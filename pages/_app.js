// Percorso: /pages/_app.js
// Scopo: App entrypoint che importa Sidebar modulare e la rende responsive
import '../styles/globals.css';
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activitiesNotifications, setActivitiesNotifications] = useState(0);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

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
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  // Sidebar visibile solo se NON siamo su /login
  const hideSidebarRoutes = ["/login"];
  const showSidebar = !hideSidebarRoutes.includes(router.pathname);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {showSidebar &&
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activitiesNotifications={activitiesNotifications}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
          loggedUser={loggedUser}
          handleLogout={handleLogout}
        />}
      <main style={{
        flex: 1,
        background: '#f3f6fb',
        minHeight: '100vh',
        marginLeft: showSidebar ? (collapsed ? 64 : 220) : 0,
        transition: 'margin-left 0.25s',
        width: "100%"
      }}>
        <Component {...pageProps} loggedUser={loggedUser} />
      </main>
    </div>
  );
}
