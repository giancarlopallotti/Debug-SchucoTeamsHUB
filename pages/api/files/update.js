// Percorso: /pages/api/files/update.js v2 – 08/06/2025
// Scopo: Aggiorna note, tag, team, progetti, clienti, utenti di un file (join tables)
// Autore: ChatGPT
// Ultima modifica: 08/06/2025

import db from "../../../db/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Solo POST" });
  const { file_id, note, tags, teams, projects, clients, users } = req.body;
  if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

  // Aggiorna note
  db.prepare("UPDATE files SET note = ? WHERE id = ?").run(note || "", file_id);

  // Aggiorna join tags
  db.prepare("DELETE FROM files_tags WHERE file_id = ?").run(file_id);
  (tags || []).forEach(tagId =>
    db.prepare("INSERT INTO files_tags (file_id, tag_id) VALUES (?, ?)").run(file_id, Number(tagId))
  );

  // Aggiorna join teams
  db.prepare("DELETE FROM files_teams WHERE file_id = ?").run(file_id);
  (teams || []).forEach(teamId =>
    db.prepare("INSERT INTO files_teams (file_id, team_id) VALUES (?, ?)").run(file_id, Number(teamId))
  );

  // Aggiorna join progetti
  db.prepare("DELETE FROM files_projects WHERE file_id = ?").run(file_id);
  (projects || []).forEach(projectId =>
    db.prepare("INSERT INTO files_projects (file_id, project_id) VALUES (?, ?)").run(file_id, Number(projectId))
  );

  // Aggiorna join clienti (se hai tabella files_clients)
  if (clients && db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files_clients'").get()) {
    db.prepare("DELETE FROM files_clients WHERE file_id = ?").run(file_id);
    clients.forEach(clientId =>
      db.prepare("INSERT INTO files_clients (file_id, client_id) VALUES (?, ?)").run(file_id, Number(clientId))
    );
  }

  // Aggiorna join utenti (NEW)
  if (users && db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='files_users'").get()) {
    db.prepare("DELETE FROM files_users WHERE file_id = ?").run(file_id);
    users.forEach(userId =>
      db.prepare("INSERT INTO files_users (file_id, user_id) VALUES (?, ?)").run(file_id, Number(userId))
    );
  }

  res.json({ success: true });
}
