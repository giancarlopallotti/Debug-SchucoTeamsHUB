// Percorso: /pages/api/messages/attachments.js
import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "../../../db/db.js";
import { getSessionUser } from "../../../utils/auth";

// Disabilita bodyParser Next.js (richiesto da formidable)
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const user = await getSessionUser(req, res);
  if (!user) return res.status(401).json({ error: "Non autenticato" });

  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non ammesso" });

  // Parsing form-data
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public/uploads");
  form.keepExtensions = true;
  form.maxFileSize = 15 * 1024 * 1024; // 15 MB

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Errore upload" });

    const message_id = fields.message_id;
    const file = files.file; // <input type="file" name="file" />
    if (!message_id || !file) return res.status(400).json({ error: "Dati mancanti" });

    // Rinominare il file
    const ext = path.extname(file.originalFilename);
    const safeName = `msg_${message_id}_${Date.now()}${ext}`;
    const dest = path.join(form.uploadDir, safeName);
    fs.renameSync(file.filepath, dest);

    // Salva record in tabella attachments
    db.prepare(`
      INSERT INTO attachments (message_id, file_name, file_path)
      VALUES (?, ?, ?)
    `).run(message_id, file.originalFilename, `/uploads/${safeName}`);

    // Aggiorna campo has_attachment su messages
    db.prepare(`UPDATE messages SET has_attachment = 1 WHERE id = ?`).run(message_id);

    res.json({ ok: true, file: `/uploads/${safeName}` });
  });
}
