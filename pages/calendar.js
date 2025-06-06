// 📁 File: /pages/calendar.js
// 🧩 Scopo: Layout calendario con EventModal ed EventDetailsModal
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 06/06/2025

import { useState } from "react";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaCalendarAlt, FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
import EventModal from "./components/EventModal";
import EventDetailsModal from "./components/EventDetailsModal";

const localizer = momentLocalizer(moment);

const eventTypeColors = {
  "Meeting": "bg-blue-500 text-white",
  "Scadenza": "bg-red-500 text-white",
  "Task": "bg-purple-500 text-white",
  "Evento": "bg-green-500 text-white",
  "Altro": "bg-gray-400 text-black"
};

import { useEffect } from "react";
import axios from "axios";



export default function CalendarPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalEvent, setModalEvent] = useState(null);
  const [readonlyView, setReadonlyView] = useState(false);
  const [allEvents, setAllEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/events")
      .then(res => {
        const events = res.data.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
          descrizione: e.description,
          readOnly: false
        }));
        setAllEvents(events);
      })
      .catch(err => console.error("Errore caricamento eventi:", err));
  }, []);

  const filteredEvents = allEvents.filter(ev =>
    (!typeFilter || ev.type === typeFilter) &&
    (!search || ev.title.toLowerCase().includes(search.toLowerCase()) || ev.descrizione?.toLowerCase().includes(search.toLowerCase()))
  );

  const nextEvents = [...allEvents].sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 3);

  const handleEventClick = (ev) => {
    if (ev.readOnly) {
      setReadonlyView(true);
      setModalEvent(ev);
    } else {
      setReadonlyView(false);
      setModalEvent(ev);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
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
            onClick={() => { setReadonlyView(false); setModalEvent({}); }}
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

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4 space-y-4">
          <h3 className="text-lg font-semibold text-blue-700 px-2">Prossimi eventi</h3>
          {nextEvents.map(ev => (
            <div key={ev.id} onClick={() => handleEventClick(ev)} className="cursor-pointer bg-white rounded-xl shadow p-4 border border-blue-100 hover:shadow-lg transition">
              <div className="text-blue-800 font-semibold">{ev.title}</div>
              <div className="text-sm text-gray-600">{moment(ev.start).format('YYYY-MM-DD HH:mm')}</div>
              <div className={`mt-2 inline-block px-3 py-1 rounded-2xl text-xs font-semibold ${eventTypeColors[ev.type] || 'bg-gray-200 text-gray-800'}`}>{ev.type}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-2xl p-4 shadow border border-blue-100">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 700 }}
            onSelectEvent={handleEventClick}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            popup
            messages={{
              next: 'Avanti',
              previous: 'Indietro',
              today: 'Oggi',
              month: 'Mese',
              week: 'Settimana',
              day: 'Giorno',
              agenda: 'Agenda',
              showMore: total => `+ altri ${total}`
            }}
          />
        </div>
      </div>

      {modalEvent && (
        readonlyView ? (
          <EventDetailsModal eventData={modalEvent} onClose={() => setModalEvent(null)} />
        ) : (
          <EventModal eventData={modalEvent} onClose={() => setModalEvent(null)} onSave={() => window.location.reload()} />
        )
      )}
    </div>
  );
}
