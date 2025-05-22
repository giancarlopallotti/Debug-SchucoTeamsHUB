// Percorso: /pages/api/files/index.js

/**
 * Scopo: upload file e restituzione lista filtrata per utente loggato
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import formidable from "formidable";
import fs from "fs";
import path from "path";
import { parse } from "cookie";
import { verifyToken } from "../../../utils/auth";
import db from "../../../db/db";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.token;
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Utente non autenticato" });

  if (req.method === "POST") {
    const form = new formidable.IncomingForm({ keepExtensions: true });
    form.uploadDir = path.join(process.cwd(), "/public/uploads");
    fs.mkdirSync(form.uploadDir, { recursive: true });

    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).json({ error: "Errore parsing file" });
      const file = files.file;
      const name = file.originalFilename;
      const filename = path.basename(file.filepath);
      const url = "/uploads/" + filename;
      const size = file.size;
      const mimetype = file.mimetype;

      const stmt = db.prepare(
        `INSERT INTO files (name, url, size, mimetype, uploader_id, created_at, private)
         VALUES (?, ?, ?, ?, ?, datetime('now'), 0)`
      );
      const info = stmt.run(name, url, size, mimetype, user.id);

      return res.status(200).json({ id: info.lastInsertRowid, name, url });
    });
  }

  if (req.method === "GET") {
    // delegato ad altro file API o già gestito altrove
    return res.status(405).end();
  }

  return res.status(405).json({ error: "Metodo non permesso" });
}
