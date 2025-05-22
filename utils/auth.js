// Percorso: /utils/auth.js

/**
 * Scopo: verifica e generazione JWT per autenticazione utente
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "schuco-secret";

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}
