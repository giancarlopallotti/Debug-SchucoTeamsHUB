// Percorso: /pages/components/MessageLinksSelector.js
import { useState, useEffect } from "react";

export default function MessageLinksSelector({ selected = [], onChange }) {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetch("/api/projects").then(res => res.json()).then(setProjects);
    fetch("/api/teams").then(res => res.json()).then(setTeams);
    fetch("/api/clients").then(res => res.json()).then(setClients);
  }, []);

  function handleAdd(entity_type, entity) {
    if (!selected.some(link => link.type === entity_type && link.id === entity.id)) {
      onChange([...selected, { type: entity_type, id: entity.id, name: entity.name || entity.title }]);
    }
  }

  function handleRemove(entity_type, entity_id) {
    onChange(selected.filter(link => !(link.type === entity_type && link.id === entity_id)));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1">
        {selected.map(link => (
          <span key={link.type + link.id} className="bg-green-100 text-green-900 rounded px-2 py-1 text-xs flex items-center">
            [{link.type}] {link.name}
            <button className="ml-1 text-red-500" onClick={() => handleRemove(link.type, link.id)}>×</button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <select onChange={e => { const id = Number(e.target.value); if (!id) return; const obj = projects.find(x => x.id === id); handleAdd("project", obj); }}>
          <option value="">+ Progetto</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select onChange={e => { const id = Number(e.target.value); if (!id) return; const obj = teams.find(x => x.id === id); handleAdd("team", obj); }}>
          <option value="">+ Team</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select onChange={e => { const id = Number(e.target.value); if (!id) return; const obj = clients.find(x => x.id === id); handleAdd("client", obj); }}>
          <option value="">+ Cliente</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}
