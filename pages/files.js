// pages/files.js

/**
 * Scopo: gestione avanzata file (upload, visualizzazione, filtri, popup associazione)
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import { useEffect, useState } from "react";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetch("/api/files").then(r => r.json()).then(setFiles);
    fetch("/api/my-projects").then(r => r.json()).then(setProjects);
    fetch("/api/my-clients").then(r => r.json()).then(setClients);
    fetch("/api/my-teams").then(r => r.json()).then(setTeams);
  }, []);

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

  const handleDelete = async (id) => {
    if (!confirm("Sei sicuro di voler eliminare il file?")) return;
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" });
    if (res.ok) setFiles(files.filter(f => f.id !== id));
  };

  const handleSaveAssociations = async () => {
    const res = await fetch("/api/files/associate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: selectedFileId,
        projectId: selectedProject,
        clientId: selectedClient,
        teamId: selectedTeam,
        private: isPrivate
      })
    });
    if (res.ok) {
      alert("Associazioni salvate con successo");
      setShowPopup(false);
    } else {
      alert("Errore nel salvataggio delle associazioni");
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-900">Gestione Files</h1>
        <button
          className="bg-blue-700 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          onClick={() => setShowPopup(true)}
        >
          Associa file
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFiles.length === 0 ? (
          <p className="text-gray-500 col-span-full">Nessun file disponibile.</p>
        ) : filteredFiles.map(file => (
          <div key={file.id} className="border p-4 rounded bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-blue-800">{file.name}</p>
                <a href={file.url} target="_blank" className="text-sm text-blue-600 underline">Visualizza / Scarica</a>
              </div>
              <button onClick={() => handleDelete(file.id)} className="text-red-600 text-sm">Elimina</button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup Associazione */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Associa file a entità</h2>

            <select value={selectedFileId} onChange={e => setSelectedFileId(e.target.value)} className="w-full border p-2 rounded mb-3">
              <option value="">Seleziona file...</option>
              {files.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="border p-2 rounded">
                <option value="">Progetto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="border p-2 rounded">
                <option value="">Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="border p-2 rounded">
                <option value="">Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm mb-4">
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
              Salva file come privato
            </label>

            <div className="flex justify-end gap-4">
              <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-gray-200 rounded">Chiudi</button>
              <button onClick={handleSaveAssociations} className="px-4 py-2 bg-blue-700 text-white rounded">Salva associazioni</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
