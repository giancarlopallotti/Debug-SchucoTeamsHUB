// Percorso: /pages/api/teams/index.js
const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Lista tutti i team
    const teams = db.prepare("SELECT * FROM teams ORDER BY id DESC").all();
    res.status(200).json(teams);
  }
  else if (req.method === "POST") {
    // Crea nuovo team
    const { name, manager, description, members, tags } = req.body;

    if (!name || !manager || !members) {
      return res.status(400).json({ error: "Compilare tutti i campi obbligatori." });
    }
    const membersStr = Array.isArray(members) ? members.join(",") : String(members);

    try {
      const result = db.prepare(`
        INSERT INTO teams (name, manager, description, members, tags)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, manager, description, membersStr, tags);
      const newTeam = db.prepare("SELECT * FROM teams WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json(newTeam);
    } catch (err) {
      return res.status(500).json({ error: "Errore creazione team", details: err.message });
    }
  }
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
