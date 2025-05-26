// Percorso: /components/modals/NotificationModal.js

export default function NotificationModal({ notifica, onClose, onRead, darkMode }) {
  if (!notifica) return null;
  return (
    <div
      style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 10010,
        background: "rgba(20,32,60,0.20)", display: "flex", alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        className={`rounded-2xl shadow-xl p-6 max-w-md w-full relative animate-pop ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white"}`}
        style={{
          minWidth: 320, minHeight: 180,
          animation: "popIn 0.25s cubic-bezier(.41,1.4,.67,.97)",
          boxShadow: "0 8px 36px 0 #213b6355"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">🔔</span>
          <span className="font-bold text-blue-900">Dettaglio notifica</span>
        </div>
        <div className="mb-3">
          <div className="text-base text-blue-900 font-semibold mb-2">{notifica.title || "Messaggio"}</div>
          <div className="text-gray-700 mb-3" style={{ whiteSpace: "pre-line" }}>{notifica.message}</div>
          <div className="text-xs text-gray-500 mb-2">
            Ricevuta il {new Date(notifica.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
            onClick={() => onRead(notifica.id)}
          >Segna come letto</button>
          {notifica.link && (
            <a
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              href={notifica.link} target="_blank" rel="noopener noreferrer"
            >Vai a dettaglio</a>
          )}
          <button
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
            onClick={onClose}
          >Chiudi</button>
        </div>
      </div>
      {/* --- CSS keyframes per animazione popup --- */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.93); opacity: 0; }
          60% { transform: scale(1.04); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop { animation: popIn 0.25s cubic-bezier(.41,1.4,.67,.97) both; }
      `}</style>
    </div>
  );
}
