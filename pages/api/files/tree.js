// Percorso: /pages/api/files/tree.js
// Scopo : Restituire la struttura ad albero dei file/cartelle VISIBILI all’utente
// Autore : ChatGPT
// Ultima modifica: 30/05/2025

import db from "../../../db/db";

/* ------------------------------------------------------------------
   Helper: restituisce [{ id, name, path , ext, size … }]
   solo per i file che l’utente corrente può vedere
------------------------------------------------------------------ */
function fetchVisibleFiles(user) {
  const baseQuery = `
    SELECT f.id,
           f.name,
           f.path,
           f.size,
           f.mimetype,
           f.uploader_id,
           f.is_public,
           GROUP_CONCAT(ft.team_id) AS team_ids
    FROM files            AS f
    LEFT JOIN files_teams AS ft ON ft.file_id = f.id
    GROUP BY f.id
  `;
  const files = db.prepare(baseQuery).all(); // pochi campi, un’unica query

  // Supervisor vede tutto
  if (user?.role === "supervisor") return files;

  // Recupera team dell’utente
  const teams = db
    .prepare("SELECT team_id FROM user_teams WHERE user_id = ?")
    .all(user.id)
    .map(r => r.team_id);

  // Recupera ACL espliciti file_user_access
  const userAcl = db
    .prepare("SELECT file_id FROM file_user_access WHERE user_id = ?")
    .all(user.id)
    .map(r => r.file_id);

  // Filtra i file
  return files.filter(f => {
    if (f.is_public) return true;
    if (f.uploader_id === user.id) return true;
    if (userAcl.includes(f.id)) return true;
    const fTeams = (f.team_ids || "").split(",").map(Number).filter(Boolean);
    return fTeams.some(tid => teams.includes(tid));
  });
}

/* ------------------------------------------------------------------
   Helper: costruisce un albero annidato a partire dai path
------------------------------------------------------------------ */
function buildTree(files) {
  const root = {};

  files.forEach(f => {
    const parts = f.path ? f.path.split("/").filter(Boolean) : [];
    let pointer = root;

    parts.forEach(dir => {
      if (!pointer[dir]) pointer[dir] = { _children: {} };
      pointer = pointer[dir]._children;
    });

    // inserisci file nella cartella finale
    pointer[f.name] = {
      _file: {
        id: f.id,
        name: f.name,
        ext: f.mimetype,
        size: f.size
      }
    };
  });

  // funzione ricorsiva per convertire in array compatibile con react-d3-tree
  const toArray = (node, nodeName = "") => {
    return Object.entries(node).map(([key, value]) => {
      if (value._file) {
        // nodo foglia (file)
        return {
          name: `📄 ${key}`,
          attributes: value._file
        };
      }
      // cartella
      return {
        name: `📁 ${key}`,
        children: toArray(value._children, key)
      };
    });
  };

  return toArray(root);
}

/* ------------------------------------------------------------------
   Handler principale
------------------------------------------------------------------ */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Metodo non consentito");
  }

  try {
    // --- 1. Ricava user da cookie (super-semplificato) ---
    const user = {
      id: req.cookies?.user_id ? parseInt(req.cookies.user_id) : null,
      role: req.cookies?.role || "user"
    };

    if (!user.id && user.role !== "supervisor") {
      return res.status(401).json({ error: "Non autenticato" });
    }

    // --- 2. Carica file visibili e costruisci albero ---
    const visibleFiles = fetchVisibleFiles(user);
    const tree = buildTree(visibleFiles);

    return res.status(200).json(tree);
  } catch (e) {
    console.error("Errore API /files/tree:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
}
