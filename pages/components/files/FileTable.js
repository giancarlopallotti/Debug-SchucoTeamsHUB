// Percorso: /components/files/FileTable.js
import React from "react";

export default function FileTable({
  files, tags, teams, users, projects, clients,
  selectedFiles, toggleSelect, selectAll, clearSelect, onEdit
}) {
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
                <td>{(file.tags || []).map(t => badge("#" + (t.name || t), colorMap.tag, t.id))}</td>
                <td>{(file.teams || []).map(t => badge(t.name || t, colorMap.team, t.id))}</td>
                <td>{(file.users || []).map(u => badge((u.surname ? u.surname + " " : "") + u.name, colorMap.user, u.id))}</td>
                <td>{(file.projects || []).map(p => badge(p.title || p.name, colorMap.project, p.id))}</td>
                <td>{(file.clients || []).map(c => badge(c.company, colorMap.client, c.id))}</td>
                <td><span style={{ color: "#666" }}>{file.created_at?.slice(0, 10) || "-"}</span></td>
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
