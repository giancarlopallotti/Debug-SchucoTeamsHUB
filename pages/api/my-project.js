// Percorso: /pages/api/my-projects.js

/**
 * Scopo: restituisce i progetti visibili all'utente loggato
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import db from "../../db/db";
import { parse } from "cookie";
import { verifyToken } from "../../utils/auth";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Non autorizzato" });

  try {
    let projects;

    if (user.role === "supervisore") {
      projects = db.prepare("SELECT * FROM projects").all();
    } else {
      projects = db.prepare(`
        SELECT p.*
        FROM projects p
        JOIN user_projects up ON p.id = up.project_id
        WHERE up.user_id = ?
      `).all(user.id);
    }

    return res.status(200).json(projects);
  } catch (err) {
    console.error("Errore my-projects:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
