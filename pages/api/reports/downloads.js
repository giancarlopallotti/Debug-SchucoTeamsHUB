// Percorso: /pages/api/reports/downloads.js

/**
 * Scopo: restituisce elenco completo dei download con dati file e utente
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";
import { parse } from "cookie";
import { verifyToken } from "../../../utils/auth";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  const user = verifyToken(token);
  if (!user || !["supervisore", "amministratore"].includes(user.role)) {
    return res.status(403).json({ error: "Non autorizzato" });
  }

  try {
    const logs = db.prepare(`
      SELECT d.downloaded_at,
             f.name AS file_name,
             u.name AS user_name,
             u.surname AS user_surname,
             u.id AS user_id
      FROM file_downloads d
      LEFT JOIN files f ON d.file_id = f.id
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.downloaded_at DESC
    `).all();

    return res.status(200).json(logs);
  } catch (err) {
    console.error("Errore report downloads:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
