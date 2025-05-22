// Percorso: /pages/dashboard.js

/**
 * Scopo: dashboard dinamica con widget selezionabili, escluso 'unreadNotifications'
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import { useEffect, useState } from "react";

export default function Dashboard() {
  const availableWidgets = {
    users: {
      label: "Utenti Registrati",
      valueKey: "totalUsers",
      color: "text-blue-800"
    },
    files: {
      label: "File Caricati",
      valueKey: "totalFiles",
      color: "text-blue-800"
    },
    downloads: {
      label: "Download Totali",
      valueKey: "totalDownloads",
      color: "text-blue-800"
    },
    today: {
      label: "Download Oggi",
      valueKey: "downloadsToday",
      color: "text-blue-800"
    },
    recentFiles: {
      label: "Ultimi File Caricati",
      valueKey: "recentFiles",
      color: "text-green-700"
    },
    upcomingEvents: {
      label: "Eventi in Arrivo",
      valueKey: "upcomingEvents",
      color: "text-indigo-700"
    },
    projectDeadlines: {
      label: "Progetti in Scadenza",
      valueKey: "projectDeadlines",
      color: "text-red-700"
    },
    recentDownloads: {
      label: "Download Recenti",
      valueKey: "recentDownloads",
      color: "text-blue-700"
    },
    recentActivity: {
      label: "Attività Recenti",
      valueKey: "recentActivity",
      color: "text-gray-800"
    }
  };

  const [extraData, setExtraData] = useState({});
  const [activeWidgets, setActiveWidgets] = useState({});
  const [user, setUser] = useState(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const all = Object.fromEntries(Object.keys(availableWidgets).map(k => [k, true]));
    setActiveWidgets(all);

    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(setUser);

    fetch("/api/dashboard/extra")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === "object") {
          setExtraData(data);
        }
      });
  }, []);

  const renderListWidget = (title, items, keyLabel, valueLabel, color = "text-sm text-gray-700") => (
    <div className="bg-white shadow-md p-4 rounded">
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <ul className="text-xs space-y-1">
        {items && items.length > 0 ? items.map((item, i) => (
          <li key={i} className={`truncate ${color}`}>
            {item[keyLabel]}{valueLabel && item[valueLabel] ? ` – ${item[valueLabel]}` : ""}
          </li>
        )) : <li className="text-gray-400 italic">Nessun dato</li>}
      </ul>
    </div>
  );

  const renderExtraWidgets = (widgets, data) => {
    return Object.entries(availableWidgets).map(([key, def]) => {
      if (!widgets?.[key] || !data[def.valueKey]) return null;
      const label = def.label;
      const valueKey = def.valueKey;
      const color = def.color;
      switch (key) {
        case "recentFiles":
          return renderListWidget(label, data[valueKey], "name", "created_at", color);
        case "upcomingEvents":
          return renderListWidget(label, data[valueKey], "title", "start_date", color);
        case "projectDeadlines":
          return renderListWidget(label, data[valueKey], "title", "deadline", color);
        case "recentDownloads":
          return renderListWidget(label, data[valueKey], "name", "downloaded_at", color);
        case "recentActivity":
          return renderListWidget(label, data[valueKey], "action", "timestamp", color);
        default:
          return null;
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
      <p className="text-sm text-gray-600">Benvenuto nella tua area personale</p>
      {user && <div className="text-sm text-gray-700 font-medium">Utente: {user.name} {user.surname} • Ruolo: {user.role}</div>}
      <button onClick={() => setShowSelector(!showSelector)} className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded shadow">Scegli widget</button>
      {showSelector && <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-3">
        {Object.entries(availableWidgets).map(([key, def]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={activeWidgets[key]} onChange={e => {
              setActiveWidgets(prev => ({ ...prev, [key]: e.target.checked }));
            }} />
            <span className="text-sm">{def.label}</span>
          </label>
        ))}
      </div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {renderExtraWidgets(activeWidgets, extraData)}
      </div>
    </div>
  );
}
