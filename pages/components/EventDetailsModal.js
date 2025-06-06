// 📁 File: /components/EventDetailsModal.js
// 🧩 Scopo: Visualizzazione dettagli evento in sola lettura
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 06/06/2025

export default function EventDetailsModal({ eventData, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Dettagli Evento</h2>

        <div className="space-y-4 text-gray-800">
          <div>
            <strong className="text-gray-600 block">Titolo:</strong>
            <div>{eventData?.title}</div>
          </div>

          <div>
            <strong className="text-gray-600 block">Descrizione:</strong>
            <div>{eventData?.description || '—'}</div>
          </div>

          <div className="flex gap-6">
            <div>
              <strong className="text-gray-600 block">Inizio:</strong>
              <div>{new Date(eventData?.start).toLocaleString()}</div>
            </div>
            <div>
              <strong className="text-gray-600 block">Fine:</strong>
              <div>{new Date(eventData?.end).toLocaleString()}</div>
            </div>
          </div>

          {eventData?.userIds?.length > 0 && (
            <div>
              <strong className="text-gray-600 block">Partecipanti:</strong>
              <div>{eventData.userIds.join(', ')}</div>
            </div>
          )}

          {eventData?.teamIds?.length > 0 && (
            <div>
              <strong className="text-gray-600 block">Team:</strong>
              <div>{eventData.teamIds.join(', ')}</div>
            </div>
          )}

          {eventData?.tagIds?.length > 0 && (
            <div>
              <strong className="text-gray-600 block">Tag:</strong>
              <div>{eventData.tagIds.join(', ')}</div>
            </div>
          )}

          {eventData?.fileIds?.length > 0 && (
            <div>
              <strong className="text-gray-600 block">Allegati:</strong>
              <div>{eventData.fileIds.join(', ')}</div>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Chiudi</button>
        </div>
      </div>
    </div>
  );
}
