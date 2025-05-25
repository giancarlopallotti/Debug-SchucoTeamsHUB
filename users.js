// pages/api/teams/users.js

const db = require('../../../db/db');

export default function handler(req, res) {
  if (req.method === 'POST') {
    // Associa un utente a un team
    const { user_id, team_id } = req.body;
    if (!user_id || !team_id) {
      return res.status(400).json({ message: 'user_id e team_id obbligatori' });
    }
    try {
      db.prepare('INSERT OR IGNORE INTO user_teams (user_id, team_id) VALUES (?, ?)').run(user_id, team_id);
      res.status(201).json({ message: 'Utente assegnato al team!' });
    } catch (err) {
      res.status(500).json({ message: 'Errore server', error: err.message });
    }
  } else if (req.method === 'DELETE') {
    // Rimuovi un utente da un team
    const { user_id, team_id } = req.body;
    if (!user_id || !team_id) {
      return res.status(400).json({ message: 'user_id e team_id obbligatori' });
    }
    try {
      db.prepare('DELETE FROM user_teams WHERE user_id = ? AND team_id = ?').run(user_id, team_id);
      res.status(200).json({ message: 'Utente rimosso dal team!' });
    } catch (err) {
      res.status(500).json({ message: 'Errore server', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Metodo non consentito' });
  }
}
