// Vérifie auprès de Wave qu'un paiement est bien réussi, puis met l'annonce à la une.
// La vérification se fait directement chez Wave avec la clé secrète : le navigateur ne peut pas la falsifier.
const { json, getUser, db, days } = require('./lib/shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method' });

  const user = await getUser(event);
  if (!user) return json(401, { error: 'auth' });

  let ref;
  try { ref = JSON.parse(event.body || '{}').ref; } catch (e) { return json(400, { error: 'body' }); }
  if (typeof ref !== 'string' || ref.length > 255 || !ref.startsWith(`tgp-${user.id}-`)) return json(400, { error: 'ref' });

  const q = await db(`paiements?ref=eq.${encodeURIComponent(ref)}&owner=eq.${encodeURIComponent(user.id)}&select=*`);
  const rows = q.ok ? await q.json() : [];
  const row = rows[0];
  if (!row) return json(404, { error: 'ref' });
  if (row.status === 'paid') return json(200, { ok: true });

  const w = await fetch('https://api.wave.com/v1/checkout/sessions/search?client_reference=' + encodeURIComponent(ref), {
    headers: { Authorization: 'Bearer ' + process.env.WAVE_API_KEY },
  });
  if (!w.ok) return json(502, { error: 'wave' });
  const body = await w.json();
  const s = (body.result || []).find((x) => x && x.payment_status === 'succeeded');
  if (!s) return json(200, { ok: false });
  if (s.amount !== undefined && Number(s.amount) !== Number(row.amount)) return json(200, { ok: false });

  const until = new Date(Date.now() + days() * 86400000).toISOString();
  const up = await db('mises_en_avant?on_conflict=item_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ item_id: row.item_id, owner: user.id, until }),
  });
  if (!up.ok) return json(500, { error: 'db' });

  await db(`paiements?ref=eq.${encodeURIComponent(ref)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'paid' }),
  });
  return json(200, { ok: true });
};
