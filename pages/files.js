// Percorso: /pages/files.js
// Scopo: Pagina gestione file, SOLO frontend React, nessun import db!
// Autore: ChatGPT (affinazione richiesta utente), revisione 25/05/2025
// Note: Chiamate API REST, compatibile Next.js 15, nessuna logica server nel client

import { useEffect, useState } from "react";

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch files da API
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/files");
      if (!res.ok) throw new Error("Errore durante il recupero dei file");
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  // Ricerca lato client (puoi adattare a ricerca lato API)
  const filteredFiles = files.filter(
    f =>
      !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.tags?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestione File e Allegati</h1>
      <div className="mb-3 flex flex-col md:flex-row gap-2 md:gap-4">
        <input
          type="text"
          placeholder="Cerca per nome o tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
        <button
          onClick={fetchFiles}
          className="px-4 py-2 bg-blue-700 text-white rounded shadow hover:bg-blue-800"
        >
          Aggiorna lista
        </button>
      </div>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {loading ? (
        <div>Caricamento...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-2 py-2 border">Nome</th>
                <th className="px-2 py-2 border">Tipo</th>
                <th className="px-2 py-2 border">Dimensione</th>
                <th className="px-2 py-2 border">Tag</th>
                <th className="px-2 py-2 border">Utente</th>
                <th className="px-2 py-2 border">Data upload</th>
                <th className="px-2 py-2 border">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6">
                    Nessun file trovato.
                  </td>
                </tr>
              ) : (
                filteredFiles.map(f => (
                  <tr key={f.id}>
                    <td className="border px-2 py-1">{f.name}</td>
                    <td className="border px-2 py-1">{f.type || "-"}</td>
                    <td className="border px-2 py-1">{f.size ? `${(f.size/1024).toFixed(1)} KB` : "-"}</td>
                    <td className="border px-2 py-1">{f.tags || "-"}</td>
                    <td className="border px-2 py-1">{f.uploaded_by || "-"}</td>
                    <td className="border px-2 py-1">{f.uploaded_at?.split("T")[0] || "-"}</td>
                    <td className="border px-2 py-1">
                      <a
                        href={f.url || f.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
