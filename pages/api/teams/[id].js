// Percorso: /pages/api/teams/[id].js
const db = require("../../../db/db.js");

export default function handler(req, res) {
  const { id } = req.query;

  if (req.method === "GET") {
    // Recupera un team specifico (opzionale, utile per dettagli)
    const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
    if (!team) return res.status(404).json({ error: "Team non trovato" });
    res.status(200).json(team);
  }
  else if (req.method === "PUT") {
    // Modifica team esistente
    const { name, manager, description, members, tags } = req.body;

    if (!name || !manager || !members) {
      return res.status(400).json({ error: "Compilare tutti i campi obbligatori." });
    }
    // Salva sempre come stringa
    const membersStr = Array.isArray(members) ? members.join(",") : String(members);

    try {
      db.prepare(`
        UPDATE teams SET
          name = ?,
          manager = ?,
          description = ?,
          members = ?,
          tags = ?
        WHERE id = ?
      `).run(name, manager, description, membersStr, tags, id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Errore aggiornamento team", details: err.message });
    }
  }
  else if (req.method === "DELETE") {
    // Elimina un team (opzionale)
    db.prepare("DELETE FROM teams WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  }
  else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
