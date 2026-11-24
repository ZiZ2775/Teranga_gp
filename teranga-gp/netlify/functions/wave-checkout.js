// Crée une session de paiement Wave pour mettre une annonce de GP en avant.
// Le paiement va sur le compte Wave Business de Teranga GP : c'est un service de la plateforme.
const { json, getUser, db, price, siteUrl } = require('./lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });

  const user = await getUser(event);
  if (!user) return json(401, { error: 'auth' });

  let itemId;
  try { itemId = JSON.parse(event.body || '{}').itemId; } catch (e) { return json(400, { error: 'body' }); }
  if (typeof itemId !== 'string' || !/^[A-Za-z0-9_-]{1,60}$/.test(itemId)) return json(400, { error: 'item' });

  const site = siteUrl();
  if (!site.startsWith('https://') || !process.env.WAVE_API_KEY) return json(500, { error: 'config' });

  // L'annonce doit appartenir à la personne connectée et être une annonce de GP.
  const r = await db(`docs?collection=eq.annonces&id=eq.${encodeURIComponent(user.id)}&select=data`);
  const rows = r.ok ? await r.json() : [];
  const items = (rows[0] && rows[0].data && rows[0].data.items) || [];
  if (!items.some((x) => x && x.id === itemId && x.kind === 'gp')) return json(404, { error: 'item' });

  const amount = price();
  const ref = `tgp-${user.id}-${itemId}-${Date.now().toString(36)}`;

  const ins = await db('paiements', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ ref, owner: user.id, item_id: itemId, amount, status: 'pending' }),
  });
  if (!ins.ok) return json(500, { error: 'db' });

  const w = await fetch('https://api.wave.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.WAVE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: String(amount),
      currency: 'XOF',
      client_reference: ref,
      success_url: `${site}/?paiement=ok&ref=${encodeURIComponent(ref)}`,
      error_url: `${site}/?paiement=erreur`,
    }),
  });
  if (!w.ok) return json(502, { error: 'wave' });
  const s = await w.json();
  if (!s.wave_launch_url) return json(502, { error: 'wave' });
  return json(200, { url: s.wave_launch_url });
};
