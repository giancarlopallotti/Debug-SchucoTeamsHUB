// Percorso: /pages/api/projects/clients.js
const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    const clients = db.prepare("SELECT id, name, surname, company FROM clients ORDER BY company, name").all();
    res.status(200).json(clients);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Metodo non permesso");
  }
}
