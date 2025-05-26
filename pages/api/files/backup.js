// /pages/api/files/backup.js
// Scopo: Backup e restore massivo dei files e metadati
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: v1, solo admin, ZIP + JSON, operazioni critiche!

import db from "../../../db/db.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import formidable from "formidable";

// Directory dove sono fisicamente i file caricati
const FILES_DIR = process.env.FILES_DIR || "uploads/";

export const config = {
  api: { bodyParser: false } // necessario per gestire form-data file upload
};

export default async function handler(req, res) {
  // Simulazione check admin (da estendere con vero controllo JWT/cookie)
  const userId = req.headers["x-user-id"] || req.cookies.user_id;
  const userRole = req.headers["x-user-role"] || "user";
  if (!userId || userRole !== "admin") return res.status(403).json({ error: "Solo admin" });

  if (req.method === "POST") {
    const { action } = req.query;

    // BACKUP: esporta tutti i file + metadati in uno ZIP
    if (action === "backup") {
      try {
        const files = db.prepare("SELECT * FROM files").all();
        const meta = JSON.stringify(files, null, 2);
        const zipPath = path.join(FILES_DIR, `backup_files_${Date.now()}.zip`);

        // Crea ZIP
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => {
          res.setHeader("Content-Type", "application/zip");
          res.setHeader("Content-Disposition", `attachment; filename=backup_files.zip`);
          const stream = fs.createReadStream(zipPath);
          stream.pipe(res);
        });

        archive.on("error", err => { throw err; });

        archive.pipe(output);

        // Aggiungi metadati JSON
        archive.append(meta, { name: "files_meta.json" });

        // Aggiungi tutti i files fisici presenti
        for (const file of files) {
          const filePath = path.join(FILES_DIR, file.path);
          if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: path.basename(file.path) });
          }
        }

        await archive.finalize();
      } catch (err) {
        console.error("Errore backup:", err);
        return res.status(500).json({ error: "Errore backup" });
      }
      return;
    }

    // RESTORE: importa ZIP con files + JSON metadati
    if (action === "restore") {
      const form = new formidable.IncomingForm({ multiples: false });

      form.parse(req, async (err, fields, filesUploaded) => {
        if (err || !filesUploaded || !filesUploaded.backup) {
          return res.status(400).json({ error: "File backup non fornito" });
        }

        const zipFile = filesUploaded.backup.filepath || filesUploaded.backup.path;
        const extractDir = path.join(FILES_DIR, "restore_" + Date.now());
        fs.mkdirSync(extractDir, { recursive: true });

        // Estrai ZIP (usa adm-zip o simile, oppure archiver per unzip)
        const AdmZip = require("adm-zip");
        const zip = new AdmZip(zipFile);
        zip.extractAllTo(extractDir, true);

        // Leggi metadati e aggiorna DB
        const metaPath = path.join(extractDir, "files_meta.json");
        if (!fs.existsSync(metaPath)) return res.status(400).json({ error: "Metadati non trovati" });

        const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
        for (const file of meta) {
          // Sovrascrivi/inserisci nel DB files
          db.prepare(`
            INSERT OR REPLACE INTO files
            (id, name, path, uploader_id, size, mimetype, created_at, private, note, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            file.id, file.name, file.path, file.uploader_id, file.size, file.mimetype,
            file.created_at, file.private, file.note, file.is_public
          );
        }

        return res.status(200).json({ success: true, count: meta.length });
      });
      return;
    }
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
