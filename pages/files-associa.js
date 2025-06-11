// pages/files-associa.js (aggiunta gestione tag)
import { parse } from "cookie";

export async function getServerSideProps(context) {
  const { req } = context;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return { props: {} };
}

import { useEffect, useState } from "react";

export default function FilesAssocia() {
  const [files, setFiles] = useState([]);
  const [progetti, setProgetti] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fileId, setFileId] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/files/list-all")
      .then(res => res.json())
      .then(data => setFiles(data.files || []));

    fetch("/api/my-project")
      .then(res => res.json())
      .then(data => setProgetti(data || []));

    fetch("/api/my-clients")
      .then(res => res.json())
      .then(data => setClienti(data || []));

    fetch("/api/my-teams")
      .then(res => res.json())
      .then(data => setTeams(data || []));
  }, []);

  useEffect(() => {
    if (!fileId) return;
    fetch(`/api/files/get-associations?file_id=${fileId}`)
      .then(res => res.json())
      .then(data => {
        setProjectIds(data.projects || []);
        setClientIds(data.clients || []);
        setTeamIds(data.teams || []);
        setTags(data.tags || []);
      });
  }, [fileId]);

  const associa = async () => {
    const promises = [];
    if (projectIds.length)
      promises.push(fetch("/api/files/associate-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: [fileId], target_type: "project", target_ids: projectIds, action: "assign" })
      }));
    if (clientIds.length)
      promises.push(fetch("/api/files/associate-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: [fileId], target_type: "client", target_ids: clientIds, action: "assign" })
      }));
    if (teamIds.length)
      promises.push(fetch("/api/files/associate-unified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_ids: [fileId], target_type: "team", target_ids: teamIds, action: "assign" })
      }));

    await Promise.all(promises);
    setMsg("Associazioni salvate correttamente");
  };

  const removeAssociation = async (type, id) => {
    await fetch("/api/files/associate-unified", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: [fileId], target_type: type, target_ids: [id], action: "remove" })
    });
    if (type === "project") setProjectIds(ids => ids.filter(i => i !== id));
    if (type === "client") setClientIds(ids => ids.filter(i => i !== id));
    if (type === "team") setTeamIds(ids => ids.filter(i => i !== id));
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    await fetch("/api/files/associate-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId, tag: newTag.trim(), action: "add" })
    });
    setTags(prev => [...prev, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = async (tag) => {
    await fetch("/api/files/associate-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId, tag, action: "remove" })
    });
    setTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div>
      <h1>Associa file</h1>

      <h3>Tag</h3>
      <div>
        {tags.map(tag => (
          <span key={tag} style={{ marginRight: 10 }}>{tag} <button onClick={() => removeTag(tag)}>❌</button></span>
        ))}
      </div>
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        placeholder="Nuovo tag"
      />
      <button onClick={addTag}>Aggiungi Tag</button>

      <h3>Progetti associati</h3>
      <ul>
        {projectIds.map(id => {
          const progetto = progetti.find(p => p.id === id);
          return progetto ? (
            <li key={id}>{progetto.title} <button onClick={() => removeAssociation("project", id)}>❌</button></li>
          ) : null;
        })}
      </ul>

      <h3>Clienti associati</h3>
      <ul>
        {clientIds.map(id => {
          const cliente = clienti.find(c => c.id === id);
          return cliente ? (
            <li key={id}>{cliente.company} <button onClick={() => removeAssociation("client", id)}>❌</button></li>
          ) : null;
        })}
      </ul>

      <h3>Team associati</h3>
      <ul>
        {teamIds.map(id => {
          const team = teams.find(t => t.id === id);
          return team ? (
            <li key={id}>{team.name} <button onClick={() => removeAssociation("team", id)}>❌</button></li>
          ) : null;
        })}
      </ul>

      <button onClick={associa}>Associa</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}