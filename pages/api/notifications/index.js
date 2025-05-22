// Percorso: /pages/api/notifications/index.js
// Scopo: API gestione notifiche - compatibile better-sqlite3 (NO await db.all!)
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: Corretto utilizzo db.prepare(...).all(...)

import db from "../../../db/db.js";

export default function handler(req, res) {
  if (req.method === "GET") {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    const notifications = db.prepare(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC"
    ).all(user_id);

    res.status(200).json(notifications);
  }

  if (req.method === "POST") {
    const { user_id, message } = req.body;
    if (!user_id || !message) return res.status(400).json({ error: "user_id and message required" });

    // Inserimento notifica
    const result = db.prepare(
      "INSERT INTO notifications (user_id, message) VALUES (?, ?)"
    ).run(user_id, message);

    res.status(200).json({ id: result.lastInsertRowid });
  }
}
