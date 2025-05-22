// Percorso: /pages/api/user/note-log.js

/**
 * Scopo: log cronologico modifiche alle note personali utente
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";
import { parse } from "cookie";
import { verifyToken } from "../../../utils/auth";

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Non autorizzato" });

  if (req.method === "GET") {
    try {
      const logs = db.prepare(`
        SELECT note, saved_at
        FROM user_note_log
        WHERE user_id = ?
        ORDER BY saved_at DESC
        LIMIT 50
      `).all(user.id);
      return res.status(200).json(logs);
    } catch (err) {
      return res.status(500).json({ error: "Errore recupero log note" });
    }
  }

  if (req.method === "POST") {
    try {
      const { note } = req.body;
      db.prepare("INSERT INTO user_note_log (user_id, note, saved_at) VALUES (?, ?, datetime('now'))").run(user.id, note);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Errore salvataggio log" });
    }
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
