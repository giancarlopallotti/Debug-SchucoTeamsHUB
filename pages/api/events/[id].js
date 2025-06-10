// 📁 File: /pages/api/events/[id].js
import db from "../../../db/db";

export default function handler(req, res) {
  const { id } = req.query;

  // ========== DELETE ==========
  if (req.method === "DELETE") {
    if (!id) return res.status(400).json({ error: "ID mancante" });
    // Elimina tutte le relazioni collegate
    db.prepare("DELETE FROM events_users    WHERE event_id = ?").run(id);
    db.prepare("DELETE FROM events_teams    WHERE event_id = ?").run(id);
    db.prepare("DELETE FROM tags_events     WHERE event_id = ?").run(id);
    db.prepare("DELETE FROM events_files    WHERE event_id = ?").run(id);
    db.prepare("DELETE FROM events_projects WHERE event_id = ?").run(id);
    db.prepare("DELETE FROM events_clients  WHERE event_id = ?").run(id);
    // Elimina evento
    db.prepare("DELETE FROM events WHERE id = ?").run(id);
    return res.status(200).json({ success: true });
  }

  // ========== GET ==========
  if (req.method === "GET") {
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

  res.setHeader("Allow", ["GET", "DELETE"]);
  res.status(405).end("Metodo non consentito");
}
