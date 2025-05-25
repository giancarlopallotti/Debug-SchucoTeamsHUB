// Percorso: /pages/api/users/details.js
// Scopo: Restituisce utenti con TUTTI i ruoli associati
import db from "../../../db/db";

export default function handler(req, res) {
  const users = db.prepare(`
    SELECT u.*, 
      GROUP_CONCAT(r.name) AS roles
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id
  `).all();

  res.status(200).json(users.map(u => ({
    ...u,
    roles: u.roles ? u.roles.split(",") : []
  })));
}
