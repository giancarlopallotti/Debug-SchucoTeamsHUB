// Percorso: /pages/api/files/search.js v3 – 07/06/2025
// Scopo: Ricerca avanzata file per nome, note, tipo, tags, teams, progetti, autori (filtri multipli)
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import db from "../../../db/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Solo GET" });

  const { q, tags, teams, projects, authors } = req.query;
  let where = [];
  let params = [];

  // Ricerca testo (nome, note, tipo)
  if (q && q.trim()) {
    where.push("(LOWER(f.name) LIKE ? OR LOWER(f.note) LIKE ? OR LOWER(f.mimetype) LIKE ?)");
    const term = `%${q.trim().toLowerCase()}%`;
    params.push(term, term, term);
  }

  // Funzione per generare filtri multipli su join
  function whereOr(values, tableField) {
    if (!values) return;
    // Supporta array, stringa con virgole, o singolo valore
    let ids = [];
    if (Array.isArray(values)) ids = values;
    else if (typeof values === "string" && values.includes(",")) ids = values.split(",").filter(Boolean);
    else if (typeof values === "string" && values.trim() !== "") ids = [values];
    if (!ids.length) return;
    where.push(`(${ids.map(() => `${tableField} = ?`).join(" OR ")})`);
    params.push(...ids.map(Number));
  }

  // Filtro tags multipli
  whereOr(tags, "ft.tag_id");

  // Filtro teams multipli
  whereOr(teams, "fte.team_id");

  // Filtro progetti multipli
  whereOr(projects, "fp.project_id");

  // Filtro autori multipli
  whereOr(authors, "f.uploader_id");

  // Query finale con join
  const files = db.prepare(`
    SELECT DISTINCT f.*
    FROM files f
    LEFT JOIN files_tags ft ON ft.file_id = f.id
    LEFT JOIN files_teams fte ON fte.file_id = f.id
    LEFT JOIN files_projects fp ON fp.file_id = f.id
    WHERE ${where.length ? where.join(" AND ") : "1=1"}
    ORDER BY f.created_at DESC
  `).all(...params);

  res.json({ files });
}
