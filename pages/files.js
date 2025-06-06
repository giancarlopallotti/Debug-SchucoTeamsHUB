// Percorso: /pages/files.js
// Scopo: Dashboard file moderna con filtri da tutto il DB, ricerca avanzata, upload batch, selezione, azioni rapide
// Autore: ChatGPT
// Ultima modifica: 10/06/2025

import { useState, useEffect } from "react";
import axios from "axios";
import FilesTreeView from "./components/FilesTreeView";
import FileEditModal from "./components/FileEditModal";

// -------- COMPONENTI DI SUPPORTO --------

// --- Multiselect per tag, team, utenti, progetti, aziende
function TagMultiSelect({ options, value, onChange, placeholder, user, project, client }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter(opt => {
    let label = user
      ? `${opt.surname || ""} ${opt.name || ""}`.trim()
      : project
        ? opt.title
        : client
          ? opt.company
          : opt.name;
    return label?.toLowerCase().includes(search.toLowerCase());
  });

  const getLabel = (opt) =>
    user ? `${opt.surname || ""} ${opt.name || ""}`.trim()
      : project ? opt.title
      : client ? opt.company
      : opt.name;

  return (
    <div style={{ position: "relative", minWidth: 120 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: "#f3f6fb",
          border: "1.5px solid #e3e6fa",
          borderRadius: 8,
          padding: "7px 12px",
          minWidth: 110,
          cursor: "pointer",
          color: "#444",
          fontSize: 15,
        }}
      >
        {value.length === 0
          ? <span style={{ color: "#aaa" }}>{placeholder}</span>
          : value.map(v => getLabel(v)).join(", ")}
        <span style={{ float: "right", fontSize: 13, marginLeft: 5 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            zIndex: 20,
            minWidth: "100%",
            background: "#fff",
            border: "1.5px solid #e3e6fa",
            borderRadius: 8,
            boxShadow: "0 2px 12px #ececec",
            padding: 8,
            maxHeight: 200,
            overflowY: "auto"
          }}
        >
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Filtra...`}
            style={{
              width: "100%",
              padding: "5px 8px",
              marginBottom: 7,
              border: "1px solid #ddd",
              borderRadius: 5,
              fontSize: 14
            }}
          />
          <div style={{ maxHeight: 130, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ color: "#aaa", fontSize: 13 }}>Nessun risultato</div>
            )}
            {filtered.map(opt => {
              const checked = value.some(v => v.id === opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (checked) onChange(value.filter(v => v.id !== opt.id));
                    else onChange([...value, opt]);
                  }}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: 5,
                    background: checked ? "#e3e6fa" : "none",
                    fontWeight: checked ? 700 : 400,
                    color: checked ? "#223" : "#333",
                    marginBottom: 1
                  }}
                >
                  {user && <span style={{ marginRight: 5, color: "#9461e3" }}>👤</span>}
                  {project && <span style={{ marginRight: 5, color: "#ffc107" }}>📁</span>}
                  {client && <span style={{ marginRight: 5, color: "#e66" }}>🏢</span>}
                  {getLabel(opt)}
                  {checked && <span style={{ float: "right" }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------- FILE TABLE (Tabella file con selezione multipla, badge, azioni) ----------
function FileTable({
  files, tags, teams, users, projects, clients,
  selectedFiles, toggleSelect, selectAll, clearSelect, onEdit
}) {
  if (!files) return null;
  const badge = (label, color, key) => (
    <span
      key={key}
      style={{
        display: "inline-block",
        background: color.bg,
        color: color.txt,
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 500,
        margin: "0 2px 2px 0",
        padding: "2.5px 9px"
      }}
    >{label}</span>
  );
  const colorMap = {
    tag: { bg: "#e3e6fa", txt: "#263b8a" },
    team: { bg: "#d8f2e0", txt: "#137956" },
    user: { bg: "#e7e0fa", txt: "#563fa6" },
    project: { bg: "#fff3d2", txt: "#a47319" },
    client: { bg: "#fce5e0", txt: "#a02222" }
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ marginBottom: 7, display: "flex", alignItems: "center" }}>
        <b style={{ fontSize: 18 }}>File trovati: {files.length}</b>
        <button onClick={selectAll} style={{ marginLeft: 18, fontSize: 13, background: "#eef3ff", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>Seleziona tutti</button>
        <button onClick={clearSelect} style={{ marginLeft: 7, fontSize: 13, background: "#ffeaea", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer", color: "#a02222" }}>Deseleziona</button>
        {selectedFiles.length > 0 && (
          <span style={{ marginLeft: 15, fontSize: 14, color: "#15671a" }}>
            {selectedFiles.length} selezionati
          </span>
        )}
      </div>
      <div style={{
        overflowX: "auto",
        borderRadius: 8,
        border: "1.5px solid #e3e6fa",
        boxShadow: "0 2px 8px #f8faff",
        background: "#fff"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f5f6fd" }}>
            <tr>
              <th style={{ width: 28 }}></th>
              <th style={{ textAlign: "left", padding: "9px 8px" }}>Nome</th>
              <th>Tag</th>
              <th>Team</th>
              <th>Utenti</th>
              <th>Progetti</th>
              <th>Aziende</th>
              <th>Data</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "#aaa", padding: 28, fontSize: 16 }}>
                  Nessun file trovato.
                </td>
              </tr>
            )}
            {files.map(file => (
              <tr key={file.id} style={{
                background: selectedFiles.includes(file.id) ? "#e8ebfa" : "transparent"
              }}>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                  />
                </td>
                <td style={{ fontWeight: 500, color: "#293562", padding: "7px 8px" }}>
                  {/\.(pdf)$/i.test(file.name) ? "📄"
                    : /\.(jpe?g|png|gif)$/i.test(file.name) ? "🖼️"
                    : /\.(xls|xlsx)$/i.test(file.name) ? "📊"
                    : "📎"
                  }
                  {" "}
                  {file.name}
                </td>
                <td>
                  {(file.tags || []).map(t =>
                    badge("#" + (t.name || t), colorMap.tag, t.id)
                  )}
                </td>
                <td>
                  {(file.teams || []).map(t =>
                    badge(t.name || t, colorMap.team, t.id)
                  )}
                </td>
                <td>
                  {(file.users || []).map(u =>
                    badge(
                      (u.surname ? u.surname + " " : "") + u.name,
                      colorMap.user,
                      u.id
                    )
                  )}
                </td>
                <td>
                  {(file.projects || []).map(p =>
                    badge(p.title || p.name, colorMap.project, p.id)
                  )}
                </td>
                <td>
                  {(file.clients || []).map(c =>
                    badge(c.company, colorMap.client, c.id)
                  )}
                </td>
                <td>
                  <span style={{ color: "#666" }}>{file.created_at?.slice(0, 10) || "-"}</span>
                </td>
                <td>
                  <button onClick={() => onEdit(file)}
                    style={{
                      background: "#fffbe7", border: "1px solid #ffe08a",
                      borderRadius: 6, padding: "4px 12px", marginRight: 4, fontSize: 15, cursor: "pointer"
                    }}
                    title="Modifica dettagli"
                  >✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- BatchSelector per upload multiplo ---
function BatchSelector({ label, items, selected, setSelected, color, badgeType }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item => {
    const value = badgeType === "fullname"
      ? (item.surname ? item.surname + " " : "") + item.name
      : badgeType === "company"
        ? item.company
        : item.name || item.title;
    return value?.toLowerCase().includes(search.toLowerCase());
  });
  const colorMap = {
    green: { bg: "#e6f6ea", txt: "#147c3b" },
    blue: { bg: "#e3e6fa", txt: "#263b8a" },
    yellow: { bg: "#fff3d2", txt: "#a47319" },
    red: { bg: "#fce5e0", txt: "#a02222" },
    violet: { bg: "#e7e0fa", txt: "#563fa6" }
  };
  return (
    <div style={{ marginBottom: 9 }}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        placeholder={`Filtra ${label.toLowerCase()}...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-1 rounded px-2 py-1 border text-xs"
        style={{ borderColor: colorMap[color].bg }}
      />
      <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 6 }}>
        <div className="flex flex-wrap gap-2">
          {filtered.map(item => {
            const value = badgeType === "fullname"
              ? (item.surname ? item.surname + " " : "") + item.name
              : badgeType === "company"
                ? item.company
                : item.name || item.title;
            const isSelected = selected.some(s => s.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`px-2 py-1 rounded-full text-xs font-semibold border`}
                style={{
                  background: colorMap[color].bg,
                  color: colorMap[color].txt,
                  border: isSelected ? `1.5px solid ${colorMap[color].txt}` : undefined
                }}
                onClick={() => {
                  if (isSelected) setSelected(selected.filter(s => s.id !== item.id));
                  else setSelected([...selected, item]);
                }}
              >
                {value}
                {isSelected &&
                  <span style={{ marginLeft: 6, fontWeight: "bold", color: "#e22", cursor: "pointer" }}>×</span>
                }
              </button>
            );
          })}
        </div>
      </div>
      {/* Badge selezionati */}
      <div className="flex flex-wrap gap-2 mb-1">
        {selected.map(item => {
          const value = badgeType === "fullname"
            ? (item.surname ? item.surname + " " : "") + item.name
            : badgeType === "company"
              ? item.company
              : item.name || item.title;
          return (
            <span
              key={item.id}
              className={`px-2 py-1 rounded-full text-xs font-semibold border`}
              style={{ background: colorMap[color].bg, color: colorMap[color].txt }}
            >
              {value}
              <button
                className="ml-1 text-red-600 font-bold hover:text-red-900"
                type="button"
                onClick={() => setSelected(selected.filter(s => s.id !== item.id))}
                style={{ background: "transparent", border: "none", marginLeft: 8, cursor: "pointer" }}
                title="Rimuovi"
              >×</button>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ------------ MAIN FILESPAGE (Dashboard) ---------------
export default function FilesPage() {
  // Stato cartella selezionata e file della cartella
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [reloadFlag, setReloadFlag] = useState(false);

  // Filtri di ricerca
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

  // Entità globali per filtri
  const [tags, setTags] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Stato selezione multipla e modifica
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

  // Upload batch
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchTags, setBatchTags] = useState([]);
  const [batchTeams, setBatchTeams] = useState([]);
  const [batchProjects, setBatchProjects] = useState([]);
  const [batchClients, setBatchClients] = useState([]);
  const [batchUsers, setBatchUsers] = useState([]);
  const [uploading, setUploading] = useState(false);

  // FETCH entità globali per filtri
  useEffect(() => {
    axios.get("/api/tags").then(res => setTags(res.data || []));
    axios.get("/api/teams").then(res => setTeams(res.data || []));
    axios.get("/api/projects").then(res => setProjects(res.data || []));
    axios.get("/api/clients").then(res => setClients(res.data || []));
    axios.get("/api/users").then(res => setUsers(res.data || []));
  }, []);

  // FETCH dei file della cartella selezionata (qui puoi integrare la logica per restituire già le join)
  useEffect(() => {
    if (!selectedFolder) return setFolderFiles([]);
    axios.get("/api/folders", { params: { parent_id: selectedFolder.id } })
      .then(res => setFolderFiles(res.data.files || []));
  }, [selectedFolder, reloadFlag]);

  // --- FILTRI (agiscono sui file della cartella selezionata) ---
  const filteredFiles = folderFiles.filter(file => {
    // Nome file
    const matchName = !search || (file.name || "").toLowerCase().includes(search.toLowerCase());
    // Tag
    const matchTags = !filterTags.length || (file.tags || []).some(t => filterTags.some(ft => ft.id === t.id));
    // Team
    const matchTeams = !filterTeams.length || (file.teams || []).some(t => filterTeams.some(ft => ft.id === t.id));
    // User
    const matchUsers = !filterUsers.length || (file.users || []).some(u => filterUsers.some(fu => fu.id === u.id));
    // Progetti
    const matchProjects = !filterProjects.length || (file.projects || []).some(p => filterProjects.some(fp => fp.id === p.id));
    // Clienti
    const matchClients = !filterClients.length || (file.clients || []).some(c => filterClients.some(fc => fc.id === c.id));
    // Estensione
    const matchExt = !filterExt || ((file.name || "").toLowerCase().endsWith(filterExt));
    // Data (da/a)
    const fileDate = file.created_at || file.uploaded_at;
    const matchDateFrom = !filterDateFrom || (fileDate && fileDate >= filterDateFrom);
    const matchDateTo = !filterDateTo || (fileDate && fileDate <= filterDateTo);
    // Solo miei
    const matchMine = !filterOnlyMine || file.created_by === window?.user?.id;
    return matchName && matchTags && matchTeams && matchUsers && matchProjects && matchClients && matchExt && matchDateFrom && matchDateTo && matchMine;
  });

  // UPLOAD MULTIPLO
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files || []);
    setBatchFiles(f => [...f, ...files]);
  };
  const removeBatchFile = (i) => {
    setBatchFiles(files => files.filter((_, idx) => idx !== i));
  };
  const handleBatchUpload = async () => {
    if (!selectedFolder) return alert("Seleziona una cartella!");
    if (batchFiles.length === 0) return alert("Nessun file selezionato!");
    setUploading(true);
    try {
      const form = new FormData();
      batchFiles.forEach(f => form.append("files", f));
      form.append("folder_id", selectedFolder.id);
      form.append("tags", JSON.stringify(batchTags.map(t => t.id)));
      form.append("teams", JSON.stringify(batchTeams.map(t => t.id)));
      form.append("projects", JSON.stringify(batchProjects.map(p => p.id)));
      form.append("clients", JSON.stringify(batchClients.map(c => c.id)));
      form.append("users", JSON.stringify(batchUsers.map(u => u.id)));
      await axios.post("/api/files/batch-upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setBatchFiles([]); setBatchTags([]); setBatchTeams([]); setBatchProjects([]); setBatchClients([]); setBatchUsers([]);
      setReloadFlag(f => !f);
      alert("Caricamento completato!");
    } catch (e) {
      alert("Errore nel caricamento: " + (e.response?.data?.error || e.message));
    } finally {
      setUploading(false);
    }
  };

  // --- SELEZIONE MULTIPLA ---
  const toggleSelect = (fileId) => {
    setSelectedFiles(sel => sel.includes(fileId) ? sel.filter(id => id !== fileId) : [...sel, fileId]);
  };
  const selectAll = () => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  };
  const clearSelect = () => setSelectedFiles([]);

  // --- UI ---
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
        <FilesTreeView
          onSelect={setSelectedFolder}
          selectedId={selectedFolder?.id}
        />
      </div>
      {/* DESTRA: DASHBOARD */}
      <div style={{ flex: 1, padding: 24, overflow: "auto" }}>
        {/* Percorso/breadcrumb */}
        <div style={{ marginBottom: 8, color: "#444", fontWeight: 500 }}>
          <span>Percorso: </span>
          {selectedFolder?.path || selectedFolder?.name || <span style={{ color: "#aaa" }}>Nessuna cartella selezionata</span>}
        </div>

        {/* BARRA RICERCA/FILTRI */}
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
        {selectedFolder && (
          <div style={{
            border: "2px dashed #90caf9", borderRadius: 12, padding: 30, marginBottom: 20,
            background: "#f9fbff", textAlign: "center", transition: "0.2s"
          }}
            onDrop={e => { e.preventDefault(); handleFilesSelected(e); }}
            onDragOver={e => e.preventDefault()}
          >
            <input type="file" multiple style={{ display: "none" }} id="batchUpload" onChange={handleFilesSelected} />
            <label htmlFor="batchUpload" style={{ cursor: "pointer", color: "#1976d2" }}>
              <b>Trascina qui i file</b> o <u>clicca per selezionare</u>
            </label>
            <div style={{ marginTop: 7, color: "#666", fontSize: 13 }}>
              I file verranno caricati nella cartella: <b>{selectedFolder?.name || "-"}</b>
            </div>
            {batchFiles.length > 0 && (
              <div style={{ textAlign: "left", margin: "18px auto", maxWidth: 600 }}>
                <b>File selezionati:</b>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {batchFiles.map((f, i) =>
                    <li key={i} style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ color: "#999", fontSize: 16 }}>
                        {/\.(pdf)$/i.test(f.name) ? "📄" : /\.(jpe?g|png|gif)$/i.test(f.name) ? "🖼️" : "📎"}
                      </span>
                      {f.name} <span style={{ color: "#888", fontSize: 12 }}>({Math.round(f.size / 1024)} KB)</span>
                      <button type="button" style={{
                        background: "none", border: "none", color: "#e23", fontWeight: "bold", marginLeft: 5, cursor: "pointer"
                      }} onClick={() => removeBatchFile(i)} title="Rimuovi file">×</button>
                    </li>
                  )}
                </ul>
              </div>
            )}
            {batchFiles.length > 0 && (
              <div style={{
                background: "#f6faff", borderRadius: 10, boxShadow: "0 1px 8px #eaeaea",
                padding: 18, marginBottom: 2, maxWidth: 720, margin: "12px auto"
              }}>
                <BatchSelector label="Tag" items={tags} selected={batchTags} setSelected={setBatchTags} color="green" badgeType="name" />
                <BatchSelector label="Team" items={teams} selected={batchTeams} setSelected={setBatchTeams} color="blue" badgeType="name" />
                <BatchSelector label="Progetti" items={projects} selected={batchProjects} setSelected={setBatchProjects} color="yellow" badgeType="title" />
                <BatchSelector label="Aziende" items={clients} selected={batchClients} setSelected={setBatchClients} color="red" badgeType="company" />
                <BatchSelector label="Utenti" items={users} selected={batchUsers} setSelected={setBatchUsers} color="violet" badgeType="fullname" />
                <div style={{ textAlign: "right", marginTop: 10 }}>
                  <button
                    className="px-7 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
                    disabled={uploading}
                    onClick={handleBatchUpload}
                  >
                    {uploading ? "Caricamento..." : "Carica tutti i file"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
