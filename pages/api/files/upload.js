// Percorso: /pages/api/files/upload.js v2 – 07/06/2025
// Scopo: Upload file avanzato con assegnazione a cartella, note, tags, team, progetti (da join table)
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "../../../db/db.js";

export const config = {
  api: {
    bodyParser: false, // Necessario per formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Solo POST" });

  // Cartella uploads (pubblica)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    uploadDir: uploadsDir,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Errore parsing upload" });

    const { folder_id, note } = fields;
    const uploaded = files.file;

    if (!uploaded) return res.status(400).json({ error: "Nessun file ricevuto" });

    // Gestione array/singolo oggetto + patch filepath/path
    let fileObj = uploaded;
    if (Array.isArray(uploaded)) fileObj = uploaded[0];

    const oldPath = fileObj.filepath || fileObj.path;
    if (!oldPath) return res.status(500).json({ error: "File temporaneo non trovato" });

    const fileName = Date.now() + "_" + fileObj.originalFilename;
    const destPath = path.join(uploadsDir, fileName);

    fs.renameSync(oldPath, destPath);

    // Metadati
    const mimetype = fileObj.mimetype || fileObj.mime;
    const size = fileObj.size;
    const name = fileObj.originalFilename;
    const publicPath = "/uploads/" + fileName;

    // Inserisci il file nella tabella files (aggiungi "note" e altri campi se mancano nel DB!)
    const info = db.prepare(
      "INSERT INTO files (name, path, mimetype, size, folder_id, note, created_at, uploader_id, is_public) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, 0)"
    ).run(
      name,
      publicPath,
      mimetype,
      size,
      folder_id ? Number(folder_id) : null,
      note || "",
      req.headers["x-user-id"] || 1 // Usa user_id reale o 1 (admin)
    );

    const fileId = info.lastInsertRowid;

    // --- PATCH: gestisci tags, teams, progetti (join table) ---

    // Tags (array di ID)
    let tagsArr = [];
    try { if (fields.tags) tagsArr = JSON.parse(fields.tags); } catch {}
    tagsArr.forEach(tagId => {
      db.prepare("INSERT INTO files_tags (file_id, tag_id) VALUES (?, ?)").run(fileId, Number(tagId));
    });

    // Teams (array di ID)
    let teamsArr = [];
    try { if (fields.teams) teamsArr = JSON.parse(fields.teams); } catch {}
    teamsArr.forEach(teamId => {
      db.prepare("INSERT INTO files_teams (file_id, team_id) VALUES (?, ?)").run(fileId, Number(teamId));
    });

    // Progetti (array di ID)
    let projectsArr = [];
    try { if (fields.projects) projectsArr = JSON.parse(fields.projects); } catch {}
    projectsArr.forEach(projectId => {
      db.prepare("INSERT INTO files_projects (file_id, project_id) VALUES (?, ?)").run(fileId, Number(projectId));
    });

    res.json({ success: true, file_id: fileId });
  });
}
