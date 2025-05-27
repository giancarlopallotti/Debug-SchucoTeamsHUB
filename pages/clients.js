// Percorso: /pages/clients.js
import { useEffect, useState } from "react";
import { FaUsers, FaEye, FaSyncAlt, FaEnvelope, FaPhone, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import ClientModal from "./components/ClientModal";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [modalClient, setModalClient] = useState(null);
  const [viewOnly, setViewOnly] = useState(true);

  // Carica i clienti dal backend
  const fetchClients = () => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []));
  };

  useEffect(() => { fetchClients(); }, []);

  // Filtraggio ricerca
  const filteredClients = clients.filter(client =>
    (!search ||
      (client.surname && client.surname.toLowerCase().includes(search.toLowerCase())) ||
      (client.name && client.name.toLowerCase().includes(search.toLowerCase())) ||
      (client.company && client.company.toLowerCase().includes(search.toLowerCase())) ||
      (client.emails && client.emails.toLowerCase().includes(search.toLowerCase())) ||
      (client.city && client.city.toLowerCase().includes(search.toLowerCase())) ||
      (client.note && client.note.toLowerCase().includes(search.toLowerCase())))
  );

  // Elimina cliente
  const handleDeleteClient = async (id) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo cliente?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) fetchClients();
    else alert("Errore durante l'eliminazione!");
  };

  // Apertura popup
  const openModal = (client, onlyView = true) => {
    setModalClient(client);
    setViewOnly(onlyView);
  };

  // Chiudi popup + refresh
  const handleCloseModal = (updated) => {
    setModalClient(null);
    if (updated) fetchClients();
  };

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri + Nuovo cliente */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaUsers className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca cliente..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition flex items-center"
            onClick={() => {
              setModalClient({});
              setViewOnly(false);
            }}
          >
            <FaPlus className="mr-2" /> Nuovo cliente
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={fetchClients}
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
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <img
                  src={client.avatar || "/default-avatar.png"}
                  alt={`${client.surname} ${client.name}`}
                  className="object-cover w-full h-full"
                  title={`${client.surname} ${client.name}`}
                />
              </div>
              <div className="flex flex-col flex-1">
                {/* Cognome Nome + Company */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-lg text-blue-800">{client.surname} {client.name}</span>
                  {client.company && (
                    <span className="font-semibold text-blue-600 text-base">{client.company}</span>
                  )}
                </div>
                {/* Email, Telefono, Mobile */}
                <div className="mt-1 flex flex-wrap gap-2 items-center">
                  {client.emails && (
                    <span className="flex items-center text-xs text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                      <FaEnvelope className="mr-1" />{client.emails.split(",")[0].trim()}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center text-xs text-green-900 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <FaPhone className="mr-1" />{client.phone}
                    </span>
                  )}
                  {client.mobile && (
                    <span className="flex items-center text-xs text-green-900 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <FaPhone className="mr-1" />{client.mobile}
                    </span>
                  )}
                  {client.city && (
                    <span className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                      {client.city}
                      {client.province && <> ({client.province})</>}
                    </span>
                  )}
                </div>
                {/* Note/Descrizione breve */}
                {client.note && (
                  <div className="text-xs text-gray-600 mt-1 truncate max-w-[220px]" title={client.note}>
                    {client.note.length > 50 ? client.note.slice(0, 50) + "..." : client.note}
                  </div>
                )}
              </div>
            </div>
            {/* Info badge aggiuntivi */}
            <div className="flex flex-wrap gap-2 items-center mt-1">
              <span className="text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                ID: {client.id}
              </span>
              {client.documents && (
                <span className="flex items-center text-xs text-green-800 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  📄 Documenti
                </span>
              )}
              {client.created_at && (
                <span className="text-xs text-gray-400">{client.created_at.split(" ")[0]}</span>
              )}
            </div>
            {/* Bottoni */}
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-100 text-blue-900 font-semibold shadow hover:bg-blue-200 transition flex items-center"
                onClick={() => openModal(client, true)}
              >
                <FaEye className="mr-2" /> Visualizza
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition flex items-center"
                onClick={() => openModal(client, false)}
              >
                <FaEdit className="mr-2" /> Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition flex items-center"
                onClick={() => handleDeleteClient(client.id)}
              >
                <FaTrash className="mr-2" /> Elimina
              </button>
            </div>
            {/* badge laterale */}
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              #Cliente
            </span>
          </div>
        ))}
      </div>

      {/* Modale Clienti: visualizza/modifica */}
      {modalClient && (
        <ClientModal
          client={modalClient}
          viewOnly={viewOnly}
          onClose={handleCloseModal}
          onSaved={fetchClients}
        />
      )}
    </div>
  );
}
