// ==================================================================
// Percorso: /utils/helpers.js
// Scopo: Utility comuni (parseJSON, uniqueArray, safeLike) per API e frontend
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

// Parsing JSON sicuro, con fallback (array vuoto o quello passato)
export function parseJSON(val, fallback = []) {
  try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

// Restituisce un array con solo elementi unici
export function uniqueArray(arr) {
  return Array.isArray(arr) ? [...new Set(arr)] : [];
}

// Per LIKE su array JSON (es: user_id in ["1","2"]) — uso base
export function safeLike(val) {
  return `%${val}%`;
}
