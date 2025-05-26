// Percorso: /pages/calendar.js
// Scopo: Layout calendario stile Microsoft Windows Fluent - colorato e professionale
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Migliorie grafiche, barra filtri sticky, pronto per integrazione calendario

import { useState } from "react";
import { FaCalendarAlt, FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
// Importa una libreria calendario qui se vuoi (es: react-big-calendar)
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';

const eventTypeColors = {
  "Meeting": "bg-blue-500 text-white",
  "Scadenza": "bg-red-500 text-white",
  "Task": "bg-purple-500 text-white",
  "Evento": "bg-green-500 text-white",
  "Altro": "bg-gray-400 text-black"
};

const mockEvents = [
  {
    id: 1,
    title: "Riunione progetto Schüco",
    type: "Meeting",
    date: "2025-05-28",
    ora: "09:00",
    descrizione: "Allineamento team tecnico",
  },
  {
    id: 2,
    title: "Scadenza consegna documenti",
    type: "Scadenza",
    date: "2025-05-30",
    ora: "12:00",
    descrizione: "Invio documenti a cliente",
  },
  {
    id: 3,
    title: "Evento presentazione nuova versione",
    type: "Evento",
    date: "2025-06-01",
    ora: "16:00",
    descrizione: "Demo live con tutti i partner",
  },
];

export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalEvent, setModalEvent] = useState(null);
  // Per ora mock, puoi caricare eventi reali da API

  const filteredEvents = mockEvents.filter(ev =>
    (!typeFilter || ev.type === typeFilter) &&
    (!search ||
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.descrizione.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaCalendarAlt className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca evento..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="Meeting">Meeting</option>
            <option value="Scadenza">Scadenza</option>
            <option value="Task">Task</option>
            <option value="Evento">Evento</option>
            <option value="Altro">Altro</option>
          </select>
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setModalEvent({})}
          >
            <FaPlus className="inline mr-2" /> Nuovo evento
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={() => window.location.reload()}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Visualizzazione elenco eventi semplice (puoi sostituire con un vero calendario) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(ev => (
          <div
            key={ev.id}
            className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
            style={{ minHeight: 170 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <FaCalendarAlt className="text-blue-400 text-3xl" />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-800">{ev.title}</div>
                <div className="text-gray-500 text-sm">{ev.date} {ev.ora}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${eventTypeColors[ev.type] || "bg-gray-200 text-gray-800"}`}
                  >
                    {ev.type}
                  </span>
                </div>
                <div className="text-gray-700 mt-1 text-sm">{ev.descrizione}</div>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => setModalEvent(ev)}
              >
                Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                // onClick={() => handleDeleteEvent(ev.id)}
              >
                Elimina
              </button>
            </div>
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              ID: {ev.id}
            </span>
          </div>
        ))}
      </div>

      {/* Modal gestione evento */}
      {modalEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          // Qui metti il tuo vero EventModal
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
            <h2 className="font-bold text-xl mb-4">
              {modalEvent.id ? "Modifica evento" : "Nuovo evento"}
            </h2>
            {/* Form gestione evento */}
            <button
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              onClick={() => setModalEvent(null)}
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
