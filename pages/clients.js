import React, { useState, useEffect } from "react";
import ClientModal from "./components/ClientModal";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [modalClient, setModalClient] = useState(null);
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [sortField, setSortField] = useState("company");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => { fetchClients(); }, []);
  function fetchClients() {
    fetch("/api/clients").then(r => r.json()).then(setClients);
  }

  // Filtri + sort
  const filteredClients = clients
    .filter(c =>
      (!search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.surname?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase())) &&
      (!companyFilter || c.company === companyFilter) &&
      (!cityFilter || c.city === cityFilter) &&
      (!provinceFilter || c.province === provinceFilter)
    )
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let va = a[sortField] || "";
      let vb = b[sortField] || "";
      return va.localeCompare(vb) * dir;
    });

  function toggleSort(field) {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function resetFilters() {
    setSearch(""); setCompanyFilter(""); setCityFilter(""); setProvinceFilter("");
  }

  // Raccogli valori unici per filtri select
  const companyOptions = [...new Set(clients.map(c => c.company).filter(Boolean))];
  const cityOptions = [...new Set(clients.map(c => c.city).filter(Boolean))];
  const provinceOptions = [...new Set(clients.map(c => c.province).filter(Boolean))];

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontWeight: "bold", marginBottom: 22 }}>Clienti</h1>
      {/* Barra filtri */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <input placeholder="Cerca nome, cognome o azienda..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} />
        <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutte le aziende</option>
          {companyOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={cityFilter} onChange={e => setCityFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutte le città</option>
          {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)} style={inputStyle}>
          <option value="">Tutte le province</option>
          {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={resetFilters} style={{
          background: "#e6e9f6", border: "none", borderRadius: 8, padding: "8px 16px",
          fontWeight: 600, color: "#23285A", cursor: "pointer"
        }}>Reset</button>
        <div style={{ flex: "1 0 90px", textAlign: "right" }}>
          <button onClick={() => setModalClient({})}
            style={{
              background: "#0749a6", color: "#fff", padding: "10px 22px", fontWeight: "bold",
              border: "none", borderRadius: 12, fontSize: 16, cursor: "pointer"
            }}>
            + Nuovo Cliente
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
              <th style={thStyle} onClick={() => toggleSort("company")}>Azienda {sortField === "company" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th style={thStyle} onClick={() => toggleSort("surname")}>Cognome {sortField === "surname" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th style={thStyle} onClick={() => toggleSort("name")}>Nome {sortField === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
              <th style={thStyle}>Città</th>
              <th style={thStyle}>Provincia</th>
              <th style={thStyle}>Contatto</th>
              <th style={thStyle}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "#f8fbff" : "#fff" }}>
                <td style={tdStyle}>{c.company}</td>
                <td style={tdStyle}>{c.surname}</td>
                <td style={tdStyle}>{c.name}</td>
                <td style={tdStyle}>{c.city}</td>
                <td style={tdStyle}>{c.province}</td>
                <td style={tdStyle}>{c.main_contact}</td>
                <td style={tdStyle}>
                  <button
                    title="Modifica"
                    onClick={() => setModalClient(c)}
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
      {/* Modale creazione/modifica cliente */}
      {modalClient && (
        <ClientModal
          client={modalClient}
          onClose={() => setModalClient(null)}
          onSaved={() => { fetchClients(); setModalClient(null); }}
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
const thStyle = { padding: 10, fontWeight: 600, cursor: "pointer" };
const tdStyle = { padding: 10 };
