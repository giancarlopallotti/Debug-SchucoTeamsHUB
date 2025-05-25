// Percorso: /pages/api/files/[id].js
// Scopo: Gestione dettaglio file (GET), aggiornamento (PUT), eliminazione (DELETE) con metadati e relazioni
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 15.00.00
// Note: Integra dettaglio + update + delete, compatibile con index.js

import db from "../../../db/db";

// Helper per recuperare tutte le associazioni del file
function getAssociations(file_id) {
  return {
    teams:      db.prepare("SELECT t.* FROM file_teams ft JOIN teams t ON ft.team_id = t.id WHERE ft.file_id = ?").all(file_id),
    projects:   db.prepare("SELECT p.* FROM file_projects fp JOIN projects p ON fp.project_id = p.id WHERE fp.file_id = ?").all(file_id),
    events:     db.prepare("SELECT e.* FROM file_events fe JOIN events e ON fe.event_id = e.id WHERE fe.file_id = ?").all(file_id),
    clients:    db.prepare("SELECT c.* FROM file_clients fc JOIN clients c ON fc.client_id = c.id WHERE fc.file_id = ?").all(file_id),
    activities: db.prepare("SELECT a.* FROM file_activities fa JOIN activities a ON fa.activity_id = a.id WHERE fa.file_id = ?").all(file_id),
    tags:       db.prepare("SELECT tg.* FROM file_tags ftg JOIN tags tg ON ftg.tag_id = tg.id WHERE ftg.file_id = ?").all(file_id),
  };
}

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    if (!file) return res.status(404).json({ error: "File non trovato" });
    Object.assign(file, getAssociations(id));
    res.status(200).json(file);
    return;
  }

  if (req.method === "PUT") {
    const {
      name, path, uploaded_by, type, size, note, status, version, private: priv,
      teams = [], projects = [], events = [], clients = [], activities = [], tags = []
    } = req.body;

    db.prepare(
      "UPDATE files SET name = ?, path = ?, uploaded_by = ?, type = ?, size = ?, note = ?, status = ?, version = ?, private = ? WHERE id = ?"
    ).run(name, path, uploaded_by, type, size, note, status, version, priv || 0, id);

    // Reset e reinserimento associazioni
    db.prepare("DELETE FROM file_teams WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_projects WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_events WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_clients WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_activities WHERE file_id = ?").run(id);
    db.prepare("DELETE FROM file_tags WHERE file_id = ?").run(id);

    for (const team_id of teams)         db.prepare("INSERT INTO file_teams (file_id, team_id) VALUES (?, ?)").run(id, team_id);
    for (const project_id of projects)   db.prepare("INSERT INTO file_projects (file_id, project_id) VALUES (?, ?)").run(id, project_id);
    for (const event_id of events)       db.prepare("INSERT INTO file_events (file_id, event_id) VALUES (?, ?)").run(id, event_id);
    for (const client_id of clients)     db.prepare("INSERT INTO file_clients (file_id, client_id) VALUES (?, ?)").run(id, client_id);
    for (const activity_id of activities)db.prepare("INSERT INTO file_activities (file_id, activity_id) VALUES (?, ?)").run(id, activity_id);
    for (const tag_id of tags)           db.prepare("INSERT INTO file_tags (file_id, tag_id) VALUES (?, ?)").run(id, tag_id);

    const file = db.prepare("SELECT * FROM files WHERE id = ?").get(id);
    Object.assign(file, getAssociations(id));
    res.status(200).json(file);
    return;
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM files WHERE id = ?").run(id);
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
