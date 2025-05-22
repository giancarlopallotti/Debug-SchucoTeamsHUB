// Percorso: /pages/api/tags/[id].js
// Scopo: Eliminazione tag referenziale sicura (conta dove usato, elimina a cascata)
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: REST API DELETE, verifica multi-tabella, elimina solo se confermato

import db from "../../../db/db.js";

export default function handler(req, res) {
  const tag_id = parseInt(req.query.id, 10);

  if (isNaN(tag_id)) {
    return res.status(400).json({ error: "Invalid tag_id" });
  }

  // --- ELIMINAZIONE TAG ---
  if (req.method === "DELETE") {
    // Modalità "check" solo se ?confirm=0 (default)
    const confirm = req.query.confirm === "1";

    // Conta utilizzi in ogni tabella ponte
    const usage = {
      files: db.prepare("SELECT COUNT(*) AS n FROM tags_files WHERE tag_id = ?").get(tag_id).n,
      projects: db.prepare("SELECT COUNT(*) AS n FROM tags_projects WHERE tag_id = ?").get(tag_id).n,
      clients: db.prepare("SELECT COUNT(*) AS n FROM tags_clients WHERE tag_id = ?").get(tag_id).n,
      events: db.prepare("SELECT COUNT(*) AS n FROM tags_events WHERE tag_id = ?").get(tag_id).n,
      teams: db.prepare("SELECT COUNT(*) AS n FROM tags_teams WHERE tag_id = ?").get(tag_id).n
    };

    const total = Object.values(usage).reduce((acc, val) => acc + val, 0);

    if (!confirm) {
      // Primo passaggio: restituisci info su dove è usato (per conferma frontend)
      if (total > 0) {
        return res.status(200).json({
          inUse: true,
          usage,
          message: "Tag in uso: conferma per eliminazione a cascata"
        });
      } else {
        // Se non usato, ok per eliminazione diretta
        return res.status(200).json({
          inUse: false,
          usage,
          message: "Tag non in uso, eliminabile subito"
        });
      }
    } else {
      // Confermato: elimina TUTTE le referenze + il tag stesso
      db.prepare("DELETE FROM tags_files WHERE tag_id = ?").run(tag_id);
      db.prepare("DELETE FROM tags_projects WHERE tag_id = ?").run(tag_id);
      db.prepare("DELETE FROM tags_clients WHERE tag_id = ?").run(tag_id);
      db.prepare("DELETE FROM tags_events WHERE tag_id = ?").run(tag_id);
      db.prepare("DELETE FROM tags_teams WHERE tag_id = ?").run(tag_id);
      db.prepare("DELETE FROM tags WHERE id = ?").run(tag_id);

      return res.status(200).json({ success: true, deleted: tag_id });
    }
  }

  // --- AGGIORNAMENTO (opzionale, modifica nome) ---
  if (req.method === "PUT") {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Missing tag name" });
    }
    try {
      db.prepare("UPDATE tags SET name = ? WHERE id = ?").run(name, tag_id);
      return res.status(200).json({ success: true, id: tag_id, name });
    } catch (e) {
      return res.status(400).json({ error: "Nome duplicato o errore" });
    }
  }

  res.setHeader("Allow", ["DELETE", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
