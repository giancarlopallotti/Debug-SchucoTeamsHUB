// Percorso: /components/DashboardHeader.js

import { useState } from "react";

export default function DashboardHeader({ user, darkMode, setDarkMode, activeWidgets, setActiveWidgets }) {
  const [showSelector, setShowSelector] = useState(false);

  const widgetsList = [
    { key: "notifications", label: "Notifiche", icon: "🔔" },
    { key: "users", label: "Utenti", icon: "👥" },
    { key: "files", label: "File", icon: "📂" },
    { key: "downloads", label: "Download", icon: "⬇️" },
    { key: "note", label: "Note", icon: "📝" },
    { key: "messages", label: "Messaggi", icon: "📧" }
  ];

  return (
    <header className="flex flex-col md:flex-row md:items-center md:gap-6 mb-4 p-6">
      <div className="flex items-center gap-3">
        <h1 className={`text-2xl font-bold flex-shrink-0 ${darkMode ? "text-blue-200" : "text-blue-900"}`}>Dashboard</h1>
        <button
          className={"ml-4 px-2 py-1 rounded text-xs font-semibold " + (darkMode ? "bg-gray-900 text-white border border-gray-700" : "bg-gray-200 text-gray-700 border border-gray-300")}
          onClick={() => setDarkMode(!darkMode)}
          title="Cambia tema"
          style={{ marginLeft: 16, transition: "all 0.2s" }}
        >
          {darkMode ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full">
        <span className="text-sm text-gray-400 md:border-l md:pl-4 md:ml-4">Benvenuto nella tua area personale</span>
        {user && (
          <span className={
            "text-sm font-medium md:ml-4 " +
            (darkMode ? "text-gray-300" : "text-gray-800")
          }>
            Nome: {user.name} &nbsp; Cognome: {user.surname} &nbsp; • Ruolo:{" "}
            <span style={{
              color: darkMode ? "#46e487" : "#0b9639",
              fontWeight: 600
            }}>{user.role}</span>
          </span>
        )}
      </div>
      <button
        onClick={() => setShowSelector(s => !s)}
        className={`ml-auto mt-2 md:mt-0 text-xs px-4 py-2 rounded shadow border ${darkMode ? "bg-gray-800 text-blue-200 border-gray-700 hover:bg-gray-700" : "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"}`}
      >
        {showSelector ? "Nascondi widget" : "Scegli widget"}
      </button>
      {showSelector && (
        <div className={`shadow border rounded mb-6 p-4 w-full max-w-xl ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {widgetsList.map(w => (
              <label key={w.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activeWidgets[w.key]}
                  onChange={e => setActiveWidgets({ ...activeWidgets, [w.key]: e.target.checked })}
                />
                <span className="text-sm">{w.icon} {w.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
