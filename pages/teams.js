// Percorso: /pages/teams.js
// Scopo: Layout team stile Microsoft Windows Fluent - colorato e professionale, con refresh automatico post-modal
// Autore: ChatGPT
// Ultima modifica: 26/05/2025

import { useEffect, useState } from "react";
import { FaUsers, FaSearch, FaPlus, FaUserTie, FaSyncAlt } from "react-icons/fa";
import TeamModal from "./components/TeamModal"; // Aggiorna percorso se necessario

const teamTypeColors = {
  "Tecnico": "bg-blue-500 text-white",
  "Commerciale": "bg-green-500 text-white",
  "Gestione": "bg-purple-500 text-white",
  "Altro": "bg-gray-400 text-black"
};

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  // const [typeFilter, setTypeFilter] = useState(""); // RIMOSSO: non usato ora
  const [modalTeam, setModalTeam] = useState(null);

  // Funzione per caricare teams
  const fetchTeams = () => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(data => setTeams(Array.isArray(data) ? data : []));
  };

  // Funzione per caricare utenti (per avatar, manager, membri)
  const fetchUsers = () => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  };

  // Carica teams e users all'avvio
  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  // Filtro search/tag (puoi aggiungere filtro per tag qui se vuoi)
  const filteredTeams = teams.filter(t =>
    (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  // Recupera utente (manager o membro) per ID
  const getUserById = (id) => users.find(u => String(u.id) === String(id));

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaUsers className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca team per nome, tag..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {/* <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tutti i tipi</option>
            <option value="Tecnico">Tecnico</option>
            <option value="Commerciale">Commerciale</option>
            <option value="Gestione">Gestione</option>
            <option value="Altro">Altro</option>
          </select> */}
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setModalTeam({})}
          >
            <FaPlus className="inline mr-2" /> Nuovo team
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={() => {
            fetchTeams();
            fetchUsers();
          }}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Lista team */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map(team => {
          // Membri (array di id stringa o array JS)
          const membersArr = typeof team.members === "string"
            ? team.members.split(",").map(x => x.trim()).filter(Boolean)
            : Array.isArray(team.members) ? team.members : [];
          // Manager
          const managerUser = getUserById(team.manager);

          return (
            <div
              key={team.id}
              className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
              style={{ minHeight: 170 }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar manager/admin */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                  {managerUser
                    ? <img src={managerUser.avatar || "/default-avatar.png"} alt="Admin" className="object-cover w-full h-full" title={`Admin: ${managerUser.surname} ${managerUser.name}`} />
                    : <FaUserTie className="text-blue-400 text-3xl" />
                  }
                </div>
                <div>
                  <div className="font-bold text-lg text-blue-800">{team.name}</div>
                  <div className="text-gray-500 text-sm">ID: {team.id}</div>
                  {/* TAGS */}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {team.tags && team.tags.split(",").map(tag =>
                      <span key={tag} className="bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full text-xs font-semibold">#{tag.trim()}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Membri scrollabili */}
              <div className="flex items-center mt-1 gap-1 overflow-x-auto" style={{ maxWidth: "100%" }}>
                <span className="text-xs text-blue-900 font-semibold mr-2">Membri: {membersArr.length}</span>
                <div className="flex items-center gap-1 overflow-x-auto" style={{ maxWidth: "calc(100% - 85px)" }}>
                  {membersArr.map(mid => {
                    const member = getUserById(mid);
                    return member ? (
                      <img
                        key={mid}
                        src={member.avatar || "/default-avatar.png"}
                        alt={member.surname + " " + member.name}
                        className="w-7 h-7 rounded-full border border-blue-100"
                        title={member.surname + " " + member.name}
                        style={{ background: "#f4f4f4" }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                  onClick={() => setModalTeam({ ...team })}
                >
                  Modifica
                </button>
                <button
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                  // onClick={() => handleDeleteTeam(team.id)}
                >
                  Elimina
                </button>
              </div>
              {/* badge laterale */}
              <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
                #Team
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal gestione team */}
      {modalTeam && (
        <TeamModal
          team={modalTeam}
          users={users}
          onClose={(updated) => {
            setModalTeam(null);
            if (updated) {
              fetchTeams();
              // fetchUsers(); // opzionale, solo se cambi anche membri
            }
          }}
        />
      )}
    </div>
  );
}
