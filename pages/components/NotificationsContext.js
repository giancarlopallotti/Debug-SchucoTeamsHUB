// Percorso: /pages/components/NotificationsContext.js
// Scopo: Context globale per gestione notifiche (conteggio, lista, update)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Usare questo context in Sidebar, Dashboard, ecc.

import { createContext, useContext, useEffect, useState } from "react";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Conta notifiche non lette
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{
      user, notifications, loading, unreadCount, setNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
