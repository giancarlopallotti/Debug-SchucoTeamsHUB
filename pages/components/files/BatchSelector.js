// Percorso: /components/files/BatchSelector.js
import React, { useState } from "react";

export default function BatchSelector({ label, items, selected, setSelected, color, badgeType }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(item => {
    const value = badgeType === "fullname"
      ? (item.surname ? item.surname + " " : "") + item.name
      : badgeType === "company"
        ? item.company
        : item.name || item.title;
    return value?.toLowerCase().includes(search.toLowerCase());
  });
  const colorMap = {
    green: { bg: "#e6f6ea", txt: "#147c3b" },
    blue: { bg: "#e3e6fa", txt: "#263b8a" },
    yellow: { bg: "#fff3d2", txt: "#a47319" },
    red: { bg: "#fce5e0", txt: "#a02222" },
    violet: { bg: "#e7e0fa", txt: "#563fa6" }
  };
  return (
    <div style={{ marginBottom: 9 }}>
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <input
        type="text"
        placeholder={`Filtra ${label.toLowerCase()}...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-1 rounded px-2 py-1 border text-xs"
        style={{ borderColor: colorMap[color].bg }}
      />
      <div style={{ maxHeight: 120, overflowY: "auto", marginBottom: 6 }}>
        <div className="flex flex-wrap gap-2">
          {filtered.map(item => {
            const value = badgeType === "fullname"
              ? (item.surname ? item.surname + " " : "") + item.name
              : badgeType === "company"
                ? item.company
                : item.name || item.title;
            const isSelected = selected.some(s => s.id === item.id);
            return (
              <button
                key={item.id}
                type="button"
                className={`px-2 py-1 rounded-full text-xs font-semibold border`}
                style={{
                  background: colorMap[color].bg,
                  color: colorMap[color].txt,
                  border: isSelected ? `1.5px solid ${colorMap[color].txt}` : undefined
                }}
                onClick={() => {
                  if (isSelected) setSelected(selected.filter(s => s.id !== item.id));
                  else setSelected([...selected, item]);
                }}
              >
                {value}
                {isSelected && <span style={{ marginLeft: 6, fontWeight: "bold", color: "#e22", cursor: "pointer" }}>×</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-1">
        {selected.map(item => {
          const value = badgeType === "fullname"
            ? (item.surname ? item.surname + " " : "") + item.name
            : badgeType === "company"
              ? item.company
              : item.name || item.title;
          return (
            <span
              key={item.id}
              className={`px-2 py-1 rounded-full text-xs font-semibold border`}
              style={{ background: colorMap[color].bg, color: colorMap[color].txt }}
            >
              {value}
              <button
                className="ml-1 text-red-600 font-bold hover:text-red-900"
                type="button"
                onClick={() => setSelected(selected.filter(s => s.id !== item.id))}
                style={{ background: "transparent", border: "none", marginLeft: 8, cursor: "pointer" }}
                title="Rimuovi"
              >×</button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
