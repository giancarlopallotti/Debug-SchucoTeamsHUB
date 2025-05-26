// /pages/api/files/audit.js
// Scopo: Audit/download tracking files (scrittura/recupero storico download)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: v1, solo file_downloads (estendibile per altre azioni in futuro)

import db from "../../../db/db.js";

export default async function handler(req, res) {
  // Semplice check autenticazione (da rafforzare in produzione)
  const userId = req.headers["x-user-id"] || req.cookies.user_id;
  if (!userId) return res.status(401).json({ error: "Non autenticato" });

  if (req.method === "POST") {
    // Registra nuovo accesso/download
    const { file_id } = req.body;
    if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

    // Data/ora corrente
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO file_downloads (file_id, user_id, downloaded_at)
      VALUES (?, ?, ?)
    `).run(file_id, userId, now);

    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    // Recupera storico accessi/download per un file
    const { file_id } = req.query;
    if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

    const logs = db.prepare(`
      SELECT fd.*, u.name as user_name, u.surname as user_surname, u.email as user_email
      FROM file_downloads fd
      LEFT JOIN users u ON fd.user_id = u.id
      WHERE fd.file_id = ?
      ORDER BY fd.downloaded_at DESC
    `).all(file_id);

    return res.status(200).json({ logs });
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
