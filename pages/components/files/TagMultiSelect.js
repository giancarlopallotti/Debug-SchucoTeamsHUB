// Percorso: /components/files/TagMultiSelect.js
import React, { useState } from "react";

export default function TagMultiSelect({ options, value, onChange, placeholder, user, project, client }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter(opt => {
    let label = user
      ? `${opt.surname || ""} ${opt.name || ""}`.trim()
      : project
        ? opt.title
        : client
          ? opt.company
          : opt.name;
    return label?.toLowerCase().includes(search.toLowerCase());
  });

  const getLabel = (opt) =>
    user ? `${opt.surname || ""} ${opt.name || ""}`.trim()
      : project ? opt.title
      : client ? opt.company
      : opt.name;

  return (
    <div style={{ position: "relative", minWidth: 120 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: "#f3f6fb",
          border: '1.5px solid #e3e6fa',
          borderRadius: 8,
          padding: "7px 12px",
          minWidth: 110,
          cursor: "pointer",
          color: "#444",
          fontSize: 15,
        }}
      >
        {value.length === 0
          ? <span style={{ color: "#aaa" }}>{placeholder}</span>
          : value.map(v => getLabel(v)).join(", ")}
        <span style={{ float: "right", fontSize: 13, marginLeft: 5 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            zIndex: 20,
            minWidth: "100%",
            background: "#fff",
            border: "1.5px solid #e3e6fa",
            borderRadius: 8,
            boxShadow: "0 2px 12px #ececec",
            padding: 8,
            maxHeight: 200,
            overflowY: "auto"
          }}
        >
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Filtra...`}
            style={{
              width: "100%",
              padding: "5px 8px",
              marginBottom: 7,
              border: "1px solid #ddd",
              borderRadius: 5,
              fontSize: 14
            }}
          />
          <div style={{ maxHeight: 130, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ color: "#aaa", fontSize: 13 }}>Nessun risultato</div>
            )}
            {filtered.map(opt => {
              const checked = value.some(v => v.id === opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (checked) onChange(value.filter(v => v.id !== opt.id));
                    else onChange([...value, opt]);
                    setOpen(false); // <-- chiude il menu dopo la selezione
                  }}
                  style={{
                    padding: "4px 8px",
                    cursor: "pointer",
                    borderRadius: 5,
                    background: checked ? "#e3e6fa" : "none",
                    fontWeight: checked ? 700 : 400,
                    color: checked ? "#223" : "#333",
                    marginBottom: 1
                  }}
                >
                  {user && <span style={{ marginRight: 5, color: "#9461e3" }}>👤</span>}
                  {project && <span style={{ marginRight: 5, color: "#ffc107" }}>📁</span>}
                  {client && <span style={{ marginRight: 5, color: "#e66" }}>🏢</span>}
                  {getLabel(opt)}
                  {checked && <span style={{ float: "right" }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
