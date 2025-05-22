// Percorso: /pages/api/user/note.js

/**
 * Scopo: salva e recupera la nota personale dell'utente loggato
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
      const row = db.prepare("SELECT note FROM user_note WHERE user_id = ?").get(user.id);
      return res.status(200).json({ note: row?.note || "" });
    } catch (err) {
      return res.status(500).json({ error: "Errore lettura nota" });
    }
  }

  if (req.method === "POST") {
    try {
      const { note } = req.body;
      db.prepare("INSERT OR REPLACE INTO user_note (user_id, note) VALUES (?, ?)").run(user.id, note);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Errore salvataggio nota" });
    }
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
