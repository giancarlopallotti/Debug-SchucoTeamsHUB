// Percorso: /pages/api/projects/[id].js
const db = require("../../../db/db.js");

export default function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID mancante" });

  if (req.method === "GET") {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id);
    if (!project) return res.status(404).json({ error: "Progetto non trovato" });
    // Recupera clienti associati
    const clients = db.prepare(
      `SELECT c.id, c.name, c.surname, c.company
       FROM clients c
       INNER JOIN project_clients pc ON pc.client_id = c.id
       WHERE pc.project_id = ?`
    ).all(id);
    project.clients = clients;
    res.status(200).json(project);

  } else if (req.method === "PUT") {
    const { title, description, status, priority, deadline, note, clients } = req.body;
    if (!title) return res.status(400).json({ error: "Titolo obbligatorio" });

    db.prepare(
      `UPDATE projects SET title = ?, description = ?, status = ?, priority = ?, deadline = ?, note = ? WHERE id = ?`
    ).run(title, description, status, priority, deadline, note, id);

    // Aggiorna i clienti associati (cancella e reinserisci)
    db.prepare("DELETE FROM project_clients WHERE project_id = ?").run(id);
    if (Array.isArray(clients)) {
      for (let clientId of clients) {
        db.prepare("INSERT INTO project_clients (project_id, client_id) VALUES (?, ?)").run(id, clientId);
      }
    }
    res.status(200).json({ success: true });

  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM project_clients WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
