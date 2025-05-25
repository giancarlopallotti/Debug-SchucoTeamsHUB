// Percorso: /pages/api/my-clients.js

/**
 * Scopo: restituisce i clienti visibili all'utente loggato
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
    let clients;

    if (user.role === "supervisor") {
      clients = db.prepare("SELECT * FROM clients").all();
    } else {
      clients = db.prepare(`
        SELECT c.*
        FROM clients c
        JOIN user_clients uc ON c.id = uc.client_id
        WHERE uc.user_id = ?
      `).all(user.id);
    }

    return res.status(200).json(clients);
  } catch (err) {
    console.error("Errore my-clients:", err);
    return res.status(500).json({ error: "Errore server" });
  }
}
