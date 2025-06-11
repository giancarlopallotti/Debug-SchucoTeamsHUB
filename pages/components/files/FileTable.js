// Percorso: /components/files/FileTable.js
import React, { useState } from "react";

export default function FileTable({
  files, tags, teams, users, projects, clients,
  selectedFiles, toggleSelect, selectAll, clearSelect, onEdit, onDownloadSelected,
  currentPath = "Percorso corrente"
}) {
  // State ordinamento
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showActions, setShowActions] = useState(null); // file.id

  // Funzione ordinamento
  const sortBy = (field) => {
    if (sortField === field) setSortDir(dir => dir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
  const sortedFiles = [...files].sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";
    if (sortField === "created_at") {
      valA = valA || ""; valB = valB || "";
    }
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Badge utility
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

  // ACTIONS MENU
  const handleActions = (action, file) => {
    setShowActions(null);
    if (action === "preview") {
      // TODO: implementa anteprima (modale, download, inline, ecc.)
      window.open(`/api/files/preview/${file.id}`, "_blank");
    }
    if (action === "delete") {
      if (window.confirm("Sei sicuro di voler eliminare questo file?")) {
        // TODO: implementa eliminazione (API call, reload lista)
        alert("Eliminazione file non ancora implementata!");
      }
    }
    if (action === "info") {
      // TODO: apri un modale con i dettagli avanzati (utente creatore, download, release, etc)
      alert("Visualizza info file: " + file.name);
    }
  };

  // ICON SORT
  const sortIcon = (field) =>
    <span style={{ fontSize: 11, marginLeft: 3, color: "#aaa" }}>
      {sortField !== field ? "⇅" : (sortDir === "asc" ? "▲" : "▼")}
    </span>;

  return (
    <div style={{ marginTop: 18 }}>
      {/* Intestazione pro con breadcrumb */}
      <div style={{ marginBottom: 7, display: "flex", alignItems: "center" }}>
        <span style={{
          fontWeight: 600, fontSize: 20, color: "#223", marginRight: 16, display: "flex", alignItems: "center"
        }}>
          <span role="img" aria-label="folder" style={{ marginRight: 5 }}>📂</span>
          {currentPath || "Percorso corrente"}
        </span>
        <b style={{ fontSize: 16, marginLeft: 12 }}>
          File trovati: {files.length}
        </b>
        <button onClick={onDownloadSelected}
          style={{
            marginLeft: 14, fontSize: 14, background: "#e3e6fa",
            border: "none", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontWeight: 600, color: "#1e39a5"
          }}
          disabled={!selectedFiles.length}
        >
          ⬇️ Download selezionati
        </button>
        <button onClick={selectAll} style={{ marginLeft: 18, fontSize: 13, background: "#eef3ff", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>Seleziona tutti</button>
        <button onClick={clearSelect} style={{ marginLeft: 7, fontSize: 13, background: "#ffeaea", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer", color: "#a02222" }}>Deseleziona</button>
        {selectedFiles.length > 0 && (
          <span style={{ marginLeft: 15, fontSize: 14, color: "#15671a" }}>
            {selectedFiles.length} selezionati
          </span>
        )}
      </div>

      {/* Tabella */}
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
              <th style={{ textAlign: "left", padding: "9px 8px", cursor: "pointer" }} onClick={() => sortBy("name")}>
                Nome{sortIcon("name")}
              </th>
              <th style={{ textAlign: "left", padding: "9px 8px", cursor: "pointer" }} onClick={() => sortBy("note")}>
                Note{sortIcon("note")}
              </th>
              <th>Tag</th>
              <th>Team</th>
              <th>Utenti</th>
              <th>Progetti</th>
              <th>Aziende</th>
              <th style={{ cursor: "pointer" }} onClick={() => sortBy("created_at")}>Data{sortIcon("created_at")}</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {sortedFiles.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "#aaa", padding: 28, fontSize: 16 }}>
                  Nessun file trovato.
                </td>
              </tr>
            )}
            {sortedFiles.map(file => (
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
                {/* NOME */}
                <td style={{ fontWeight: 500, color: "#293562", padding: "7px 8px", verticalAlign: "top" }}>
                  {/\.(pdf)$/i.test(file.name) ? "📄"
                    : /\.(jpe?g|png|gif)$/i.test(file.name) ? "🖼️"
                    : /\.(xls|xlsx)$/i.test(file.name) ? "📊"
                    : "📎"
                  } {file.name}
                </td>
                {/* NOTE */}
                <td style={{ color: "#444", fontSize: 13, padding: "6px 4px", verticalAlign: "top" }}>
                  {file.note || ""}
                </td>
                {/* TAGS */}
                <td style={{ padding: "6px 4px" }}>
                  {(file.tags || []).length === 0 ? "-" : (file.tags || []).map(t =>
                    <div key={t.id || t} style={{ marginBottom: 3 }}>
                      {badge("#" + (t.name || t), colorMap.tag, t.id)}
                    </div>
                  )}
                </td>
                {/* TEAM */}
                <td style={{ padding: "6px 4px" }}>
                  {(file.teams || []).length === 0 ? "-" : (file.teams || []).map(t =>
                    <div key={t.id || t} style={{ marginBottom: 3 }}>
                      {badge(t.name || t, colorMap.team, t.id)}
                    </div>
                  )}
                </td>
                {/* UTENTI */}
                <td style={{ padding: "6px 4px" }}>
                  {(file.users || []).length === 0 ? "-" : (file.users || []).map(u =>
                    <div key={u.id} style={{ marginBottom: 3 }}>
                      {badge(
                        (u.surname ? u.surname + " " : "") + u.name,
                        colorMap.user,
                        u.id
                      )}
                    </div>
                  )}
                </td>
                {/* PROGETTI */}
                <td style={{ padding: "6px 4px" }}>
                  {(file.projects || []).length === 0 ? "-" : (file.projects || []).map(p =>
                    <div key={p.id || p} style={{ marginBottom: 3 }}>
                      {badge(p.title || p.name, colorMap.project, p.id)}
                    </div>
                  )}
                </td>
                {/* AZIENDE */}
                <td style={{ padding: "6px 4px" }}>
                  {(file.clients || []).length === 0 ? "-" : (file.clients || []).map(c =>
                    <div key={c.id || c} style={{ marginBottom: 3 }}>
                      {badge(c.company, colorMap.client, c.id)}
                    </div>
                  )}
                </td>
                {/* DATA */}
                <td style={{ color: "#666", fontSize: 13, verticalAlign: "top", padding: "6px 4px" }}>
                  {file.created_at?.slice(0, 10) || "-"}
                </td>
                {/* AZIONI */}
                <td style={{ position: "relative", textAlign: "center" }}>
                  <button
                    onClick={() => setShowActions(file.id === showActions ? null : file.id)}
                    style={{
                      background: "#fffbe7",
                      border: "1px solid #ffe08a",
                      borderRadius: 6,
                      padding: "4px 8px",
                      fontSize: 15,
                      cursor: "pointer"
                    }}
                    title="Azioni"
                  >⋮</button>
                  {showActions === file.id && (
                    <div
                      style={{
                        position: "absolute", right: 0, top: 30, zIndex: 20,
                        background: "#fff", border: "1.5px solid #e3e6fa", borderRadius: 10,
                        minWidth: 150, boxShadow: "0 2px 14px #eee"
                      }}
                      onMouseLeave={() => setShowActions(null)}
                    >
                      <button onClick={() => handleActions("preview", file)} style={menuBtnStyle}>Anteprima</button>
                      <button onClick={() => handleActions("delete", file)} style={menuBtnStyle}>Elimina</button>
                      <button onClick={() => handleActions("info", file)} style={menuBtnStyle}>Info</button>
                    </div>
                  )}
                  <button onClick={() => onEdit(file)}
                    style={{
                      background: "#fffbe7", border: "1px solid #ffe08a",
                      borderRadius: 6, padding: "4px 12px", marginLeft: 4, fontSize: 15, cursor: "pointer"
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

// Stile per bottoni menu azioni
const menuBtnStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  fontSize: 15,
  padding: "10px 18px",
  cursor: "pointer",
  color: "#223"
};
