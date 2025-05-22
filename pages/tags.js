// Percorso: /pages/tags.js
// Scopo: Gestione tag globale (aggiunta, modifica, eliminazione sicura con conferma referenziale)
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: UI moderna, elimina con doppio check, modifica inline, fix await async

import { useEffect, useState } from "react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null); // { id, name, usage }
  const [editing, setEditing] = useState(null);   // { id, name }
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);

  // Carica tags
  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(setTags);
  }, []);

  // Aggiungi tag
  const addTag = async () => {
    if (!newTag.trim()) return;
    setLoading(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() })
    });
    if (res.ok) {
      const data = await res.json();
      setTags(t => [...t, data]);
      setSuccess("TAG aggiunto!");
      setNewTag("");
    } else {
      setError("Errore: TAG già esistente o non valido");
    }
    setLoading(false);
    setTimeout(() => setSuccess("") || setError("") , 1500);
  };

  // Chiede conferma eliminazione referenziale
  const confirmDelete = async (tag) => {
    setLoading(true);
    const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    if (data.inUse) {
      setDeleting({ id: tag.id, name: tag.name, usage: data.usage });
    } else {
      setDeleting({ id: tag.id, name: tag.name, usage: null });
    }
  };

  // Elimina dopo doppia conferma
  const doDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    await fetch(`/api/tags/${deleting.id}?confirm=1`, { method: "DELETE" });
    setTags(tags.filter(t => t.id !== deleting.id));
    setDeleting(null);
    setLoading(false);
  };

  // Modifica nome tag
  const startEdit = (tag) => {
    setEditing({ id: tag.id, name: tag.name });
    setEditName(tag.name);
  };
  const saveEdit = async () => {
    if (!editName.trim() || !editing) return;
    setLoading(true);
    const res = await fetch(`/api/tags/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() })
    });
    if (res.ok) {
      setTags(tags.map(t => t.id === editing.id ? { ...t, name: editName.trim() } : t));
      setEditing(null);
    } else {
      setError("Nome tag duplicato/non valido");
    }
    setLoading(false);
    setTimeout(() => setError("") , 1500);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white rounded shadow p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Gestione TAGS Globali</h1>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          className="border p-2 rounded w-full"
          maxLength={24}
          placeholder="Nuovo TAG (solo MAIUSCOLO)"
          value={newTag}
          onChange={e => setNewTag(e.target.value.toUpperCase())}
          disabled={loading}
        />
        <button
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
          onClick={addTag}
          disabled={loading}
        >Aggiungi TAG</button>
      </div>
      {success && <div className="text-green-700 mb-2">{success}</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}
      <div className="mb-4">
        <div className="font-bold mb-1">TAG disponibili:</div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag.id} className="flex items-center bg-green-100 rounded px-3 py-1 gap-1">
              {editing?.id === tag.id ? (
                <>
                  <input
                    className="border rounded px-1 py-0.5 text-xs"
                    value={editName}
                    maxLength={24}
                    onChange={e => setEditName(e.target.value.toUpperCase())}
                  />
                  <button className="text-blue-600 text-xs ml-1" onClick={saveEdit}>Salva</button>
                  <button className="text-gray-500 text-xs ml-1" onClick={() => setEditing(null)}>Annulla</button>
                </>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <button
                    className="text-xs text-yellow-700 hover:underline ml-1"
                    onClick={() => startEdit(tag)}
                    disabled={loading}
                  >Modifica</button>
                  <button
                    className="text-xs text-red-700 hover:underline ml-1"
                    onClick={() => confirmDelete(tag)}
                    disabled={loading}
                  >Elimina</button>
                </>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Conferma eliminazione: modal semplice o dettagliata */}
      {deleting && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg max-w-md p-6">
            <h2 className="font-bold text-lg mb-2 text-red-700">Conferma eliminazione TAG</h2>
            <div className="mb-3">
              Vuoi eliminare il tag <b>{deleting.name}</b>?
              {deleting.usage && (
                <>
                  <div className="mt-2 text-sm text-gray-700">Il tag è utilizzato in:</div>
                  <ul className="mb-2 ml-5 text-xs text-gray-700">
                    {Object.entries(deleting.usage).map(([ent, n]) => (
                      n > 0 && <li key={ent}>{n} {ent}</li>
                    ))}
                  </ul>
                  <div className="text-xs text-red-500 mb-2">Sarà rimosso da tutte le entità collegate!</div>
                </>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-1 rounded bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => setDeleting(null)}
              >Annulla</button>
              <button
                className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                onClick={doDelete}
                disabled={loading}
              >Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
