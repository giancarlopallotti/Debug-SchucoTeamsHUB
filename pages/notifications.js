// Percorso: /pages/notifications.js
// Scopo: Pagina notifiche moderna, user dinamico, filtri, badge e UX migliorata
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: Filtro non lette/tutte, badge nuovo, gestione user e azioni ottimizzate

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);

  // Fetch user loggato + notifiche
  useEffect(() => {
    fetch('/api/auth/me', { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        setUser(userData);
        if (userData?.id) {
          fetch(`/api/notifications?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => {
              setNotifications(Array.isArray(data) ? data : []);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  // Segna tutto come letto
  const markAllRead = () => {
    if (!user?.id) return;
    fetch("/api/notifications/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    }).then(() => {
      setNotifications(n => n.map(notif => ({ ...notif, read: 1 })));
    });
  };

  // Segna singola come letta
  const markOneRead = (id) => {
    fetch(`/api/notifications/${id}/read`, { method: "POST" }).then(() => {
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: 1 } : notif));
    });
  };

  const filteredNotifs = showOnlyUnread
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Notifiche</h2>
        {filteredNotifs.length > 0 && showOnlyUnread && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">Nuovo</span>
        )}
      </div>

      <div className="mb-3 flex gap-4 items-center">
        <button
          onClick={() => setShowOnlyUnread(false)}
          className={`px-3 py-1 rounded ${!showOnlyUnread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Tutte
        </button>
        <button
          onClick={() => setShowOnlyUnread(true)}
          className={`px-3 py-1 rounded ${showOnlyUnread ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Solo non lette
        </button>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="ml-auto px-3 py-1 bg-green-600 text-white rounded"
          >
            Segna tutte come lette
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-gray-400 text-xs">Caricamento...</div>
      ) : filteredNotifs.length === 0 ? (
        <div className="text-gray-400 italic">{showOnlyUnread ? "Nessuna notifica non letta" : "Nessuna notifica trovata"}</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded shadow">
          {filteredNotifs.map(notif => (
            <li key={notif.id} className={`p-4 flex items-center ${!notif.read ? "bg-orange-50 font-semibold text-blue-900" : "text-gray-800"}`}>
              <span className="flex-1">
                {notif.message}
                <span className="block text-xs text-gray-400 font-normal mt-1">{new Date(notif.created_at).toLocaleString()}</span>
              </span>
              {!notif.read && (
                <button
                  className="ml-4 text-blue-600 underline text-xs"
                  onClick={() => markOneRead(notif.id)}
                >
                  Segna come letta
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
