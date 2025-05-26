// Percorso: /components/widgets/WidgetMessaggi.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function WidgetMessaggi({ limit = 5, darkMode, user }) {
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
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
  }, [user, limit]);

  return (
    <div className={`
      rounded-2xl shadow p-4 min-h-[150px] flex flex-col
      ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white"}
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-lg font-bold ${darkMode ? "text-blue-200" : "text-blue-800"}`}>📧 Messaggi</span>
        <Link href="/messages" className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-700"} hover:underline`}>Vedi tutti</Link>
      </div>
      {loading ? (
        <div className="text-sm text-gray-400">Caricamento...</div>
      ) : msgs.length === 0 ? (
        <div className="text-sm text-gray-400">Nessun messaggio</div>
      ) : (
        <ul className="divide-y text-sm">
          {msgs.map(m => (
            <li key={m.id} className={"py-2 flex items-center gap-2 " + (m.read ? "" : (darkMode ? "font-bold bg-blue-900/30" : "font-bold bg-blue-50")) }>
              <span className="flex-1 cursor-pointer truncate" title={m.subject}>{m.subject}</span>
              {!m.read && <span className={`inline-block w-2 h-2 ${darkMode ? "bg-blue-300" : "bg-blue-600"} rounded-full mr-2`}></span>}
              <span className="text-xs text-gray-400">{m.created_at?.split('T')[0]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
