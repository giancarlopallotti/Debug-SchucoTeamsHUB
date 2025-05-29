// Percorso: /pages/components/AttachmentPreviewPDFInline.js
import { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';

// Imposta worker da CDN (richiesto da react-pdf)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function AttachmentPreviewPDFInline({ attachment }) {
  const [numPages, setNumPages] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        onClick={() => setShowPreview(true)}
        style={{ width: 90, height: 100, background: "#f2f3f5", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 4 }}>
        <span role="img" aria-label="pdf" style={{ fontSize: 36, color: "#d22" }}>📄</span>
      </div>
      <span className="truncate text-xs w-full text-center">{attachment.file_name}</span>
      {showPreview && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.8)", zIndex: 2100, display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onClick={() => setShowPreview(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 14, boxShadow: "0 2px 18px #0004",
              maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", padding: 20
            }}>
            <Document
              file={attachment.file_path}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading={<div style={{ color: "#888", fontSize: 18, textAlign: "center" }}>Caricamento PDF…</div>}
              error={<div style={{ color: "#e00", fontSize: 18 }}>Errore PDF</div>}
            >
              {[...Array(numPages || 1).keys()].map(pageIdx =>
                <Page
                  key={pageIdx + 1}
                  pageNumber={pageIdx + 1}
                  width={700}
                  renderTextLayer={false}
                  renderAnnotationLayer={true}
                  style={{ marginBottom: 12, borderRadius: 5, boxShadow: "0 1px 5px #0001" }}
                />
              )}
            </Document>
          </div>
        </div>
      )}
    </div>
  );
}
