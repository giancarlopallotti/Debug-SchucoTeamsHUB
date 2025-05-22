// pages/notifications.js

/**
 * Scopo: gestione notifiche utente loggato, lettura e aggiornamento stato
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 * Note: recupero dati utente da /api/auth/me, stile coerente, aggiornamento UI
 */

import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        setUser(data);
        return fetch(`/api/notifications?user_id=${data.id}`);
      })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error("Errore notifiche:", err))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    if (!user?.id) return;
    await fetch(`/api/notifications/mark-all-read?user_id=${user.id}`, { method: "POST" });
    const res = await fetch(`/api/notifications?user_id=${user.id}`);
    const data = await res.json();
    setNotifications(data);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-blue-900">Notifiche</h1>
      <button
        onClick={markAllRead}
        className="bg-blue-800 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Segna tutte come lette
      </button>

      {loading ? (
        <p>Caricamento notifiche...</p>
      ) : notifications.length === 0 ? (
        <p>Nessuna notifica presente.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map(n => (
            <li key={n.id} className={`p-4 border rounded ${n.read ? "bg-gray-100" : "bg-red-50"}`}>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${n.read ? "text-gray-500" : "text-red-800 font-semibold"}`}>
                  {n.message}
                </span>
                <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}