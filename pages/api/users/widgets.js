// Percorso: /pages/api/users/widgets.js
// Scopo: Salvataggio/ripristino configurazione dashboard utente (layout, widget attivi, dark mode)
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import db from "../../../db/db";

export default function handler(req, res) {
  let user_id = null;
  if (req.cookies && req.cookies.user_id) {
    user_id = parseInt(req.cookies.user_id, 10);
  }
  if (!user_id || isNaN(user_id)) {
    return res.status(401).json({ error: "Non autenticato" });
  }

  if (req.method === "GET") {
    try {
      const row = db.prepare("SELECT widgets FROM user_widgets WHERE user_id = ?").get(user_id);
      if (row && row.widgets) {
        let config;
        try {
          config = JSON.parse(row.widgets);
        } catch {
          config = {};
        }

        // Aggiunge structure=true se utente è supervisor e il widget manca
        if (config.activeWidgets && typeof config.activeWidgets === "object") {
          if (config.structure === undefined && config.role === "supervisor") {
            config.activeWidgets.structure = true;
          }
        }

        return res.status(200).json({
          layout: Array.isArray(config.layout) ? config.layout : [],
          activeWidgets: typeof config.activeWidgets === "object" && config.activeWidgets !== null ? config.activeWidgets : {},
          darkMode: typeof config.darkMode === "boolean" ? config.darkMode : false
        });
      } else {
        return res.status(200).json({
          layout: [],
          activeWidgets: { structure: true },
          darkMode: false
        });
      }
    } catch (e) {
      console.error("Errore GET widgets:", e);
      return res.status(500).json({ error: "Errore server" });
    }
  }

  if (req.method === "POST") {
    try {
      const { layout, activeWidgets, darkMode } = req.body;
      if (!Array.isArray(layout) || typeof activeWidgets !== "object" || typeof darkMode !== "boolean") {
        return res.status(400).json({ error: "Dati non validi" });
      }
      const toStore = JSON.stringify({ layout, activeWidgets, darkMode });

      db.prepare("INSERT OR REPLACE INTO user_widgets (user_id, widgets) VALUES (?, ?)").run(user_id, toStore);

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Errore POST widgets:", e);
      return res.status(500).json({ error: "Errore server" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Metodo ${req.method} non consentito`);
}
