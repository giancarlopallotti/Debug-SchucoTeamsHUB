// /pages/api/roles/index.js
const db = require("../../../db/db.js");
export default function handler(req, res) {
  if (req.method === "GET") {
    // Ruoli unici, escludendo vuoti
    const roles = db.prepare("SELECT DISTINCT role FROM users WHERE role IS NOT NULL AND TRIM(role) <> '' ORDER BY role ASC").all();
    res.status(200).json(roles.map(r => r.role));
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end("Metodo non permesso");
  }
};
