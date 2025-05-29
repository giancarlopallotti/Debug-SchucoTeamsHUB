// Percorso: /pages/api/projects/index.js
// Scopo: API per lettura progetti con team e clienti associati
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import db from "../../../db/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    // Recupera tutti i progetti
    const projects = db.prepare("SELECT * FROM projects").all();

    // Recupera tutti i clienti (una sola volta)
    const allClients = db.prepare("SELECT id, name FROM clients").all();

    const enrichedProjects = projects.map(p => {
      let clientIds = [];

      try {
        if (p.clients && typeof p.clients === "string") {
          clientIds = p.clients.split(",").map(id => id.trim()).filter(Boolean);
        }
      } catch (err) {
        clientIds = [];
      }

      const clientObjs = clientIds.map(cid =>
        allClients.find(c => String(c.id) === String(cid))
      ).filter(Boolean);

      return {
        ...p,
        clients: clientObjs
      };
    });

    return res.status(200).json(enrichedProjects);
  } catch (e) {
    console.error("Errore API progetti:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
