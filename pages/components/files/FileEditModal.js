// Percorso: /pages/components/FileEditModal.js 
// Scopo: Modifica dettagli file, multi-assegnazione tag, team, progetti, clienti, utenti
// Autore: ChatGPT
// Ultima modifica: 12/06/2025

import { useState, useEffect } from "react";
import LoadingSpinner from "../LoadingSpinner"; // occhio al path!

export default function FileEditModal({ file = {}, isOpen, onClose, onSaved }) {
  // Stati per entità e filtri ricerca
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [teams, setTeams] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [teamSearch, setTeamSearch] = useState("");
  const [projects, setProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [note, setNote] = useState(file.note || "");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Per gestione "dirty": se c'è una modifica non salvata
  const [dirty, setDirty] = useState(false);

  // Fetch disponibili (all'avvio)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/tags").then(res => res.json()),
      fetch("/api/teams").then(res => res.json()),
      fetch("/api/projects").then(res => res.json()),
      fetch("/api/clients").then(res => res.json()),
      fetch("/api/users").then(res => res.json()),
    ]).then(([tags, teams, projects, clients, users]) => {
      setAvailableTags(tags || []);
      setAvailableTeams(teams || []);
      setAvailableProjects(projects || []);
      setAvailableClients(clients || []);
      setAvailableUsers(users || []);
      setLoading(false);
    });
  }, []);

  // Fetch entità già associate al file ogni volta che cambia
  useEffect(() => {
    if (!file?.id) return;
    setLoading(true);
    fetch(`/api/files/relations?file_id=${file.id}`)
      .then(res => res.json())
      .then(data => {
        setTags(data.tags || []);
        setTeams(data.teams || []);
        setProjects(data.projects || []);
        setClients(data.clients || []);
        setUsers(data.users || []);
        setNote(file.note || "");
        setDirty(false);
        setLoading(false);
      });
  }, [file]);

  // Dirty se cambia qualcosa
  useEffect(() => {
    setDirty(true);
    // eslint-disable-next-line
  }, [tags, teams, projects, clients, users, note]);

  // --- SALVA MODIFICHE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/files/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: file.id,
          note,
          tags: tags.map(t => t.id),
          teams: teams.map(t => t.id),
          projects: projects.map(p => p.id),
          clients: clients.map(c => c.id),
          users: users.map(u => u.id),
        })
      });
      if (res.ok && onSaved) onSaved();
    } finally {
      setSaving(false);
      onClose();
    }
  };

  // --- ANNULLA CON CONFERMA MODIFICHE ---
  const handleCancel = () => {
    if (dirty) {
      if (!window.confirm("Sei sicuro di non voler annullare le modifiche?")) return;
    }
    onClose();
  };

  // Toggle helper generico (aggiungi/rimuovi)
  function toggleItem(array, setArray, item, key = "id") {
    if (array.some(i => i[key] === item[key])) {
      setArray(array.filter(i => i[key] !== item[key]));
    } else {
      setArray([...array, item]);
    }
  }
  function removeItem(array, setArray, item, key = "id") {
    setArray(array.filter(i => i[key] !== item[key]));
  }

  // FILTRI SEARCH
  const filteredTags = availableTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase()));
  const filteredTeams = availableTeams.filter(t => t.name?.toLowerCase().includes(teamSearch.toLowerCase()));
  const filteredProjects = availableProjects.filter(p => (p.name || p.title || "").toLowerCase().includes(projectSearch.toLowerCase()));
  const filteredClients = availableClients.filter(c => (c.company || "").toLowerCase().includes(clientSearch.toLowerCase()));
  const filteredUsers = availableUsers.filter(u =>
    (`${u.surname || ""} ${u.name || ""}`.toLowerCase().includes(userSearch.toLowerCase()))
  );

  // BADGE COLORI
  const colorMap = {
    green: { bg: "#e6f6ea", txt: "#147c3b" },
    blue: { bg: "#e3e6fa", txt: "#263b8a" },
    yellow: { bg: "#fff3d2", txt: "#a47319" },
    red: { bg: "#fce5e0", txt: "#a02222" },
    violet: { bg: "#e7e0fa", txt: "#563fa6" }
  };

  // --- RENDER BADGE ---
  const renderBadgeList = (label, array, setArray, color, type = "name") => (
    <div style={{ marginBottom: 8 }}>
      <label className="block text-xs font-semibold mb-1">{label} associati:</label>
      <div className="flex flex-wrap gap-2">
        {array.length === 0 && <span className="text-xs text-gray-400">Nessuno</span>}
        {array.map(item =>
          <span
            key={item.id}
            className={`px-2 py-1 rounded-full text-xs font-semibold border bg-${color}-50 flex items-center`}
            style={{ background: colorMap[color].bg, color: colorMap[color].txt }}
          >
            {type === "fullname"
              ? (item.surname ? item.surname + " " : "") + item.name
              : type === "company"
                ? item.company
                : item.name || item.title}
            <button
              className="ml-1 text-red-600 font-bold hover:text-red-900"
              type="button"
              onClick={() => removeItem(array, setArray, item)}
              title="Rimuovi"
              style={{ background: "transparent", border: "none", marginLeft: 8, cursor: "pointer" }}
            >×</button>
          </span>
        )}
      </div>
    </div>
  );

  // --- UI ---
  if (!isOpen) return null;

  // Percorso completo (breadcrumb) da FileTreeView: file.path o file.fullPath
  const filePath = file.fullPath || file.path || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
      {loading && (
        <div style={{
          position: "absolute", left: 0, top: 0, width: "100%", height: "100%",
          background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10
        }}>
          <LoadingSpinner label="Caricamento..." />
        </div>
      )}
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-8 mx-2 relative flex flex-col gap-6"
        onSubmit={handleSubmit}
        style={{ maxHeight: "90vh", overflow: "hidden" }}
      >
        {/* Titolo file e percorso */}
        <h2 className="text-2xl font-bold mb-2 text-blue-900">
          {file.name}
          {filePath && (
            <span style={{ fontSize: 15, color: "#666", fontWeight: 400, marginLeft: 8 }}>
              {filePath}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {/* Tag disponibili + associati */}
          <div>
            <label className="block text-sm font-semibold mb-1">Tag disponibili</label>
            <input
              type="text"
              placeholder="Filtra tag..."
              value={tagSearch}
              onChange={e => setTagSearch(e.target.value)}
              className="w-full mb-2 rounded px-2 py-1 border border-green-200 text-xs"
            />
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${tags.some(t => t.id === tag.id)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-green-100 text-green-700 border-green-200"}
                      cursor-pointer hover:bg-green-200 transition`}
                    onClick={() => toggleItem(tags, setTags, tag)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
            {renderBadgeList("Tag", tags, setTags, "green")}
          </div>
          {/* Team */}
          <div>
            <label className="block text-sm font-semibold mb-1">Team disponibili</label>
            <input
              type="text"
              placeholder="Filtra team..."
              value={teamSearch}
              onChange={e => setTeamSearch(e.target.value)}
              className="w-full mb-2 rounded px-2 py-1 border border-blue-200 text-xs"
            />
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              <div className="flex flex-wrap gap-2">
                {filteredTeams.map(team => (
                  <button
                    key={team.id}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${teams.some(t => t.id === team.id)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-blue-100 text-blue-700 border-blue-200"}
                      cursor-pointer hover:bg-blue-200 transition`}
                    onClick={() => toggleItem(teams, setTeams, team)}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
            {renderBadgeList("Team", teams, setTeams, "blue")}
          </div>
          {/* Progetti */}
          <div>
            <label className="block text-sm font-semibold mb-1">Progetti disponibili</label>
            <input
              type="text"
              placeholder="Filtra progetti..."
              value={projectSearch}
              onChange={e => setProjectSearch(e.target.value)}
              className="w-full mb-2 rounded px-2 py-1 border border-yellow-200 text-xs"
            />
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              <div className="flex flex-wrap gap-2">
                {filteredProjects.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${projects.some(p => p.id === project.id)
                        ? "bg-yellow-600 text-white border-yellow-600"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"}
                      cursor-pointer hover:bg-yellow-200 transition`}
                    onClick={() => toggleItem(projects, setProjects, project)}
                  >
                    {project.name || project.title}
                  </button>
                ))}
              </div>
            </div>
            {renderBadgeList("Progetti", projects, setProjects, "yellow")}
          </div>
          {/* Aziende */}
          <div>
            <label className="block text-sm font-semibold mb-1">Aziende disponibili</label>
            <input
              type="text"
              placeholder="Filtra aziende..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="w-full mb-2 rounded px-2 py-1 border border-red-200 text-xs"
            />
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              <div className="flex flex-wrap gap-2">
                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${clients.some(c => c.id === client.id)
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-red-100 text-red-700 border-red-200"}
                      cursor-pointer hover:bg-red-200 transition`}
                    onClick={() => toggleItem(clients, setClients, client)}
                  >
                    {client.company}
                  </button>
                ))}
              </div>
            </div>
            {renderBadgeList("Aziende", clients, setClients, "red", "company")}
          </div>
          {/* Utenti */}
          <div>
            <label className="block text-sm font-semibold mb-1">Utenti disponibili</label>
            <input
              type="text"
              placeholder="Filtra utenti..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full mb-2 rounded px-2 py-1 border border-violet-200 text-xs"
            />
            <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
              <div className="flex flex-wrap gap-2">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    className={`px-2 py-1 rounded-full text-xs font-semibold border
                      ${users.some(u => u.id === user.id)
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-violet-100 text-violet-700 border-violet-200"}
                      cursor-pointer hover:bg-violet-200 transition`}
                    onClick={() => toggleItem(users, setUsers, user)}
                  >
                    {(user.surname ? user.surname + " " : "") + user.name}
                  </button>
                ))}
              </div>
            </div>
            {renderBadgeList("Utenti", users, setUsers, "violet", "fullname")}
          </div>
        </div>
        {/* NOTE */}
        <div>
          <label className="block text-sm font-semibold mb-1">Note</label>
          <textarea className="w-full rounded-xl px-3 py-2 border border-blue-200"
            value={note} onChange={e => setNote(e.target.value)} rows={2} />
        </div>
        {/* Bottoni */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            onClick={handleCancel}
            disabled={saving}
          >Annulla</button>
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            disabled={saving}
          >Salva</button>
        </div>
      </form>
    </div>
  );
}
