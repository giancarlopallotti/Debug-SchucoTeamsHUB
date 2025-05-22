// Percorso: /pages/projects.js

import React, { useState, useEffect } from "react";
import ProjectModal from "../pages/components/ProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [modalProject, setModalProject] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchProjects();
    fetch("/api/clients").then(res => res.json()).then(setClients);
  }, []);

  function fetchProjects() {
    fetch("/api/projects")
      .then(res => res.json())
      .then(setProjects);
  }

  function getClientById(id) {
    return clients.find(c => String(c.id) === String(id));
  }

  // Calcola tutti i clienti effettivamente associati a progetti per filtro dinamico
  const usedClients = Array.from(
  new Set(
    projects.flatMap(p => (Array.isArray(p.clients) ? p.clients.map(c => c.id) : []))
  )
).map(id => getClientById(id)).filter(Boolean);


  const filteredProjects = projects
    .filter(p =>
      (!search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      ) &&
      (!statusFilter || p.status === statusFilter) &&
      (!priorityFilter || p.priority === priorityFilter) &&
      (!clientFilter ||
        (p.clients || "")
          .split(",")
          .map(x => x.trim())
          .includes(clientFilter)
      )
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let va = a[sortField] || "";
      let vb = b[sortField] || "";
      return va.localeCompare(vb) * dir;
    });

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function resetFilters() {
    setSearch(""); setStatusFilter(""); setPriorityFilter(""); setClientFilter("");
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 22 }}>Progetti</h1>
      {/* Barra filtri */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input
          placeholder="Cerca per titolo o descrizione..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={inputStyle}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutti gli stati</option>
          <option value="da iniziare">Da iniziare</option>
          <option value="in corso">In corso</option>
          <option value="completato">Completato</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutte le priorità</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="bassa">Bassa</option>
        </select>
        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutti i clienti</option>
          {usedClients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} {c.surname ? c.surname : ""}
            </option>
          ))}
        </select>
        <button onClick={resetFilters} style={{
          background: "#e6e9f6", border: "none", borderRadius: 8, padding: "8px 16px",
          fontWeight: 600, color: "#23285A", cursor: "pointer"
        }}>Reset</button>
        <div style={{ flex: "1 0 90px", textAlign: "right" }}>
          <button
            onClick={() => setModalProject({})}
            style={{
              background: "#0749a6",
              color: "#fff",
              padding: "10px 22px",
              fontWeight: "bold",
              border: "none",
              borderRadius: 12,
              fontSize: 16,
              cursor: "pointer"
            }}>
            + Nuovo Progetto
          </button>
        </div>
      </div>
      {/* Tabella */}
      <div style={{
        background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px #0002", padding: 18, maxWidth: 1350, margin: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f6f8fa" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle} onClick={() => toggleSort("title")} className="sortable">
                Titolo {sortField === "title" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>Descrizione</th>
              <th style={thStyle} onClick={() => toggleSort("status")} className="sortable">
                Stato {sortField === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle} onClick={() => toggleSort("priority")} className="sortable">
                Priorità {sortField === "priority" ? (sortDir === "asc" ? "▲" : "▼") : ""}
              </th>
              <th style={thStyle}>Scadenza</th>
              <th style={thStyle}>Clienti</th>
              <th style={thStyle}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "#f8fbff" : "#fff" }}>
                <td style={tdStyle}>{p.id}</td>
                <td style={tdStyle}>{p.title}</td>
                <td style={tdStyle}>{p.description}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: p.status === "completato" ? "#d1f8c3" : p.status === "in corso" ? "#ffe8c7" : "#e0e6f2",
                    color: p.status === "completato" ? "#278626" : p.status === "in corso" ? "#a35b00" : "#23285A",
                    fontWeight: 600, padding: "3px 10px", borderRadius: 8,
                  }}>
                    {p.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    background: p.priority === "alta" ? "#ffc4c4" : p.priority === "media" ? "#ffe8c7" : "#e0e6f2",
                    color: p.priority === "alta" ? "#c10000" : "#a35b00",
                    fontWeight: 600, padding: "3px 10px", borderRadius: 8,
                  }}>
                    {p.priority}
                  </span>
                </td>
                <td style={tdStyle}>{p.deadline}</td>
                <td style={tdStyle}>
                  {(p.clients || "")
                    .split(",")
                    .map(cid => {
                      const c = getClientById(cid);
                      return c ? (
                        <span key={c.id}
                          style={{
                            background: "#e7e9ff", color: "#204080", padding: "2px 8px", borderRadius: 6,
                            marginRight: 3, fontSize: 12, display: "inline-block"
                          }}>
                          {c.name}
                        </span>
                      ) : null;
                    })}
                </td>
                <td style={tdStyle}>
                  <button
                    title="Modifica"
                    onClick={() => setModalProject(p)}
                    style={{
                      background: "#f5f5f5", border: "none", borderRadius: 8, padding: "6px 14px",
                      cursor: "pointer"
                    }}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modale creazione/modifica progetto */}
      {modalProject && (
        <ProjectModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onSaved={() => {
            fetchProjects();
            setModalProject(null);
          }}
        />
      )}
      <style>{`
        .sortable { cursor: pointer; user-select: none; }
        .sortable:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

const inputStyle = {
  minWidth: 120, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0e6f2", flex: "1 1 140px"
};
const thStyle = { padding: 10, fontWeight: 600, cursor: "default" };
const tdStyle = { padding: 10 };
