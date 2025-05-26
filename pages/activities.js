// Percorso: /pages/activities.js
// Scopo: Layout attività stile Microsoft Windows Fluent - colorato e professionale
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Migliorie grafiche, badge stato/tipo/utente, barra filtri sticky

import { useEffect, useState } from "react";
import { FaTasks, FaSearch, FaPlus, FaUser, FaSyncAlt, FaClock } from "react-icons/fa";
import ActivityModal from "./components/ActivityModal"; // Aggiorna percorso se necessario

const statusColors = {
  "Da fare": "bg-blue-500 text-white",
  "In corso": "bg-yellow-500 text-white",
  "Completata": "bg-green-500 text-white",
  "Sospesa": "bg-gray-400 text-black"
};

const typeColors = {
  "Task": "bg-purple-500 text-white",
  "Evento": "bg-orange-500 text-white",
  "Reminder": "bg-blue-300 text-white",
  "Altro": "bg-gray-400 text-black"
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalActivity, setModalActivity] = useState(null);

  useEffect(() => {
    fetch("/api/activities")
      .then(res => res.json())
      .then(data => setActivities(Array.isArray(data) ? data : []));
  }, []);

  const filteredActivities = activities.filter(activity =>
    (!statusFilter || activity.status === statusFilter) &&
    (!typeFilter || activity.type === typeFilter) &&
    (!search ||
      activity.title?.toLowerCase().includes(search.toLowerCase()) ||
      activity.user?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaTasks className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca attività..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            <option value="Da fare">Da fare</option>
            <option value="In corso">In corso</option>
            <option value="Completata">Completata</option>
            <option value="Sospesa">Sospesa</option>
          </select>
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="Task">Task</option>
            <option value="Evento">Evento</option>
            <option value="Reminder">Reminder</option>
            <option value="Altro">Altro</option>
          </select>
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setModalActivity({})}
          >
            <FaPlus className="inline mr-2" /> Nuova attività
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={() => window.location.reload()}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Lista attività */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map(activity => (
          <div
            key={activity.id}
            className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
            style={{ minHeight: 170 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <FaTasks className="text-blue-400 text-3xl" />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-800">{activity.title}</div>
                <div className="text-gray-500 text-sm">
                  <FaUser className="inline mr-1 text-blue-400" />
                  {activity.user}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${statusColors[activity.status] || "bg-gray-200 text-gray-800"}`}
                  >
                    {activity.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${typeColors[activity.type] || "bg-gray-200 text-gray-800"}`}
                  >
                    {activity.type}
                  </span>
                  {activity.dueDate && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-blue-100 text-blue-700 font-semibold flex items-center gap-1">
                      <FaClock className="inline" /> {activity.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => setModalActivity(activity)}
              >
                Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                // onClick={() => handleDeleteActivity(activity.id)}
              >
                Elimina
              </button>
            </div>
            {/* badge laterale */}
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              ID: {activity.id}
            </span>
          </div>
        ))}
      </div>

      {/* Modal gestione attività */}
      {modalActivity && (
        <ActivityModal activity={modalActivity} onClose={() => setModalActivity(null)} />
      )}
    </div>
  );
}
