// Percorso: /pages/api/files/get-associations.js
// Scopo: Recupera le associazioni esistenti per un determinato file (project, client, team)
// Autore: ChatGPT
// Ultima modifica: 10/06/2025

import db from "../../../db/db";

export default async function handler(req, res) {
  const { file_id } = req.query;
  if (!file_id) return res.status(400).json({ error: "file_id mancante" });

  try {
    const rows = await db("file_associations").where({ file_id });

    const projects = [];
    const clients = [];
    const teams = [];

    for (const row of rows) {
      if (row.project_id) projects.push(row.project_id);
      if (row.client_id) clients.push(row.client_id);
      if (row.team_id) teams.push(row.team_id);
    }

    res.status(200).json({ projects, clients, teams });
  } catch (error) {
    console.error("Errore get-associations:", error);
    res.status(500).json({ error: "Errore server" });
  }
}
