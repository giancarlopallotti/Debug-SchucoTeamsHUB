// Percorso: /pages/api/files/download.js
import db from '../../../db/db';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver'; // npm install archiver

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Download singolo
    const { file_id } = req.query;
    const row = db.prepare("SELECT * FROM files WHERE id = ?").get(file_id);
    if (!row) return res.status(404).send("Not found");
    const filePath = path.join(process.cwd(), 'uploads', row.stored_name || row.name);
    if (!fs.existsSync(filePath)) return res.status(404).send("Not found");
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(row.name)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
    return;
  }
  // Download multiplo (POST)
  if (req.method === "POST") {
    const { fileIds } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: "Nessun file selezionato" });
    }
    const rows = db.prepare(
      `SELECT * FROM files WHERE id IN (${fileIds.map(() => '?').join(',')})`
    ).all(fileIds);
    res.setHeader("Content-Disposition", `attachment; filename="files.zip"`);
    res.setHeader("Content-Type", "application/zip");
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);
    for (const row of rows) {
      const filePath = path.join(process.cwd(), 'uploads', row.stored_name || row.name);
      if (fs.existsSync(filePath)) {
        archive.file(filePath, { name: row.name });
      }
    }
    await archive.finalize();
    return;
  }
  res.status(405).send("Metodo non permesso");
}
