// Percorso: /components/DashboardHeader.js
// Scopo: Header dashboard con toggle dark mode, avatar e selezione widget
// Autore: ChatGPT
// Ultima modifica: 29/05/2025

export default function DashboardHeader({ user, darkMode, setDarkMode, activeWidgets, setActiveWidgets }) {
  const toggleWidget = (key) => {
    const updated = { ...activeWidgets, [key]: !activeWidgets[key] };
    setActiveWidgets(updated);
  };

  const widgets = [
    { key: "notifications", label: "🔔 Notifiche" },
    { key: "files", label: "📁 File" },
    { key: "note", label: "🗒️ Note" },
    { key: "users", label: "👥 Utenti" },
    { key: "downloads", label: "📥 Download" },
    { key: "messages", label: "📨 Messaggi" }
  ];

  if (user?.role === "supervisor") {
    widgets.push({ key: "structure", label: "🧩 Struttura" });
  }

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500 flex items-center gap-2">
          Benvenuto nella tua area personale
          {user?.name && user?.surname && user?.role && (
            <>
              {user?.avatar && (
                <img src={user.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-gray-300" />
              )}
              <span>
                – {user.surname} {user.name} ({user.role})
              </span>
            </>
          )}
        </span>
        <button onClick={() => setDarkMode(!darkMode)} className="ml-auto bg-yellow-100 px-3 py-1 rounded">
          {darkMode ? "🌙 Dark" : "🌕 Light"}
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={() => document.getElementById("widget-panel").classList.toggle("hidden")}
          className="bg-blue-100 px-3 py-1 rounded mb-2"
        >
          Scegli widget
        </button>

        <div id="widget-panel" className="hidden p-3 bg-white rounded shadow-md flex flex-wrap gap-4">
          {widgets.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!activeWidgets[key]}
                onChange={() => toggleWidget(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
