// Percorso: /pages/files/index.js
// Scopo: File manager unificato – albero cartelle + grid con upload / associazione
// Autore: ChatGPT
// Ultima modifica: 30/05/2025

import { useEffect, useState } from "react";
import FileTree from "../components/FileTree";
import ProjectFileAssocModal from "./components/FileAssocModal"; // nuovo wrapper riusa logic da files‑associa.js

export default function FileManagerPage() {
  const [selectedFolder, setSelectedFolder] = useState(null); // path string se serve
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [showAssocModal, setShowAssocModal] = useState(false);

  // Carica file della cartella selezionata (flat grid)
  useEffect(() => {
    if (!selectedFolder) return;
    fetch(`/api/files/list?path=${encodeURIComponent(selectedFolder)}`)
      .then(r => r.json())
      .then(d => setFiles(Array.isArray(d) ? d : []));
  }, [selectedFolder]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar alberata */}
      <aside className="w-1/4 bg-gray-50 dark:bg-gray-900 border-r overflow-auto p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Archivio</h2>
        <FileTree
          darkMode={false}
          onFileClick={(node) => {
            if (node.attributes) {
              setSelectedFile(node);
            } else {
              // clic su cartella → aggiorna path corrente
              const fullPath = node.__rd3t.path || ""; // path build da FileTree (da implementare)
              setSelectedFolder(fullPath);
            }
          }}
        />
      </aside>

      {/* Pannello principale */}
      <main className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-100 dark:bg-gray-700">
          <div className="text-gray-700 dark:text-gray-200 font-semibold">
            {selectedFolder || "Seleziona una cartella"}
          </div>
          <div className="flex gap-2">
            <label className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded cursor-pointer">
              📤 Upload
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  const fd = new FormData();
                  [...e.target.files].forEach(f => fd.append("files", f));
                  fetch(`/api/files/upload?path=${encodeURIComponent(selectedFolder || "")}`, {
                    method: "POST",
                    body: fd
                  }).then(() => {
                    // refresh grid
                    if (selectedFolder) {
                      fetch(`/api/files/list?path=${encodeURIComponent(selectedFolder)}`)
                        .then(r => r.json())
                        .then(d => setFiles(Array.isArray(d) ? d : []));
                    }
                  });
                }}
              />
            </label>
            <button
              onClick={() => setShowAssocModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            >
              🔗 Associa a progetto/cliente
            </button>
          </div>
        </div>

        {/* Grid file */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 overflow-auto flex-1">
          {files.map(f => (
            <div
              key={f.id}
              className="border rounded-lg p-4 hover:shadow cursor-pointer flex flex-col items-center"
              onClick={() => setSelectedFile({ name: f.name, attributes: f })}
            >
              <div className="text-4xl">📄</div>
              <div className="mt-2 text-sm text-center break-all">{f.name}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Anteprima / Dettagli file */}
      {selectedFile && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white dark:bg-gray-900 border-l p-6 overflow-auto z-50 shadow-lg">
          <button className="absolute top-2 right-2 text-red-600 text-xl" onClick={() => setSelectedFile(null)}>✖</button>
          <h3 className="text-xl font-bold mb-4">{selectedFile.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2"><strong>Mimetype:</strong> {selectedFile.attributes.mimetype}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2"><strong>Size:</strong> {(selectedFile.attributes.size/1024).toFixed(2)} KB</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow mt-4"
            onClick={() => window.location.href = `/api/files/${selectedFile.attributes.id}/download`}
          >⬇️ Scarica</button>
        </div>
      )}

      {showAssocModal && (
        <ProjectFileAssocModal
          fileIds={files.filter(f => f.selected).map(f => f.id)}
          onClose={() => setShowAssocModal(false)}
          onSaved={() => setShowAssocModal(false)}
        />
      )}
    </div>
  );
}
