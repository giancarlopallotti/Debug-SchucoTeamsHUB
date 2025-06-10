// Percorso: /pages/api/files/associate-unified.js
// Scopo: Gestione unificata associazione/disassociazione file <-> entità tramite tabella file_associations
// Autore: ChatGPT
// Ultima modifica: 10/06/2025

import db from "../../../db/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non permesso" });
  }

  const { file_ids = [], target_type, target_ids = [], action = "assign" } = req.body;

  if (!Array.isArray(file_ids) || !Array.isArray(target_ids) || !target_type) {
    return res.status(400).json({ error: "Parametri non validi" });
  }

  if (!['project', 'client', 'team'].includes(target_type)) {
    return res.status(400).json({ error: "Tipo entità non supportato" });
  }

  try {
    for (const file_id of file_ids) {
      for (const target_id of target_ids) {
        const whereClause = {
          file_id,
          [`${target_type}_id`]: target_id,
        };

        const existing = await db("file_associations").where(whereClause).first();

        if (action === "assign" && !existing) {
          await db("file_associations").insert(whereClause);
        } else if (action === "remove" && existing) {
          await db("file_associations").where(whereClause).del();
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Errore API associate-unified:", error);
    res.status(500).json({ error: "Errore server" });
  }
}