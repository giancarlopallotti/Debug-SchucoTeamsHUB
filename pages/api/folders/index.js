// Percorso: /pages/api/folders/index.js
import db from "../../../db/db.js";

export default async function handler(req, res) {
  switch (req.method) {
    case "GET": {
      // parent_id null/undefined => root, oppure figlio
      const parentId = req.query.parent_id === undefined || req.query.parent_id === "null"
        ? null
        : req.query.parent_id;

      // Recupera cartelle figlie
      const folders = db.prepare(
        "SELECT * FROM folders WHERE (parent_id IS ? OR (parent_id IS NULL AND ? IS NULL)) ORDER BY name ASC"
      ).all(parentId, parentId);

      // Recupera files nella cartella
      const files = db.prepare(
        "SELECT * FROM files WHERE (folder_id IS ? OR (folder_id IS NULL AND ? IS NULL))"
      ).all(parentId, parentId);

      // Sempre la stessa struttura, anche se vuoto!
      res.json({
        folders: folders || [],
        files: files || [],
      });
      break;
    }
    case "POST": {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch {}
      }
      const { name, parent_id, is_public } = body;
      if (!name) return res.status(400).json({ error: "Nome cartella obbligatorio" });
      const info = db.prepare(
        "INSERT INTO folders (name, parent_id, created_by, is_public) VALUES (?, ?, ?, ?)"
      ).run(name, parent_id || null, 1, is_public ? 1 : 0);
      res.json({ success: true, folder_id: info.lastInsertRowid });
      break;
    }
    case "PUT": {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch {} }
      const { id, name, is_public } = body;
      if (!id) return res.status(400).json({ error: "ID obbligatorio" });
      db.prepare(
        "UPDATE folders SET name=?, is_public=?, updated_at=datetime('now') WHERE id=?"
      ).run(name, is_public ? 1 : 0, id);
      res.json({ success: true });
      break;
    }
    case "DELETE": {
      let body = req.body;
      if (typeof body === "string") { try { body = JSON.parse(body); } catch {} }
      const { id } = body;
      if (!id) return res.status(400).json({ error: "ID obbligatorio" });
      db.prepare("DELETE FROM folders WHERE id=?").run(id);
      res.json({ success: true });
      break;
    }
    default:
      res.status(405).json({ error: "Metodo non supportato" });
  }
}
