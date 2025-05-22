// Percorso: /pages/api/files/associate.js

/**
 * Scopo: API per associare un file a progetto, cliente, team e impostarlo come privato
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const { fileId, projectId, clientId, teamId, private: isPrivate } = req.body;

  if (!fileId) {
    return res.status(400).json({ error: "fileId mancante" });
  }

  try {
    const stmt = db.prepare("UPDATE files SET private = ? WHERE id = ?");
    stmt.run(isPrivate ? 1 : 0, fileId);

    if (projectId) {
      db.prepare("INSERT OR IGNORE INTO file_projects (file_id, project_id) VALUES (?, ?)").run(fileId, projectId);
    }
    if (clientId) {
      db.prepare("INSERT OR IGNORE INTO file_clients (file_id, client_id) VALUES (?, ?)").run(fileId, clientId);
    }
    if (teamId) {
      db.prepare("INSERT OR IGNORE INTO file_teams (file_id, team_id) VALUES (?, ?)").run(fileId, teamId);
    }

    return res.status(200).json({ message: "Associazioni salvate con successo" });
  } catch (err) {
    console.error("Errore nel salvataggio associazioni:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
