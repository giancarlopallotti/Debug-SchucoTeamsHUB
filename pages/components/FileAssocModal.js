// Percorso: /pages/components/FileAssocModal.js
// Scopo : Modal per associare un file a progetti / clienti / team (riusa logica di files‑associa.js)
// Autore : ChatGPT
// Ultima modifica: 06/06/2025

import { useEffect, useState } from "react";

export default function FileAssocModal({ onClose = () => {} }) {
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);

  const [fileId, setFileId] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [msg, setMsg] = useState("");
  const [assoc, setAssoc] = useState({ projects: [], clients: [], teams: [] });

  useEffect(() => {
    Promise.all([
      fetch("/api/files").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/clients").then(r => r.json()),
      fetch("/api/teams").then(r => r.json())
    ]).then(([f, p, c, t]) => {
      setFiles(f.files || f); // compat tensor
      setProjects(p);
      setClients(c);
      setTeams(t);
    });
  }, []);

  useEffect(() => {
    if (!fileId) {
      setAssoc({ projects: [], clients: [], teams: [] });
      return;
    }
    Promise.all([
      fetch(`/api/files?project=-1&file=${fileId}`).then(r => r.json()),
      fetch(`/api/files?client=-1&file=${fileId}`).then(r => r.json()),
      fetch(`/api/files?team=-1&file=${fileId}`).then(r => r.json())
    ]).then(([fp, fc, ft]) => {
      setAssoc({
        projects: fp.map(x => x.project_id || x.id),
        clients:  fc.map(x => x.client_id || x.id),
        teams:    ft.map(x => x.team_id || x.id)
      });
    });
  }, [fileId]);

  const handleAssign = async e => {
    e.preventDefault();
    setMsg("");
    if (!fileId) return setMsg("Seleziona un file!");
    const res = await fetch("/api/files/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, projectIds, clientIds, teamIds })
    });
    if (res.ok) {
      setMsg("Associazioni aggiornate!");
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile associare"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-xl relative overflow-auto max-h-[90vh]">
        <button className="absolute top-2 right-2 text-red-600 text-xl" onClick={onClose}>✖</button>
        <h2 className="text-xl font-bold mb-4">Associa File</h2>
        <form onSubmit={handleAssign} className="space-y-4 text-sm">
          <div>
            <label className="font-medium mr-2">File:</label>
            <select value={fileId} onChange={e => setFileId(e.target.value)} className="border rounded p-1">
              <option value="">Seleziona file…</option>
              {files.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium mr-2">Progetti:</label>
            <select multiple value={projectIds} onChange={e => setProjectIds([...e.target.selectedOptions].map(o => Number(o.value)))} className="border rounded p-1 min-w-[180px] h-24">
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium mr-2">Clienti:</label>
            <select multiple value={clientIds} onChange={e => setClientIds([...e.target.selectedOptions].map(o => Number(o.value)))} className="border rounded p-1 min-w-[180px] h-24">
              {clients.map(c => <option key={c.id} value={c.id}>{c.surname} {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-medium mr-2">Team:</label>
            <select multiple value={teamIds} onChange={e => setTeamIds([...e.target.selectedOptions].map(o => Number(o.value)))} className="border rounded p-1 min-w-[180px] h-24">
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          {msg && <p className="text-sm text-blue-700">{msg}</p>}
          <div className="text-right">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Salva</button>
          </div>
        </form>
      </div>
    </div>
  );
}
