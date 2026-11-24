-- À exécuter une fois dans Supabase : SQL Editor > New query > Run.

create table if not exists public.docs (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.docs enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Un utilisateur peut savoir s'il est admin, rien de plus.
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select using (user_id = auth.uid());

-- Lecture : annonces et avis publics ; signalements réservés aux admins (et à leur auteur).
drop policy if exists docs_read on public.docs;
create policy docs_read on public.docs for select using (
  collection in ('annonces','avis')
  or (collection = 'signalements' and (public.is_admin() or id = auth.uid()::text))
);

-- Écriture : chacun écrit son propre document (id = son identifiant), les admins écrivent partout.
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert with check (
  collection in ('annonces','avis','signalements')
  and (id = auth.uid()::text or public.is_admin())
);

drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update
  using (id = auth.uid()::text or public.is_admin())
  with check (collection in ('annonces','avis','signalements') and (id = auth.uid()::text or public.is_admin()));

drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete using (id = auth.uid()::text or public.is_admin());

-- Suivi de colis : de la remise au GP jusqu'à la livraison.
-- Aucun accès direct à la table : tout passe par les fonctions ci-dessous.
-- Le code de remise (4 chiffres) n'est jamais stocké en clair ni renvoyé après sa création :
-- le GP ne peut marquer « Livré » qu'avec le code que le destinataire lui donne.
create table if not exists public.suivis (
  code text primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  gp_id uuid references auth.users(id) on delete set null,
  label text not null check (char_length(label) between 1 and 80),
  from_city text not null,
  to_city text not null,
  sender_phone text,
  recipient_phone text,
  pin_hash text not null,
  pin_tries integer not null default 0,
  status text not null default 'cree' check (status in ('cree','remis','voyage','arrive','livre')),
  events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.suivis enable row level security;

create or replace function public.suivi_creer(p_label text, p_from text, p_to text, p_sender text, p_recipient text)
returns table(code text, pin text)
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_pin text;
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  if coalesce(trim(p_label), '') = '' or coalesce(trim(p_from), '') = '' or coalesce(trim(p_to), '') = '' then
    raise exception 'donnees';
  end if;
  v_code := 'TGP-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  v_pin := lpad(floor(random() * 10000)::int::text, 4, '0');
  insert into public.suivis (code, sender_id, label, from_city, to_city, sender_phone, recipient_phone, pin_hash, events)
  values (
    v_code, auth.uid(), left(trim(p_label), 80), left(trim(p_from), 40), left(trim(p_to), 40),
    nullif(left(trim(coalesce(p_sender, '')), 20), ''), nullif(left(trim(coalesce(p_recipient, '')), 20), ''),
    md5(v_pin || v_code),
    jsonb_build_array(jsonb_build_object('status', 'cree', 'ts', now(), 'note', ''))
  );
  return query select v_code, v_pin;
end $$;

create or replace function public.suivi_voir(p_code text)
returns table(label text, from_city text, to_city text, status text, events jsonb)
language sql security definer set search_path = public stable as $$
  select s.label, s.from_city, s.to_city, s.status, s.events
  from public.suivis s
  where s.code = upper(trim(p_code));
$$;

create or replace function public.suivi_prendre(p_code text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  n integer;
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  update public.suivis s
     set gp_id = auth.uid(),
         status = 'remis',
         events = s.events || jsonb_build_array(jsonb_build_object('status', 'remis', 'ts', now(), 'note', ''))
   where s.code = upper(trim(p_code))
     and s.gp_id is null
     and s.sender_id <> auth.uid()
     and s.status = 'cree';
  get diagnostics n = row_count;
  if n = 0 then raise exception 'indisponible'; end if;
end $$;

-- Renvoie 'ok', 'pin' (code de remise incorrect) ou 'verrou' (trop d'essais).
-- Les essais ratés sont comptés sans lever d'erreur, pour que le compteur ne soit pas annulé.
create or replace function public.suivi_maj(p_code text, p_status text, p_note text default '', p_pin text default null)
returns text
language plpgsql security definer set search_path = public as $$
declare
  r public.suivis%rowtype;
  v_order text[] := array['cree', 'remis', 'voyage', 'arrive', 'livre'];
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  select * into r from public.suivis s where s.code = upper(trim(p_code)) and s.gp_id = auth.uid() for update;
  if not found then raise exception 'indisponible'; end if;
  if array_position(v_order, p_status) is distinct from array_position(v_order, r.status) + 1 then
    raise exception 'etape';
  end if;
  if p_status = 'livre' then
    if r.pin_tries >= 5 then return 'verrou'; end if;
    if md5(coalesce(p_pin, '') || r.code) <> r.pin_hash then
      update public.suivis set pin_tries = pin_tries + 1 where code = r.code;
      return 'pin';
    end if;
  end if;
  update public.suivis
     set status = p_status,
         events = events || jsonb_build_array(jsonb_build_object('status', p_status, 'ts', now(), 'note', left(coalesce(p_note, ''), 140)))
   where code = r.code;
  return 'ok';
end $$;

create or replace function public.suivi_mes()
returns table(code text, label text, from_city text, to_city text, status text, events jsonb, role text, sender_phone text, recipient_phone text)
language sql security definer set search_path = public stable as $$
  select s.code, s.label, s.from_city, s.to_city, s.status, s.events,
         case when s.sender_id = auth.uid() then 'expediteur' else 'gp' end,
         s.sender_phone, s.recipient_phone
  from public.suivis s
  where s.sender_id = auth.uid() or s.gp_id = auth.uid()
  order by s.created_at desc;
$$;

revoke all on function public.suivi_creer(text, text, text, text, text) from public, anon;
revoke all on function public.suivi_prendre(text) from public, anon;
revoke all on function public.suivi_maj(text, text, text, text) from public, anon;
revoke all on function public.suivi_mes() from public, anon;
revoke all on function public.suivi_voir(text) from public;
grant execute on function public.suivi_creer(text, text, text, text, text) to authenticated;
grant execute on function public.suivi_prendre(text) to authenticated;
grant execute on function public.suivi_maj(text, text, text, text) to authenticated;
grant execute on function public.suivi_mes() to authenticated;
grant execute on function public.suivi_voir(text) to anon, authenticated;

-- Clients qui suivent un GP : visibles seulement par le GP suivi et par la personne qui suit.
create table if not exists public.abonnes (
  gp_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(name) between 1 and 40),
  phone text not null check (phone ~ '^[+]?[0-9]{8,15}$'),
  created_at timestamptz not null default now(),
  primary key (gp_id, client_id)
);
alter table public.abonnes enable row level security;
drop policy if exists abonnes_select on public.abonnes;
create policy abonnes_select on public.abonnes for select using (gp_id = auth.uid() or client_id = auth.uid());
drop policy if exists abonnes_insert on public.abonnes;
create policy abonnes_insert on public.abonnes for insert with check (client_id = auth.uid() and gp_id <> auth.uid());
drop policy if exists abonnes_update on public.abonnes;
create policy abonnes_update on public.abonnes for update using (client_id = auth.uid()) with check (client_id = auth.uid() and gp_id <> auth.uid());
drop policy if exists abonnes_delete on public.abonnes;
create policy abonnes_delete on public.abonnes for delete using (client_id = auth.uid() or gp_id = auth.uid());

-- Mise en avant payante : écrite uniquement par les fonctions serveur (clé service), lisible par tous.
create table if not exists public.mises_en_avant (
  item_id text primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  until timestamptz not null
);
alter table public.mises_en_avant enable row level security;
drop policy if exists mea_select on public.mises_en_avant;
create policy mea_select on public.mises_en_avant for select using (true);

create table if not exists public.paiements (
  ref text primary key,
  owner uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  amount integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.paiements enable row level security;
drop policy if exists paiements_select on public.paiements;
create policy paiements_select on public.paiements for select using (owner = auth.uid());

-- Mises à jour en direct.
alter publication supabase_realtime add table public.docs;

-- Après votre première connexion sur le site, remplacez l'adresse puis exécutez :
-- insert into public.admins (user_id) select id from auth.users where email = 'votre@email.com';
