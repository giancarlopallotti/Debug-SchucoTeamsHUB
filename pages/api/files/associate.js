// Percorso: /pages/api/files/associate.js

/**
 * Scopo: API per associare un file a progetto, cliente, team e impostarlo come privato
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
  if (!user) return res.status(403).json({ error: "Non autorizzato" });

  const { fileId, projectId, clientId, teamId, private: isPrivate } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: "fileId mancante" });
  }

  try {
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(fileId);
    if (!file) return res.status(404).json({ error: "File non trovato" });
    if (file.uploader_id !== user.id && user.role !== "supervisore") {
      return res.status(403).json({ error: "Permesso negato" });
    }

    const stmt = db.prepare("UPDATE files SET private = ? WHERE id = ?");
    stmt.run(isPrivate ? 1 : 0, fileId);

    if (projectId) {
      db.prepare("INSERT OR IGNORE INTO files_projects (file_id, project_id) VALUES (?, ?)").run(fileId, projectId);
    }
    if (clientId) {
      db.prepare("INSERT OR IGNORE INTO files_clients (file_id, client_id) VALUES (?, ?)").run(fileId, clientId);
    }
    if (teamId) {
      db.prepare("INSERT OR IGNORE INTO files_teams (file_id, team_id) VALUES (?, ?)").run(fileId, teamId);
    }

    // Recupero informazioni aggiornate del file per visualizzazione frontend
    const updated = db.prepare(`
      SELECT f.*, u.name AS uploader_name, u.surname AS uploader_surname,
             strftime('%d/%m/%Y %H:%M', f.created_at) AS created_display
      FROM files f
      LEFT JOIN users u ON f.uploader_id = u.id
      WHERE f.id = ?
    `).get(fileId);

    return res.status(200).json({ message: "Associazioni salvate con successo", file: updated });
  } catch (err) {
    console.error("Errore nel salvataggio associazioni:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
