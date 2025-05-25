// Percorso: /pages/api/users/avatar.js
// Scopo: Upload avatar utente (salva file in /public/avatars/ e restituisce url)
// Autore: ChatGPT
// Ultima modifica: 23/05/2025

import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const form = new formidable.IncomingForm();
  const uploadDir = path.join(process.cwd(), "public/avatars");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  form.uploadDir = uploadDir;
  form.keepExtensions = true;
  form.maxFileSize = 1024 * 1024 * 2; // max 2MB

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(400).json({ error: "Upload error" });
    const file = files.avatar;
    if (!file) return res.status(400).json({ error: "No file" });
    const fileName = Date.now() + "-" + file.originalFilename.replace(/\s+/g, "_");
    const destPath = path.join(uploadDir, fileName);
    fs.renameSync(file.filepath, destPath);
    // restituisci url pubblico (usato da <img src="...">)
    res.json({ url: "/avatars/" + fileName });
  });
}
