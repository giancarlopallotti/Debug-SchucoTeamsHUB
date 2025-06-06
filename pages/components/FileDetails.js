// Percorso: /pages/components/FileDetails.js v7 – 09/06/2025
import { useEffect, useState } from "react";
import axios from "axios";
import FileEditModal from "./FileEditModal";
import FileVersionsModal from "./FileVersionsModal";
import FileMoveModal from "./FileMoveModal";

// Badge style + tooltip via title
const badgeStyle = (bg, color = "#222") => ({
  background: bg,
  color,
  borderRadius: 12,
  padding: "8px 18px",
  fontSize: 15,
  fontWeight: 500,
  marginRight: 8,
  marginBottom: 8,
  display: "inline-block",
  minWidth: 54,
  boxShadow: "0 1px 3px #ececec",
  transition: "0.2s",
  cursor: "pointer",
  position: "relative"
});
const blockStyle = { marginBottom: 22 };

// Helpers preview
function getFileExtension(name) { return name?.split(".").pop()?.toLowerCase() || ""; }
function isImage(ext) { return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext); }
function isPDF(ext) { return ext === "pdf"; }
function isText(ext) { return ["txt", "csv", "md", "log"].includes(ext); }
function isExcel(ext) { return ["xls", "xlsx"].includes(ext); }
function isWord(ext) { return ["doc", "docx", "rtf"].includes(ext); }

