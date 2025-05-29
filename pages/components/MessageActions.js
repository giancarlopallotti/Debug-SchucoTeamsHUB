// ==================================================================
// Percorso: /pages/components/MessageActions.js
// Scopo: Azioni rapide messaggi (archivia, preferiti, letto, reazioni, reply)
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Chiama API modulari, aggiorna stato genitore onRefresh
// ==================================================================

import React, { useState } from "react";

export default function MessageActions({ message, onReply, onRefresh }) {
  const [loading, setLoading] = useState(false);

  // Azione generica API POST (archivia, favorito, letto, reazione)
  async function callAction(api, body = {}) {
    setLoading(true);
    await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_id: message.id, ...body })
    });
    setLoading(false);
    if (onRefresh) onRefresh();
  }

  // Gestione click sulle varie azioni
  return (
    <div className="flex gap-2">
      {/* Reply */}
      <button
        title="Rispondi"
        className="text-blue-500 hover:underline text-sm"
        onClick={onReply}
        disabled={loading}
      >Rispondi</button>

      {/* Archivia */}
      <button
        title="Archivia"
        className="text-gray-500 hover:text-gray-800 text-sm"
        onClick={() => callAction("/api/messages/archive")}
        disabled={loading}
      >Archivia</button>

      {/* Preferito */}
      <button
        title="Preferito"
        className={`text-yellow-500 hover:text-yellow-600 text-sm ${
          (message.favorited_by && JSON.parse(message.favorited_by).includes(message.sender_id))
            ? "font-bold"
            : ""
        }`}
        onClick={() => callAction("/api/messages/favorite")}
        disabled={loading}
      >★</button>

      {/* Segna come letto */}
      <button
        title="Segna come letto"
        className="text-green-500 hover:text-green-700 text-sm"
        onClick={() => callAction("/api/messages/mark-read")}
        disabled={loading}
      >Letto</button>

      {/* Reazioni (demo: like) */}
      <button
        title="Metti like"
        className="text-pink-500 hover:text-pink-700 text-sm"
        onClick={() => callAction("/api/messages/reactions", { reaction: "like" })}
        disabled={loading}
      >👍</button>
    </div>
  );
}
