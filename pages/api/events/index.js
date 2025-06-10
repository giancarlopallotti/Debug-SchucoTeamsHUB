// 📁 File: /pages/api/events/index.js
// 🧩 Scopo: API gestione eventi (GET, POST, PUT) completo di relazioni Utenti, Team, Tag, File, Progetti, Clienti
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 07/06/2025

import db from "../../../db/db";

export default function handler(req, res) {
  /* ========================= GET ========================= */
  if (req.method === "GET") {
    const { id } = req.query;

    //── GET /api/events?id=ID  → singolo evento dettagliato ──
    if (id) {
      const base = db.prepare("SELECT * FROM events WHERE id = ?").get(Number(id));
      if (!base) return res.status(404).json({ error: "Evento non trovato" });

      const idsFor = (table, col) =>
        db.prepare(`SELECT ${col} FROM ${table} WHERE event_id = ?`).all(id).map(r => r[col]);

      return res.status(200).json({
        ...base,
        userIds:    idsFor("events_users"   , "user_id"   ),
        teamIds:    idsFor("events_teams"   , "team_id"   ),
        tagIds:     idsFor("tags_events"    , "tag_id"    ),
        fileIds:    idsFor("events_files"   , "file_id"   ),
        projectIds: idsFor("events_projects", "project_id"),
        clientIds:  idsFor("events_clients" , "client_id" )
      });
    }

    //── GET /api/events  → lista base ──
    const list = db.prepare("SELECT * FROM events ORDER BY start ASC").all();
    return res.status(200).json(list);
  }

  /* ========================= POST ======================== */
  if (req.method === "POST") {
    const {
      title, description, start, end, status,
      userIds = [], teamIds = [], tagIds = [], fileIds = [],
      projectIds = [], clientIds = []
    } = req.body;

    if (!title || !start || !end)
      return res.status(400).json({ error: "Campi obbligatori mancanti" });

    const stmt = db.prepare("INSERT INTO events (title, description, start, end, status) VALUES (?, ?, ?, ?, ?)");
    const info = stmt.run(title, description, start, end, status || "confermato");
    const eventId = info.lastInsertRowid;

    saveRelations(eventId, { userIds, teamIds, tagIds, fileIds, projectIds, clientIds });
    return res.status(200).json({ success: true, id: eventId });
  }

  /* ========================= PUT ========================= */
  if (req.method === "PUT") {
    const {
      id, title, description, start, end, status,
      userIds = [], teamIds = [], tagIds = [], fileIds = [],
      projectIds = [], clientIds = []
    } = req.body;

    if (!id || !title || !start || !end)
      return res.status(400).json({ error: "Campi obbligatori mancanti" });

    db.prepare("UPDATE events SET title = ?, description = ?, start = ?, end = ?, status = ? WHERE id = ?")
      .run(title, description, start, end, status || "confermato", id);

    deleteRelations(id);
    saveRelations(id, { userIds, teamIds, tagIds, fileIds, projectIds, clientIds });

    return res.status(200).json({ success: true });
  }

  /* ======================= FALLBACK ====================== */
  res.setHeader("Allow", ["GET", "POST", "PUT"]);
  return res.status(405).end("Metodo non consentito");
}

/* ------------------------ HELPERS ----------------------- */
function deleteRelations(eventId) {
  db.prepare("DELETE FROM events_users    WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM events_teams    WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM tags_events     WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM events_files    WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM events_projects WHERE event_id = ?").run(eventId);
  db.prepare("DELETE FROM events_clients  WHERE event_id = ?").run(eventId);
}

function saveRelations(eventId, { userIds, teamIds, tagIds, fileIds, projectIds, clientIds }) {
  const insertMany = (table, col, ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    const stmt = db.prepare(`INSERT OR IGNORE INTO ${table} (event_id, ${col}) VALUES (?, ?)`);
    ids.forEach(val => stmt.run(eventId, val));
  };
  insertMany("events_users"   , "user_id"   , userIds);
  insertMany("events_teams"   , "team_id"   , teamIds);
  insertMany("tags_events"    , "tag_id"    , tagIds);
  insertMany("events_files"   , "file_id"   , fileIds);
  insertMany("events_projects", "project_id", projectIds);
  insertMany("events_clients" , "client_id" , clientIds);
}
