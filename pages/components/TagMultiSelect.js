// Percorso: /components/TagMultiSelect.js
// Selettore tag avanzato con ricerca/autocomplete/on-the-fly
// Autore: ChatGPT – 25/05/2025

import { useState } from "react";

export default function TagMultiSelect({ tags, selectedTags, onChange, onCreate }) {
  const [query, setQuery] = useState("");
  const filteredTags = tags.filter(
    t =>
      t.name.toLowerCase().includes(query.toLowerCase()) &&
      !selectedTags.some(sel => sel.id === t.id)
  );

  const handleSelect = (tag) => {
    if (!selectedTags.some(t => t.id === tag.id)) {
      onChange([...selectedTags, tag]);
    }
    setQuery("");
  };

  const handleRemove = (tagId) => {
    onChange(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreate = () => {
    if (!query.trim()) return;
    onCreate(query.trim());
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedTags.map(tag => (
          <span key={tag.id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="ml-1 text-blue-800 hover:text-red-600 font-bold"
              style={{ lineHeight: 0.8 }}
              aria-label="Rimuovi tag"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="border px-2 py-1 rounded w-full text-xs"
        placeholder="Cerca o aggiungi tag…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ fontSize: "12px", height: "26px" }}
        onKeyDown={e => {
          if (e.key === "Enter" && query.trim()) {
            if (
              !filteredTags.some(t => t.name.toLowerCase() === query.toLowerCase()) &&
              !selectedTags.some(t => t.name.toLowerCase() === query.toLowerCase())
            ) {
              handleCreate();
            }
          }
        }}
      />
      {query && (
        <div className="absolute z-10 bg-white border rounded w-full shadow mt-1 max-h-36 overflow-auto">
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => (
              <div
                key={tag.id}
                onClick={() => handleSelect(tag)}
                className="px-3 py-1 cursor-pointer hover:bg-blue-50 text-xs"
              >
                {tag.name}
              </div>
            ))
          ) : (
            <div
              className="px-3 py-1 text-blue-700 cursor-pointer hover:bg-blue-50 text-xs"
              onClick={handleCreate}
            >
              Crea nuovo tag: <b>{query.trim()}</b>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
