// Percorso: /pages/files.js

/**
 * Scopo: gestione avanzata file (upload, visualizzazione, log download, metadati + icone)
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import { useEffect, useState } from "react";
import { FiFileText, FiImage, FiVideo, FiMusic, FiFile, FiDownload } from "react-icons/fi";
import Link from "next/link";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    setUploading(true);
    const res = await fetch("/api/files", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setFiles(prev => [...prev, data]);
    }
    setUploading(false);
  };

  const handleDownload = async (file) => {
    await fetch("/api/files/log-download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: file.id })
    });
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (mimetype) => {
    if (!mimetype) return <FiFile className="text-gray-400" />;
    if (mimetype.startsWith("image/")) return <FiImage className="text-blue-500" />;
    if (mimetype.startsWith("video/")) return <FiVideo className="text-purple-500" />;
    if (mimetype.startsWith("audio/")) return <FiMusic className="text-green-500" />;
    if (mimetype.includes("pdf") || mimetype.includes("text") || mimetype.includes("word")) return <FiFileText className="text-red-500" />;
    return <FiFile className="text-gray-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestione Files</h1>
        <div className="flex gap-4">
          <Link
            href="/reports/downloads"
            className="bg-green-700 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          >
            Report Download
          </Link>
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            onClick={() => setShowPopup(true)}
          >
            Associa file
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="border p-2 rounded"
        />
        {uploading && <span className="text-gray-500">Caricamento in corso...</span>}

        <input
          type="text"
          placeholder="Cerca file..."
          className="border rounded p-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ...contenuto file... */}
    </div>
  );
}
