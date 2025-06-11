// Percorso: /pages/api/files/folders.js
// Scopo: Restituisce l'elenco delle cartelle disponibili dal DB (tabella folders)
// Autore: ChatGPT – aggiornato il 10/06/2025 – COMPATIBILE better-sqlite3

const db = require("../../../db/db");

export default function handler(req, res) {
  try {
    const stmt = db.prepare("SELECT id, name FROM folders ORDER BY name ASC");
    const rows = stmt.all();
    const folders = rows.map(r => r.name);
    res.status(200).json(folders);
  } catch (error) {
    console.error("Errore /api/files/folders:", error);
    res.status(500).json({ error: error.message });
  }
}
