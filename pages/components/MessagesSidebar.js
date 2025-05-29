/*
  Scopo: Sidebar professionale sezione Messaggi con badge filtri rapidi
  Autore: ChatGPT
  Data ultima modifica: 27/05/2025
  Note: UI moderna stile Teams, badge non letti, responsive, pronta per integrazione router
*/

import { useState, useEffect } from "react";

const filters = [
  { key: "inbox", label: "In arrivo", icon: "📥" },
  { key: "sent", label: "Inviati", icon: "📤" },
  { key: "favorites", label: "Preferiti", icon: "⭐" },
  { key: "archived", label: "Archiviati", icon: "🗃️" },
  { key: "unread", label: "Non letti", icon: "🔵" }
];

export default function MessagesSidebar({ selected, onSelect, badgeCounts = {}, onNewMessage }) {
  const [collapsed, setCollapsed] = useState(false);

  // Responsività (collassa su mobile)
  useEffect(() => {
    function handleResize() {
      setCollapsed(window.innerWidth < 600);
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={`h-full bg-gradient-to-b from-blue-800 to-blue-900 text-white flex flex-col
        ${collapsed ? "w-14" : "w-56"} transition-all duration-200 ease-in-out`}
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-700">
        {!collapsed && (
          <span className="font-bold text-lg tracking-wide">Messaggi</span>
        )}
        <button
          onClick={() => setCollapsed(x => !x)}
          className="text-blue-300 hover:text-white focus:outline-none"
          title={collapsed ? "Espandi" : "Riduci"}
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>
      {/* Filtri rapidi con badge */}
      <nav className="flex-1 overflow-y-auto py-2">
        {filters.map(f => (
          <button
            key={f.key}
            className={`
              w-full flex items-center gap-2 px-4 py-2 text-base rounded transition 
              ${selected === f.key ? "bg-blue-600 font-semibold" : "hover:bg-blue-700"}
            `}
            onClick={() => onSelect(f.key)}
          >
            <span className="text-xl">{f.icon}</span>
            {!collapsed && <span>{f.label}</span>}
            {/* Badge */}
            {!collapsed && badgeCounts[f.key] > 0 && (
              <span className="ml-auto inline-block bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {badgeCounts[f.key]}
              </span>
            )}
          </button>
        ))}
      </nav>
      {/* Azione nuovo messaggio */}
      <div className="p-3 border-t border-blue-700 flex justify-center">
        <button
          onClick={onNewMessage}
          className="bg-white text-blue-900 hover:bg-blue-100 font-semibold rounded-xl px-4 py-2 w-full flex items-center gap-2 justify-center shadow"
        >
          <span>✉️</span>
          {!collapsed && <span>Nuovo messaggio</span>}
        </button>
      </div>
    </aside>
  );
}
