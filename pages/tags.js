// Percorso: /pages/tags.js
// Scopo: Gestione TAGS Globali, 2 colonne responsive, badge e bottoni ridotti del 50%
// Autore: ChatGPT (su file utente, solo modifica grafica)
// Ultima modifica: 25/05/2025

import { useState, useEffect } from "react";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editTag, setEditTag] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(Array.isArray(data) ? data : []));
  }, []);

  const addTag = () => {
    if (!newTag.trim()) return;
    fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    })
      .then((res) => res.json())
      .then((tag) => setTags((tags) => [...tags, tag]));
    setNewTag("");
  };

  const removeTag = (id) => {
    fetch(`/api/tags/${id}`, { method: "DELETE" }).then(() =>
      setTags((tags) => tags.filter((t) => t.id !== id))
    );
  };

  const startEdit = (tag) => {
    setEditTag(tag.id);
    setEditValue(tag.name);
  };

  const saveEdit = (id) => {
    fetch(`/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setTags((tags) => tags.map((t) => (t.id === id ? updated : t)));
        setEditTag(null);
      });
  };

  return (
    <div style={{ maxWidth: 600, margin: "32px auto", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 3px 14px #0001", padding: 20, minWidth: 260 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#17409e", marginBottom: 15 }}>
          Gestione <b>TAGS</b> Globali
        </h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value.toUpperCase())}
            placeholder="Nuovo TAG (solo MAIUSCOLO)"
            style={{ flex: 1, fontSize: 13, padding: "6px 10px", borderRadius: 7, border: "1px solid #ccc", minWidth: 0 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTag();
            }}
          />
          <button
            onClick={addTag}
            style={{ background: "#179f44", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 7, padding: "7px 12px", minWidth: 0 }}
          >
            Aggiungi TAG
          </button>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#24661d", marginBottom: 6 }}>
          TAG disponibili:
        </div>
        {/* 2 colonne responsive con dimensioni dimezzate */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 7,
          maxWidth: 520,
        }}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#d2ffe4",
                borderRadius: 8,
                fontSize: 13,
                margin: 0,
                padding: "2px 10px",
                marginBottom: 5,
                minWidth: 0,
                fontWeight: 500,
                gap: 4,
                height: 28,
              }}
            >
              {editTag === tag.id ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                    style={{ fontSize: 12, padding: "2px 4px", borderRadius: 5, border: "1px solid #bbb", width: 68, marginRight: 4 }}
                  />
                  <button
                    onClick={() => saveEdit(tag.id)}
                    style={{ fontSize: 11, padding: "1px 6px", marginRight: 2, borderRadius: 5, background: "#ccf", border: "none", color: "#234", fontWeight: 600, cursor: "pointer" }}
                  >Salva</button>
                  <button
                    onClick={() => setEditTag(null)}
                    style={{ fontSize: 11, padding: "1px 6px", borderRadius: 5, background: "#ffd", border: "none", color: "#a00", fontWeight: 600, cursor: "pointer" }}
                  >Annulla</button>
                </>
              ) : (
                <>
                  {tag.name}
                  <button
                    onClick={() => startEdit(tag)}
                    style={{
                      marginLeft: 4,
                      fontSize: 11,
                      padding: "2px 6px",
                      background: "#ccffe6",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#236",
                      fontWeight: 600,
                      minWidth: 0,
                    }}
                    title="Modifica tag"
                  >Modifica</button>
                  <button
                    onClick={() => removeTag(tag.id)}
                    style={{
                      marginLeft: 4,
                      fontSize: 11,
                      padding: "2px 6px",
                      background: "#ffd3d3",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      color: "#b90000",
                      fontWeight: 600,
                      minWidth: 0,
                    }}
                    title="Elimina tag"
                  >Elimina</button>
                </>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
