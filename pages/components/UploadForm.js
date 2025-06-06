import { useState } from "react";
import axios from "axios";

// Colori badge (coerenti con FileEditModal)
const colorMap = {
  green: { bg: "#e6f6ea", txt: "#147c3b" },
  blue: { bg: "#e3e6fa", txt: "#263b8a" },
  yellow: { bg: "#fff3d2", txt: "#a47319" },
  red: { bg: "#fce5e0", txt: "#a02222" },
  violet: { bg: "#e7e0fa", txt: "#563fa6" }
};

// Badge selector riusabile (come BatchSelector)
function BadgeSelector({ label, items, selected, setSelected, color, badgeType }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item => {
    const value = badgeType === "fullname"
      ? (item.surname ? item.surname + " " : "") + item.name
      : badgeType === "company"
        ? item.company
        : item.name || item.title;
    return value?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ marginBottom: 8 }}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        placeholder={`Filtra ${label.toLowerCase()}...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-1 rounded px-2 py-1 border text-xs"
        style={{ borderColor: colorMap[color].bg }}
      />
      <div style={{ maxHeight: 100, overflowY: "auto", marginBottom: 6 }}>
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
              className="px-2 py-1 rounded-full text-xs font-semibold border"
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

export default function UploadForm({
  folder, tags = [], teams = [], projects = [], clients = [], users = [],
  onUploaded
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [batchTags, setBatchTags] = useState([]);
  const [batchTeams, setBatchTeams] = useState([]);
  const [batchProjects, setBatchProjects] = useState([]);
  const [batchClients, setBatchClients] = useState([]);
  const [batchUsers, setBatchUsers] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Drop/Select handler
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files || []);
    setSelectedFiles(f => [...f, ...files]);
  };

  // Remove single file from batch
  const removeFile = (i) => setSelectedFiles(files => files.filter((_, idx) => idx !== i));

  // Upload handler
  const handleUpload = async () => {
    if (!folder) return alert("Seleziona una cartella di destinazione!");
    if (selectedFiles.length === 0) return alert("Nessun file selezionato!");
    setUploading(true);

    try {
      const form = new FormData();
      selectedFiles.forEach(f => form.append("files", f));
      form.append("folder_id", folder.id);
      form.append("tags", JSON.stringify(batchTags.map(t => t.id)));
      form.append("teams", JSON.stringify(batchTeams.map(t => t.id)));
      form.append("projects", JSON.stringify(batchProjects.map(p => p.id)));
      form.append("clients", JSON.stringify(batchClients.map(c => c.id)));
      form.append("users", JSON.stringify(batchUsers.map(u => u.id)));
      await axios.post("/api/files/batch-upload", form, { headers: { "Content-Type": "multipart/form-data" } });

      setSelectedFiles([]);
      setBatchTags([]); setBatchTeams([]); setBatchProjects([]); setBatchClients([]); setBatchUsers([]);
      if (onUploaded) onUploaded();
      alert("Caricamento completato!");
    } catch (e) {
      alert("Errore nel caricamento: " + (e.response?.data?.error || e.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      border: "2px dashed #90caf9",
      borderRadius: 12,
      padding: 28,
      background: "#f9fbff",
      marginBottom: 18,
      textAlign: "center",
      maxWidth: 700
    }}
      onDrop={e => { e.preventDefault(); handleFilesSelected(e); }}
      onDragOver={e => e.preventDefault()}
    >
      {/* Percorso/cartella info */}
      <div style={{ fontSize: 15, color: "#666", marginBottom: 10, textAlign: "left" }}>
        I file verranno caricati nella cartella: <b>{folder?.name || "-"}</b>
      </div>
      {/* Dropzone */}
      <input type="file" multiple style={{ display: "none" }} id="uploadFormInput" onChange={handleFilesSelected} />
      <label htmlFor="uploadFormInput" style={{ cursor: "pointer", color: "#1976d2", fontWeight: 500 }}>
        <b>Trascina qui i file</b> o <u>clicca per selezionare</u>
      </label>
      {/* File list preview */}
      {selectedFiles.length > 0 && (
        <div style={{ textAlign: "left", margin: "14px auto", maxWidth: 480 }}>
          <b style={{ fontSize: 15 }}>File selezionati:</b>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {selectedFiles.map((f, i) =>
              <li key={i} style={{ marginBottom: 2, display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ color: "#999", fontSize: 16 }}>
                  {/\.(pdf)$/i.test(f.name) ? "📄" : /\.(jpe?g|png|gif)$/i.test(f.name) ? "🖼️" : "📎"}
                </span>
                {f.name} <span style={{ color: "#888", fontSize: 12 }}>({Math.round(f.size / 1024)} KB)</span>
                <button type="button" style={{
                  background: "none", border: "none", color: "#e23", fontWeight: "bold", marginLeft: 5, cursor: "pointer"
                }} onClick={() => removeFile(i)} title="Rimuovi file">×</button>
              </li>
            )}
          </ul>
        </div>
      )}
      {/* Badge selectors per entità */}
      {selectedFiles.length > 0 && (
        <div style={{
          background: "#f6faff", borderRadius: 10, boxShadow: "0 1px 8px #eaeaea",
          padding: 20, margin: "15px auto 0", textAlign: "left"
        }}>
          <BadgeSelector label="Tag" items={tags} selected={batchTags} setSelected={setBatchTags} color="green" badgeType="name" />
          <BadgeSelector label="Team" items={teams} selected={batchTeams} setSelected={setBatchTeams} color="blue" badgeType="name" />
          <BadgeSelector label="Progetti" items={projects} selected={batchProjects} setSelected={setBatchProjects} color="yellow" badgeType="title" />
          <BadgeSelector label="Aziende" items={clients} selected={batchClients} setSelected={setBatchClients} color="red" badgeType="company" />
          <BadgeSelector label="Utenti" items={users} selected={batchUsers} setSelected={setBatchUsers} color="violet" badgeType="fullname" />
          <div style={{ textAlign: "right", marginTop: 10 }}>
            <button
              className="px-7 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              disabled={uploading}
              onClick={handleUpload}
            >
              {uploading ? "Caricamento..." : "Carica file"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
