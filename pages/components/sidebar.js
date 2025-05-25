// Percorso: /pages/sidebar.js
// Sidebar compatta e responsive con gestione popup Info Utente tramite props da _app.js

import { useRouter } from "next/router";
import {
  FaUsers, FaUserShield, FaProjectDiagram, FaFolderOpen,
  FaCalendarAlt, FaTags, FaSignOutAlt, FaBars, FaTasks
} from "react-icons/fa";
import { useState, useEffect } from "react";

const linkData = [
  { href: "/", label: "Dashboard", icon: <FaUserShield /> },
  { href: "/users", label: "Utenti", icon: <FaUsers /> },
  { href: "/teams", label: "Team", icon: <FaProjectDiagram /> },
  { href: "/files", label: "Files", icon: <FaFolderOpen /> },
  { href: "/clients", label: "Clienti", icon: <FaUsers /> },
  { href: "/projects", label: "Progetti", icon: <FaProjectDiagram /> },
  { href: "/activities", label: "Attività", icon: <FaTasks />, notify: true },
  { href: "/calendar", label: "Calendario", icon: <FaCalendarAlt /> },
  { href: "/tags", label: "Tag", icon: <FaTags /> },
];

export default function Sidebar({
  collapsed, setCollapsed, activitiesNotifications, showUserInfo, setShowUserInfo, loggedUser, handleLogout
}) {
  const router = useRouter();

  // Responsive burger icon per mobile
  const [showBurger, setShowBurger] = useState(false);

  useEffect(() => {
    const handleResize = () => setShowBurger(window.innerWidth < 700);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {showBurger && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed', top: 18, left: 12, zIndex: 1001,
            background: '#162364', color: 'white', border: 'none',
            borderRadius: 8, padding: 8, fontSize: 28, boxShadow: '0 1px 8px rgba(0,0,0,0.09)', cursor: 'pointer',
          }}
        >
          <FaBars />
        </button>
      )}
      <nav
        style={{
          width: collapsed ? 64 : 220,
          background: '#162364',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'flex-start',
          padding: '16px 0',
          transition: 'width 0.25s',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          minHeight: '100vh',
          zIndex: 1000,
          boxShadow: '2px 0 6px rgba(0,0,0,0.10)',
        }}
      >
        <div style={{ width: "100%", textAlign: 'center', marginBottom: collapsed ? 0 : 18 }}>
          {!collapsed && (
            <>
              <img
                src="/LogoSchuco.png"
                alt="Schüco"
                style={{ maxWidth: 110, marginBottom: 8, marginLeft: "auto", marginRight: "auto", display: "block" }}
              />
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>SchucoTeamsHUB</div>
              <div style={{ fontSize: 11, color: "#dedede", fontWeight: 500, marginBottom: 2, marginTop: 2 }}>
                Powered by Giancarlo Pallotti
              </div>
             
            </>
          )}
        </div>
        {/* Collapse/Expand button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'none',
            border: 'none',
            color: '#76CE40',
            fontSize: 20,
            cursor: 'pointer',
            marginLeft: collapsed ? 0 : 4,
            marginBottom: 10,
            outline: 'none'
          }}
          title={collapsed ? "Espandi" : "Collassa"}
        >
          {collapsed ? "»" : "«"}
        </button>
        <div style={{ width: "100%" }}>
          {linkData.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: 'white',
                textDecoration: 'none',
                background: router.pathname === link.href ? "#2843A1" : "transparent",
                borderLeft: router.pathname === link.href ? "4px solid #76CE40" : "4px solid transparent",
                fontWeight: router.pathname === link.href ? "bold" : "normal",
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? "7px 5px" : "7px 16px",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 8,
                fontSize: 15,
                transition: 'all 0.15s',
                position: 'relative',
                margin: '2px 0',
                borderRadius: '0 8px 8px 0',
              }}
              title={link.label}
              onClick={() => {
                if (window.innerWidth < 700) setCollapsed(false);
              }}
            >
              {link.icon}
              {!collapsed && link.label}
              {link.notify && activitiesNotifications > 0 && (
                <span style={{
                  background: "#f43",
                  color: "#fff",
                  borderRadius: "50%",
                  fontSize: 10,
                  minWidth: 18,
                  height: 18,
                  padding: "0 2px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  position: "absolute",
                  right: collapsed ? 4 : 9,
                  top: 4,
                  boxShadow: "0 1px 4px #9008"
                }}>
                  {activitiesNotifications}
                </span>
              )}
            </a>
          ))}
        </div>
        {/* Tasto ESCI */}
        <div style={{ width: "100%", marginTop: "auto", padding: 12 }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "8px 0",
              background: "#e22",
              color: "#fff",
              fontWeight: 700,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 15,
              marginTop: 8
            }}
          >
            <FaSignOutAlt style={{ fontSize: 17 }} /> Esci
          </button>
        </div>
      </nav>
    </>
  );
}
