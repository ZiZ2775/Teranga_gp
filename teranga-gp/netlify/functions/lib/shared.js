// Aides communes aux fonctions Wave. Aucune clé n'est écrite ici : tout vient des variables d'environnement Netlify.

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(obj),
});

const serviceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY;

// Identifie la personne connectée à partir du jeton envoyé par le site.
async function getUser(event) {
  const h = event.headers.authorization || event.headers.Authorization || '';
  const token = h.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const r = await fetch(process.env.SUPABASE_URL + '/auth/v1/user', {
    headers: { apikey: serviceKey(), Authorization: 'Bearer ' + token },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}

// Appel à la base Supabase avec la clé service (contourne les règles RLS : à n'utiliser que côté serveur).
function db(path, opts = {}) {
  return fetch(process.env.SUPABASE_URL + '/rest/v1/' + path, {
    ...opts,
    headers: {
      apikey: serviceKey(),
      Authorization: 'Bearer ' + serviceKey(),
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
}

const price = () => parseInt(process.env.FEATURE_PRICE_XOF || '1000', 10);
const days = () => parseInt(process.env.FEATURE_DAYS || '7', 10);
const siteUrl = () => (process.env.SITE_URL || '').replace(/\/$/, '');

module.exports = { json, getUser, db, price, days, siteUrl };
