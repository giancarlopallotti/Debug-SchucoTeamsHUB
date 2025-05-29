// ==================================================================
// Percorso: /pages/components/NewMessageModal.js
// Scopo: Modale nuovo messaggio con selettore destinatari e invio autenticato
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Aggiunto credentials: "include" alla fetch per supporto JWT cookie
// ==================================================================

import { useState, useEffect } from "react";

// Selettore destinatari (stesso del composer)
function SelectRecipient({ recipients, setRecipients }) {
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

export default function NewMessageModal({ onSend, onClose }) {
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const userRecipients = recipients.filter(r => r.type === "user").map(r => r.id);
    const teamRecipients = recipients.filter(r => r.type === "team").map(r => r.id);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          recipients: userRecipients,
          teams: teamRecipients,
        }),
        credentials: "include"    // <-- Questa linea è ESSENZIALE per invio cookie JWT!
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Risposta NON JSON dal backend:", text);
        alert("Errore server: " + text);
        return;
      }
      if (!res.ok) {
        alert(data.error || "Errore invio");
        return;
      }
      if (data.id && onSend) onSend(data);
      setRecipients([]); setSubject(""); setBody("");
      onClose && onClose();
    } catch (err) {
      alert("Errore di rete: " + err.message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 min-w-[330px] max-w-full"
        style={{ minWidth: 330, maxWidth: 420 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Nuovo Messaggio</h2>
          <button type="button" className="text-xl text-gray-400 hover:text-gray-800" onClick={onClose}>×</button>
        </div>
        {/* Destinatari */}
        <SelectRecipient recipients={recipients} setRecipients={setRecipients} />
        {/* Oggetto */}
        <input
          className="mb-2 w-full border px-2 py-1 rounded"
          placeholder="Oggetto (opzionale)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        {/* Messaggio */}
        <textarea
          className="mb-2 w-full border px-2 py-1 rounded"
          placeholder="Scrivi il messaggio…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
        />
        <button type="submit" className="w-full bg-blue-600 text-white font-bold rounded py-2 hover:bg-blue-700 transition">
          Invia messaggio
        </button>
      </form>
    </div>
  );
}
