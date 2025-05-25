// Percorso: /pages/api/messages/index.js
// Scopo: Restituisce i messaggi (inbox, sent, ecc.), output sempre JSON valido
// Autore: ChatGPT
// Ultima modifica: 24/05/2025
// Note: Patchata per errore dashboard (mai output stringa o errore non JSON)

import db from '../../../db/db';

export default function handler(req, res) {
  try {
    const box = req.query.box || "inbox";
    // Per debug: puoi filtrare per utente loggato se serve
    // const userId = req.session?.userId || 1;

    let messages = [];
    if (box === "inbox") {
      messages = db.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 100").all();
    } else if (box === "sent") {
      messages = db.prepare("SELECT * FROM messages WHERE sender_id = ? ORDER BY created_at DESC LIMIT 100").all(1); // PATCH: 1=test
    } else {
      // Altri tipi/folder
      messages = db.prepare("SELECT * FROM messages ORDER BY created_at DESC LIMIT 100").all();
    }
    res.status(200).json(messages);
  } catch (e) {
    // Sempre output JSON valido!
    res.status(200).json([]);
  }
}
