// Percorso: /pages/api/files/move.js
import db from "../../../db/db.js";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { file_id, folder_id } = req.body;
  if (!file_id || !folder_id) return res.status(400).json({ error: "file_id e folder_id obbligatori" });
  db.prepare("UPDATE files SET folder_id = ? WHERE id = ?").run(folder_id, file_id);
  res.json({ success: true });
}
