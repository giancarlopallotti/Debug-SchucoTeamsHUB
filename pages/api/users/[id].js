// Percorso: /pages/api/users/[id].js
// Scopo: Gestione update e delete utente, ora aggiorna anche il campo avatar
// Autore: ChatGPT
// Ultima modifica: 23/05/2025
// Note: PATCH avatar, nessuna modifica ad altre logiche

import db from '../../../db/db';

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    return res.status(200).json(user);
  }

  if (req.method === 'PUT') {
    const {
      name, surname, email, password, phone, address,
      role, status, note, tags, avatar // 👈 PATCH: avatar support
    } = req.body;

    // PATCH: aggiorna anche avatar
    db.prepare(
      `UPDATE users SET
        name = ?, surname = ?, email = ?, password = ?, phone = ?, address = ?,
        role = ?, status = ?, note = ?, tags = ?, avatar = ?
       WHERE id = ?`
    ).run(
      name, surname, email, password, phone, address,
      role, status, note, tags, avatar, // 👈 PATCH: avatar in update
      id
    );

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Metodo ${req.method} non permesso`);
}
