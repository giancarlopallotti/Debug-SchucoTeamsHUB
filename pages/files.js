// Percorso: /pages/files.js
// Scopo: Dashboard file moderna con sidebar/albero, filtri, ricerca globale/cartella
// Versione ottimizzata per componenti modulari

import { useState, useEffect } from "react";
import axios from "axios";
import FilesTreeView from "./components/files/FilesTreeView";
import FileEditModal from "./components/files/FileEditModal";
import TagMultiSelect from "./components/files/TagMultiSelect";
import FileTable from "./components/files/FileTable";
import BatchSelector from "./components/files/BatchSelector";

export default function FilesPage() {
  // Stato di ricerca e filtri
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [allFiles, setAllFiles] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  const [search, setSearch] = useState("");
  const [filterTags, setFilterTags] = useState([]);
  const [filterTeams, setFilterTeams] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);
  const [filterProjects, setFilterProjects] = useState([]);
  const [filterClients, setFilterClients] = useState([]);
  const [filterExt, setFilterExt] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);

  // Stato dati entità per filtri
  const [tags, setTags] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Stato selezione multipla e modale
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

  // Upload multiplo
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchTags, setBatchTags] = useState([]);
  const [batchTeams, setBatchTeams] = useState([]);
  const [batchProjects, setBatchProjects] = useState([]);
  const [batchClients, setBatchClients] = useState([]);
  const [batchUsers, setBatchUsers] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get("/api/tags").then(res => setTags(res.data || []));
    axios.get("/api/teams").then(res => setTeams(res.data || []));
    axios.get("/api/projects").then(res => setProjects(res.data || []));
    axios.get("/api/clients").then(res => setClients(res.data || []));
    axios.get("/api/users").then(res => setUsers(res.data || []));
  }, []);

  useEffect(() => {
    if (!selectedFolder) {
      axios.get("/api/files/list-all")
        .then(res => setAllFiles(res.data.files || []));
    } else {
      axios.get("/api/files/list-all", { params: { folder_id: selectedFolder.id } })
        .then(res => setAllFiles(res.data.files || []));
    }
  }, [selectedFolder, reloadFlag]);

  const filteredFiles = allFiles.filter(file => {
    const matchName = !search || (file.name || "").toLowerCase().includes(search.toLowerCase());
    const matchTags = !filterTags.length || (file.tags || []).some(t => filterTags.some(ft => ft.id === t.id));
    const matchTeams = !filterTeams.length || (file.teams || []).some(t => filterTeams.some(ft => ft.id === t.id));
    const matchUsers = !filterUsers.length || (file.users || []).some(u => filterUsers.some(fu => fu.id === u.id));
    const matchProjects = !filterProjects.length || (file.projects || []).some(p => filterProjects.some(fp => fp.id === p.id));
    const matchClients = !filterClients.length || (file.clients || []).some(c => filterClients.some(fc => fc.id === c.id));
    const matchExt = !filterExt || ((file.name || "").toLowerCase().endsWith(filterExt));
    const fileDate = file.created_at || file.uploaded_at;
    const matchDateFrom = !filterDateFrom || (fileDate && fileDate >= filterDateFrom);
    const matchDateTo = !filterDateTo || (fileDate && fileDate <= filterDateTo);
    const matchMine = !filterOnlyMine || file.created_by === window?.user?.id;
    return matchName && matchTags && matchTeams && matchUsers && matchProjects && matchClients && matchExt && matchDateFrom && matchDateTo && matchMine;
  });

  const toggleSelect = (fileId) => {
    setSelectedFiles(sel => sel.includes(fileId) ? sel.filter(id => id !== fileId) : [...sel, fileId]);
  };
  const selectAll = () => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  };
  const clearSelect = () => setSelectedFiles([]);

  return (
    <div style={{ display: "flex", minHeight: "80vh" }}>
      {/* SIDEBAR: ALBERO CARTELLE + FILE */}
      <div style={{
        width: 480,
        borderRight: "1.5px solid #eaeaea",
        background: "#fafaff",
        overflowX: "auto",
        minWidth: 320,
        maxWidth: 600
      }}>
        {/* Bottone Torna alla root */}
        <button
          style={{
            width: "96%",
            margin: "12px auto 4px auto",
            display: "block",
            background: "#f0f0fa",
            border: "1.2px solid #b7b7de",
            borderRadius: 8,
            color: "#263b8a",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            padding: "7px 0",
            transition: "0.2s"
          }}
          onClick={() => setSelectedFolder(null)}
          title="Vai alla root"
        >
          ⬅️ Torna alla root
        </button>
        <FilesTreeView
          onSelect={setSelectedFolder}
          selectedId={selectedFolder?.id}
        />
      </div>
      {/* DESTRA: DASHBOARD */}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        <div style={{ marginBottom: 8, color: "#444", fontWeight: 500 }}>
          <span>Percorso: </span>
          {selectedFolder?.path || selectedFolder?.name || <span style={{ color: "#aaa" }}>Nessuna cartella selezionata</span>}
        </div>
        {/* FILTRI */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #ececec", padding: "12px 14px", marginBottom: 14 }}>
          <input
            type="text"
            placeholder="Cerca per nome file..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: "1.5px solid #e3e6fa", borderRadius: 8, padding: "7px 16px", fontSize: 16, minWidth: 180, flex: 1, outline: 0
            }}
          />
          <TagMultiSelect options={tags} value={filterTags} onChange={setFilterTags} placeholder="Tag" />
          <TagMultiSelect options={teams} value={filterTeams} onChange={setFilterTeams} placeholder="Team" />
          <TagMultiSelect options={users} value={filterUsers} onChange={setFilterUsers} placeholder="Utente" user />
          <TagMultiSelect options={projects} value={filterProjects} onChange={setFilterProjects} placeholder="Progetto" project />
          <TagMultiSelect options={clients} value={filterClients} onChange={setFilterClients} placeholder="Azienda" client />
          <select value={filterExt} onChange={e => setFilterExt(e.target.value)} style={{ border: "1.5px solid #e3e6fa", borderRadius: 8, padding: "7px 12px", fontSize: 15 }}>
            <option value="">Tipo file</option>
            <option value="pdf">PDF</option>
            <option value="jpg">Immagine (jpg)</option>
            <option value="png">Immagine (png)</option>
            <option value="xlsx">Excel</option>
            <option value="docx">Word</option>
          </select>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={{ borderRadius: 7, border: "1.2px solid #e3e6fa", padding: "6px" }} title="Data da" />
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={{ borderRadius: 7, border: "1.2px solid #e3e6fa", padding: "6px" }} title="Data a" />
          <label style={{ fontSize: 13, color: "#777", display: "flex", alignItems: "center" }}>
            <input type="checkbox" checked={filterOnlyMine} onChange={e => setFilterOnlyMine(e.target.checked)} style={{ marginRight: 4 }} /> Solo miei
          </label>
          <button
            onClick={() => { setSearch(""); setFilterTags([]); setFilterTeams([]); setFilterUsers([]); setFilterProjects([]); setFilterClients([]); setFilterExt(""); setFilterDateFrom(""); setFilterDateTo(""); setFilterOnlyMine(false); }}
            style={{ marginLeft: 10, background: "#e3e6fa", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", color: "#555" }}
            title="Azzera filtri"
          >❌ Reset</button>
        </div>
        {/* UPLOAD MULTIPLO */}
        {/* Incolla qui la tua logica di batch upload e BatchSelector, se vuoi */}
        {/* TABELLA FILE */}
        <FileTable
          files={filteredFiles}
          tags={tags}
          teams={teams}
          users={users}
          projects={projects}
          clients={clients}
          selectedFiles={selectedFiles}
          toggleSelect={toggleSelect}
          selectAll={selectAll}
          clearSelect={clearSelect}
          onEdit={file => setEditingFile(file)}
        />
        {/* MODALE MODIFICA FILE */}
        {editingFile && (
          <FileEditModal
            file={editingFile}
            isOpen={!!editingFile}
            onClose={() => setEditingFile(null)}
            onSaved={() => { setReloadFlag(f => !f); setEditingFile(null); }}
          />
        )}
      </div>
    </div>
  );
}
