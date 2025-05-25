// Percorso: /pages/api/messages/[id].js
// Scopo: API dettaglio messaggio con recipients, allegati, audit log
// Autore: ChatGPT
// Ultima modifica: 22/05/2025

import db from "../../../db/db.js";
import { getSessionUser } from "../../../utils/auth";

export default async function handler(req, res) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "Non autenticato" });

  const { id } = req.query;
  // Recupera messaggio e verifica permessi (può vedere se è mittente, destinatario o in CC)
  const msg = db.prepare(`
    SELECT m.*, 
      (SELECT name FROM users WHERE id = m.sender_id) AS sender_name,
      (SELECT surname FROM users WHERE id = m.sender_id) AS sender_surname,
      EXISTS (SELECT 1 FROM attachments WHERE attachments.message_id = m.id) AS hasAttachment
    FROM messages m
    WHERE m.id = ?
  `).get(id);

  if (!msg) return res.status(404).json({ error: "Messaggio non trovato" });

  // Verifica permesso lettura (mittente o destinatario o CC)
  const isRecipient = db.prepare(`
    SELECT 1 FROM message_recipients 
    WHERE message_id = ? AND recipient_id = ?
  `).get(id, user.id) || (msg.sender_id === user.id);
  if (!isRecipient) return res.status(403).json({ error: "Accesso negato" });

  // Prendi tutti i destinatari (TO/CC)
  const recipients = db.prepare(`
    SELECT r.type, u.id, u.name, u.surname, u.email
    FROM message_recipients r
    LEFT JOIN users u ON u.id = r.recipient_id
    WHERE r.message_id = ?
    ORDER BY r.type, u.name
  `).all(id);

  // Allegati (se presenti)
  let attachments = [];
  if (msg.hasAttachment) {
    attachments = db.prepare(`
      SELECT id, file_name, file_path, uploaded_at
      FROM attachments
      WHERE message_id = ?
    `).all(id);
  }

  // Audit log (solo per admin/supervisor)
  let audit = [];
  if (user.role === "supervisor" || user.role === "admin") {
    audit = db.prepare(`
      SELECT l.*, u.name, u.surname 
      FROM message_logs l
      LEFT JOIN users u ON u.id = l.user_id
      WHERE l.message_id = ?
      ORDER BY l.created_at DESC
      LIMIT 30
    `).all(id);
  }

  res.json({
    ...msg,
    recipients,
    attachments,
    audit
  });
}
