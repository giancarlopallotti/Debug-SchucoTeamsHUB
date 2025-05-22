// Percorso: /pages/api/user/widgets.js

/**
 * Scopo: gestire le preferenze widget dell'utente loggato (GET/POST)
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
      const row = db.prepare("SELECT widgets FROM user_widgets WHERE user_id = ?").get(user.id);
      return res.status(200).json(row ? JSON.parse(row.widgets) : {});
    } catch (err) {
      return res.status(500).json({ error: "Errore lettura preferenze" });
    }
  }

  if (req.method === "POST") {
    try {
      const { widgets } = req.body;
      const stmt = db.prepare("INSERT OR REPLACE INTO user_widgets (user_id, widgets) VALUES (?, ?)");
      stmt.run(user.id, JSON.stringify(widgets));
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Errore salvataggio preferenze" });
    }
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
