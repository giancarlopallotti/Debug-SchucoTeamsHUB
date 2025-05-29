// Percorso: /pages/api/teams/structure.js
// Scopo: Restituisce una struttura gerarchica Team > Progetti > Utenti per il widget supervisor
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import db from "../../../db/db";

export default function handler(req, res) {
  try {
    const teams = db.prepare("SELECT id, name FROM teams").all();
    const projects = db.prepare("SELECT id, title, team_id FROM projects").all();
    const users = db.prepare("SELECT u.name, u.surname, ut.project_id FROM users u JOIN users_to_projects ut ON u.id = ut.user_id").all();

    const tree = teams.map(team => {
      const teamProjects = projects.filter(p => p.team_id === team.id);
      return {
        name: team.name,
        children: teamProjects.map(project => {
          const projectUsers = users.filter(u => u.project_id === project.id);
          return {
            name: project.title,
            children: projectUsers.map(u => ({ name: `${u.name} ${u.surname}` }))
          };
        })
      };
    });

    res.status(200).json(tree);
  } catch (e) {
    console.error("Errore struttura team:", e);
    res.status(500).json({ error: "Errore interno" });
  }
}
