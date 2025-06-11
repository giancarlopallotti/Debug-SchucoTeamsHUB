///pages/api/files/raw/[id].js
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export default function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).end();
  // In produzione: valida accessi/permessi, prendi path dal DB!
  const filePath = path.join(UPLOAD_DIR, id); // O id-to-nome, se serve
  if (!fs.existsSync(filePath)) return res.status(404).end();
  const ext = path.extname(filePath).toLowerCase();
  const type =
    ext === ".pdf" ? "application/pdf"
    : [".jpg", ".jpeg"].includes(ext) ? "image/jpeg"
    : ext === ".png" ? "image/png"
    : "application/octet-stream";
  res.setHeader("Content-Type", type);
  fs.createReadStream(filePath).pipe(res);
}
