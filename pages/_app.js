// Percorso: /pages/_app.js
// Scopo: App entrypoint globale, integra Sidebar e NotificationsProvider
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Mantiene struttura originale + aggiunta context notifiche

import '../styles/globals.css';
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
// 👉 Importa NotificationsProvider (nuovo context)
import { NotificationsProvider } from "./components/NotificationsContext";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activitiesNotifications, setActivitiesNotifications] = useState(0);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  // Sidebar visibile solo se NON siamo su /login
  const hideSidebarRoutes = ["/login"];
  const showSidebar = !hideSidebarRoutes.includes(router.pathname);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setLoggedUser(data); });
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/activities/notifications');
        if (res.ok) {
          const data = await res.json();
          setActivitiesNotifications(Array.isArray(data) ? data.length : (data.count || 0));
        }
      } catch { }
    };
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000); // 60s
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        setLoggedUser(null);
        router.push("/login");
      });
  };

  return (
    <NotificationsProvider>
      {showSidebar && (
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activitiesNotifications={activitiesNotifications}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          loggedUser={loggedUser}
          handleLogout={handleLogout}
        />
      )}
      <div style={{
        marginLeft: showSidebar ? (collapsed ? 64 : 220) : 0,
        transition: "margin-left 0.2s"
      }}>
        <Component
          {...pageProps}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          loggedUser={loggedUser}
          handleLogout={handleLogout}
        />
      </div>
    </NotificationsProvider>
  );
}
