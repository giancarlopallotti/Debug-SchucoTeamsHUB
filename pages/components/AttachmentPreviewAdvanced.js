// Percorso: /pages/components/AttachmentPreviewAdvanced.js
import { useState } from "react";

export default function AttachmentPreviewAdvanced({ attachment }) {
  const [showPreview, setShowPreview] = useState(false);

  const ext = (attachment.file_name || "").split(".").pop().toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
  const isPDF = ext === "pdf";
  const fileSize = attachment.size ? (attachment.size / 1024).toFixed(1) + " KB" : "";

  // Modal preview (effetto wow)
  function PreviewModal({ children }) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center"
      }} onClick={() => setShowPreview(false)}>
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 2px 16px #0005", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}
          onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow p-2 bg-white border flex flex-col items-center gap-1 relative" style={{ minWidth: 110, maxWidth: 160 }}>
      {/* Badge tipo e dimensione */}
      <span style={{
        position: "absolute", top: 6, right: 10, background: "#eee", color: "#444",
        fontSize: 11, borderRadius: 8, padding: "0 7px", fontWeight: 700
      }}>
        {isImage ? "IMG" : isPDF ? "PDF" : ext.toUpperCase()} {fileSize}
      </span>

      {/* Thumbnail/preview */}
      {isImage && (
        <>
          <img
            src={attachment.file_path}
            alt={attachment.file_name}
            style={{ maxWidth: 100, maxHeight: 80, borderRadius: 7, cursor: "pointer", objectFit: "cover", marginBottom: 3 }}
            onClick={() => setShowPreview(true)}
          />
          {showPreview && (
            <PreviewModal>
              <img src={attachment.file_path} alt={attachment.file_name} style={{ maxWidth: "75vw", maxHeight: "75vh" }} />
            </PreviewModal>
          )}
        </>
      )}

      {isPDF && (
        <>
          <div
            onClick={() => setShowPreview(true)}
            style={{ width: 90, height: 100, background: "#f2f3f5", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 4 }}>
            <span role="img" aria-label="pdf" style={{ fontSize: 36, color: "#d22" }}>📄</span>
          </div>
          <span className="truncate text-xs w-full text-center">{attachment.file_name}</span>
          {showPreview && (
            <PreviewModal>
              <iframe
                src={attachment.file_path}
                title={attachment.file_name}
                width="600"
                height="600"
                style={{ border: "none", maxWidth: "90vw", maxHeight: "80vh" }}
              />
            </PreviewModal>
          )}
        </>
      )}

      {!isImage && !isPDF && (
        <a
          href={attachment.file_path}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "14px 0"
          }}
          title="Scarica/Visualizza"
        >
          <span role="img" aria-label="allegato" style={{ fontSize: 30 }}>📎</span>
          <span className="truncate text-xs w-full text-center">{attachment.file_name}</span>
        </a>
      )}

      {/* Quick action: download */}
      <a
        href={attachment.file_path}
        download={attachment.file_name}
        className="mt-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-900 hover:bg-blue-200"
        style={{ textDecoration: "none" }}
        title="Scarica allegato"
      >Download</a>
    </div>
  );
}
