// Percorso: /pages/api/files/batch-upload.js
// Scopo: Gestione upload multiplo file + assegnazione batch proprietà
// Autore: ChatGPT
import db from "../../../db/db.js";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } }; // Importante per FormData!

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non permesso" });

  // Multiparty per parsing form-data
  const multiparty = (await import("multiparty")).default;
  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Errore parsing", details: err.message });

    const folderId = fields.folder_id?.[0];
    const tagIds = JSON.parse(fields.tags?.[0] || "[]");
    const teamIds = JSON.parse(fields.teams?.[0] || "[]");
    const projectIds = JSON.parse(fields.projects?.[0] || "[]");
    const clientIds = JSON.parse(fields.clients?.[0] || "[]");
    const userIds = JSON.parse(fields.users?.[0] || "[]");

    // Ciclo su ogni file caricato
    for (const fileObj of files.files) {
      const filePath = fileObj.path;
      const originalName = fileObj.originalFilename;
      const mimetype = fileObj.headers["content-type"];
      const size = fileObj.size;

      // Salva fisicamente il file (puoi modificare il path di destinazione se vuoi)
      const destPath = path.join(process.cwd(), "uploads", originalName);
      fs.copyFileSync(filePath, destPath);

      // Salva su DB
      const info = db.prepare(
        "INSERT INTO files (name, path, mimetype, size, folder_id, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
      ).run(originalName, destPath, mimetype, size, folderId);

      const fileId = info.lastInsertRowid;

      // Associa batch tag, team, ecc
      tagIds.forEach(tid => db.prepare("INSERT INTO files_tags (file_id, tag_id) VALUES (?, ?)").run(fileId, tid));
      teamIds.forEach(tid => db.prepare("INSERT INTO files_teams (file_id, team_id) VALUES (?, ?)").run(fileId, tid));
      projectIds.forEach(pid => db.prepare("INSERT INTO files_projects (file_id, project_id) VALUES (?, ?)").run(fileId, pid));
      clientIds.forEach(cid => db.prepare("INSERT INTO files_clients (file_id, client_id) VALUES (?, ?)").run(fileId, cid));
      userIds.forEach(uid => db.prepare("INSERT INTO files_users (file_id, user_id) VALUES (?, ?)").run(fileId, uid));
    }

    res.json({ success: true });
  });
}
