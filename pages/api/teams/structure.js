// Percorso: /pages/api/teams/structure.js
// Scopo: Generare struttura Team > Progetti > Utenti con avatar e flag admin
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import db from "../../../db/db";

export default function handler(req, res) {
  try {
    const teams = db.prepare("SELECT id, name, members FROM teams").all();
    const projects = db.prepare("SELECT id, title as name, team_id FROM projects").all();
    const users = db.prepare("SELECT id, name, surname, role, avatar FROM users").all();

    const tree = teams.map(team => {
      const teamProjects = projects.filter(p => p.team_id === team.id);
      const userIds = team.members
        ? team.members.split(",").map(x => parseInt(x)).filter(Boolean)
        : [];

      const adminId = userIds.length ? userIds[0] : null;

      return {
        name: `🧱 ${team.name}`,
        children: teamProjects.length
          ? teamProjects.map(project => {
              const projectUsers = users.filter(u => userIds.includes(u.id));
              return {
                name: `📁 ${project.name}`,
                children: projectUsers.map(u => ({
                  name: `${u.surname} ${u.name} (${u.role})`,
                  attributes: {
                    avatar: u.avatar || null,
                    isAdmin: u.id === adminId
                  }
                }))
              };
            })
          : [{
              name: "🚫 Nessun progetto associato",
              children: users
                .filter(u => userIds.includes(u.id))
                .map(u => ({
                  name: `${u.surname} ${u.name} (${u.role})`,
                  attributes: {
                    avatar: u.avatar || null,
                    isAdmin: u.id === adminId
                  }
                }))
            }]
      };
    });

    res.status(200).json(tree);
  } catch (e) {
    console.error("Errore struttura:", e);
    res.status(500).json({ error: "Errore interno" });
  }
}
