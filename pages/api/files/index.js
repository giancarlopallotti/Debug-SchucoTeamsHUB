// Percorso: /pages/api/files/index.js

/**
 * Scopo: Restituisce solo i file visibili all'utente loggato
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

  if (!token) return res.status(401).json({ error: "Non autorizzato" });

  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Token non valido" });

  try {
    let files;

    if (user.role === "supervisore") {
      files = db.prepare("SELECT * FROM files").all();
    } else {
      const query = `
        SELECT DISTINCT f.*
        FROM files f
        LEFT JOIN files_projects fp ON f.id = fp.file_id
        LEFT JOIN files_clients fc ON f.id = fc.file_id
        LEFT JOIN files_teams ft ON f.id = ft.file_id
        LEFT JOIN user_projects up ON fp.project_id = up.project_id AND up.user_id = ?
        LEFT JOIN user_clients uc ON fc.client_id = uc.client_id AND uc.user_id = ?
        LEFT JOIN user_teams ut ON ft.team_id = ut.team_id AND ut.user_id = ?
        WHERE 
          f.private = 0
          AND (up.user_id IS NOT NULL OR uc.user_id IS NOT NULL OR ut.user_id IS NOT NULL)
        UNION
        SELECT * FROM files WHERE private = 1 AND uploader_id = ?
      `;

      files = db.prepare(query).all(user.id, user.id, user.id, user.id);
    }

    return res.status(200).json(files);
  } catch (err) {
    console.error("Errore nel recupero dei files:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
