# Instructions pour GitHub Copilot : Teranga GP

Site de mise en relation entre les GP (voyageurs qui transportent des colis) au départ ou à destination du Sénégal et la diaspora sénégalaise. Interface et textes en français.

## Architecture
- Site statique : `index.html` (HTML, CSS et JS dans un seul fichier, sans étape de build), `legal.html`, `config.js`.
- Données et comptes : Supabase (`supabase.sql`). Table unique `docs (collection, id, data jsonb)`, avec les collections `annonces`, `avis`, `signalements`. L'`id` d'un document est l'identifiant de l'utilisateur qui l'a créé ; `data.items` contient un tableau d'éléments.
- Le script « Couche de données Supabase » dans `index.html` expose `window.claude.use('db' | 'user')` : `db.doc(path).get()/set()`, `db.collection(name).onSnapshot()`, `user.id()`, `user.canEdit()`. Le reste de la page utilise uniquement cette interface.
- Tables Supabase en plus de `docs` : `abonnes` (clients qui suivent un GP, visibles du GP et du client seulement), `mises_en_avant` et `paiements` (écrites uniquement par les fonctions Netlify avec la clé service).
- Suivi de colis : table `suivis` sans accès direct, uniquement via les fonctions `suivi_creer`, `suivi_voir`, `suivi_prendre`, `suivi_maj`, `suivi_mes` (voir `supabase.sql`). L'interface est dans `tracking.js` et utilise `window.TGP_TRACK`. Le code de remise n'est jamais renvoyé après sa création.
- `window.TGP_SUBS` (suivi des GP) et `window.TGP_PAY` (mise en avant payante via Wave, si `payments: true`) sont définis dans le script Supabase. Les clés secrètes ne vont que dans les variables d'environnement Netlify, jamais dans le dépôt. Voir `PAIEMENTS.md`.
- Sans `config.js` renseigné, le site fonctionne en mode démonstration : annonces d'exemple et annonces locales (localStorage).

## Règles
- Langue : français, tutoiement évité (vouvoiement).
- Toute donnée venant des utilisateurs passe par `esc()` avant d'être insérée dans le HTML.
- Pas de dépendance de build ; les bibliothèques se chargent par CDN avec version précise.
- Garder le thème clair et sombre via les variables CSS de `:root`.
- Ne jamais mettre de clé secrète dans le dépôt : seule la clé « anon » Supabase est publique. La sécurité repose sur les politiques RLS de `supabase.sql`.
