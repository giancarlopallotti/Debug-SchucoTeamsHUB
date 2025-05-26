// Percorso: /pages/projects.js
// Scopo: Layout progetti stile Microsoft Windows Fluent - colorato e professionale
// Autore: ChatGPT
// Ultima modifica: 25/05/2025
// Note: Migliorie grafiche, badge stato/cliente/team, barra filtri sticky

import { useEffect, useState } from "react";
import { FaProjectDiagram, FaSearch, FaPlus, FaUsers, FaSyncAlt } from "react-icons/fa";
import ProjectModal from "./components/ProjectModal"; // Aggiorna percorso se necessario

const statusColors = {
  "In corso": "bg-blue-500 text-white",
  "Completato": "bg-green-500 text-white",
  "In attesa": "bg-yellow-500 text-white",
  "Sospeso": "bg-gray-400 text-black"
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalProject, setModalProject] = useState(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []));
  }, []);

  const filteredProjects = projects.filter(project =>
    (!statusFilter || project.status === statusFilter) &&
    (!search ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.client && project.client.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen bg-[#f3f6fd] px-0 md:px-8 py-4">
      {/* Barra filtri */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between shadow-md rounded-2xl p-4 mb-8 border border-blue-100">
        <div className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0">
          <FaProjectDiagram className="text-blue-500 text-2xl mr-2" />
          <input
            type="text"
            placeholder="Cerca progetto..."
            className="rounded-xl px-4 py-2 border border-blue-200 bg-white shadow focus:outline-blue-400 transition"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="rounded-xl px-3 py-2 ml-2 border border-blue-200 bg-white text-blue-700"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            <option value="In corso">In corso</option>
            <option value="Completato">Completato</option>
            <option value="In attesa">In attesa</option>
            <option value="Sospeso">Sospeso</option>
          </select>
          <button
            className="ml-2 rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold shadow hover:bg-blue-700 transition"
            onClick={() => setModalProject({})}
          >
            <FaPlus className="inline mr-2" /> Nuovo progetto
          </button>
        </div>
        <button
          className="rounded-xl bg-blue-100 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-200 transition flex items-center"
          onClick={() => window.location.reload()}
        >
          <FaSyncAlt className="mr-2" /> Aggiorna elenco
        </button>
      </div>

      {/* Lista progetti */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div
            key={project.id}
            className="rounded-2xl bg-white hover:shadow-2xl shadow-md p-5 flex flex-col gap-2 border border-blue-100 transition-all duration-200 relative"
            style={{ minHeight: 170 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <FaProjectDiagram className="text-blue-400 text-3xl" />
              </div>
              <div>
                <div className="font-bold text-lg text-blue-800">{project.name}</div>
                <div className="text-gray-500 text-sm">{project.client}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold shadow ${statusColors[project.status] || "bg-gray-200 text-gray-800"}`}
                  >
                    {project.status}
                  </span>
                  {project.team && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-purple-100 text-purple-700 font-semibold flex items-center gap-1">
                      <FaUsers className="inline" /> {project.team}
                    </span>
                  )}
                  {project.startDate && (
                    <span className="px-3 py-1 rounded-2xl text-xs bg-blue-100 text-blue-700 font-semibold">
                      Avvio: {project.startDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 font-semibold shadow hover:bg-blue-200 transition"
                onClick={() => setModalProject(project)}
              >
                Modifica
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-100 text-red-600 font-semibold shadow hover:bg-red-200 transition"
                // onClick={() => handleDeleteProject(project.id)}
              >
                Elimina
              </button>
            </div>
            {/* badge laterale */}
            <span className="absolute top-3 right-3 text-xs bg-blue-200 text-blue-700 rounded-full px-3 py-1 shadow">
              ID: {project.id}
            </span>
          </div>
        ))}
      </div>

      {/* Modal gestione progetto */}
      {modalProject && (
        <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
      )}
    </div>
  );
}
