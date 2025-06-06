// Percorso: /pages/api/files/index.js
// Scopo: API file manager (GET con ACL + path, POST upload, tags fix)
// Autore: ChatGPT
// Ultima modifica: 06/06/2025

import db from "../../../db/db";
import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import { canUserSee } from "./permissions";

export const config = { api: { bodyParser: false } };

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Funzione di query con filtri (path, ricerca, team, progetto, client)
function buildFilterQuery(q) {
  const filters = [];
  const params = [];

  if (q.path !== undefined) { filters.push("f.path = ?"); params.push(q.path); }
  if (q.search) { filters.push("(f.name LIKE ? OR f.note LIKE ?)"); params.push(`%${q.search}%`,`%${q.search}%`); }
  if (q.team)   { filters.push("EXISTS (SELECT 1 FROM files_teams ft WHERE ft.file_id = f.id AND ft.team_id = ?)"); params.push(q.team); }
  if (q.project){ filters.push("EXISTS (SELECT 1 FROM files_projects fp WHERE fp.file_id = f.id AND fp.project_id = ?)"); params.push(q.project); }
  if (q.client) { filters.push("EXISTS (SELECT 1 FROM files_clients fc WHERE fc.file_id = f.id AND fc.client_id = ?)"); params.push(q.client); }

  return { filters, params };
}

export default async function handler(req, res) {
  const user = {
    id: req.cookies?.user_id ? Number(req.cookies.user_id) : null,
    role: req.cookies?.role || "user"
  };

  // --------- GET: lista file con filtri e ACL -----------
  if (req.method === "GET") {
    const { filters, params } = buildFilterQuery(req.query);

    let sql = `
      SELECT f.*, GROUP_CONCAT(DISTINCT t.name) AS tags
      FROM files f
      LEFT JOIN tags_files tf ON tf.file_id = f.id
      LEFT JOIN tags t ON tf.tag_id = t.id
    `;
    if (filters.length) sql += " WHERE " + filters.join(" AND ");
    sql += " GROUP BY f.id ORDER BY f.created_at DESC";

    const rows = db.prepare(sql).all(...params);
    const visible = rows
      .filter(f => canUserSee(f, user))
      .map(f => ({
        ...f,
        tags: (f.tags || "").split(",").filter(Boolean)
      }));
    return res.status(200).json({ files: visible });
  }

  // --------- POST: upload file(s) -----------
  if (req.method === "POST") {
    const form = new IncomingForm({ multiples: true, uploadDir, keepExtensions: true });

    form.parse(req, (err, fields, filesObj) => {
      if (err) return res.status(500).json({ error: "Errore upload" });

      const destPath = fields.path || "";
      const user_id  = user.id || 1;
      const fileList = Array.isArray(filesObj.files) ? filesObj.files : [filesObj.files];

      if (!fileList.length) return res.status(400).json({ error: "Nessun file caricato" });

      const stmt = db.prepare(`
        INSERT INTO files (name, path, uploader_id, size, mimetype, created_at, private, note, is_public)
        VALUES (?, ?, ?, ?, ?, datetime('now'), 0, '', 0)
      `);

      fileList.forEach(f => {
        stmt.run(f.originalFilename, destPath, user_id, f.size, f.mimetype);
      });

      return res.status(200).json({ success: true });
    });
    return;
  }

  // --------- Altri metodi non consentiti -----------
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Metodo non consentito");
}
