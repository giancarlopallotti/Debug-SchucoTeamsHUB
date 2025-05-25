// Percorso: /pages/api/auth/login.js
// Scopo: Login sicuro solo con JWT (cookie HttpOnly 'token')
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 12:10:00
// Note: Solo JWT, nessun user_id nel cookie

import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import db from "../../../db/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "my-strong-secret-jwt-key";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email e password obbligatori" });
  }

  // Cerca l'utente in db
  const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);

  if (!user) {
    return res.status(401).json({ error: "Credenziali non valide" });
  }

  // Genera JWT token con i dati essenziali
  const token = jwt.sign(
    { user_id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  // Setta solo il cookie 'token'
  res.setHeader("Set-Cookie", [
    serialize("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 2 // 2h
    }),
  ]);

  res.status(200).json({ ok: true, id: user.id, email: user.email, name: user.name, role: user.role });
}
