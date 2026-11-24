# 🤝 Teranga GP - Gestion de Partenariats

Application web moderne pour gérer les partenariats commerciaux en Afrique de l'Ouest.

## 🚀 Démarrage rapide

### 1. Configuration Supabase

1. Allez à [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Accédez à **Project Settings > API**
4. Copiez vos clés:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon key

### 2. Configuration locale

```bash
# Clonez et installez
git clone https://github.com/ZiZ2775/Teranga_gp.git
cd Teranga_gp
npm install

# Créez .env.local
cp .env.local.example .env.local

# Ajoutez vos clés dans .env.local:
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### 3. Import du schéma Supabase

1. Allez dans Supabase > SQL Editor
2. Exécutez le contenu de `supabase-improved.sql`
3. Exécutez le contenu de `supabase-auth.sql`

### 4. Lancement local

```bash
npm run dev
```

Ouvrez http://localhost:8000

## 📁 Structure

```
├── index.html           # Application principale
├── config.js           # Configuration Supabase
├── tracking.js         # Système d'analytics
├── netlify.toml        # Configuration de déploiement
├── package.json        # Dépendances
├── supabase-improved.sql # Schéma principal
├── supabase-auth.sql   # Fonctions d'authentification
└── .env.local.example  # Template des variables
```

## 🔐 Authentification

L'app utilise Supabase pour:
- Stockage des utilisateurs
- Authentification email/password
- Row-Level Security (RLS)
- Hachage sécurisé des mots de passe

## 📊 Fonctionnalités

- ✅ Login/Signup
- ✅ Dashboard avec statistiques
- ✅ Profil utilisateur
- ✅ Tracking des événements
- ✅ Design responsive
- ✅ Sécurité hardcoded

## 🛠️ Développement

### Lancement en développement
```bash
npm run dev
```

### Build pour production
```bash
npm run build
```

### Preview production
```bash
npm run preview
```

## 🌐 Déploiement Netlify

Le site est automatiquement déployé sur Netlify:
- **URL:** https://teranga-gp.netlify.app
- **Branch:** main
- **Logs:** Consultez le dashboard Netlify

### Variables d'environnement Netlify

Dans les settings Netlify du site, ajoutez:
```
VITE_SUPABASE_URL = https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY = votre_clé_anon
```

## 📝 Notes

- Le site est un SPA (Single Page Application)
- Toutes les routes sont redirigées vers `index.html`
- Les données sont stockées dans Supabase
- Les événements sont tracés en temps réel

## 🤝 Support

Pour des questions, créez une issue sur GitHub.

---

**Dernière mise à jour:** 2026-11-24
**Version:** 1.0.0
