// Percorso: /pages/api/files/download-zip.js
import db from '../../../db/db';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export default async function handler(req, res) {
  const ids = (req.query.ids || '').split(',').map(i => parseInt(i)).filter(Boolean);
  if (!ids.length) return res.status(400).send("Nessun file selezionato");
  const files = db.prepare(`SELECT * FROM files WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids);

  res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');
  res.setHeader('Content-Type', 'application/zip');
  const archive = archiver('zip');
  archive.pipe(res);

  for (const file of files) {
    const filePath = path.join(process.cwd(), 'uploads', file.stored_name || file.name);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file.name });
    }
  }
  await archive.finalize();
}
