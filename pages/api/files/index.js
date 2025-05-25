// Percorso: /pages/api/files.js
// Scopo: API CRUD avanzato per files con associazioni e filtri
// Autore: ChatGPT (su base file utente, update 25/05/2025)
// Ultima modifica: 25/05/2025

import db from "../../../db/db";

export default function handler(req, res) {
  if (req.method === "GET") {
    // Filtri avanzati da query string
    const {
      q,            // ricerca nome/note
      team_id, project_id, event_id, client_id, activity_id, tag_id,
      status, type, uploader
    } = req.query;

    let query = "SELECT f.* FROM files f";
    const where = [];
    const params = [];

    // JOIN per filtri relazionali
    if (team_id)   { query += " INNER JOIN file_teams ft ON ft.file_id = f.id"; }
    if (project_id){ query += " INNER JOIN file_projects fp ON fp.file_id = f.id"; }
    if (event_id)  { query += " INNER JOIN file_events fe ON fe.file_id = f.id"; }
    if (client_id) { query += " INNER JOIN file_clients fc ON fc.file_id = f.id"; }
    if (activity_id){query += " INNER JOIN file_activities fa ON fa.file_id = f.id"; }
    if (tag_id)    { query += " INNER JOIN file_tags ftg ON ftg.file_id = f.id"; }

    if (q)         { where.push("(f.name LIKE ? OR f.note LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
    if (team_id)   { where.push("ft.team_id = ?"); params.push(team_id); }
    if (project_id){ where.push("fp.project_id = ?"); params.push(project_id); }
    if (event_id)  { where.push("fe.event_id = ?"); params.push(event_id); }
    if (client_id) { where.push("fc.client_id = ?"); params.push(client_id); }
    if (activity_id){where.push("fa.activity_id = ?"); params.push(activity_id); }
    if (tag_id)    { where.push("ftg.tag_id = ?"); params.push(tag_id); }
    if (status)    { where.push("f.status = ?"); params.push(status); }
    if (type)      { where.push("f.type = ?"); params.push(type); }
    if (uploader)  { where.push("f.uploaded_by = ?"); params.push(uploader); }

    if (where.length > 0) {
      query += " WHERE " + where.join(" AND ");
    }

    query += " ORDER BY f.uploaded_at DESC";

    const files = db.prepare(query).all(...params);

    // Recupera anche le associazioni per ogni file
    for (const file of files) {
      file.teams      = db.prepare("SELECT t.* FROM file_teams ft JOIN teams t ON ft.team_id = t.id WHERE ft.file_id = ?").all(file.id);
      file.projects   = db.prepare("SELECT p.* FROM file_projects fp JOIN projects p ON fp.project_id = p.id WHERE fp.file_id = ?").all(file.id);
      file.events     = db.prepare("SELECT e.* FROM file_events fe JOIN events e ON fe.event_id = e.id WHERE fe.file_id = ?").all(file.id);
      file.clients    = db.prepare("SELECT c.* FROM file_clients fc JOIN clients c ON fc.client_id = c.id WHERE fc.file_id = ?").all(file.id);
      file.activities = db.prepare("SELECT a.* FROM file_activities fa JOIN activities a ON fa.activity_id = a.id WHERE fa.file_id = ?").all(file.id);
      file.tags       = db.prepare("SELECT tg.* FROM file_tags ftg JOIN tags tg ON ftg.tag_id = tg.id WHERE ftg.file_id = ?").all(file.id);
    }

    res.status(200).json(files);
    return;
  }

  if (req.method === "POST") {
    const {
      name, path, uploaded_by, type, size, note, status, version,
      teams = [], projects = [], events = [], clients = [], activities = [], tags = []
    } = req.body;

    const stmt = db.prepare("INSERT INTO files (name, path, uploaded_by, type, size, note, status, version, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))");
    const info = stmt.run(name, path, uploaded_by, type, size, note, status, version);
    const file_id = info.lastInsertRowid;

    // Salva associazioni molti-a-molti
    for (const team_id of teams)         db.prepare("INSERT INTO file_teams (file_id, team_id) VALUES (?, ?)").run(file_id, team_id);
    for (const project_id of projects)   db.prepare("INSERT INTO file_projects (file_id, project_id) VALUES (?, ?)").run(file_id, project_id);
    for (const event_id of events)       db.prepare("INSERT INTO file_events (file_id, event_id) VALUES (?, ?)").run(file_id, event_id);
    for (const client_id of clients)     db.prepare("INSERT INTO file_clients (file_id, client_id) VALUES (?, ?)").run(file_id, client_id);
    for (const activity_id of activities)db.prepare("INSERT INTO file_activities (file_id, activity_id) VALUES (?, ?)").run(file_id, activity_id);
    for (const tag_id of tags)           db.prepare("INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?)").run(file_id, tag_id);

    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(file_id);
    res.status(200).json(file);
    return;
  }

  if (req.method === "PUT") {
    const {
      id, name, path, uploaded_by, type, size, note, status, version,
      teams = [], projects = [], events = [], clients = [], activities = [], tags = []
    } = req.body;

    db.prepare(
      "UPDATE files SET name = ?, path = ?, uploaded_by = ?, type = ?, size = ?, note = ?, status = ?, version = ? WHERE id = ?"
    ).run(name, path, uploaded_by, type, size, note, status, version, id);

    // Prima rimuovi tutte le vecchie associazioni
    db.prepare("DELETE FROM file_teams WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_projects WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_events WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_clients WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_activities WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_tags WHERE file_id = ?").run(id);

    // Poi inserisci le nuove
    for (const team_id of teams)         db.prepare("INSERT INTO file_teams (file_id, team_id) VALUES (?, ?)").run(id, team_id);
    for (const project_id of projects)   db.prepare("INSERT INTO file_projects (file_id, project_id) VALUES (?, ?)").run(id, project_id);
    for (const event_id of events)       db.prepare("INSERT INTO file_events (file_id, event_id) VALUES (?, ?)").run(id, event_id);
    for (const client_id of clients)     db.prepare("INSERT INTO file_clients (file_id, client_id) VALUES (?, ?)").run(id, client_id);
    for (const activity_id of activities)db.prepare("INSERT INTO file_activities (file_id, activity_id) VALUES (?, ?)").run(id, activity_id);
    for (const tag_id of tags)           db.prepare("INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?)").run(id, tag_id);

    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    res.status(200).json(file);
    return;
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    db.prepare("DELETE FROM files WHERE id = ?").run(id);

    // Elimina tutte le associazioni collegata
    db.prepare("DELETE FROM file_teams WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_projects WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_events WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_clients WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_activities WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_tags WHERE file_id = ?").run(id);

    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ error: "Metodo non permesso" });
}
