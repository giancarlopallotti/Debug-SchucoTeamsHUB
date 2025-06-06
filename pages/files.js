// Percorso: /pages/files.js
import { useState, useEffect } from "react";
import FilesTreeView from "./components/FilesTreeView";
import FileEditModal from "./components/FileEditModal";
import axios from "axios";

export default function FilesPage() {
  // Stati selezione cartella/file
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);

  // Batch upload
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchTags, setBatchTags] = useState([]);
  const [batchTeams, setBatchTeams] = useState([]);
  const [batchProjects, setBatchProjects] = useState([]);
  const [batchClients, setBatchClients] = useState([]);
  const [batchUsers, setBatchUsers] = useState([]);
  // Dati disponibili
  const [tags, setTags] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  // Carica tutte le entità disponibili
  useEffect(() => {
    axios.get("/api/tags").then(res => setTags(res.data || []));
    axios.get("/api/teams").then(res => setTeams(res.data || []));
    axios.get("/api/projects").then(res => setProjects(res.data || []));
    axios.get("/api/clients").then(res => setClients(res.data || []));
    axios.get("/api/users").then(res => setUsers(res.data || []));
  }, []);

  // Carica i file della cartella selezionata
  useEffect(() => {
    if (!selectedFolder?.id) return setFolderFiles([]);
    axios.get("/api/folders", { params: { parent_id: selectedFolder.id } })
      .then(res => setFolderFiles(res.data.files || []));
  }, [selectedFolder]);

  // --- HANDLER UPLOAD MULTIPLO
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files || []);
    setBatchFiles(f => [...f, ...files]);
  };
  const removeBatchFile = (i) => setBatchFiles(files => files.filter((_, idx) => idx !== i));
  const removeItem = (array, setArray, item, key = "id") => setArray(array.filter(i => i[key] !== item[key]));
  const toggleItem = (array, setArray, item, key = "id") => {
    if (array.some(i => i[key] === item[key])) removeItem(array, setArray, item, key);
    else setArray([...array, item]);
  };

  // UPLOAD
  const [uploading, setUploading] = useState(false);
  const handleBatchUpload = async () => {
    if (!selectedFolder) return alert("Seleziona una cartella di destinazione!");
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
      // Ricarica file in cartella
      axios.get("/api/folders", { params: { parent_id: selectedFolder.id } })
        .then(res => setFolderFiles(res.data.files || []));
      alert("Caricamento completato!");
    } catch (e) {
      alert("Errore nel caricamento batch: " + (e.response?.data?.error || e.message));
    } finally {
      setUploading(false);
    }
  };

  // --- UI ---
  return (
    <div style={{ display: "flex", height: "calc(100vh - 50px)" }}>
      {/* SINISTRA: ALBERO */}
      <div style={{ width: 270, borderRight: "1.5px solid #eaeaea", background: "#fafaff" }}>
        <FilesTreeView
          onSelect={f => setSelectedFolder(f && f.files ? f : f)}
          selectedId={selectedFolder?.id}
        />
      </div>

      {/* DESTRA: CONTENUTO */}
      <div style={{ flex: 1, padding: 18, overflow: "auto" }}>
        {/* Percorso */}
        <div style={{ marginBottom: 14, fontSize: 16, color: "#333" }}>
          <b>Percorso corrente: </b>
          {selectedFolder
            ? (selectedFolder.path || selectedFolder.name)
            : <span style={{ color: "#999" }}>Nessuna cartella selezionata</span>
          }
        </div>

        {/* DROPZONE BATCH */}
        <div
          style={{
            border: "2px dashed #90caf9", borderRadius: 12, padding: 32, marginBottom: 18,
            background: "#f9fbff", textAlign: "center", transition: "0.2s"
          }}
          onDrop={e => { e.preventDefault(); handleFilesSelected(e); }}
          onDragOver={e => e.preventDefault()}
        >
          <input type="file" multiple style={{ display: "none" }} id="batchUpload" onChange={handleFilesSelected} />
          <label htmlFor="batchUpload" style={{ cursor: "pointer", color: "#1976d2" }}>
            <b>Trascina qui i file</b> o <u>clicca per selezionare</u>
          </label>
          <div style={{ marginTop: 8, color: "#666", fontSize: 13 }}>
            I file verranno caricati nella cartella: <b>{selectedFolder?.name || "-"}</b>
          </div>
          {batchFiles.length > 0 && (
            <div style={{ textAlign: "left", margin: "18px auto", maxWidth: 550 }}>
              <b style={{ fontSize: 15 }}>File selezionati:</b>
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
        </div>

        {/* BATCH: TAG/TEAM/PROGETTI/CLIENTI/UTENTI */}
        {batchFiles.length > 0 && (
          <div style={{
            background: "#f6faff", borderRadius: 10, boxShadow: "0 1px 8px #eaeaea",
            padding: 20, marginBottom: 16, maxWidth: 700
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

        {/* TABELLA FILE NELLA CARTELLA */}
        <table style={{ width: "100%", marginTop: 30, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              <th style={{ textAlign: "left" }}>Nome</th>
              <th style={{ textAlign: "left" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {folderFiles.map(file => (
              <tr key={file.id} style={{ borderBottom: "1px solid #f4f4f4" }}>
                <td>{file.name}</td>
                <td>
                  <button
                    style={{
                      background: "#f5f8ff",
                      border: "1px solid #b3c6ff",
                      borderRadius: 7,
                      padding: "3px 14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                    title="Modifica file"
                    onClick={() => setEditingFile(file)}
                  >
                    ✏️ Modifica
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* MODALE MODIFICA */}
        {editingFile && (
          <FileEditModal
            file={editingFile}
            isOpen={true}
            onClose={() => setEditingFile(null)}
            onSaved={() => {
              setEditingFile(null);
              axios.get("/api/folders", { params: { parent_id: selectedFolder.id } })
                .then(res => setFolderFiles(res.data.files || []));
            }}
          />
        )}
      </div>
    </div>
  );
}

// --- BatchSelector reusabile, come da FileEditModal.js ---
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
                  background: isSelected ? colorMap[color].txt : colorMap[color].bg,
                  color: isSelected ? "#fff" : colorMap[color].txt,
                  borderColor: isSelected ? colorMap[color].txt : colorMap[color].bg
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
