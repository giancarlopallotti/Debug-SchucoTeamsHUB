// ==================================================================
// Percorso: /pages/api/messages/favorite.js
// Scopo: Azione rapida - Aggiungi/rimuovi messaggio dai preferiti
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Aggiorna favorited_by come array JSON
// ==================================================================

import db from '../../../utils/db';
import { getSessionUser } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { message_id } = req.body;
  if (!message_id) return res.status(400).json({ error: "message_id richiesto" });

  const msg = await db.get(`SELECT favorited_by FROM messages WHERE id = ?`, [message_id]);
  let favorites = [];
  try { favorites = msg && msg.favorited_by ? JSON.parse(msg.favorited_by) : []; } catch { favorites = []; }

  // Toggle favorito
  if (favorites.includes(user.id)) {
    favorites = favorites.filter(id => id !== user.id);
  } else {
    favorites.push(user.id);
  }

  await db.run(`UPDATE messages SET favorited_by = ? WHERE id = ?`, [JSON.stringify(favorites), message_id]);
  res.status(200).json({ success: true, favorited_by: favorites });
}
