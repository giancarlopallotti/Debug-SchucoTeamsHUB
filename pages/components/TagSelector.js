// Percorso: /pages/components/TagSelector.js
import { useState, useEffect } from "react";

/*
  USO:
  <TagSelector selected={selectedTags} onChange={setSelectedTags} />
*/

export default function TagSelector({ selected = [], onChange }) {
  const [allTags, setAllTags] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  // Carica tutti i tag disponibili
  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(data => setAllTags(data));
  }, []);

  // Aggiungi tag esistente selezionato
  function handleAdd(tag) {
    if (!selected.some(t => t.id === tag.id)) onChange([...selected, tag]);
  }

  // Crea e aggiungi nuovo tag (solo MAIUSCOLO e univoco)
  function handleCreate() {
    const name = input.trim().toUpperCase();
    if (!name) return;
    if (allTags.some(t => t.name.toUpperCase() === name)) {
      setError("Tag già esistente");
      return;
    }
    fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).error);
        return res.json();
      })
      .then(newTag => {
        setAllTags([...allTags, newTag]);
        onChange([...selected, newTag]);
        setInput("");
        setError("");
      })
      .catch(err => setError(err.message || "Errore creazione tag"));
  }

  function handleRemove(tagId) {
    onChange(selected.filter(t => t.id !== tagId));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {selected.map(tag => (
          <span key={tag.id} className="bg-blue-100 text-blue-900 rounded px-2 py-1 text-xs flex items-center">
            #{tag.name}
            <button className="ml-1 text-red-500" onClick={() => handleRemove(tag.id)}>×</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={e => { setInput(e.target.value); setError(""); }}
        placeholder="Aggiungi tag (MAIUSCOLO)…"
        className="border px-2 py-1 rounded text-xs mr-2"
        onKeyDown={e => e.key === "Enter" && handleCreate()}
        style={{ textTransform: "uppercase" }}
      />
      <button onClick={handleCreate} className="bg-blue-500 text-white rounded px-2 py-1 text-xs">Aggiungi</button>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      <div className="flex flex-wrap gap-1 mt-2">
        {allTags
          .filter(t => !selected.some(sel => sel.id === t.id))
          .map(tag => (
            <button key={tag.id}
              className="bg-gray-100 hover:bg-blue-100 text-gray-700 rounded px-2 py-1 text-xs"
              onClick={() => handleAdd(tag)}
            >
              #{tag.name}
            </button>
          ))}
      </div>
    </div>
  );
}
