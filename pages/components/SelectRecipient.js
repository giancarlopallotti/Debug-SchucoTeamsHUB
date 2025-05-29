// Percorso: /pages/components/SelectRecipient.js
import { useEffect, useState } from "react";

export default function SelectRecipient({ recipients, setRecipients }) {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("/api/users").then(res => res.json()).then(setUsers);
    fetch("/api/teams").then(res => res.json()).then(setTeams);
  }, []);

  function toggleRecipient(id, type) {
    const exists = recipients.find(r => r.id === id && r.type === type);
    if (exists) {
      setRecipients(recipients.filter(r => !(r.id === id && r.type === type)));
    } else {
      setRecipients([...recipients, { id, type }]);
    }
  }

  return (
    <div className="mb-2">
      <label className="font-semibold mb-1 block">Destinatari</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {recipients.map(r => (
          <span key={r.type + r.id} className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs flex items-center">
            {r.type === "user"
              ? users.find(u => u.id === r.id)?.name
              : teams.find(t => t.id === r.id)?.name}
            <button type="button" className="ml-1 text-red-400 hover:text-red-600" onClick={() => toggleRecipient(r.id, r.type)}>×</button>
          </span>
        ))}
      </div>
      <select
        className="border px-2 py-1 rounded text-sm"
        onChange={e => {
          const [type, id] = e.target.value.split(":");
          if (id && type) toggleRecipient(Number(id), type);
          e.target.value = "";
        }}>
        <option value="">+ Aggiungi destinatario…</option>
        <optgroup label="Utenti">
          {users.map(u => (
            <option key={"u" + u.id} value={`user:${u.id}`}>{u.name}</option>
          ))}
        </optgroup>
        <optgroup label="Team">
          {teams.map(t => (
            <option key={"t" + t.id} value={`team:${t.id}`}>{t.name}</option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
