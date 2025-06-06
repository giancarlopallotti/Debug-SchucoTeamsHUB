// Percorso: /pages/api/files/logs.js
// Scopo: Restituisce i log attività per un file (upload, download, update, delete, ecc.)
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import db from "../../../db/db.js";

export default async function handler(req, res) {
  const { file_id } = req.query;
  if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

  try {
    // Recupera i log associati al file_id
    const logs = db.prepare(`
      SELECT l.id, l.action, l.note, l.timestamp, u.name as user, u.surname as surname
      FROM file_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.file_id = ?
      ORDER BY l.timestamp DESC
      LIMIT 100
    `).all(file_id);

    // Formatta user fullname
    const logsFormatted = logs.map(l => ({
      ...l,
      user: l.surname ? `${l.surname} ${l.user}` : l.user || null,
    }));

    res.json(logsFormatted);
  } catch (err) {
    res.status(500).json({ error: "Errore DB log file", details: err.message });
  }
}
