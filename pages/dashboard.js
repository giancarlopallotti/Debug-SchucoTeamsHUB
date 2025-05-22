// Percorso: /pages/dashboard.js
// Scopo: Dashboard con header compatto, widget dinamici selezionabili e Widget Messaggi (robusto)
// Autore: ChatGPT
// Ultima modifica: 22/05/2025

import { useEffect, useState } from "react";
import Link from "next/link";

// --- Widget Messaggi (robusto su errore API) ---
function WidgetMessaggi({ limit = 5 }) {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/messages?box=inbox`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMsgs(data.slice(0, limit));
        } else {
          setMsgs([]);
        }
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <div className="bg-white rounded-2xl shadow p-4 min-h-[150px] flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-blue-800">📧 Messaggi</span>
        <Link href="/messages" className="text-xs text-blue-700 hover:underline">Vedi tutti</Link>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">Caricamento...</div>
      ) : msgs.length === 0 ? (
        <div className="text-sm text-gray-500">Nessun messaggio</div>
      ) : (
        <ul className="divide-y text-sm">
          {msgs.map(m => (
            <li key={m.id} className={"py-2 flex items-center gap-2 " + (m.read ? "" : "font-bold bg-blue-50") }>
              <span className="flex-1 cursor-pointer truncate" title={m.subject}>{m.subject}</span>
              {!m.read && <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-2"></span>}
              <span className="text-xs text-gray-500">{m.created_at?.split('T')[0]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Definizione e mapping widget ---
const defaultWidgets = {
  notifications: {
    label: "Notifiche recenti",
    icon: "🔔",
    color: "text-orange-700"
  },
  users: {
    label: "Utenti registrati",
    icon: "👥",
    color: "text-blue-800"
  },
  files: {
    label: "File caricati",
    icon: "📂",
    color: "text-blue-800"
  },
  downloads: {
    label: "Download totali",
    icon: "⬇️",
    color: "text-blue-800"
  },
  note: {
    label: "Note personali",
    icon: "📝",
    color: "text-yellow-700"
  },
  // Widget messaggi
  messages: {
    label: "Messaggi ricevuti",
    icon: "📧",
    color: "text-blue-800"
  }
};

export default function Dashboard() {
  const [widgets, setWidgets] = useState(defaultWidgets);
  const [activeWidgets, setActiveWidgets] = useState({
    notifications: true,
    users: true,
    files: true,
    downloads: false,
    note: false,
    messages: true // di default il widget messaggi è attivo
  });
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        setUser(userData);
        if (userData?.id) {
          fetch(`/api/notifications?user_id=${userData.id}`)
            .then(res => res.json())
            .then(data => {
              setNotifications(Array.isArray(data) ? data.filter(n => !n.read).slice(0, 3) : []);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  // Render widget per tipo
  const renderWidget = (key) => {
    switch (key) {
      case "notifications":
        return (
          <div key={key} className="bg-white rounded shadow p-4 flex items-center">
            <div className="mr-4 text-3xl">{widgets[key].icon}</div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`font-semibold ${widgets[key].color}`}>{widgets[key].label}</span>
                {notifications.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">Nuovo</span>
                )}
              </div>
              {loading ? (
                <div className="text-gray-400 text-xs">Caricamento...</div>
              ) : notifications.length === 0 ? (
                <div className="text-gray-400 text-xs">Nessuna nuova notifica</div>
              ) : (
                <ul className="space-y-1 text-xs">
                  {notifications.map(n => (
                    <li key={n.id} className="border-b last:border-b-0 pb-1 text-blue-900 font-medium flex items-center">
                      {n.message}
                      <span className="ml-3 text-gray-400 font-normal">{new Date(n.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2">
                <Link href="/notifications" className="text-xs text-blue-600 underline hover:text-blue-900">
                  Visualizza tutte le notifiche
                </Link>
              </div>
            </div>
          </div>
        );
      case "users":
        return (
          <div key={key} className="bg-white rounded shadow p-4 flex items-center">
            <div className="mr-4 text-3xl">{widgets[key].icon}</div>
            <div>
              <div className={`font-semibold ${widgets[key].color}`}>{widgets[key].label}</div>
              <div className="text-2xl font-bold mt-2">15</div>
              <div className="text-xs text-gray-500 mt-1">Attualmente registrati</div>
            </div>
          </div>
        );
      case "files":
        return (
          <div key={key} className="bg-white rounded shadow p-4 flex items-center">
            <div className="mr-4 text-3xl">{widgets[key].icon}</div>
            <div>
              <div className={`font-semibold ${widgets[key].color}`}>{widgets[key].label}</div>
              <div className="text-2xl font-bold mt-2">27</div>
              <div className="text-xs text-gray-500 mt-1">Caricati in totale</div>
            </div>
          </div>
        );
      case "downloads":
        return (
          <div key={key} className="bg-white rounded shadow p-4 flex items-center">
            <div className="mr-4 text-3xl">{widgets[key].icon}</div>
            <div>
              <div className={`font-semibold ${widgets[key].color}`}>{widgets[key].label}</div>
              <div className="text-2xl font-bold mt-2">52</div>
              <div className="text-xs text-gray-500 mt-1">Download totali</div>
            </div>
          </div>
        );
      case "note":
        return (
          <div key={key} className="bg-yellow-100 border-l-8 border-yellow-500 rounded p-4">
            <h2 className="text-md font-semibold text-yellow-800 mb-2">📝 Note rapide</h2>
            <textarea
              rows="4"
              className="w-full p-2 border rounded bg-yellow-50"
              placeholder="Scrivi una nota personale qui..."
            />
          </div>
        );
      case "messages":
        return <WidgetMessaggi key={key} limit={5} />;
      default:
        return null;
    }
  };

  // Render
  return (
    <main className="flex-1 p-6 space-y-6">
      {/* HEADER su unica riga, responsive */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-4">
        <h1 className="text-2xl font-bold text-blue-900 flex-shrink-0">Dashboard</h1>
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 w-full">
          <span className="text-sm text-gray-600 md:border-l md:pl-4 md:ml-4">Benvenuto nella tua area personale</span>
          {user && (
            <span className="text-sm text-gray-700 font-medium md:ml-4">Utente: {user.name} {user.surname} • Ruolo: {user.role}</span>
          )}
        </div>
        <button
          onClick={() => setShowSelector(s => !s)}
          className="ml-auto mt-2 md:mt-0 text-xs px-4 py-2 bg-blue-100 text-blue-700 rounded shadow border border-blue-200 hover:bg-blue-200"
        >
          {showSelector ? "Nascondi widget" : "Scegli widget"}
        </button>
      </div>

      {/* Menu a tendina per selezione widget */}
      {showSelector && (
        <div className="bg-white shadow border rounded mb-6 p-4 w-full max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {Object.entries(widgets).map(([key, w]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activeWidgets[key]}
                  onChange={e => setActiveWidgets(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                <span className="text-sm">{w.icon} {w.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Griglia dinamica widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Object.entries(activeWidgets)
          .filter(([_, v]) => v)
          .map(([key]) => renderWidget(key))}
      </div>
    </main>
  );
}
