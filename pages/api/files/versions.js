// Percorso: /pages/api/files/versions.js
import db from "../../../db/db.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Restituisce tutte le versioni di un file (dummy/fallback se non c'è tabella)
    const { file_id } = req.query;
    if (!file_id) return res.status(400).json([]);
    try {
      // Supponiamo una tabella file_versions (id, file_id, name, path, uploader_id, created_at, note)
      const versions = db.prepare("SELECT * FROM file_versions WHERE file_id = ? ORDER BY created_at DESC").all(file_id);
      return res.json(Array.isArray(versions) ? versions : []);
    } catch (err) {
      // Fallback vuoto
      return res.json([]);
    }
  }

  // UPLOAD NUOVA VERSIONE
  if (req.method === "POST") {
    const multiparty = (await import("multiparty")).default;
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Errore upload", details: err.message });
      const file_id = fields.file_id?.[0];
      const note = fields.note?.[0] || "";
      const uploadedBy = fields.uploaded_by?.[0] || null;
      if (!file_id || !files.file?.[0]) return res.status(400).json({ error: "Dati obbligatori" });
      // Salva nuova versione
      const uploaded = files.file[0];
      const versionName = uploaded.originalFilename;
      const ext = path.extname(versionName);
      const newName = uuidv4() + ext;
      const destDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, newName);
      fs.copyFileSync(uploaded.path, destPath);
      // Salva metadata versione
      db.prepare(`
        INSERT INTO file_versions (file_id, name, path, uploader_id, created_at, note)
        VALUES (?, ?, ?, ?, datetime('now'), ?)
      `).run(file_id, versionName, destPath, uploadedBy, note);
      res.json({ success: true });
    });
    return;
  }

  // RESTORE: imposta una versione come attiva
  if (req.method === "PUT") {
    const { file_id, version_id } = req.body;
    if (!file_id || !version_id) return res.status(400).json({ error: "file_id/version_id obbligatori" });
    // Trova la versione scelta
    const v = db.prepare("SELECT * FROM file_versions WHERE id = ? AND file_id = ?").get(version_id, file_id);
    if (!v) return res.status(404).json({ error: "Versione non trovata" });
    // Aggiorna il record file principale (puoi copiare path/nome/note/altro)
    db.prepare("UPDATE files SET name = ?, path = ?, note = ? WHERE id = ?").run(v.name, v.path, v.note || "", file_id);
    res.json({ success: true });
    return;
  }

  res.status(405).json({ error: "Metodo non permesso" });
}
