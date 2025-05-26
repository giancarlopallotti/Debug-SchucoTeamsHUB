import { useEffect, useState } from "react";
import { FaUserPlus, FaUsers, FaSyncAlt } from "react-icons/fa";
import UserModal from "./components/UserModal";

const STATIC_ROLES = ["Supervisor", "Admin", "Technician", "Operator"];

const roleColors = {
  admin: "bg-blue-600 text-white",
  supervisor: "bg-green-500 text-white",
  technician: "bg-yellow-500 text-white",
  operator: "bg-purple-500 text-white"
};

function capitalize(s) {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  // Caricamento utenti
  const loadUsers = () => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtro: ruoli solo STATIC_ROLES, ricerca per tag
  const filteredUsers = users
    .filter(u =>
      (!roleFilter ||
        (u.role && u.role.toLowerCase() === roleFilter.toLowerCase())
      ) &&
      (!search ||
        (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
        (u.surname && u.surname.toLowerCase().includes(search.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
        (u.phone && (u.phone + "").toLowerCase().includes(search.toLowerCase())) ||
        (u.tags && u.tags.toLowerCase().includes(search.toLowerCase()))
      )
    )
    .sort((a, b) => {
      const surnameA = (a.surname || "").toLowerCase();
      const surnameB = (b.surname || "").toLowerCase();
      if (surnameA < surnameB) return -1;
      if (surnameA > surnameB) return 1;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Apri modale in sola lettura
  const openViewUser = (user) => {
    setModalUser(user);
    setViewOnly(true);
  };

  // Apri modale in modifica
  const openEditUser = (user) => {
    setModalUser(user);
    setViewOnly(false);
  };

  // Nuovo utente
  const openNewUser = () => {
    setModalUser({});
    setViewOnly(false);
  };

  // Ricerca rapida per tag da badge
  const handleTagSearch = (tag) => setSearch(tag);

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaUsers className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca per nome, cognome, email, telefono o tag..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-gray-900"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ minWidth: 130 }}
          >
            <option value="">Tutti i ruoli</option>
            {STATIC_ROLES.map(role =>
              <option key={role} value={role}>{role}</option>
            )}
          </select>
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={openNewUser}
          >
            <FaUserPlus className="inline mr-2" /> Nuovo utente
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={loadUsers}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Lista utenti */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
            style={{ minHeight: 170 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-800">
                  {(user.surname || "") + " " + (user.name || "")}
                </div>
                <div className="text-gray-500 text-sm flex gap-4 flex-wrap">
                  {user.email}
                  {user.phone && (
                    <span className="inline-block text-xs text-blue-800 bg-blue-50 px-2 py-1 rounded ml-2">
                      <b>Tel:</b> {user.phone}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${roleColors[(user.role || "").toLowerCase()] || "bg-gray-200 text-gray-800"}`}
                  >
                    {capitalize(user.role)}
                  </span>
                  {/* Visualizza tag badge */}
                  {user.tags && user.tags.split(",").map(tag => (
                    <button
                      key={tag.trim()}
                      type="button"
                      className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold border border-green-200 cursor-pointer hover:bg-green-200 transition"
                      title={`Cerca tag: ${tag.trim()}`}
                      onClick={() => handleTagSearch(tag.trim())}
                    >
                      #{tag.trim()}
                    </button>
                  ))}
                  {user.status === "inactive" && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-red-100 text-red-700 font-semibold">Non attivo</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => openViewUser(user)}
              >
                Visualizza
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => openEditUser(user)}
              >
                Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                // onClick={() => handleDeleteUser(user.id)}
              >
                Elimina
              </button>
            </div>
            {/* badge laterale */}
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              ID: {user.id}
            </span>
          </div>
        ))}
      </div>

      {/* Modal gestione utente */}
      {modalUser && (
        <UserModal
          user={modalUser}
          onClose={(refresh) => {
            setModalUser(null);
            setViewOnly(false);
            if (refresh) loadUsers();
          }}
          roles={STATIC_ROLES}
          viewOnly={viewOnly}
          onTagSearch={handleTagSearch}
        />
      )}
    </div>
  );
}
