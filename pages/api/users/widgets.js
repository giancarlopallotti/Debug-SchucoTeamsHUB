// Percorso: /pages/api/user/widgets.js
// Scopo: Salvataggio/ripristino configurazione dashboard utente (layout, widget attivi, dark mode)
// Autore: ChatGPT
// Ultima modifica: 26/05/2025

import db from "../../../db/db"; // Adatta il path se diverso nel tuo progetto

export default async function handler(req, res) {
  // --- 1. AUTENTICAZIONE (usa sempre INTEGER!) ---
  let user_id = null;
  if (req.cookies && req.cookies.user_id) {
    user_id = parseInt(req.cookies.user_id, 10);
  }
  if (!user_id || isNaN(user_id)) {
    return res.status(401).json({ error: "Non autenticato" });
  }

  // --- 2. GET: Recupero configurazione dashboard ---
  if (req.method === "GET") {
    try {
      const row = await db.get("SELECT widgets FROM user_widgets WHERE user_id = ?", [user_id]);
      if (row && row.widgets) {
        let config;
        try { config = JSON.parse(row.widgets); } catch { config = {}; }
        return res.status(200).json({
          layout: Array.isArray(config.layout) ? config.layout : [],
          activeWidgets: typeof config.activeWidgets === "object" && config.activeWidgets !== null ? config.activeWidgets : {},
          darkMode: typeof config.darkMode === "boolean" ? config.darkMode : false
        });
      } else {
        return res.status(200).json({ layout: [], activeWidgets: {}, darkMode: false });
      }
    } catch (e) {
      console.error("Errore GET widgets:", e);
      return res.status(500).json({ error: "Errore server" });
    }
  }

  // --- 3. POST: Salvataggio configurazione dashboard ---
  if (req.method === "POST") {
    try {
      const { layout, activeWidgets, darkMode } = req.body;
      // Validazione minima (puoi ampliare)
      if (!Array.isArray(layout) || typeof activeWidgets !== "object" || typeof darkMode !== "boolean") {
        return res.status(400).json({ error: "Dati non validi" });
      }
      const toStore = JSON.stringify({ layout, activeWidgets, darkMode });
      await db.run(
        "INSERT OR REPLACE INTO user_widgets (user_id, widgets) VALUES (?, ?)",
        [user_id, toStore]
      );
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("Errore POST widgets:", e);
      return res.status(500).json({ error: "Errore server" });
    }
  }

  // --- 4. Metodo non consentito ---
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Metodo ${req.method} non consentito`);
}
