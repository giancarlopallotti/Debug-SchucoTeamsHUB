// Percorso: /pages/api/dashboard/extra.js

/**
 * Scopo: fornire dati aggregati per widget dinamici della dashboard
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  try {
    const recentFiles = db.prepare(`
      SELECT id, name, created_at FROM files
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    const upcomingEvents = db.prepare(`
      SELECT id, title, start AS start_date FROM events
      WHERE DATE(start) >= DATE('now')
      ORDER BY start ASC
      LIMIT 5
    `).all();

    const projectDeadlines = db.prepare(`
      SELECT id, title, deadline FROM projects
      WHERE DATE(deadline) <= DATE('now', '+7 day')
      ORDER BY deadline ASC
      LIMIT 5
    `).all();

    const recentDownloads = db.prepare(`
      SELECT f.name, d.downloaded_at
      FROM file_downloads d
      JOIN files f ON f.id = d.file_id
      ORDER BY d.downloaded_at DESC
      LIMIT 5
    `).all();

    const unreadNotifications = db.prepare(`
      SELECT id, message, created_at FROM notifications
      WHERE read = 0
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Tabella 'activity_log' non esistente, sostituiamo con ultime attività generiche
    const recentActivity = db.prepare(`
      SELECT id, title AS action, status AS entity, updated_at AS timestamp
      FROM activities
      ORDER BY updated_at DESC
      LIMIT 5
    `).all();

    return res.status(200).json({
      recentFiles,
      upcomingEvents,
      projectDeadlines,
      recentDownloads,
      unreadNotifications,
      recentActivity
    });
  } catch (err) {
    console.error("Errore fetch extra dashboard:", err);
    return res.status(500).json({ error: "Errore lato server" });
  }
}
