// Percorso: /pages/api/projects/index.js
const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Recupera progetti + clienti associati
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    for (let project of projects) {
      const clients = db.prepare(
        `SELECT c.id, c.name, c.surname, c.company
         FROM clients c
         INNER JOIN project_clients pc ON pc.client_id = c.id
         WHERE pc.project_id = ?`
      ).all(project.id);
      project.clients = clients;
    }
    res.status(200).json(projects);

  } else if (req.method === "POST") {
    const { title, description, status, priority, deadline, note, clients } = req.body;
    if (!title) return res.status(400).json({ error: "Titolo obbligatorio" });
    const result = db.prepare(
      `INSERT INTO projects (title, description, status, priority, deadline, note) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(title, description, status, priority, deadline, note);
    const projectId = result.lastInsertRowid;

    // Gestione clienti associati
    if (Array.isArray(clients)) {
      for (let clientId of clients) {
        db.prepare("INSERT INTO project_clients (project_id, client_id) VALUES (?, ?)").run(projectId, clientId);
      }
    }
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
