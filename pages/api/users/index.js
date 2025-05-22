// Percorso: /pages/api/users/index.js
// Scopo: Gestione lista e creazione utenti; solo il supervisore può creare
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: Sicurezza backend, POST consentito solo al supervisore

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
  if (req.method === "GET") {
    const users = db.prepare("SELECT * FROM users").all();
    return res.status(200).json(users);
  }

  // Protezione: solo supervisore può creare
  const currentUser = getCurrentUser(req);
  if (!currentUser || currentUser.role !== "supervisore") {
    return res.status(403).json({ error: "Solo il supervisore può creare utenti." });
  }

  if (req.method === "POST") {
    const { name, surname, email, password, phone, address, role, status, tags, note } = req.body;
    db.prepare(`INSERT INTO users (name, surname, email, password, phone, address, role, status, tags, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(name, surname, email, password, phone, address, role, status, tags, note);
    return res.status(201).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Metodo ${req.method} non consentito`);
}
