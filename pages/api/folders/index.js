// Percorso: /pages/api/folders/index.js
// Scopo: CRUD cartelle, navigazione ad albero, NESSUN filtro permessi (tutti vedono tutto)
// Autore: ChatGPT
// Ultima modifica: 06/06/2025

import db from "../../../db/db.js";

export default async function handler(req, res) {
  // Disabilitiamo qualunque filtro utente/ruolo!
  switch (req.method) {
    case "GET": {
      // GET /api/folders?parent_id=... => figli di una cartella (tutti visibili)
      const parentId = req.query.parent_id ?? null;
      const folders = db
        .prepare("SELECT * FROM folders WHERE parent_id IS ? ORDER BY name ASC")
        .all(parentId);
      // Nessun filtro!
      let files = db
        .prepare("SELECT * FROM files WHERE folder_id IS ?")
        .all(parentId);

      res.json({
        folders,
        files,
      });
      break;
    }
    case "POST": {
      // Crea nuova cartella (chiunque può)
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch {}
      }
      const { name, parent_id, is_public } = body;
      if (!name)
        return res.status(400).json({ error: "Nome cartella obbligatorio" });

      // creator = 1 (admin fittizio) se vuoi, oppure usa pure userId se preferisci!
      const info = db
        .prepare(
          "INSERT INTO folders (name, parent_id, created_by, is_public) VALUES (?, ?, ?, ?)"
        )
        .run(name, parent_id || null, 1, is_public ? 1 : 0);

      res.json({ success: true, folder_id: info.lastInsertRowid });
      break;
    }
    case "PUT": {
      // Modifica cartella (tutti possono)
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch {}
      }
      const { id, name, is_public } = body;
      if (!id) return res.status(400).json({ error: "ID obbligatorio" });

      db.prepare(
        "UPDATE folders SET name=?, is_public=?, updated_at=datetime('now') WHERE id=?"
      ).run(name, is_public ? 1 : 0, id);

      res.json({ success: true });
      break;
    }
    case "DELETE": {
      // Elimina cartella (tutti possono)
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch {}
      }
      const { id } = body;
      if (!id) return res.status(400).json({ error: "ID obbligatorio" });

      db.prepare("DELETE FROM folders WHERE id=?").run(id);
      // (TODO: elimina ricorsivo files/sottocartelle se serve)
      res.json({ success: true });
      break;
    }
    default:
      res.status(405).json({ error: "Metodo non supportato" });
  }
}
