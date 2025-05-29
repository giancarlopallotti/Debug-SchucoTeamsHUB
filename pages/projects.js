// Percorso: /pages/projects.js
// Scopo: Visualizzazione e gestione dei progetti associati ai team
// Autore: ChatGPT
// Ultima modifica: 29/05/2025 (grafica migliorata omogenea)

import { useState, useEffect } from "react";
import ProjectModal from "./components/ProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [clients, setClients] = useState([]);
  const [modalProject, setModalProject] = useState(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    fetch("/api/teams")
      .then(res => res.json())
      .then(data => setTeams(Array.isArray(data) ? data : []));

    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(Array.isArray(data) ? data : []));
  }, []);

  const getTeamName = (id) => {
    const t = teams.find(t => t.id === id);
    return t ? t.name : "-";
  };

  const getClientNames = (ids) => {
    if (!Array.isArray(ids)) return "-";
    return ids.map(id => {
      const c = clients.find(c => c.id === id);
      return c ? c.name : "";
    }).filter(Boolean).join(", ");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">📁 Progetti</h2>
        <button onClick={() => setModalProject({})} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow">
          + Nuovo Progetto
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-100 text-left text-xs uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Clienti</th>
              <th className="px-4 py-3 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">📌 {p.name}</td>
                <td className="px-4 py-3">🏷 {getTeamName(p.team_id)}</td>
                <td className="px-4 py-3">👥 {getClientNames(p.clients)}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setModalProject(p)}
                    className="text-blue-600 hover:underline font-medium"
                  >Modifica</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalProject && (
        <ProjectModal
          project={modalProject}
          onClose={() => setModalProject(null)}
          onRefresh={() => {
            fetch("/api/projects")
              .then(res => res.json())
              .then(data => setProjects(Array.isArray(data) ? data : []));
          }}
        />
      )}
    </div>
  );
}
