// Percorso: /pages/api/users/[id].js
// Scopo: Gestione utente singolo, protetta: solo il supervisore può modificare/cancellare
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: Sicurezza lato backend (blocco su ruolo)

import db from "../../../db/db.js";
import { parse } from "cookie";

function getCurrentUser(req) {
  const cookies = parse(req.headers.cookie || "");
  const userId = cookies.user_id; // Modifica 'user_id' se usi altro nome cookie!
  if (!userId) return null;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return user || null;
}

export default function handler(req, res) {
  const id = parseInt(req.query.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "ID non valido" });

  // --- Protezione: solo supervisore può modificare o eliminare ---
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== "supervisore") {
    return res.status(403).json({ error: "Solo il supervisore può modificare o eliminare utenti." });
  }

  if (req.method === "GET") {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });
    return res.status(200).json(user);
  }

  if (req.method === "PUT") {
    const { name, surname, email, password, phone, address, role, status, tags, note } = req.body;
    db.prepare(`UPDATE users SET name=?, surname=?, email=?, password=?, phone=?, address=?, role=?, status=?, tags=?, note=? WHERE id=?`)
      .run(name, surname, email, password, phone, address, role, status, tags, note, id);
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
