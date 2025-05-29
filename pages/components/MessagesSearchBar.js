// Percorso: /pages/components/MessagesSearchBar.js
import { useState, useEffect } from "react";
import TagSelector from "./TagSelector";

export default function MessagesSearchBar({ onFilter }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [project, setProject] = useState("");
  const [client, setClient] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(setTags);
    fetch("/api/projects").then(r => r.json()).then(setProjects);
    fetch("/api/clients").then(r => r.json()).then(setClients);
  }, []);

  function applyFilters(e) {
    e && e.preventDefault();
    onFilter({
      search,
      tag_id: selectedTag ? selectedTag.id : undefined,
      project_id: project || undefined,
      client_id: client || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  }

  return (
    <form className="flex flex-wrap gap-2 items-end mb-3" onSubmit={applyFilters}>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Cerca testo o oggetto..."
        className="border px-2 py-1 rounded text-sm w-40"
      />
      <select
        value={project}
        onChange={e => setProject(e.target.value)}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Progetto</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
      <select
        value={client}
        onChange={e => setClient(e.target.value)}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Cliente</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select
        value={selectedTag ? selectedTag.id : ""}
        onChange={e => setSelectedTag(tags.find(t => t.id == e.target.value) || null)}
        className="border px-2 py-1 rounded text-sm"
      >
        <option value="">Tag</option>
        {tags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
      </select>
      <input
        type="date"
        value={dateFrom}
        onChange={e => setDateFrom(e.target.value)}
        className="border px-2 py-1 rounded text-sm"
        placeholder="Da"
      />
      <input
        type="date"
        value={dateTo}
        onChange={e => setDateTo(e.target.value)}
        className="border px-2 py-1 rounded text-sm"
        placeholder="A"
      />
      <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1 text-sm font-semibold">
        Applica
      </button>
      <button type="button" className="text-gray-500 border px-2 py-1 rounded text-xs" onClick={() => {
        setSearch(""); setProject(""); setClient(""); setDateFrom(""); setDateTo(""); setSelectedTag(null); applyFilters();
      }}>Reset</button>
    </form>
  );
}
