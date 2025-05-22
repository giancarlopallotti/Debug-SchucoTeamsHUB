// Percorso: /pages/api/dashboard/stats.js

/**
 * Scopo: API per statistiche aggregate da mostrare in dashboard
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  try {
    const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
    const totalFiles = db.prepare("SELECT COUNT(*) AS count FROM files").get().count;
    const totalDownloads = db.prepare("SELECT COUNT(*) AS count FROM file_downloads").get().count;
    const downloadsToday = db.prepare("SELECT COUNT(*) AS count FROM file_downloads WHERE DATE(downloaded_at) = DATE('now')").get().count;

    return res.status(200).json({
      totalUsers,
      totalFiles,
      totalDownloads,
      downloadsToday
    });
  } catch (err) {
    console.error("Errore nel recupero delle statistiche:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
