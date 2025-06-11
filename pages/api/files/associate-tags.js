// Percorso: /pages/api/files/associate-tags.js
// Scopo: Aggiunge o rimuove tag da un file nella tabella file_tags
// Autore: ChatGPT
// Ultima modifica: 10/06/2025

import db from "../../../db/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const { file_id, tag, action = "add" } = req.body;

  if (!file_id || !tag || typeof tag !== "string") {
    return res.status(400).json({ error: "Parametri non validi" });
  }

  try {
    if (action === "add") {
      const exists = await db("file_tags").where({ file_id, tag }).first();
      if (!exists) {
        await db("file_tags").insert({ file_id, tag });
      }
    } else if (action === "remove") {
      await db("file_tags").where({ file_id, tag }).del();
    } else {
      return res.status(400).json({ error: "Azione non riconosciuta" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("associate-tags.js errore:", error);
    res.status(500).json({ error: "Errore server" });
  }
}
