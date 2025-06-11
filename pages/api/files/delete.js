///pages/api/files/delete.js
import fs from "fs";
import path from "path";
import { query } from "../../../db/db"; // Usa la tua utility DB

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { file_id } = req.body;
  if (!file_id) return res.status(400).json({ error: "file_id obbligatorio" });

  // Prendi dal DB il nome file e path esatto
  // Esempio:
  // const { name } = await query("SELECT name FROM files WHERE id=?", [file_id]);
  // const filePath = path.join(UPLOAD_DIR, name);

  // Per esempio diretto:
  const filePath = path.join(UPLOAD_DIR, file_id);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Elimina da DB (adatta alla tua struttura)
  // await query("DELETE FROM files WHERE id=?", [file_id]);

  res.json({ ok: true });
}
