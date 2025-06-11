// Percorso: /pages/components/FileVersionsModal.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function FileVersionsModal({ file, onClose }) {
  const [versions, setVersions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (file && file.id)
      axios.get("/api/files/versions", { params: { file_id: file.id } })
        .then(res => setVersions(res.data || []));
  }, [file]);

  // Upload nuova versione
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file_id", file.id);
    fd.append("file", e.target.file.files[0]);
    fd.append("note", note);
    try {
      await axios.post("/api/files/versions", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setNote("");
      e.target.reset();
      // Reload
      const res = await axios.get("/api/files/versions", { params: { file_id: file.id } });
      setVersions(res.data || []);
      if (onClose) onClose(true); // opzionale
    } catch (err) {
      setError("Errore upload versione: " + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Restore versione
  const handleRestore = async (version_id) => {
    setRestoring(true);
    setError("");
    try {
      await axios.put("/api/files/versions", { file_id: file.id, version_id });
      if (onClose) onClose(true); // chiude e forza refresh
    } catch (err) {
      setError("Errore restore: " + (err.response?.data?.error || err.message));
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadein">
      <div className="bg-white rounded-2xl shadow-2xl p-8 min-w-[390px] max-w-full flex flex-col gap-4">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Versioni file: {file.name}</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">{error}</div>}
        <form onSubmit={handleUpload} className="flex flex-col gap-3 border p-3 rounded mb-2 bg-blue-50/40">
          <label>Carica nuova versione (verrà storicizzata):</label>
          <input type="file" name="file" required disabled={uploading} />
          <input type="text" placeholder="Note (opzionale)" value={note} onChange={e => setNote(e.target.value)} className="rounded border px-2 py-1" />
          <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" disabled={uploading}>Carica</button>
        </form>
        <div>
          <b>Storico versioni:</b>
          <div className="max-h-[200px] overflow-y-auto mt-2">
            {versions.length === 0 && <div className="text-gray-400">Nessuna versione presente.</div>}
            {versions.map(v =>
              <div key={v.id} className="flex items-center gap-3 border-b py-2">
                <div className="flex-1">
                  <div>
                    <b>{v.name}</b> <span className="text-xs text-gray-400 ml-2">{v.created_at?.slice(0,16).replace("T"," ")}</span>
                  </div>
                  {v.note && <div className="text-xs text-gray-600">Note: {v.note}</div>}
                </div>
                <button className="bg-yellow-300 hover:bg-yellow-400 px-3 py-1 rounded text-xs font-semibold" disabled={restoring} onClick={() => handleRestore(v.id)}>Ripristina</button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-6 py-2 bg-gray-200 rounded font-semibold" onClick={() => onClose(false)}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}
