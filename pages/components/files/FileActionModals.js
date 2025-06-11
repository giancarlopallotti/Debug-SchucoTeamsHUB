// Percorso: /components/files/FileActionModals.js

import React from "react";

export function FilePreviewModal({ open, file, onClose }) {
  if (!open) return null;
  // Anteprima semplice: mostra PDF, immagini o link, fallback per altri
  let content = null;
  if (!file) return null;
  if (/\.(pdf)$/i.test(file.name)) {
    content = <iframe src={`/api/files/raw/${file.id}`} title={file.name} style={{ width: "90vw", height: "80vh" }} />;
  } else if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
    content = <img src={`/api/files/raw/${file.id}`} alt={file.name} style={{ maxWidth: "90vw", maxHeight: "80vh" }} />;
  } else {
    content = <a href={`/api/files/raw/${file.id}`} target="_blank" rel="noopener noreferrer">Scarica / Visualizza</a>;
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-5 shadow-xl relative min-w-[380px] min-h-[120px]">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
          <b style={{ fontSize: 18 }}>{file.name}</b>
          <button style={{
            marginLeft: "auto", border: "none", background: "none", fontSize: 28, cursor: "pointer"
          }} onClick={onClose} title="Chiudi">×</button>
        </div>
        <div style={{ maxHeight: "75vh", overflow: "auto" }}>{content}</div>
      </div>
    </div>
  );
}

export function FileInfoModal({ open, file, onClose }) {
  if (!open || !file) return null;
  // Personalizza i campi info come preferisci (mostro esempi base)
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-xl relative min-w-[350px]">
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <b style={{ fontSize: 19 }}>Info file: {file.name}</b>
          <button style={{
            marginLeft: "auto", border: "none", background: "none", fontSize: 28, cursor: "pointer"
          }} onClick={onClose} title="Chiudi">×</button>
        </div>
        <table style={{ fontSize: 15, marginBottom: 8 }}>
          <tbody>
            <tr><td style={{ color: "#555" }}>Nome</td><td>{file.name}</td></tr>
            <tr><td style={{ color: "#555" }}>Caricato da</td><td>{file.created_by_name || file.created_by || "-"}</td></tr>
            <tr><td style={{ color: "#555" }}>Data creazione</td><td>{file.created_at?.slice(0, 16) || "-"}</td></tr>
            <tr><td style={{ color: "#555" }}>Note</td><td>{file.note || "-"}</td></tr>
            <tr><td style={{ color: "#555" }}>Download</td><td>{file.download_count || 0}</td></tr>
            {/* Puoi aggiungere qui altri dettagli, tipo release, cronologia download ecc. */}
          </tbody>
        </table>
      </div>
    </div>
  );
}
