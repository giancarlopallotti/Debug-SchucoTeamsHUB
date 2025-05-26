// Percorso: /pages/api/files/index.js
// Scopo: API gestione file con filtri avanzati e risposta JSON robusta
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Migliorata gestione errori, compatibile con UI moderna, filtri query, output sempre { files: [...] }

import db from "../../../db/db";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Funzione per parsing filtri dalla query string
function buildFilterQuery(query) {
  const filters = [];
  const params = [];
  if (query.search) {
    filters.push("(f.name LIKE ? OR f.note LIKE ?)");
    params.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.team) {
    filters.push(`EXISTS (SELECT 1 FROM files_teams ft WHERE ft.file_id = f.id AND ft.team_id = ?)`);
    params.push(query.team);
  }
  if (query.project) {
    filters.push(`EXISTS (SELECT 1 FROM files_projects fp WHERE fp.file_id = f.id AND fp.project_id = ?)`);
    params.push(query.project);
  }
  if (query.client) {
    filters.push(`EXISTS (SELECT 1 FROM files_clients fc WHERE fc.file_id = f.id AND fc.client_id = ?)`);
    params.push(query.client);
  }
  if (query.tag) {
    filters.push(`EXISTS (SELECT 1 FROM tags_files tf INNER JOIN tags t ON tf.tag_id = t.id WHERE tf.file_id = f.id AND t.name LIKE ?)`);
    params.push(`%${query.tag}%`);
  }
  if (query.uploader) {
    filters.push("u.name LIKE ?");
    params.push(`%${query.uploader}%`);
  }
  if (query.privacy !== undefined && query.privacy !== "") {
    filters.push("f.private = ?");
    params.push(Number(query.privacy));
  }
  return { filters, params };
}

// --- HANDLER PRINCIPALE ---
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { filters, params } = buildFilterQuery(req.query);

      // Query base files con JOIN per uploader e tags
      let sql = `
        SELECT f.*, u.name AS uploader_name,
          GROUP_CONCAT(DISTINCT t.name) AS tags
        FROM files f
        LEFT JOIN users u ON f.uploader_id = u.id
        LEFT JOIN tags_files tf ON tf.file_id = f.id
        LEFT JOIN tags t ON tf.tag_id = t.id
      `;
      if (filters.length) {
        sql += " WHERE " + filters.join(" AND ");
      }
      sql += " GROUP BY f.id ORDER BY f.created_at DESC";

      const files = db.prepare(sql).all(...params);

      files.forEach(f => {
        f.tags = (f.tags || "").split(",").filter(Boolean);
      });

      return res.status(200).json({ files });
    }

    if (req.method === "POST") {
      // --- Upload singolo/multiplo ---
      const form = new formidable.IncomingForm({ multiples: true, uploadDir, keepExtensions: true });
      form.parse(req, async (err, fields, filesObj) => {
        if (err) return res.status(500).json({ error: "Errore upload" });

        // Estrai info dal form
        const { note = "", private: priv = 0 } = fields;
        const user_id = 1; // Sostituisci con user_id reale!
        let fileList = filesObj.files ? (Array.isArray(filesObj.files) ? filesObj.files : [filesObj.files]) : [];
        if (!fileList.length) return res.status(400).json({ error: "Nessun file caricato" });

        for (const file of fileList) {
          const relPath = path.basename(file.filepath);
          db.prepare(`
            INSERT INTO files (name, path, uploader_id, size, mimetype, created_at, private, note, is_public)
            VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, 0)
          `).run(file.originalFilename, relPath, user_id, file.size, file.mimetype, priv, note);
        }
        return res.status(200).json({ success: true });
      });
      return;
    }

    if (req.method === "DELETE") {
      // --- Elimina multipli ---
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);
      const { file_ids } = body;
      if (!Array.isArray(file_ids) || !file_ids.length)
        return res.status(400).json({ error: "Nessun file selezionato" });
      for (const id of file_ids) {
        db.prepare("DELETE FROM files WHERE id = ?").run(id);
        // TODO: elimina anche dal filesystem e dalle tabelle ponte
      }
      return res.status(200).json({ success: true });
    }

    // Metodo non permesso
    return res.status(405).json({ error: "Metodo non permesso" });

  } catch (err) {
    console.error("Errore files API:", err);
    return res.status(500).json({ error: "Errore interno files API" });
  }
}
