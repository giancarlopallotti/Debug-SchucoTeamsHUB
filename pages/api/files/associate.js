// Percorso: /pages/api/files/associate.js
// Scopo: Gestione bulk associazioni/disassociazioni file <-> entità (team, project, event, client, activity, tag)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 15.13.00
// Note: Bulk update relazioni, compatibile con index.js e assign.js

import db from "../../../db/db";

// Relazioni supportate
const tables = {
  team:      "file_teams",
  project:   "file_projects",
  event:     "file_events",
  client:    "file_clients",
  activity:  "file_activities",
  tag:       "file_tags",
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Metodo non permesso" });
    return;
  }

  const { file_ids = [], relation, ids = [], action = "assign" } = req.body;
  if (!Array.isArray(file_ids) || !relation || !tables[relation] || !Array.isArray(ids)) {
    res.status(400).json({ error: "Parametri mancanti o relazione non supportata" });
    return;
  }

  const table = tables[relation];

  let count = 0;
  if (action === "assign") {
    for (const file_id of file_ids) {
      for (const rel_id of ids) {
        db.prepare(`INSERT OR IGNORE INTO ${table} (file_id, ${relation}_id) VALUES (?, ?)`).run(file_id, rel_id);
        count++;
      }
    }
    res.status(200).json({ success: true, assigned: count });
    return;
  }

  if (action === "unassign") {
    for (const file_id of file_ids) {
      for (const rel_id of ids) {
        db.prepare(`DELETE FROM ${table} WHERE file_id = ? AND ${relation}_id = ?`).run(file_id, rel_id);
        count++;
      }
    }
    res.status(200).json({ success: true, unassigned: count });
    return;
  }

  res.status(400).json({ error: "Azione non supportata" });
}
