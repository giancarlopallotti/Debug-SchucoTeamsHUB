// Percorso: /pages/api/clients/[id].js

const db = require("../../../db/db.js");

export default function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "ID mancante" });

  if (req.method === "GET") {
    const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
    if (!client) return res.status(404).json({ error: "Cliente non trovato" });
    res.status(200).json(client);
  } else if (req.method === "PUT") {
    const {
      surname, name, company, city, province, address,
      cap, note, main_contact, phone, mobile, emails, documents, avatar
    } = req.body;
    if (!surname || !name || !company) {
      return res.status(400).json({ error: "Nome, Cognome e Azienda sono obbligatori" });
    }
    db.prepare(`
      UPDATE clients SET
        surname = ?, name = ?, company = ?, city = ?, province = ?, address = ?, cap = ?, note = ?, main_contact = ?, phone = ?, mobile = ?, emails = ?, documents = ?, avatar = ?
      WHERE id = ?
    `).run(surname, name, company, city, province, address, cap, note, main_contact, phone, mobile, emails, documents, avatar, id);
    res.status(200).json({ success: true });
  } else if (req.method === "DELETE") {
    db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    res.status(200).json({ success: true });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end("Metodo non permesso");
  }
}
