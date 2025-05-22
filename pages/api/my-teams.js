// Percorso: /pages/api/my-teams.js

/**
 * Scopo: restituisce i team visibili all'utente loggato
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
    let teams;

    if (user.role === "supervisore") {
      teams = db.prepare("SELECT * FROM teams").all();
    } else {
      teams = db.prepare(`
        SELECT t.*
        FROM teams t
        JOIN user_teams ut ON t.id = ut.team_id
        WHERE ut.user_id = ?
      `).all(user.id);
    }

    return res.status(200).json(teams);
  } catch (err) {
    console.error("Errore my-teams:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
