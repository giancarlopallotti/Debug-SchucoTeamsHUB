// Percorso: /pages/dashboard.js
// Scopo: Pagina principale dashboard utente con configurazioni salvate
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

import { useEffect, useState, useCallback } from "react";
import DashboardHeader from "./components/DashboardHeader";
import DashboardLayout from "./components/DashboardLayout";
import NotificationModal from "./components/widgets/NotificationModal";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [layout, setLayout] = useState([]);
  const [activeWidgets, setActiveWidgets] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [notifiche, setNotifiche] = useState([]);
  const [notificheLoading, setNotificheLoading] = useState(true);
  const [modalNotifica, setModalNotifica] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(userData => setUser(userData));

    fetch('/api/user/widgets', { method: 'GET', credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.layout)) setLayout(data.layout);
        if (data && typeof data.activeWidgets === "object") setActiveWidgets(data.activeWidgets);
        if (typeof data?.darkMode === "boolean") setDarkMode(data.darkMode);
      });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setNotificheLoading(true);
    fetch(`/api/notifications?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setNotifiche(Array.isArray(data) ? data.filter(n => !n.read).slice(0, 3) : []);
        setNotificheLoading(false);
      });
  }, [user]);

  const saveDashboardPrefs = useCallback((next) => {
    fetch('/api/user/widgets', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(next)
    });
  }, []);

  const markNotificationRead = id => {
    fetch('/api/notifications/read', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id })
    }).then(() => {
      setModalNotifica(null);
      if (user?.id) {
        fetch(`/api/notifications?user_id=${user.id}`)
          .then(res => res.json())
          .then(data => setNotifiche(Array.isArray(data) ? data.filter(n => !n.read).slice(0, 3) : []));
      }
    });
  };

  return (
    <div className={darkMode ? "bg-gray-900 min-h-screen" : "bg-gray-100 min-h-screen"}>
      <DashboardHeader
        user={user}
        darkMode={darkMode}
        setDarkMode={dm => {
          setDarkMode(dm);
          saveDashboardPrefs({ layout, activeWidgets, darkMode: dm });
        }}
        activeWidgets={activeWidgets}
        setActiveWidgets={aw => {
          setActiveWidgets(aw);
          saveDashboardPrefs({ layout, activeWidgets: aw, darkMode });
        }}
      />
      <DashboardLayout
        layout={layout}
        setLayout={l => {
          setLayout(l);
          saveDashboardPrefs({ layout: l, activeWidgets, darkMode });
        }}
        activeWidgets={activeWidgets}
        darkMode={darkMode}
        notifiche={notifiche}
        notificheLoading={notificheLoading}
        setModalNotifica={setModalNotifica}
        user={user}
        saveDashboardPrefs={saveDashboardPrefs}
      />
      <NotificationModal
        notifica={modalNotifica}
        onClose={() => setModalNotifica(null)}
        onRead={markNotificationRead}
        darkMode={darkMode}
      />
    </div>
  );
}
