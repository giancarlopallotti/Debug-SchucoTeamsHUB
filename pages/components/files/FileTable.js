// Percorso: /components/files/FileTable.js

import React, { useState } from "react";
import { Download, Eye, Info, Pencil, Trash2 } from "lucide-react"; // Se non vuoi le icone: usa emoji "⬇️", "✏️" ecc.

export default function FileTable({
  files, tags, teams, users, projects, clients,
  selectedFiles, toggleSelect, selectAll, clearSelect, onEdit,
  onInfo, onPreview, onDelete
}) {
  const [downloading, setDownloading] = useState(false);

  // Badge e colori
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
        margin: "0 3px 3px 0",
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
  const multiline = arr => arr.length > 0
    ? arr.map((el, i) => <div key={i} style={{ marginBottom: 2 }}>{el}</div>)
    : <span style={{ color: "#bbb" }}>-</span>;

  // DOWNLOAD MULTIPLO ZIP
  async function handleDownloadSelected() {
    if (!selectedFiles.length) {
      alert("Nessun file selezionato!");
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/files/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedFiles }),
      });
      if (!res.ok) {
        alert("Errore nel download.");
        return;
      }
      const cd = res.headers.get('content-disposition');
      let filename = "files.zip";
      if (cd && /filename="?([^"]+)"?/.test(cd)) filename = cd.match(/filename="?([^"]+)"?/)[1];
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  // DOWNLOAD SINGOLO FILE (usa nome reale dal DB, se fornito)
  async function handleDownloadFile(file) {
    if (!file || !file.id) return;
    try {
      // Chiede info reali (nome file) dal backend
      const res = await fetch(`/api/files/info?file_id=${file.id}`);
      if (!res.ok) {
        window.open(`/api/files/raw/${file.id}`, "_blank"); // fallback
        return;
      }
      const data = await res.json();
      // Download vero
      const rawRes = await fetch(`/api/files/raw/${file.id}`);
      if (!rawRes.ok) {
        alert("Errore nel download.");
        return;
      }
      const blob = await rawRes.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = data.original_name || data.name || file.name || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(a.href);
    } catch {
      window.open(`/api/files/raw/${file.id}`, "_blank");
    }
  }

  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ marginBottom: 7, display: "flex", alignItems: "center" }}>
        <b style={{ fontSize: 18 }}>File trovati: {files.length}</b>
        <button onClick={selectAll} style={{ marginLeft: 18, fontSize: 13, background: "#eef3ff", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer" }}>Seleziona tutti</button>
        <button onClick={clearSelect} style={{ marginLeft: 7, fontSize: 13, background: "#ffeaea", border: "none", borderRadius: 7, padding: "5px 12px", cursor: "pointer", color: "#a02222" }}>Deseleziona</button>
        {selectedFiles.length > 0 && (
          <span style={{ marginLeft: 15, fontSize: 14, color: "#15671a" }}>
            {selectedFiles.length} selezionati
            <button
              onClick={handleDownloadSelected}
              disabled={downloading}
              style={{
                marginLeft: 20, background: "#d2f5e3", border: "none", borderRadius: 7,
                padding: "6px 16px", fontWeight: 600, color: "#177b29", cursor: "pointer"
              }}>
              <Download size={17} style={{ verticalAlign: "middle", marginRight: 6 }} />
              {downloading ? "Download..." : "Scarica selezionati"}
            </button>
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
              <th style={{ textAlign: "left" }}>Note</th>
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
                <td colSpan={10} style={{ textAlign: "center", color: "#aaa", padding: 28, fontSize: 16 }}>
                  Nessun file trovato.
                </td>
              </tr>
            )}
            {files.map(file => (
              <tr key={file.id} style={{
                background: selectedFiles.includes(file.id) ? "#e8ebfa" : "transparent",
                borderBottom: "1px solid #f0f1fa"
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
                <td style={{ color: "#6c6c6c", fontSize: 13, maxWidth: 170 }}>
                  {file.note || <span style={{ color: "#bbb" }}>-</span>}
                </td>
                <td>{multiline((file.tags || []).map(t =>
                  badge("#" + (t.name || t), colorMap.tag, t.id)
                ))}</td>
                <td>{multiline((file.teams || []).map(t =>
                  badge(t.name || t, colorMap.team, t.id)
                ))}</td>
                <td>{multiline((file.users || []).map(u =>
                  badge(
                    (u.surname ? u.surname + " " : "") + u.name,
                    colorMap.user,
                    u.id
                  )
                ))}</td>
                <td>{multiline((file.projects || []).map(p =>
                  badge(p.title || p.name, colorMap.project, p.id)
                ))}</td>
                <td>{multiline((file.clients || []).map(c =>
                  badge(c.company, colorMap.client, c.id)
                ))}</td>
                <td>
                  <span style={{ color: "#666" }}>{file.created_at?.slice(0, 10) || "-"}</span>
                </td>
                <td>
                  {/* Download diretto */}
                  <button
                    onClick={() => handleDownloadFile(file)}
                    style={{
                      background: "#f5fbf7", border: "1px solid #c9eccb",
                      borderRadius: 6, padding: "4px 12px", marginRight: 4, fontSize: 15, cursor: "pointer"
                    }}
                    title="Scarica file"
                  >
                    <Download size={17} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  </button>
                  {/* Anteprima file */}
                  <button onClick={() => onPreview?.(file)}
                    style={{
                      background: "#f6f6fc", border: "1px solid #e2e1ff",
                      borderRadius: 6, padding: "4px 12px", marginRight: 4, fontSize: 15, cursor: "pointer"
                    }}
                    title="Anteprima file"
                  > <Eye size={17} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  </button>
                  {/* Info file */}
                  <button onClick={() => onInfo?.(file)}
                    style={{
                      background: "#eafdfe", border: "1px solid #c1e8ed",
                      borderRadius: 6, padding: "4px 12px", marginRight: 4, fontSize: 15, cursor: "pointer"
                    }}
                    title="Info file"
                  > <Info size={17} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  </button>
                  {/* Modifica */}
                  <button onClick={() => onEdit?.(file)}
                    style={{
                      background: "#fffbe7", border: "1px solid #ffe08a",
                      borderRadius: 6, padding: "4px 12px", marginRight: 4, fontSize: 15, cursor: "pointer"
                    }}
                    title="Modifica dettagli"
                  > <Pencil size={17} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  </button>
                  {/* Elimina */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Confermi eliminazione del file "${file.name}"?`))
                        onDelete?.(file);
                    }}
                    style={{
                      background: "#fef3f3", border: "1px solid #e9bebe",
                      borderRadius: 6, padding: "4px 12px", fontSize: 15, cursor: "pointer", color: "#a02222"
                    }}
                    title="Elimina file"
                  > <Trash2 size={17} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        th { font-weight: 600; color: #344060; font-size: 15px; user-select: none }
        th, td { vertical-align: top }
      `}</style>
    </div>
  );
}
