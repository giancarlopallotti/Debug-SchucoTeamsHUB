// ==================================================================
// Percorso: /pages/api/auth/login.js
// Scopo: Login utente, setta cookie token + user_id (compatibile db.js CommonJS)
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import { signToken } from '../../../utils/auth';
const db = require('../../../db/db.js'); // <-- usa require (CommonJS)

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Metodo non consentito" });

  const { email, password } = req.body;

  // Ricerca utente in db
  let user;
  try {
    user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  } catch (err) {
    console.error("Errore DB:", err);
    return res.status(500).json({ error: "Errore database" });
  }

  if (!user || user.password !== password)
    return res.status(401).json({ error: "Credenziali errate" });

  // Genera JWT
  const token = signToken({ id: user.id, name: user.name, role: user.role });

  // Setta cookie token + user_id
  res.setHeader("Set-Cookie", [
    `token=${token}; Path=/; HttpOnly; SameSite=Lax;`,
    `user_id=${user.id}; Path=/; SameSite=Lax;`
  ]);

  res.status(200).json({ success: true });
}
