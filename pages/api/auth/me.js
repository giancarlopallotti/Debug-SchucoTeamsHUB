// Percorso: /pages/api/auth/me.js
// Scopo: Recupero informazioni utente loggato
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import db from "../../../db/db";

export default function handler(req, res) {
  try {
    const user_id = parseInt(req.cookies?.user_id, 10);
    if (!user_id || isNaN(user_id)) {
      return res.status(401).json({ error: "Utente non autenticato" });
    }

    const stmt = db.prepare(`
      SELECT id, name, surname, email, role, status
      FROM users
      WHERE id = ?
    `);

    const user = stmt.get(user_id);

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    return res.status(200).json(user);
  } catch (e) {
    console.error("Errore API /auth/me:", e);
    return res.status(500).json({ error: "Errore interno del server" });
  }
}
