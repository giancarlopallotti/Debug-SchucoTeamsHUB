// ==================================================================
// Percorso: /pages/api/messages/archive.js
// Scopo: Azione rapida - Archivia/disarchivia messaggio per utente loggato
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import db from '../../../db/db.js';

export default async function handler(req, res) {
  // Ricava user_id dal cookie (senza JWT)
  const user_id = req.cookies?.user_id;
  if (!user_id) return res.status(401).json({ error: "Unauthorized: user_id missing" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const { message_id } = req.body;
  if (!message_id) return res.status(400).json({ error: "message_id richiesto" });

  const msg = await db.get(`SELECT archived_by FROM messages WHERE id = ?`, [message_id]);
  let archived = [];
  try { archived = msg && msg.archived_by ? JSON.parse(msg.archived_by) : []; } catch { archived = []; }

  if (archived.includes(Number(user_id))) {
    archived = archived.filter(id => id !== Number(user_id));
  } else {
    archived.push(Number(user_id));
  }

  await db.run(`UPDATE messages SET archived_by = ? WHERE id = ?`, [JSON.stringify(archived), message_id]);
  res.status(200).json({ success: true, archived_by: archived });
}
