// Percorso: /pages/api/messages/index.js
// Scopo: API messaggi PRO (filtri, sort, allegati, badge, audit trail)
// Autore: ChatGPT
// Ultima modifica: 22/05/2025

import db from "../../../db/db.js";
import { getSessionUser } from "../../../utils/auth"; // Utility di sessione

export default async function handler(req, res) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "Non autenticato" });

  // GET: elenco messaggi con filtri, sort, badge, allegati
  if (req.method === "GET") {
    const {
      box = "inbox",
      search = "",
      sort = "created_at",
      dir = "desc",
      from,
      to
    } = req.query;

    let sql = `
      SELECT m.*, 
        (SELECT name FROM users WHERE users.id = m.sender_id) AS sender_name,
        EXISTS (SELECT 1 FROM attachments WHERE attachments.message_id = m.id) AS hasAttachment
      FROM messages m
      LEFT JOIN message_recipients r ON r.message_id = m.id
      WHERE 1=1
    `;
    let params = [];

    if (box === "inbox") {
      sql += " AND r.recipient_id = ? AND r.type = 'to' AND m.archived = 0 AND m.deleted = 0";
      params.push(user.id);
    } else if (box === "sent") {
      sql += " AND m.sender_id = ? AND m.deleted = 0";
      params.push(user.id);
    } else if (box === "cc") {
      sql += " AND r.recipient_id = ? AND r.type = 'cc' AND m.archived = 0 AND m.deleted = 0";
      params.push(user.id);
    }

    if (search) {
      sql += " AND (m.subject LIKE ? OR m.body LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (from) {
      sql += " AND date(m.created_at) >= date(?)";
      params.push(from);
    }
    if (to) {
      sql += " AND date(m.created_at) <= date(?)";
      params.push(to);
    }

    // Sort sicuro
    const safeFields = ["created_at", "subject", "sender_id"];
    const orderField = safeFields.includes(sort) ? sort : "created_at";
    const orderDir = dir === "asc" ? "ASC" : "DESC";
    sql += ` GROUP BY m.id ORDER BY m.${orderField} ${orderDir} LIMIT 100`;

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
    return;
  }

  // POST: invio nuovo messaggio
  if (req.method === "POST") {
    const { subject, body, to, cc } = req.body || {};
    if (!subject || !body || !Array.isArray(to) || to.length === 0)
      return res.status(400).json({ error: "Campi obbligatori mancanti" });

    const result = db.prepare(`
      INSERT INTO messages (sender_id, subject, body, created_at) 
      VALUES (?, ?, ?, datetime('now'))
    `).run(user.id, subject, body);
    const message_id = result.lastInsertRowid;

    // Inserisci destinatari principali
    for (const rid of to) {
      db.prepare(`
        INSERT INTO message_recipients (message_id, recipient_id, type)
        VALUES (?, ?, 'to')
      `).run(message_id, rid);
    }
    // Inserisci CC
    if (Array.isArray(cc)) {
      for (const rid of cc) {
        db.prepare(`
          INSERT INTO message_recipients (message_id, recipient_id, type)
          VALUES (?, ?, 'cc')
        `).run(message_id, rid);
      }
    }
    // Log invio (audit)
    db.prepare(`INSERT INTO message_logs (message_id, action, user_id) VALUES (?, ?, ?)`)
      .run(message_id, "sent", user.id);

    res.json({ ok: true, message_id });
    return;
  }

  // PUT: aggiornamento stato (archivia, elimina, segna letto, importante)
  if (req.method === "PUT") {
    const { id } = req.query;
    const body = req.body || {};
    let update = [];
    let logActions = [];

    if ("read" in body) {
      update.push("read = ?");
      logActions.push({ action: "read", user_id: user.id });
    }
    if ("archived" in body) {
      update.push("archived = ?");
      logActions.push({ action: "archived", user_id: user.id });
    }
    if ("deleted" in body) {
      update.push("deleted = ?");
      logActions.push({ action: "deleted", user_id: user.id });
    }
    if ("important" in body) {
      update.push("important = ?");
      logActions.push({ action: "important", user_id: user.id });
    }
    if (!update.length) return res.status(400).json({ error: "Nessun campo valido" });

    db.prepare(`UPDATE messages SET ${update.join(", ")} WHERE id = ?`).run(
      ...Object.values(body), id
    );
    // Log azioni
    for (const log of logActions) {
      db.prepare(`INSERT INTO message_logs (message_id, action, user_id) VALUES (?, ?, ?)`)
        .run(id, log.action, log.user_id);
    }
    res.json({ ok: true });
    return;
  }

  // DELETE: elimina davvero (opzionale, usare solo per pulizia DB, mai in produzione)
  if (req.method === "DELETE") {
    const { id } = req.query;
    db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
    db.prepare(`DELETE FROM message_recipients WHERE message_id = ?`).run(id);
    db.prepare(`DELETE FROM attachments WHERE message_id = ?`).run(id);
    db.prepare(`DELETE FROM message_logs WHERE message_id = ?`).run(id);
    res.json({ ok: true });
    return;
  }

  // Default: metodo non ammesso
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end("Metodo non permesso");
}
