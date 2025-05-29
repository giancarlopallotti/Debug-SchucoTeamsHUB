import { useState, useEffect } from "react";

// Selettore destinatari (riusato da entrambi)
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

export default function MessageComposerModal({
  open,
  onClose,
  onSent,
  threadId = null,
  parentId = null,
  currentUser,
  defaultRecipients = [],
  defaultSubject = "",
  linkEntities = []
}) {
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [recipients, setRecipients] = useState(defaultRecipients); // [{id, type}]
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [entityLinks, setEntityLinks] = useState(linkEntities); // [{type, id}]
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  }

  async function handleSend() {
    if (!body.trim()) return;
    setLoading(true);

    const userRecipients = recipients.filter(r => r.type === "user").map(r => r.id);
    const teamRecipients = recipients.filter(r => r.type === "team").map(r => r.id);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          parent_id: parentId,
          sender_id: currentUser.id,
          body,
          subject,
          recipients: userRecipients,
          teams: teamRecipients,
          tags,
          entity_links: entityLinks
        })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Risposta NON JSON dal backend:", text);
        alert("Errore server: " + text);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        alert(data.error || "Errore invio");
        setLoading(false);
        return;
      }
      if (attachments.length) {
        const form = new FormData();
        attachments.forEach(f => form.append("file", f));
        form.append("message_id", data.id);
        form.append("user_id", currentUser.id);
        await fetch("/api/messages/attachments", { method: "POST", body: form });
      }
      setBody(""); setSubject(""); setAttachments([]); setTags([]);
      setRecipients([]);
      onSent && onSent(data);
      onClose();
    } catch (err) {
      alert("Errore di rete: " + err.message);
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full bg-neutral-100 hover:bg-neutral-200"
          aria-label="Chiudi"
        >✕</button>
        <h2 className="text-xl font-bold mb-2">
          {threadId ? "Rispondi al thread" : "Nuovo Messaggio"}
        </h2>
        {/* Selettore destinatari */}
        <SelectRecipient recipients={recipients} setRecipients={setRecipients} />
        {/* Oggetto */}
        <input
          type="text"
          className="w-full mb-2 px-2 py-1 rounded border"
          placeholder="Oggetto (opzionale)"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        {/* Corpo testo */}
        <textarea
          className="w-full min-h-[80px] mb-2 px-2 py-1 rounded border"
          placeholder="Scrivi il messaggio…"
          value={body}
          onChange={e => setBody(e.target.value)}
          autoFocus
        />
        {/* Allegati */}
        <div className="mb-2">
          <label className="block font-semibold mb-1">Allega file</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full"
          />
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {attachments.map((file, idx) => (
                <div key={idx} className="bg-neutral-200 px-2 py-1 rounded text-xs">
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Tag */}
        <div className="mb-2">
          <label className="block font-semibold mb-1">Tag</label>
          <input
            type="text"
            className="w-full px-2 py-1 rounded border"
            placeholder="Aggiungi tag separati da virgola"
            value={tags.join(",")}
            onChange={e => setTags(e.target.value.split(",").map(t => t.trim().toUpperCase()).filter(Boolean))}
          />
        </div>
        {/* Entità collegate (progetto, cliente, ecc) */}
        <div className="mb-3 text-xs text-gray-500">
          {entityLinks.length > 0 && (
            <span>
              Collegato a: {entityLinks.map(el => `${el.type} #${el.id}`).join(", ")}
            </span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 font-bold transition disabled:opacity-60"
        >
          {loading ? "Invio..." : threadId ? "Rispondi" : "Invia messaggio"}
        </button>
      </div>
    </div>
  );
}
