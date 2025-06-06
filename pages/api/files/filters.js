// Percorso: /pages/api/files/filters.js
// Scopo: Restituisce solo tag/team/progetti/autori usati nei files
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import db from "../../../db/db.js";

export default async function handler(req, res) {
  // Tags effettivi
  const tags = db.prepare(`
    SELECT DISTINCT t.id, t.name
    FROM tags t
    JOIN files_tags ft ON t.id = ft.tag_id
    JOIN files f ON f.id = ft.file_id
    ORDER BY t.name
  `).all();

  // Team effettivi
  const teams = db.prepare(`
    SELECT DISTINCT te.id, te.name
    FROM teams te
    JOIN files_teams fte ON te.id = fte.team_id
    JOIN files f ON f.id = fte.file_id
    ORDER BY te.name
  `).all();

  // Progetti effettivi
  const projects = db.prepare(`
  SELECT DISTINCT p.id, p.title as name
  FROM projects p
  JOIN files_projects fp ON p.id = fp.project_id
  JOIN files f ON f.id = fp.file_id
  ORDER BY p.title
`).all();

  // Autori effettivi
  const authors = db.prepare(`
    SELECT DISTINCT u.id, u.name, u.email
    FROM users u
    JOIN files f ON f.uploader_id = u.id
    ORDER BY u.name, u.email
  `).all();

  res.json({ tags, teams, projects, authors });
}
