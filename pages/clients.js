// Percorso: /pages/clients.js
// Scopo: Layout clienti stile Microsoft Windows Fluent - colorato e professionale
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Migliorie grafiche, badge settore, barra filtri sticky

import { useEffect, useState } from "react";
import { FaUserTie, FaSearch, FaPlus, FaBuilding, FaSyncAlt } from "react-icons/fa";
import ClientModal from "./components/ClientModal"; // Aggiorna il percorso se necessario

const sectorColors = {
  "Azienda": "bg-blue-500 text-white",
  "Privato": "bg-green-500 text-white",
  "Pubblica Amm.": "bg-purple-500 text-white",
  "Altro": "bg-gray-400 text-black"
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [modalClient, setModalClient] = useState(null);

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  const filteredClients = clients.filter(client =>
    (!sectorFilter || client.sector === sectorFilter) &&
    (!search ||
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaBuilding className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca cliente..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
          >
            <option value="">Tutti i settori</option>
            <option value="Azienda">Azienda</option>
            <option value="Privato">Privato</option>
            <option value="Pubblica Amm.">Pubblica Amm.</option>
            <option value="Altro">Altro</option>
          </select>
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setModalClient({})}
          >
            <FaPlus className="inline mr-2" /> Nuovo cliente
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={() => window.location.reload()}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Lista clienti */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
            style={{ minHeight: 170 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <FaUserTie className="text-blue-400 text-3xl" />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-800">{client.name}</div>
                <div className="text-gray-500 text-sm">{client.email}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${sectorColors[client.sector] || "bg-gray-200 text-gray-800"}`}
                  >
                    {client.sector}
                  </span>
                  {client.contact && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-yellow-200 text-yellow-900 font-semibold flex items-center gap-1">
                      <FaUserTie className="inline" /> {client.contact}
                    </span>
                  )}
                  {client.status === "inactive" && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-red-100 text-red-700 font-semibold">Non attivo</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => setModalClient(client)}
              >
                Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                // onClick={() => handleDeleteClient(client.id)}
              >
                Elimina
              </button>
            </div>
            {/* badge laterale */}
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              ID: {client.id}
            </span>
          </div>
        ))}
      </div>

      {/* Modal gestione cliente */}
      {modalClient && (
        <ClientModal client={modalClient} onClose={() => setModalClient(null)} />
      )}
    </div>
  );
}
