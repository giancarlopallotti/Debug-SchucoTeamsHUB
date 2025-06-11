// Percorso: /pages/api/files/info.js
import db from "../../../db/db";

export default function handler(req, res) {
  // Accetta sia file_id (query string) sia id
  const file_id = req.query.file_id || req.query.id;
  if (!file_id) {
    res.status(400).json({ error: "file_id mancante" });
    return;
  }

  // Recupera il file dal DB
  const file = db.prepare("SELECT * FROM files WHERE id=?").get(file_id);
  if (!file) {
    res.status(404).json({ error: "File non trovato" });
    return;
  }

  // Recupera informazioni aggiuntive collegate al file
  const downloads = db.prepare("SELECT * FROM file_downloads WHERE file_id=?").all(file_id);
  const releases = db.prepare("SELECT * FROM file_releases WHERE file_id=?").all(file_id);

  // Utente che ha caricato il file (se c'è la colonna uploaded_by)
  let uploaded_by = null;
  if (file.uploaded_by) {
    uploaded_by = db.prepare("SELECT * FROM users WHERE id=?").get(file.uploaded_by);
  }

  // (Puoi aggiungere altre join/entità come team, tag, ecc. se vuoi!)

  res.status(200).json({
    ...file,
    downloads,
    releases,
    uploaded_by
  });
}
