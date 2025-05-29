// ==================================================================
// Percorso: /utils/auth.js
// Scopo: Verifica e generazione JWT + logging avanzato per debug
// Autore: ChatGPT
// Ultima modifica: 28/05/2025 (patch logging debug JWT)
// ==================================================================

import jwt from "jsonwebtoken";

const SECRET = "schuco-secret";

/**
 * Verifica la validità di un JWT, con log dettagliato per debugging.
 * @param {string} token
 * @returns {object|null} payload oppure null se token non valido
 */
export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    console.log("✅ JWT PAYLOAD OK:", payload);
    return payload;
  } catch (err) {
    console.error("❌ JWT verification error:", err.message, "| TOKEN:", token);
    return null;
  }
}

/**
 * Firma/crea un nuovo JWT per l'utente (payload).
 * @param {object} payload
 * @returns {string} JWT
 */
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

/**
 * Recupera l'utente autenticato dalla request (cookie, header o query)
 * @param {*} req
 * @param {*} res
 * @returns {object|null} payload utente autenticato oppure null
 */
export async function getSessionUser(req, res) {
  // Cerca il token nei cookie, header Authorization o query param
  let token = null;

  // Cookie (di default "token")
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Header Authorization: Bearer <token>
  if (!token && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  // Query param (?token=...)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // Se non trovato, utente non autenticato
  if (!token) {
    console.warn("⚠️ Nessun token trovato nella request.");
    return null;
  }

  // Verifica JWT
  const payload = verifyToken(token);
  return payload || null;
}
