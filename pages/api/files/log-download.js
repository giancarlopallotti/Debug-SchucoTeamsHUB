// Percorso: /pages/api/files/log-download.js
// Scopo: Log download/accesso file (storico, compliance, notifiche)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 15.16.00
// Note: Crea log download file, restituisce storico per file o utente

import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method === "POST") {
    // Logga un nuovo download/accesso
    const { file_id, user_id, ip } = req.body;
    if (!file_id || !user_id) {
      res.status(400).json({ error: "Parametri mancanti" });
      return;
    }
    db.prepare(
      "INSERT INTO file_download_logs (file_id, user_id, downloaded_at, ip) VALUES (?, ?, datetime('now'), ?)"
    ).run(file_id, user_id, ip || null);

    res.status(200).json({ success: true });
    return;
  }

  if (req.method === "GET") {
    // Recupera lo storico dei download, filtrabile per file_id o user_id
    const { file_id, user_id, limit = 50 } = req.query;
    let query = "SELECT * FROM file_download_logs";
    const where = [];
    const params = [];

    if (file_id) { where.push("file_id = ?"); params.push(file_id); }
    if (user_id) { where.push("user_id = ?"); params.push(user_id); }

    if (where.length > 0) query += " WHERE " + where.join(" AND ");
    query += " ORDER BY downloaded_at DESC LIMIT ?"; params.push(Number(limit) || 50);

    const logs = db.prepare(query).all(...params);
    res.status(200).json(logs);
    return;
  }

  res.status(405).json({ error: "Metodo non permesso" });
}
