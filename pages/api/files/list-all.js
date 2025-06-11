// Percorso: /pages/api/files/list-all.js
// Restituisce tutti i file con tutti i dati joinati: cartella, tag, team, ecc.

const db = require("../../../db/db");

function getFileJoins(fileId) {
  // Join su tutte le relazioni (tag, team, progetti, clienti, utenti)
  const tags = db.prepare(`
    SELECT t.id, t.name FROM tags_files tf
    JOIN tags t ON tf.tag_id = t.id WHERE tf.file_id = ?
  `).all(fileId);
  const teams = db.prepare(`
    SELECT tm.id, tm.name FROM files_teams ft
    JOIN teams tm ON ft.team_id = tm.id WHERE ft.file_id = ?
  `).all(fileId);
  const projects = db.prepare(`
    SELECT p.id, p.title FROM files_projects fp
    JOIN projects p ON fp.project_id = p.id WHERE fp.file_id = ?
  `).all(fileId);
  const clients = db.prepare(`
    SELECT c.id, c.company FROM files_clients fc
    JOIN clients c ON fc.client_id = c.id WHERE fc.file_id = ?
  `).all(fileId);
  // Puoi aggiungere la join per utenti se la hai (qui esempio generico):
  // const users = ...
  return { tags, teams, projects, clients };
}

export default function handler(req, res) {
  try {
    let files;
    if (req.query.folder_id) {
      // Solo file della cartella selezionata
      files = db.prepare(`
        SELECT f.*, folders.name as folder_name
        FROM files f
        LEFT JOIN folders ON f.folder_id = folders.id
        WHERE f.folder_id = ?
      `).all(req.query.folder_id);
    } else {
      // Tutti i file (nessuna cartella selezionata)
      files = db.prepare(`
        SELECT f.*, folders.name as folder_name
        FROM files f
        LEFT JOIN folders ON f.folder_id = folders.id
      `).all();
    }

    // JOIN: arricchiamo ogni file
    const arricchiti = files.map(file => {
      const joins = getFileJoins(file.id);
      return { ...file, ...joins };
    });

    res.status(200).json({ files: arricchiti });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
