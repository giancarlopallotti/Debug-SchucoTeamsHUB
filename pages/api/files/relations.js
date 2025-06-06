// Percorso: /pages/api/files/relations.js v3 – 07/06/2025
import db from "../../../db/db.js";

export default async function handler(req, res) {
  const { file_id } = req.query;
  if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

  // Tags associati (con nome)
  const tags = db.prepare(`
    SELECT t.id, t.name
    FROM files_tags ft
    JOIN tags t ON t.id = ft.tag_id
    WHERE ft.file_id = ?
  `).all(file_id);

  // Teams associati (con nome)
  const teams = db.prepare(`
    SELECT tm.id, tm.name
    FROM files_teams ft
    JOIN teams tm ON tm.id = ft.team_id
    WHERE ft.file_id = ?
  `).all(file_id);

  // Progetti associati (usa title AS name!)
  const projects = db.prepare(`
    SELECT pr.id, pr.title as name
    FROM files_projects fp
    JOIN projects pr ON pr.id = fp.project_id
    WHERE fp.file_id = ?
  `).all(file_id);

  // Clienti associati (con company)
  let clients = [];
  try {
    clients = db.prepare(`
      SELECT c.id, c.company
      FROM files_clients fc
      JOIN clients c ON c.id = fc.client_id
      WHERE fc.file_id = ?
    `).all(file_id);
  } catch {}

  // Utenti associati (opzionale)
  let users = [];
  try {
    users = db.prepare(`
      SELECT u.id, u.name, u.surname
      FROM files_users fu
      JOIN users u ON u.id = fu.user_id
      WHERE fu.file_id = ?
    `).all(file_id);
  } catch {}

  res.json({ tags, teams, projects, clients, users });
}