export default function FileDetails({ file, onFileMoved, onFileDeleted }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [relations, setRelations] = useState({ tags: [], teams: [], projects: [], clients: [], users: [] });
  const [logs, setLogs] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [folders, setFolders] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    axios.get("/api/files/relations", { params: { file_id: file.id } })
      .then(res => setRelations({
        tags: res.data.tags || [],
        teams: res.data.teams || [],
        projects: res.data.projects || [],
        clients: res.data.clients || [],
        users: res.data.users || []
      }));
    axios.get("/api/files/logs", { params: { file_id: file.id } })
      .then(res => setLogs(res.data || []));
  }, [file.id, refreshKey]);

  // Download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(file.path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo file?")) return;
    setDeleting(true);
    await axios.delete("/api/files", { data: { id: file.id } });
    setDeleting(false);
    if (onFileDeleted) onFileDeleted();
  };

  // Versioni
  const handleVersions = () => setShowVersions(true);

  // Sposta file
  const openMoveModal = async () => {
    // Carica cartelle solo quando serve (API: /api/folders, deve restituire [{id, name}])
    const res = await axios.get("/api/folders");
    setFolders(res.data);
    setShowMoveModal(true);
  };

  // Preview integrata
  const ext = getFileExtension(file.name);
  let preview = null;
  if (isImage(ext)) {
    preview = <img src={file.path} alt={file.name} style={{ maxWidth: "100%", maxHeight: 340, borderRadius: 12, margin: "0 auto 18px", display: "block", boxShadow: "0 2px 8px #e3eafe" }} />;
  } else if (isPDF(ext)) {
    preview = <iframe src={file.path} title={file.name} style={{ width: "100%", height: 440, border: "1px solid #ececec", borderRadius: 8, background: "#f7f7fc", marginBottom: 18 }} />;
  } else if (isText(ext)) {
    preview = <iframe src={file.path} title={file.name} style={{ width: "100%", height: 220, border: "1px solid #ececec", background: "#fcfcfe", borderRadius: 8, marginBottom: 18 }} />;
  } else if (isExcel(ext)) {
    preview = <div style={{ color: "#15671a", margin: "0 0 18px" }}>📊 File Excel non visualizzabile in preview.</div>;
  } else if (isWord(ext)) {
    preview = <div style={{ color: "#2450a5", margin: "0 0 18px" }}>📝 File Word non visualizzabile in preview.</div>;
  }

  // Tooltip helpers
  const tooltipFor = (obj, tipo) => {
    if (!obj) return "";
    if (tipo === "tag") return `#${obj.name}\nCreato il: ${obj.created_at || "-"}`;
    if (tipo === "team") return `Team: ${obj.name}\nCreato da: ${obj.created_by_name || "?"}`;
    if (tipo === "project") return `Progetto: ${obj.title}\nCreato il: ${obj.created_at?.slice(0,10) || "-"}`;
    if (tipo === "client") return `Azienda: ${obj.company}`;
    if (tipo === "user") return `Utente: ${obj.surname ? obj.surname + " " : ""}${obj.name}`;
    return "";
  };

  // Badge color mapping
  const colorMap = {
    tags:     { bg: "#e3e6fa", txt: "#263b8a" },
    teams:    { bg: "#d8f2e0", txt: "#137956" },
    projects: { bg: "#fff3d2", txt: "#a47319" },
    clients:  { bg: "#fce5e0", txt: "#a02222" },
    users:    { bg: "#e7e0fa", txt: "#563fa6" }
  };
  const renderBadges = (items, bg, col, label, valueKey = "name", type) =>
    items.length ? (
      <div style={{ marginBottom: 7 }}>
        <span style={{ color: "#555", fontWeight: 500 }}>{label}: </span>
        {items.map(item =>
          <span
            key={item.id || item}
            style={badgeStyle(bg, col)}
            title={tooltipFor(item, type)}
          >
            {(label === "Tag" ? "#" : "")}
            {valueKey === "fullname"
              ? `${item.surname ? item.surname + " " : ""}${item.name}`
              : valueKey === "company"
                ? item.company
                : item[valueKey] || item.name || item.title}
          </span>
        )}
      </div>
    ) : null;

  // Timeline log verticale moderna
  const renderLogs = logs => (
    <div style={{
      background: "#f8f8fc",
      borderRadius: 12,
      padding: 18,
      marginTop: 30,
      marginBottom: 0,
      boxShadow: "0 2px 8px #ececf5"
    }}>
      <b style={{ color: "#5a54c7" }}>Cronologia attività file</b>
      <div style={{ marginLeft: 14, borderLeft: "3px solid #c5c7e7", paddingLeft: 16, marginTop: 10, position: "relative" }}>
        {logs.length === 0 && <div style={{ color: "#aaa", marginTop: 8 }}>Nessuna attività registrata.</div>}
        {logs.map((log, i) =>
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", marginBottom: 14, position: "relative",
            opacity: 0, animation: `fadeinlog 0.9s cubic-bezier(.2,.6,.7,1) forwards`, animationDelay: `${i * 70}ms`
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 16, background: "#fff", color: "#5a54c7",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 5px #e3eafc", position: "absolute", left: -33, top: 2, fontSize: 18,
              border: `2.2px solid ${log.action === "upload" ? "#60a5fa" : log.action === "download" ? "#22d3ee" : log.action === "update" ? "#fbbf24" : log.action === "delete" ? "#f87171" : "#c5c7e7"}`
            }}>
              {log.action === "upload" && "⬆️"}
              {log.action === "download" && "⬇️"}
              {log.action === "update" && "✏️"}
              {log.action === "delete" && "🗑️"}
              {log.action === "version_upload" && "🕓"}
            </div>
            <div style={{ fontSize: 15, marginLeft: 0, color: "#444", minHeight: 28, display: "flex", flexDirection: "column" }}>
              <span>
                <span style={{ fontWeight: 600 }}>{log.datetime?.slice(0, 16).replace("T", " ")}</span>
                {log.user ? <span style={{ marginLeft: 6, color: "#4a469e" }}>{log.user}</span> : ""}
                <span style={{ marginLeft: 10, color: "#666" }}>{log.description || log.action}</span>
              </span>
              {log.note && <span style={{ color: "#8b889a", fontSize: 13, marginLeft: 2 }}>{log.note}</span>}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeinlog {
          from { opacity:0; transform:translateY(16px);}
          to { opacity:1; transform:none;}
        }
      `}</style>
    </div>
  );

  // --- UI ---
  return (
    <div style={{
      maxWidth: 820, margin: "30px auto",
      borderRadius: 18, background: "#fff",
      boxShadow: "0 2px 24px #e8eafe", padding: 32
    }}>
      {/* HEADER + PREVIEW */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 180px" }}>
          {preview}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 28, display: "flex", alignItems: "center" }}>
            {isImage(ext) && <span title="Immagine">🖼️</span>}
            {isPDF(ext) && <span title="PDF">📄</span>}
            {isExcel(ext) && <span title="Excel">📊</span>}
            {isWord(ext) && <span title="Word">📝</span>}
            {!isImage(ext) && !isPDF(ext) && !isExcel(ext) && !isWord(ext) && <span title="File">📎</span>}
            <span style={{ marginLeft: 12 }}>{file.name}</span>
          </h2>
          <div style={{ color: "#5a5a8a", fontSize: 15, fontWeight: 500 }}>
            {file.mimetype} – <b>{(file.size / 1024).toFixed(1)} KB</b>
            {" | "} Cartella: <b>{file.folder_id || "root"}</b>
          </div>
          <div style={{ display: "flex", gap: 10, margin: "20px 0" }}>
            <button style={{ background: "#f3f5ff", border: "1px solid #b3c6ff", borderRadius: 7, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }} onClick={handleDownload} disabled={downloading}>⬇️ Download</button>
            <button style={{ background: "#fdf0e9", border: "1px solid #fdc6b1", borderRadius: 7, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }} onClick={() => setShowEdit(true)}>✏️ Modifica</button>
            <button style={{ background: "#ffeaea", border: "1px solid #ffb3b3", borderRadius: 7, padding: "7px 18px", fontWeight: 600, cursor: "pointer", color: "#c71a1a" }} onClick={handleDelete} disabled={deleting}>🗑️ Elimina</button>
            <button style={{ background: "#eef6e6", border: "1px solid #a0c99e", borderRadius: 7, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }} onClick={openMoveModal}>↔️ Sposta</button>
            <button style={{ background: "#e6f0fa", border: "1px solid #7bb5e8", borderRadius: 7, padding: "7px 18px", fontWeight: 600, cursor: "pointer" }} onClick={handleVersions}>🕓 Versioni</button>
          </div>
        </div>
      </div>

      {/* BADGE GROUPS */}
      <div style={blockStyle}>
        {renderBadges(relations.tags, colorMap.tags.bg, colorMap.tags.txt, "Tag", "name", "tag")}
        {renderBadges(relations.teams, colorMap.teams.bg, colorMap.teams.txt, "Team", "name", "team")}
        {renderBadges(relations.projects, colorMap.projects.bg, colorMap.projects.txt, "Progetti", "title", "project")}
        {renderBadges(relations.clients, colorMap.clients.bg, colorMap.clients.txt, "Aziende", "company", "client")}
        {renderBadges(relations.users, colorMap.users.bg, colorMap.users.txt, "Utenti", "fullname", "user")}
      </div>

      {/* NOTE */}
      <div style={{
        background: "#f8faff", padding: 18, borderRadius: 10, fontSize: 16,
        margin: "16px 0 0 0", color: "#222", border: "1px solid #e7eef8"
      }}>
        <b>Note:</b> {file.note || <span style={{ color: "#aaa" }}>-</span>}
      </div>

      {/* TIMELINE LOG */}
      {renderLogs(logs)}

      {/* MODAL: Modifica */}
      <FileEditModal
        file={file}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={() => { setRefreshKey(k => k + 1); setShowEdit(false); }}
      />

      {/* MODAL: Versioni */}
      {showVersions && (
        <FileVersionsModal
          file={file}
          onClose={(refresh) => {
            setShowVersions(false);
            if (refresh) setRefreshKey(k => k + 1);
          }}
        />
      )}

      {/* MODAL: Sposta file */}
      {showMoveModal && (
        <FileMoveModal
          file={file}
          folders={folders}
          onClose={(refresh) => {
            setShowMoveModal(false);
            if (refresh) setRefreshKey(k => k + 1);
          }}
        />
      )}
    </div>
  );
}
