// /pages/api/files/permissions.js
// Scopo: API REST gestione permessi avanzati file-utente/team
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: v1, solo CRUD permessi file-user/team, con validazione base

import db from "../../../db/db.js";

export default async function handler(req, res) {
  // Middleware di autenticazione (semplificato)
  // TODO: integrare controllo JWT/cookie reale
  const userId = req.headers["x-user-id"] || req.cookies.user_id;
  if (!userId) return res.status(401).json({ error: "Non autenticato" });

  const { file_id, user_id, team_id, min_role, can_download, can_delete } = req.body;

  try {
    switch (req.method) {
      case "GET":
        // Permessi per un file
        {
          const { fileId } = req.query;
          if (!fileId) return res.status(400).json({ error: "fileId obbligatorio" });

          const userPerms = db.prepare(
            "SELECT * FROM file_user_access WHERE file_id = ?"
          ).all(fileId);

          const teamPerms = db.prepare(
            "SELECT * FROM file_team_access WHERE file_id = ?"
          ).all(fileId);

          return res.status(200).json({ userPerms, teamPerms });
        }

      case "POST":
        // Crea o aggiorna permesso user/team
        if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });
        if (!user_id && !team_id)
          return res.status(400).json({ error: "user_id o team_id obbligatorio" });

        // Normalizza valori booleani
        const _can_download = can_download ? 1 : 0;
        const _can_delete = can_delete ? 1 : 0;
        const _min_role = min_role || "user";

        if (user_id) {
          // Upsert permesso utente
          db.prepare(
            `INSERT INTO file_user_access (file_id, user_id, min_role, can_download, can_delete)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(file_id, user_id) DO UPDATE SET min_role=?, can_download=?, can_delete=?`
          ).run(
            file_id, user_id, _min_role, _can_download, _can_delete,
            _min_role, _can_download, _can_delete
          );
        } else if (team_id) {
          // Upsert permesso team
          db.prepare(
            `INSERT INTO file_team_access (file_id, team_id, min_role, can_download, can_delete)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(file_id, team_id) DO UPDATE SET min_role=?, can_download=?, can_delete=?`
          ).run(
            file_id, team_id, _min_role, _can_download, _can_delete,
            _min_role, _can_download, _can_delete
          );
        }

        return res.status(200).json({ success: true });

      case "DELETE":
        // Elimina permesso user/team su file
        if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });
        if (!user_id && !team_id)
          return res.status(400).json({ error: "user_id o team_id obbligatorio" });

        if (user_id) {
          db.prepare(
            "DELETE FROM file_user_access WHERE file_id = ? AND user_id = ?"
          ).run(file_id, user_id);
        } else if (team_id) {
          db.prepare(
            "DELETE FROM file_team_access WHERE file_id = ? AND team_id = ?"
          ).run(file_id, team_id);
        }

        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: "Metodo non permesso" });
    }
  } catch (err) {
    console.error("Errore permessi file:", err);
    return res.status(500).json({ error: "Errore interno" });
  }
}
