// Renseignez ces deux valeurs depuis Supabase : Project Settings > API.
// La clé "anon" est publique par conception : la sécurité repose sur supabase.sql.
window.TGP_CONFIG = {
  url: 'https://VOTRE-PROJET.supabase.co',
  anonKey: 'VOTRE_CLE_ANON',
  // Passez à true une fois les fonctions Wave configurées (voir PAIEMENTS.md).
  payments: false,
  featurePriceLabel: '1 000 FCFA'
};
