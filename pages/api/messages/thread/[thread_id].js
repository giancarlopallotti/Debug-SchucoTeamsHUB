// ==================================================================
// Percorso: /pages/api/messages/thread/[thread_id].js
// Scopo: Dettaglio e gestione messaggi di un thread
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import db from '../../../../db/db.js';
import { parseJSON } from '../../../../utils/helpers';

export default async function handler(req, res) {
  // Prende user_id dal cookie
  const user_id = req.cookies?.user_id;
  if (!user_id) return res.status(401).json({ error: 'Unauthorized: user_id missing' });
  const user = { id: Number(user_id) };

  const { thread_id } = req.query;
  if (!thread_id) return res.status(400).json({ error: "thread_id richiesto" });

  if (req.method === "GET") {
    // Restituisce i messaggi e il thread
    const thread = await db.get(`SELECT * FROM threads WHERE id = ?`, [thread_id]);
    const messages = await db.all(`SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC`, [thread_id]);
    res.status(200).json({ thread, messages });
    return;
  }

  if (req.method === "PATCH") {
    // Aggiornamenti thread: (ad es. aggiungi/rimuovi partecipanti, modifica titolo, archivia)
    const { title, participant_ids, archived } = req.body;
    let updates = [];
    let params = [];

    if (title) { updates.push("title = ?"); params.push(title); }
    if (participant_ids) { updates.push("participant_ids = ?"); params.push(JSON.stringify(participant_ids)); }
    if (archived !== undefined) { updates.push("archived = ?"); params.push(archived ? 1 : 0); }

    if (updates.length > 0) {
      params.push(thread_id);
      await db.run(`UPDATE threads SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    res.status(200).json({ success: true });
    return;
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
