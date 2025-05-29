// ==================================================================
// Percorso: /pages/components/ThreadList.js
// Scopo: Visualizzazione lista thread/conversazioni, filtri, badge
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Integrato con API threads/messages, supporta filtri/badge
// ==================================================================

import React, { useEffect, useState } from "react";
import MessagesSidebar from "./MessagesSidebar"; // Sidebar con filtri rapidi

export default function ThreadList({ onSelectThread, selectedThreadId }) {
  const [threads, setThreads] = useState([]);
  const [badgeCounts, setBadgeCounts] = useState({});
  const [filter, setFilter] = useState("inbox");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Recupero lista thread secondo filtro e ricerca
    async function fetchThreads() {
      let url = `/api/messages?${filter}=1`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      // Adatto la risposta: threads possono arrivare da messaggi distinti (thread_id)
      const grouped = {};
      (data.messages || []).forEach(msg => {
        if (!msg.thread_id) return;
        if (!grouped[msg.thread_id]) grouped[msg.thread_id] = [];
        grouped[msg.thread_id].push(msg);
      });
      // Estraggo un messaggio per thread (il più recente)
      const threadList = Object.values(grouped).map(msgs => msgs[0]);
      setThreads(threadList);
      setBadgeCounts(data.badgeCounts || {});
    }
    fetchThreads();
  }, [filter, search]);

  return (
    <div className="w-full h-full flex flex-col border-r border-gray-200 bg-white dark:bg-slate-900">
      {/* Sidebar Filtri */}
      <MessagesSidebar
        selectedFilter={filter}
        setSelectedFilter={setFilter}
        badgeCounts={badgeCounts}
      />
      {/* Ricerca */}
      <div className="p-2">
        <input
          className="w-full p-2 rounded border"
          placeholder="Cerca thread o messaggi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Elenco thread */}
      <div className="flex-1 overflow-auto">
        {threads.length === 0 && (
          <div className="text-gray-400 text-center p-4">Nessun thread trovato.</div>
        )}
        {threads.map(thread => (
          <div
            key={thread.thread_id}
            className={`p-3 cursor-pointer border-b hover:bg-slate-50 dark:hover:bg-slate-800 ${
              selectedThreadId === thread.thread_id ? "bg-blue-50 dark:bg-blue-950" : ""
            }`}
            onClick={() => onSelectThread(thread.thread_id)}
          >
            <div className="font-semibold truncate">
              {thread.subject || thread.body?.slice(0, 40) || "Nuovo Thread"}
            </div>
            <div className="text-xs text-gray-500 flex gap-2">
              {thread.created_at && (
                <span>{new Date(thread.created_at).toLocaleString()}</span>
              )}
              {thread.tags && JSON.parse(thread.tags).length > 0 && (
                <span>🏷️ {JSON.parse(thread.tags).join(", ")}</span>
              )}
            </div>
            {/* Badge non letto/favorito/archiviato */}
            <div className="mt-1 flex gap-1">
              {thread.unread && <span className="text-blue-500 text-xs">• Non letto</span>}
              {thread.favorited_by && JSON.parse(thread.favorited_by || "[]").includes(thread.sender_id) && (
                <span className="text-yellow-500 text-xs">★</span>
              )}
              {thread.archived_by && JSON.parse(thread.archived_by || "[]").includes(thread.sender_id) && (
                <span className="text-gray-400 text-xs">[Archiviato]</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
