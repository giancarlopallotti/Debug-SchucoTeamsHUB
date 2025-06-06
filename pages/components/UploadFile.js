// Percorso: /pages/components/UploadFile.js v2 – 07/06/2025
// Scopo: Upload file avanzato con selezione tags, team, progetti da elenco e inserimento note
// Autore: ChatGPT
// Ultima modifica: 07/06/2025
// Note: Utilizza solo API/DB esistenti per popolare i campi, non modifica nulla di teams/progetti/tags

import { useState, useEffect } from "react";
import axios from "axios";

export default function UploadFile({ folderId, onUpload }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [tagsList, setTagsList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carica i tags, teams, projects dai rispettivi endpoint già esistenti
    axios.get("/api/tags").then(res => setTagsList(res.data.tags || []));
    axios.get("/api/teams").then(res => setTeamsList(res.data.teams || []));
    axios.get("/api/projects").then(res => setProjectsList(res.data.projects || []));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_id", folderId);
    formData.append("note", note);
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append("teams", JSON.stringify(selectedTeams));
    formData.append("projects", JSON.stringify(selectedProjects));

    await axios.post("/api/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setFile(null);
    setNote("");
    setSelectedTags([]);
    setSelectedTeams([]);
    setSelectedProjects([]);
    setLoading(false);
    if (onUpload) onUpload();
  };

  return (
    <div style={{ margin: "12px 0", border: "1px solid #eee", padding: 12, borderRadius: 8, background: "#fcfcfd" }}>
      <div>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
      </div>
      <div style={{ marginTop: 6 }}>
        <label>Tags:</label>
        <select multiple value={selectedTags} onChange={e => setSelectedTags(Array.from(e.target.selectedOptions, o => o.value))}>
          {tagsList.map(tag => (
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 6 }}>
        <label>Team:</label>
        <select multiple value={selectedTeams} onChange={e => setSelectedTeams(Array.from(e.target.selectedOptions, o => o.value))}>
          {teamsList.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 6 }}>
        <label>Progetto:</label>
        <select multiple value={selectedProjects} onChange={e => setSelectedProjects(Array.from(e.target.selectedOptions, o => o.value))}>
          {projectsList.map(proj => (
            <option key={proj.id} value={proj.id}>{proj.name}</option>
          ))}
        </select>
      </div>
      <div style={{ marginTop: 6 }}>
        <label>Note:</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Descrizione o note aggiuntive"
          rows={2}
          style={{ width: "100%", resize: "vertical" }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleUpload} disabled={!file || loading}>
          {loading ? "Caricamento..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
