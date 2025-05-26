// Percorso: /components/widgets/WidgetNotifiche.js

export default function WidgetNotifiche({ 
  notifications, loading, darkMode, onDettaglio 
}) {
  return (
    <div className={`
      rounded shadow p-4 flex items-center h-full
      ${darkMode ? "bg-gray-800 text-orange-200" : "bg-white"}
    `}>
      <div className="mr-4 text-3xl">🔔</div>
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <span className={`font-semibold ${darkMode ? "text-orange-200" : "text-orange-700"}`}>Notifiche recenti</span>
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
              <li
                key={n.id}
                className="border-b last:border-b-0 pb-1 text-blue-900 font-medium flex items-center cursor-pointer hover:bg-blue-50"
                onClick={() => onDettaglio(n)}
                title="Dettagli notifica"
              >
                {n.message.length > 60 ? n.message.substring(0, 58) + "…" : n.message}
                <span className="ml-3 text-gray-400 font-normal">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <a href="/notifications" className={`text-xs underline hover:text-blue-900 ${darkMode ? "text-blue-300" : "text-blue-600"}`}>
            Visualizza tutte le notifiche
          </a>
        </div>
      </div>
    </div>
  );
}
