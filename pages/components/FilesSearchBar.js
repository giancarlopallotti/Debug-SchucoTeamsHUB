// Percorso: /pages/components/FilesSearchBar.js v3 – 07/06/2025
// Scopo: Barra ricerca con filtri multipli su tags/team/progetti/autori
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import { useState, useEffect } from "react";
import axios from "axios";

export default function FilesSearchBar({ onSelectFile }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tags, setTags] = useState([]);
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Stato filtri multipli (array di id)
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  useEffect(() => {
    axios.get("/api/files/filters").then(res => {
      setTags(res.data.tags || []);
      setTeams(res.data.teams || []);
      setProjects(res.data.projects || []);
      setAuthors(res.data.authors || []);
    });
  }, []);

  useEffect(() => {
    const search = async () => {
      if (
        !query &&
        selectedTags.length === 0 &&
        selectedTeams.length === 0 &&
        selectedProjects.length === 0 &&
        selectedAuthors.length === 0
      ) {
        setResults([]);
        return;
      }
      setLoading(true);
      const res = await axios.get("/api/files/search", {
        params: {
          q: query,
          tags: selectedTags.join(","),
          teams: selectedTeams.join(","),
          projects: selectedProjects.join(","),
          authors: selectedAuthors.join(",")
        }
      });
      setResults(res.data.files || []);
      setLoading(false);
    };
    search();
    // eslint-disable-next-line
  }, [query, selectedTags, selectedTeams, selectedProjects, selectedAuthors]);

  // Utility handler per multiselect
  const handleMultiSelect = setter => e =>
    setter(Array.from(e.target.selectedOptions, o => o.value));

  return (
    <div style={{ marginBottom: 12, background: "#f7f9fa", padding: 10, borderRadius: 8, position: "relative" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Cerca file per nome, nota, tipo..."
          style={{ width: 170, padding: 5, fontSize: 15 }}
        />
        <select multiple value={selectedTags} onChange={handleMultiSelect(setSelectedTags)} style={{ minWidth: 110 }}>
          {tags.length === 0 && <option value="">Tutti i TAG</option>}
          {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select multiple value={selectedTeams} onChange={handleMultiSelect(setSelectedTeams)} style={{ minWidth: 110 }}>
          {teams.length === 0 && <option value="">Tutti i Team</option>}
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select multiple value={selectedProjects} onChange={handleMultiSelect(setSelectedProjects)} style={{ minWidth: 120 }}>
          {projects.length === 0 && <option value="">Tutti i Progetti</option>}
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select multiple value={selectedAuthors} onChange={handleMultiSelect(setSelectedAuthors)} style={{ minWidth: 120 }}>
          {authors.length === 0 && <option value="">Tutti gli autori</option>}
          {authors.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
        </select>
        {loading && <span style={{ marginLeft: 6 }}>⏳</span>}
      </div>
      {results.length > 0 && (
        <div style={{
          background: "#fff",
          border: "1px solid #ccc",
          marginTop: 6,
          maxHeight: 220,
          overflowY: "auto",
          width: 640,
          zIndex: 10,
          position: "absolute"
        }}>
          {results.map(file => (
            <div
              key={file.id}
              style={{
                padding: "5px 10px",
                borderBottom: "1px solid #eee",
                cursor: "pointer"
              }}
              onClick={() => {
                onSelectFile(file);
                setQuery("");
                setResults([]);
              }}
              title={file.note}
            >
              📄 <b>{file.name}</b>{" "}
              <span style={{ color: "#888", fontSize: 12 }}>({file.mimetype})</span>
              {file.note && <span style={{ fontSize: 12, color: "#6a6" }}> • {file.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
