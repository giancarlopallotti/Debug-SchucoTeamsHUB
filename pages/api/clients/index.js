// Percorso: /pages/api/clients/index.js

const db = require("../../../db/db.js");

export default function handler(req, res) {
  if (req.method === "GET") {
    // Lista tutti i clienti, ordinati per azienda, cognome, nome
    const clients = db.prepare("SELECT * FROM clients ORDER BY company, surname, name").all();
    res.status(200).json(clients);
  } else if (req.method === "POST") {
    // Inserisci nuovo cliente
    const {
      surname, name, company, city, province, address,
      cap, note, main_contact, phone, mobile, emails, documents, avatar
    } = req.body;
    if (!surname || !name || !company) {
      return res.status(400).json({ error: "Nome, Cognome e Azienda sono obbligatori" });
    }
    db.prepare(`
      INSERT INTO clients (surname, name, company, city, province, address, cap, note, main_contact, phone, mobile, emails, documents, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(surname, name, company, city, province, address, cap, note, main_contact, phone, mobile, emails, documents, avatar);
    res.status(201).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end("Metodo non permesso");
  }
}
