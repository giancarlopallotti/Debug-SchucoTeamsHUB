// Percorso: /pages/api/files/log-download.js

/**
 * Scopo: registra il download di un file da parte dell'utente loggato
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";
import { parse } from "cookie";
import { verifyToken } from "../../../utils/auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Utente non autorizzato" });

  const { fileId } = req.body;
  if (!fileId) return res.status(400).json({ error: "fileId mancante" });

  try {
    const stmt = db.prepare(`
      INSERT INTO file_downloads (file_id, user_id, downloaded_at)
      VALUES (?, ?, datetime('now'))
    `);
    stmt.run(fileId, user.id);

    return res.status(200).json({ message: "Download registrato" });
  } catch (err) {
    console.error("Errore log-download:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
