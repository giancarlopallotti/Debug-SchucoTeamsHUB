// Percorso: /pages/api/auth/me.js
// Scopo: Restituisce info utente loggato, con join su teams corretta
// Autore: ChatGPT (correzione alias/nomi tabella su richiesta utente)
// Ultima modifica: 25/05/2025

import db from '../../../db/db';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end('Metodo non permesso');
  }

  // Recupera JWT dai cookie
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated (no token)' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || "my-strong-secret-jwt-key");
  } catch (e) {
    return res.status(401).json({ error: 'Token non valido' });
  }

  // Carica dati utente
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.user_id);
  if (!user) {
    return res.status(401).json({ error: 'Utente non trovato' });
  }

  // Lista team associati (corretto: tabella 'teams' e alias 't')
  const teams = db.prepare(`
    SELECT ut.team_id, t.name AS team_name
    FROM user_teams ut
    JOIN teams t ON ut.team_id = t.id
    WHERE ut.user_id = ?
  `).all(user.id);

  // Restituisci anche i team associati
  res.status(200).json({
    id: user.id,
    name: user.name,
    surname: user.surname,
    role: user.role,
    email: user.email,
    teams: teams
  });
}
