// Percorso: /pages/components/FileMoveModal.js
import { useState } from "react";
import axios from "axios";

export default function FileMoveModal({ file, folders, onClose }) {
  const folderList = Array.isArray(folders) ? folders : [];
  const [dest, setDest] = useState(file.folder_id || folderList[0]?.id || "");
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");

  const handleMove = async e => {
    e.preventDefault();
    setMoving(true);
    setError("");
    try {
      await axios.post("/api/files/move", { file_id: file.id, folder_id: dest });
      onClose(true);
    } catch (err) {
      setError("Errore nello spostamento: " + (err.response?.data?.error || err.message));
    } finally {
      setMoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadein">
      <form onSubmit={handleMove} className="bg-white rounded-2xl shadow-2xl p-8 min-w-[340px] max-w-full flex flex-col gap-4">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Sposta file: {file.name}</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">{error}</div>}
        <label className="font-semibold mb-1">Sposta in cartella:</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={dest}
          onChange={e => setDest(e.target.value)}
        >
          {folderList.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2 mt-3">
          <button type="button" className="px-6 py-2 bg-gray-200 rounded font-semibold" onClick={() => onClose(false)} disabled={moving}>Annulla</button>
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-semibold" disabled={moving}>
            Sposta
          </button>
        </div>
      </form>
    </div>
  );
}
