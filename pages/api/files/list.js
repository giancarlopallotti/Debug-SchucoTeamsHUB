// Percorso: /pages/api/files/list.js
// Scopo : Restituire i file di una cartella (path) visibili all’utente, per la grid
// Autore : ChatGPT
// Ultima modifica: 30/05/2025

import db from "../../../db/db";

function fetchVisibleFiles(user) {
  const sql = `
    SELECT f.*,
           GROUP_CONCAT(ft.team_id) AS team_ids
    FROM files f
    LEFT JOIN files_teams ft ON ft.file_id = f.id
    GROUP BY f.id`;
  const files = db.prepare(sql).all();

  if (user?.role === "supervisor") return files;

  const teams = db.prepare("SELECT team_id FROM user_teams WHERE user_id = ?").all(user.id).map(r => r.team_id);
  const userAcl = db.prepare("SELECT file_id FROM file_user_access WHERE user_id = ?").all(user.id).map(r => r.file_id);

  return files.filter(f => {
    if (f.is_public) return true;
    if (f.uploader_id === user.id) return true;
    if (userAcl.includes(f.id)) return true;
    const fTeams = (f.team_ids || "").split(",").map(Number).filter(Boolean);
    return fTeams.some(tid => teams.includes(tid));
  });
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Metodo non consentito");
  }

  const folderPath = req.query.path || ""; // es. "docs/manuali"
  const user = {
    id: req.cookies?.user_id ? parseInt(req.cookies.user_id) : null,
    role: req.cookies?.role || "user"
  };
  if (!user.id && user.role !== "supervisor") {
    return res.status(401).json({ error: "Non autenticato" });
  }

  try {
    const visibleFiles = fetchVisibleFiles(user);
    const filesInFolder = visibleFiles.filter(f => {
      const dir = (f.path || "").replace(/\\/g, "/");
      return dir === folderPath;
    });
    res.status(200).json(filesInFolder);
  } catch (e) {
    console.error("/api/files/list", e);
    res.status(500).json({ error: "Errore interno" });
  }
}
