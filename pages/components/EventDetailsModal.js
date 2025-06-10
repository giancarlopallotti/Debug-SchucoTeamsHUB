// 📁 File: /pages/components/EventDetailsModal.js
// 🧩 Modale visualizzazione dettagli evento, con tasto Modifica
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 08/06/2025

import React from "react";

export default function EventDetailsModal({
  event,
  users = [],
  teams = [],
  files = [],
  projects = [],
  clients = [],
  tags = [],
  onClose,
  onEdit
}) {
  // Fallback: se non c'è l'evento mostra avviso
  if (!event) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
        <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8">
          <div className="text-red-600 text-lg mb-4">Evento non trovato</div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helpers per visualizzare info correlate
  const getUser = id => users.find(u => String(u.id) === String(id));
  const getTeam = id => teams.find(t => String(t.id) === String(id));
  const getFile = id => files.find(f => String(f.id) === String(id));
  const getProject = id => projects.find(p => String(p.id) === String(id));
  const getClient = id => clients.find(c => String(c.id) === String(id));
  const getTag = id => tags.find(tag => String(tag.id) === String(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Dettagli Evento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2">
              <span className="font-semibold">Titolo:</span> {event.title}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Descrizione:</span> {event.description || "—"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Stato:</span>{" "}
              <span className={event.status === "bozza" ? "bg-yellow-200 text-yellow-700 px-2 py-1 rounded" : "bg-green-100 text-green-700 px-2 py-1 rounded"}>
                {event.status}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Inizio:</span>{" "}
              {event.start ? new Date(event.start).toLocaleString() : "—"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Fine:</span>{" "}
              {event.end ? new Date(event.end).toLocaleString() : "—"}
            </div>
            {/* Altri campi se vuoi */}
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Partecipanti:</span>
              <ul className="ml-2 list-disc">
                {(event.userIds || []).length
                  ? event.userIds.map(id => {
                      const u = getUser(id);
                      return u ? (
                        <li key={id} className="flex items-center gap-2">
                          <img src={u.avatar || "/default-avatar.png"} alt="" className="w-6 h-6 rounded-full border" />
                          {u.surname} {u.name}
                        </li>
                      ) : null;
                    })
                  : <li className="ml-4 text-gray-500">—</li>}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Team:</span>
              <ul className="ml-2 list-disc">
                {(event.teamIds || []).length
                  ? event.teamIds.map(id => {
                      const t = getTeam(id);
                      return t ? <li key={id}>{t.name}</li> : null;
                    })
                  : <li className="ml-4 text-gray-500">—</li>}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Progetti:</span>
              <ul className="ml-2 list-disc">
                {(event.projectIds || []).length
                  ? event.projectIds.map(id => {
                      const p = getProject(id);
                      return p ? <li key={id}>{p.title}</li> : null;
                    })
                  : <li className="ml-4 text-gray-500">—</li>}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Clienti:</span>
              <ul className="ml-2 list-disc">
                {(event.clientIds || []).length
                  ? event.clientIds.map(id => {
                      const c = getClient(id);
                      return c ? <li key={id}>{c.company || (c.surname + " " + c.name)}</li> : null;
                    })
                  : <li className="ml-4 text-gray-500">—</li>}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Allegati:</span>
              <ul className="ml-2 list-disc">
                {(event.fileIds || []).length
                  ? event.fileIds.map(id => {
                      const f = getFile(id);
                      return f ? (
                        <li key={id}>
                          <a href={f.path || "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            {f.name || f.filename}
                          </a>
                        </li>
                      ) : null;
                    })
                  : <li className="ml-4 text-gray-500">—</li>}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Tag:</span>
              <span className="ml-2 flex flex-wrap gap-1">
                {(event.tagIds || []).length
                  ? event.tagIds.map(id => {
                      const tag = getTag(id);
                      return tag ? (
                        <span key={id} className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">{tag.name}</span>
                      ) : null;
                    })
                  : <span className="ml-4 text-gray-500">—</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-2">
          {onEdit && (
            <button
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => onEdit(event)}
            >
              Modifica
            </button>
          )}
          <button
            className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
