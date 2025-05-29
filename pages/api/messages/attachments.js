/*
  Percorso: /pages/api/messages/attachments.js
  Scopo: Upload/lista allegati (attachments)
  Autore: ChatGPT
  Ultima modifica: 28/05/2025
*/

import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "../../../db/db.js";

export const config = { api: { bodyParser: false } };
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads/messages");

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();
    form.uploadDir = UPLOAD_DIR;
    form.keepExtensions = true;

    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Errore upload" });
      const { message_id } = fields;
      const file = files.file;
      if (!file || !message_id) return res.status(400).json({ error: "Dati mancanti" });

      const fileUrl = `/uploads/messages/${path.basename(file.path)}`;
      db.prepare(
        `INSERT INTO attachments (message_id, file_name, file_path, uploaded_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(message_id, file.name, fileUrl);
      return res.status(201).json({ success: true, url: fileUrl, file_name: file.name });
    });
    return;
  }

  if (req.method === "GET") {
    const { message_id } = req.query;
    if (!message_id) return res.status(400).json({ error: "ID messaggio mancante" });
    const attachments = db.prepare(
      `SELECT * FROM attachments WHERE message_id = ?`
    ).all(message_id);
    return res.status(200).json(attachments);
  }

  res.setHeader("Allow", ["POST", "GET"]);
  res.status(405).end("Metodo non permesso");
}
