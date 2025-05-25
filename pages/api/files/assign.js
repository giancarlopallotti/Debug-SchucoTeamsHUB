// Percorso: /pages/api/files/assign.js
// Scopo: Gestione assegnazione/associazione file <-> entità (team, project, event, client, activity, tag)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 15.08.00
// Note: Solo aggiunte, mantiene compatibilità; usato per bulk assign/unassign

import db from "../../../db/db";

// Mappa nome-relazione -> tabella ponte
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

  const { file_id, relation, ids = [], action = "assign" } = req.body;
  if (!file_id || !relation || !tables[relation]) {
    res.status(400).json({ error: "Parametri mancanti o relazione non supportata" });
    return;
  }

  const table = tables[relation];

  // Aggiungi o rimuovi le associazioni richieste
  if (action === "assign") {
    for (const rel_id of ids) {
      db.prepare(`INSERT OR IGNORE INTO ${table} (file_id, ${relation}_id) VALUES (?, ?)`).run(file_id, rel_id);
    }
    res.status(200).json({ success: true, assigned: ids.length });
    return;
  }

  if (action === "unassign") {
    for (const rel_id of ids) {
      db.prepare(`DELETE FROM ${table} WHERE file_id = ? AND ${relation}_id = ?`).run(file_id, rel_id);
    }
    res.status(200).json({ success: true, unassigned: ids.length });
    return;
  }

  res.status(400).json({ error: "Azione non supportata" });
}
