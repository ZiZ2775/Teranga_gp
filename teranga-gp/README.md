# Teranga GP

Site de mise en relation entre les GP du Sénégal et la diaspora sénégalaise. Page statique (`index.html`) avec Supabase pour les comptes et les données.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Le site (HTML, CSS, JS) |
| `config.js` | URL et clé publique Supabase à renseigner |
| `supabase.sql` | Tables et règles de sécurité à exécuter une fois |
| `legal.html` | Modèle de conditions et de confidentialité à faire relire |
| `.github/copilot-instructions.md` | Contexte donné à GitHub Copilot |
| `netlify.toml` | Réglage d'hébergement Netlify |

Sans `config.js` renseigné, le site s'ouvre en mode démonstration (annonces d'exemple, annonces enregistrées sur l'appareil). Vous pouvez l'essayer en ouvrant `index.html` dans un navigateur.

## 1. Mettre le code sur GitHub

1. Sur github.com, cliquez sur **New repository**, nommez-le `teranga-gp`, laissez-le vide.
2. Dans ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Première version de Teranga GP"
   git branch -M main
   git remote add origin https://github.com/VOTRE-COMPTE/teranga-gp.git
   git push -u origin main
   ```
   Sans terminal : sur la page du dépôt vide, cliquez sur **uploading an existing file** et glissez tous les fichiers (y compris le dossier `.github`).
3. Ouvrez le dépôt dans GitHub Copilot (VS Code ou github.dev). Il lira `.github/copilot-instructions.md` pour comprendre le projet.

## 2. Créer la base de données (Supabase)

1. Créez un projet sur supabase.com.
2. **SQL Editor** → **New query** → collez `supabase.sql` → **Run**.
3. **Project Settings → API** : copiez l'**URL du projet** et la clé **anon public** dans `config.js`, puis envoyez la modification sur GitHub.
4. **Authentication → URL Configuration** : mettez `https://teranga-gp.com` comme **Site URL** et ajoutez-le dans les **Redirect URLs** (ajoutez aussi l'adresse de test Netlify tant que vous testez).

## 3. Mettre en ligne (Netlify)

1. Sur netlify.com : **Add new site → Import an existing project → GitHub**, choisissez `teranga-gp`. Aucune commande de build, dossier de publication `.`.
2. Chaque `git push` met le site à jour automatiquement.

## 4. Brancher teranga-gp.com

1. Vérifiez que le nom est disponible et achetez-le chez un registrar (OVH, Gandi, Namecheap, etc.).
2. Netlify : **Domain management → Add a domain**, puis suivez les enregistrements DNS indiqués (Netlify DNS ou enregistrements chez votre registrar). Le certificat HTTPS est créé automatiquement.

## 5. Activer la connexion par SMS

Le site propose la connexion par SMS (code à 6 chiffres) et par e-mail (lien). L'e-mail marche dès le départ. Le SMS demande un fournisseur payant :

1. Créez un compte chez un fournisseur de SMS pris en charge par Supabase (Twilio, MessageBird, Vonage ou Textlocal) et notez ses identifiants.
2. Supabase → **Authentication → Providers → Phone** : activez-le, choisissez le fournisseur et collez les identifiants.
3. Vérifiez que le fournisseur peut envoyer des SMS vers les pays de vos utilisateurs (Sénégal, France, Italie, Espagne, etc.) et regardez les tarifs par SMS, qui varient beaucoup selon le pays.
4. Tant que ce n'est pas fait, les utilisateurs peuvent choisir « Par e-mail » dans la fenêtre de connexion.

Pour limiter les abus et la facture, gardez les limites de débit de Supabase (Authentication → Rate Limits) à des valeurs basses.

## 6. Devenir administrateur

1. Ouvrez le site, cliquez sur **Se connecter** et connectez-vous (SMS ou e-mail).
2. Dans Supabase → SQL Editor, exécutez l'une des deux requêtes :
   ```sql
   -- connexion par e-mail
   insert into public.admins (user_id) select id from auth.users where email = 'votre@email.com';
   -- connexion par SMS (numéro sans le +)
   insert into public.admins (user_id) select id from auth.users where phone = '221771234567';
   ```
3. Rechargez le site : vous voyez les signalements et le bouton « Retirer (modération) ».

## 7. Clients, mise en avant payante, paiements

Le suivi des GP par leurs clients, la mise en avant payante via Wave et le choix d'un agrégateur sont décrits dans **`PAIEMENTS.md`**. Le suivi des GP marche dès que `supabase.sql` est exécuté. La mise en avant payante est désactivée tant que `payments` vaut `false` dans `config.js`.

## 8. Suivi de colis

Le suivi est actif dès que `supabase.sql` est exécuté (il contient aussi les fonctions du suivi). Déroulement :

1. L'**expéditeur** se connecte, ouvre « Suivre un colis », puis « Enregistrer un colis à envoyer ». Il reçoit un **code de suivi** (par exemple `TGP-7K2M9Q`) et un **code de remise** à 4 chiffres, affiché une seule fois.
2. Il donne le code de suivi au **GP**, et le code de remise au **destinataire**. Le GP ne doit pas connaître le code de remise.
3. Le GP saisit le code de suivi dans « Prendre en charge » : l'étape **Remis au GP** est enregistrée.
4. Le GP marque ensuite **En voyage** puis **Arrivé à destination**, avec une note facultative. Des boutons WhatsApp permettent de prévenir l'expéditeur et le destinataire s'ils ont donné leur numéro.
5. À la livraison, le destinataire donne son code de remise au GP, qui le saisit pour marquer **Livré**. Après 5 codes faux, la validation est bloquée.
6. **Tout le monde**, sans compte, peut consulter les étapes avec le code de suivi.

Le suivi montre les étapes que le GP déclare : il ne localise pas le colis. Si un colis n'arrive pas, le site ne rembourse rien : prévoyez une procédure de réclamation.

## Avant d'ouvrir au public

- Compléter et faire relire `legal.html` (éditeur, contact, droit applicable).
- Tester avec deux comptes : publier une annonce, laisser un avis, signaler, retirer en tant qu'admin.
- La connexion se fait par lien envoyé par e-mail. La connexion par SMS demande un fournisseur payant (Twilio, par exemple) et se configure dans Supabase → Authentication → Providers.
- Prévoir une personne qui traite les signalements régulièrement.
