// ==================================================================
// Percorso: /pages/api/messages/index.js
// Scopo: Gestione messaggi e thread, autenticazione via cookie user_id
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import db from '../../../db/db.js';
import { parseJSON, uniqueArray, safeLike } from '../../../utils/helpers';

export default async function handler(req, res) {
  // Ricava user_id dal cookie (senza JWT)
  const user_id = req.cookies?.user_id;
  if (!user_id) return res.status(401).json({ error: 'Unauthorized: user_id missing' });
  const user = { id: Number(user_id) };

  // --- GET: elenco messaggi (filtri e badge) ---
  if (req.method === "GET") {
    const {
      thread_id, inbox, archived, favorite, unread, search, tag, linked_type, linked_id
    } = req.query;

    let sql = `SELECT * FROM messages WHERE 1=1`;
    let params = [];

    if (thread_id) {
      sql += ` AND thread_id = ?`;
      params.push(thread_id);
    }
    if (archived) {
      sql += ` AND archived_by LIKE ?`;
      params.push(safeLike(user.id));
    } else if (favorite) {
      sql += ` AND favorited_by LIKE ?`;
      params.push(safeLike(user.id));
    } else if (unread) {
      sql += ` AND (read_by IS NULL OR read_by NOT LIKE ?)`;
      params.push(safeLike(user.id));
    } else if (inbox) {
      sql += ` AND (archived_by IS NULL OR archived_by NOT LIKE ?)`;
      params.push(safeLike(user.id));
    }
    if (tag) {
      sql += ` AND tags LIKE ?`;
      params.push(safeLike(tag));
    }
    if (linked_type && linked_id) {
      sql += ` AND linked_type = ? AND linked_id = ?`;
      params.push(linked_type, linked_id);
    }
    if (search) {
      sql += ` AND (body LIKE ? OR subject LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const messages = db.prepare(sql).all(params);


    // Badge conteggi rapidi
    const badgeCounts = {
      inbox: messages.filter(m => !parseJSON(m.archived_by)?.includes(user.id)).length,
      archived: messages.filter(m => parseJSON(m.archived_by)?.includes(user.id)).length,
      unread: messages.filter(m => !parseJSON(m.read_by)?.includes(user.id)).length,
      favorite: messages.filter(m => parseJSON(m.favorited_by)?.includes(user.id)).length
    };

    res.status(200).json({ messages, badgeCounts });
    return;
  }

  // --- POST: crea nuovo messaggio (thread o reply) ---
  if (req.method === "POST") {
    const {
      thread_id, parent_id, subject, body, attachment_urls, tags, linked_type,
      linked_id, is_private, scheduled_at
    } = req.body;

    // Creazione nuovo thread se non esiste
    let newThreadId = thread_id;
    if (!thread_id) {
      const { title, type, participant_ids } = req.body;
      const result = await db.run(
        `INSERT INTO threads (title, created_by, type, linked_type, linked_id, participant_ids)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title || (subject ? subject.substring(0, 50) : 'Nuovo thread'),
          user.id,
          type || 'private',
          linked_type || null,
          linked_id || null,
          JSON.stringify(participant_ids || [user.id])
        ]
      );
      newThreadId = result.lastID;
    }

    // Inserimento messaggio collegato al thread
    const result = await db.run(
      `INSERT INTO messages (thread_id, parent_id, sender_id, body, subject, attachment_urls, tags, linked_type, linked_id, is_private, scheduled_at, read_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        newThreadId,
        parent_id || null,
        user.id,
        body,
        subject,
        JSON.stringify(attachment_urls || []),
        JSON.stringify(tags || []),
        linked_type || null,
        linked_id || null,
        is_private ? 1 : 0,
        scheduled_at || null,
        JSON.stringify([user.id])
      ]
    );

    res.status(201).json({
      message: "Messaggio creato",
      message_id: result.lastID,
      thread_id: newThreadId
    });
    return;
  }

  // --- Metodo non supportato ---
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
