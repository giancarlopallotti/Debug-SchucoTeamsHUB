// pages/projects.js

/**
 * Scopo: gestione visualizzazione e lista progetti, incluso parsing clienti con UI migliorata e filtri
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 * Note: UI migliorata con filtri per titolo e cliente, stile coerente con sezione Team
 */

import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchClient, setSearchClient] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      });

    fetch("/api/clients")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
      });
  }, []);

  const getClientById = (id) => {
    return clients.find(c => String(c.id) === String(id));
  };

  const filteredProjects = projects.filter(p => {
    const titleMatch = p.title.toLowerCase().includes(searchTitle.toLowerCase());
    const clientNames = (Array.isArray(p.clients) ? p.clients : (p.clients || "").split(","))
      .map(cid => {
        const client = getClientById(cid);
        return client ? client.name.toLowerCase() : "";
      });
    const clientMatch = clientNames.some(name => name.includes(searchClient.toLowerCase()));
    return titleMatch && clientMatch;
  });

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gestione Progetti</h1>

      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Filtra per titolo"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
        <input
          type="text"
          placeholder="Filtra per cliente"
          value={searchClient}
          onChange={(e) => setSearchClient(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Titolo</th>
              <th className="border px-4 py-2 text-left">Clienti</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{p.title}</td>
                <td className="border px-4 py-2">
                  {(Array.isArray(p.clients) ? p.clients : (p.clients || "").split(","))
                    .map(cid => {
                      const c = getClientById(cid);
                      return c ? <span key={cid} className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mr-1 mb-1">{c.name}</span> : null;
                    })}
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan="2" className="text-center py-4">Nessun progetto trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}