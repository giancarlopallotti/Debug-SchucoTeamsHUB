// ==================================================================
// Percorso: /pages/api/messages/[id].js
// Scopo: Dettaglio, modifica e azioni rapide su singolo messaggio
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import db from '../../../db/db.js';
import { parseJSON } from '../../../utils/helpers';

export default async function handler(req, res) {
  // Prende user_id dal cookie
  const user_id = req.cookies?.user_id;
  if (!user_id) return res.status(401).json({ error: 'Unauthorized: user_id missing' });
  const user = { id: Number(user_id) };

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "id messaggio richiesto" });

  if (req.method === "GET") {
    // Restituisce dettagli messaggio
    const message = await db.get(`SELECT * FROM messages WHERE id = ?`, [id]);
    res.status(200).json({ message });
    return;
  }

  if (req.method === "PATCH") {
    // Aggiorna messaggio: solo campi consentiti (es: modifica testo/tag/allegati)
    const { body, subject, tags, attachment_urls } = req.body;
    let updates = [];
    let params = [];

    if (body !== undefined) { updates.push("body = ?"); params.push(body); }
    if (subject !== undefined) { updates.push("subject = ?"); params.push(subject); }
    if (tags !== undefined) { updates.push("tags = ?"); params.push(JSON.stringify(tags)); }
    if (attachment_urls !== undefined) { updates.push("attachment_urls = ?"); params.push(JSON.stringify(attachment_urls)); }

    if (updates.length > 0) {
      params.push(id);
      await db.run(`UPDATE messages SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    res.status(200).json({ success: true });
    return;
  }

  if (req.method === "DELETE") {
    // Soft delete: marca il messaggio come cancellato
    await db.run(`UPDATE messages SET status = ?, deleted_at = CURRENT_TIMESTAMP WHERE id = ?`, ["deleted", id]);
    res.status(200).json({ success: true });
    return;
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
