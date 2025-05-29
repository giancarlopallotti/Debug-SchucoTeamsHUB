// Percorso: /pages/messages.js
// Scopo: Sezione Messaggi con sidebar principale + sidebar locale filtri messaggi + desk conversazioni
// Autore: ChatGPT
// Ultima modifica: 28/05/2025

import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar"; // Sidebar principale
import MessagesSidebar from "./components/MessagesSidebar"; // Sidebar filtri rapidi
import NewMessageModal from "./components/NewMessageModal";
// import altri componenti desk messaggi se necessario

export default function MessagesPage() {
  // Stato per sidebar locale
  const [selectedFilter, setSelectedFilter] = useState("inbox");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Badge dummy: aggiorna secondo i dati reali se vuoi badge dinamici
  const badgeCounts = {
    inbox: threads.filter(t => selectedFilter === "inbox" && !t.archived).length,
    sent: 0, // Da implementare se vuoi vedere "inviati"
    favorites: threads.filter(t => t.is_favorite).length,
    archived: threads.filter(t => t.is_archived).length,
    unread: threads.filter(t => t.unread_count > 0).length
  };

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        setUser(userData);
        // PATCH: controllo user loggato e user_id valido
        if (userData?.id && !isNaN(Number(userData.id))) {
          fetch(`/api/messages?user_id=${Number(userData.id)}`)
            .then(res => res.json())
            .then(data => {
              setThreads(Array.isArray(data) ? data : []);
              setLoading(false);
            });
        } else {
          setThreads([]);
          setLoading(false);
        }
      });
  }, []);

  // Reload conversazioni dopo invio nuovo messaggio
  const reloadThreads = () => {
    if (!user?.id || isNaN(Number(user.id))) return;
    setLoading(true);
    fetch(`/api/messages?user_id=${Number(user.id)}`)
      .then(res => res.json())
      .then(data => {
        setThreads(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar principale */}
      <Sidebar
        collapsed={false}
        setCollapsed={() => {}}
        activitiesNotifications={0}
        showUserInfo={false}
        setShowUserInfo={() => {}}
        loggedUser={user}
        handleLogout={() => { /* implementa logout */ }}
      />

      {/* Sidebar locale filtri messaggi */}
      <MessagesSidebar
        selected={selectedFilter}
        onSelect={setSelectedFilter}
        badgeCounts={badgeCounts}
        onNewMessage={() => setShowNewMessageModal(true)}
      />

      {/* Desk messaggi */}
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Messaggi</h1>
          {/* Bottone nuovo messaggio anche qui per UX ottimale */}
          <button
            className="btn-primary"
            onClick={() => setShowNewMessageModal(true)}
          >
            Nuovo messaggio
          </button>
        </div>

        {/* Lista conversazioni secondo filtro scelto */}
        {loading ? (
          <div className="text-gray-400 text-sm">Caricamento...</div>
        ) : threads.length === 0 ? (
          <div className="text-gray-500 italic flex flex-col items-center mt-12">
            <div>Nessuna conversazione trovata.</div>
            <button
              className="btn-primary mt-6"
              onClick={() => setShowNewMessageModal(true)}
            >
              Crea la prima conversazione
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white rounded shadow">
            {threads
              .filter(thread => {
                if (selectedFilter === "favorites") return thread.is_favorite;
                if (selectedFilter === "archived") return thread.is_archived;
                if (selectedFilter === "unread") return thread.unread_count > 0;
                // inbox = default
                return !thread.is_archived;
              })
              .map(thread => (
                <li key={thread.id} className="p-4 hover:bg-blue-50 transition flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg">{thread.title || "Senza oggetto"}</div>
                      <div className="text-xs text-gray-500">
                        {thread.author_name} •{" "}
                        {thread.last_message_at && new Date(thread.last_message_at).toLocaleString()}
                      </div>
                    </div>
                    {/* Badge non letti */}
                    {thread.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-4">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-800 mt-1 line-clamp-2">
                    {thread.last_body || "(Nessun testo)"}
                  </div>
                </li>
              ))}
          </ul>
        )}

        {/* Modale Nuovo Messaggio */}
        {showNewMessageModal && (
          <NewMessageModal
            onSend={() => {
              setShowNewMessageModal(false);
              reloadThreads();
            }}
            onClose={() => setShowNewMessageModal(false)}
          />
        )}
      </main>
    </div>
  );
}
