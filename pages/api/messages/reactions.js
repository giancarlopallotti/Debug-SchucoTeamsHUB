// ==================================================================
// Percorso: /pages/api/messages/reactions.js
// Scopo: Azione rapida - Aggiungi/togli reazione (es: like) a messaggio
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Gestisce reazioni come oggetto JSON {"like": [user_id], ...}
// ==================================================================

import db from '../../../utils/db';
import { getSessionUser } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { message_id, reaction } = req.body;
  if (!message_id || !reaction) return res.status(400).json({ error: "message_id e reaction richiesti" });

  const msg = await db.get(`SELECT reactions FROM messages WHERE id = ?`, [message_id]);
  let reactions = {};
  try { reactions = msg && msg.reactions ? JSON.parse(msg.reactions) : {}; } catch { reactions = {}; }

  // Toggle reazione: se c’è già la tolgo, altrimenti la aggiungo
  if (!reactions[reaction]) reactions[reaction] = [];
  if (reactions[reaction].includes(user.id)) {
    reactions[reaction] = reactions[reaction].filter(id => id !== user.id);
  } else {
    reactions[reaction].push(user.id);
  }

  await db.run(`UPDATE messages SET reactions = ? WHERE id = ?`, [JSON.stringify(reactions), message_id]);
  res.status(200).json({ success: true, reactions });
}
