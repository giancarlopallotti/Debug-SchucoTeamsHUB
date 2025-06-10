// 📁 File: /pages/components/EventModal.js
// Modale di creazione/modifica evento con gestione relazioni

import { useState, useEffect } from "react";

export default function EventModal({
  eventData = {},
  onClose,
  onSave,
  allUsers = [],
  allTeams = [],
  allFiles = [],
  allProjects = [],
  allClients = [],
  allTags = []
}) {
  // Campi base evento
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("confermato");

  // Relazioni
  const [participants, setParticipants] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [projectIds, setProjectIds] = useState([]);
  const [clientIds, setClientIds] = useState([]);
  const [tags, setTags] = useState([]);
  const [showTagSelect, setShowTagSelect] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Popola stato su apertura
  useEffect(() => {
    if (!eventData) return;
    setTitle(eventData.title || "");
    setDescription(eventData.description || "");
    setStart(eventData.start ? eventData.start.slice(0, 16) : "");
    setEnd(eventData.end ? eventData.end.slice(0, 16) : "");
    setStatus(eventData.status || "confermato");
    setParticipants(eventData.userIds?.map(String) || []);
    setFileIds(eventData.fileIds?.map(String) || []);
    setTeamIds(eventData.teamIds?.map(String) || []);
    setProjectIds(eventData.projectIds?.map(String) || []);
    setClientIds(eventData.clientIds?.map(String) || []);
    setTags(eventData.tagIds?.map(String) || []);
  }, [eventData]);

  // Se selezioni una data di inizio, imposta quella anche come fine se è vuota o precedente
  useEffect(() => {
    if (start && (!end || end < start)) setEnd(start);
  }, [start]);

  // --- Validazione data ---
  const nowISO = new Date().toISOString().slice(0, 16);
  function isPastDate(d) {
    return d && d < nowISO;
  }

  // --- Gestori input ---
  const toggleCheckbox = (val, arr, setArr) => {
    setArr(arr.includes(val) ? arr.filter(i => i !== val) : [...arr, val]);
  };
  const toggleTag = (id) => {
    setTags(tags.includes(id) ? tags.filter(t => t !== id) : [...tags, id]);
  };

  // --- Salvataggio ---
  async function handleSave() {
    setError("");
    if (!title.trim() || !start || !end) return setError("Compilare tutti i campi obbligatori.");
    if (isPastDate(start)) return setError("La data di inizio non può essere nel passato.");
    setSaving(true);
    const payload = {
      id: eventData.id,
      title, description, start, end, status,
      userIds: participants.map(Number),
      fileIds: fileIds.map(Number),
      teamIds: teamIds.map(Number),
      projectIds: projectIds.map(Number),
      clientIds: clientIds.map(Number),
      tagIds: tags.map(Number)
    };
    const res = await fetch("/api/events", {
      method: eventData.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      onSave && onSave();
      onClose && onClose();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err?.error || "Errore durante il salvataggio");
    }
    setSaving(false);
  }

  // --- Eliminazione evento ---
  async function handleDelete() {
    if (!eventData.id) return;
    if (!window.confirm("Sei sicuro di voler eliminare questo evento?")) return;
    setSaving(true);
    await fetch(`/api/events/${eventData.id}`, { method: "DELETE" });
    onSave && onSave();
    onClose && onClose();
    setSaving(false);
  }

  // --- Render ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 md:p-8 mx-2 flex flex-col gap-5"
        onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <h2 className="text-2xl font-bold mb-2 text-blue-900">
          {eventData.id ? <>Modifica Evento <span className="text-base text-gray-400 font-mono">ID {eventData.id}</span></> : "Nuovo Evento"}
        </h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 whitespace-pre-line">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- COLONNA SX --- */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Titolo <span className="text-red-500">*</span></label>
              <input type="text" className="w-full rounded-xl px-3 py-2 border border-blue-200" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Descrizione</label>
              <textarea className="w-full rounded-xl px-3 py-2 border border-blue-200" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Inizio <span className="text-red-500">*</span></label>
                <input type="datetime-local" className="w-full rounded-xl px-3 py-2 border border-blue-200"
                  value={start} onChange={e => setStart(e.target.value)}
                  min={nowISO}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-1">Fine <span className="text-red-500">*</span></label>
                <input type="datetime-local" className="w-full rounded-xl px-3 py-2 border border-blue-200"
                  value={end} onChange={e => setEnd(e.target.value)}
                  min={start || nowISO}
                />
              </div>
            </div>
            {/* ALLEGATI */}
            <div>
              <label className="block text-sm font-semibold mb-1">Allegati</label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-gray-300 bg-gray-50 max-h-40 overflow-y-auto">
                {allFiles.map(file => (
                  <label key={file.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded border border-gray-200 hover:bg-gray-100 mb-1">
                    <input
                      type="checkbox"
                      checked={fileIds.includes(String(file.id))}
                      onChange={() => toggleCheckbox(String(file.id), fileIds, setFileIds)}
                    />
                    <span className="truncate max-w-[120px]">{file.name || file.filename}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* --- COLONNA DX --- */}
          <div className="flex flex-col gap-4">
            {/* PARTECIPANTI */}
            <div>
              <label className="block text-sm font-semibold mb-1">Partecipanti</label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-blue-100 bg-blue-50 max-h-40 overflow-y-auto">
                {allUsers.map(u => (
                  <label key={u.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border border-blue-100 shadow hover:bg-blue-100 mb-1">
                    <input
                      type="checkbox"
                      checked={participants.includes(String(u.id))}
                      onChange={() => toggleCheckbox(String(u.id), participants, setParticipants)}
                    />
                    <img src={u.avatar || "/default-avatar.png"} alt="" className="w-7 h-7 rounded-full border" />
                    <span>{u.surname} {u.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* TEAM */}
            <div>
              <label className="block text-sm font-semibold mb-1">Team</label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-blue-100 bg-blue-50 max-h-40 overflow-y-auto">
                {allTeams.map(team => (
                  <label key={team.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border border-blue-100 shadow hover:bg-blue-100 mb-1">
                    <input
                      type="checkbox"
                      checked={teamIds.includes(String(team.id))}
                      onChange={() => toggleCheckbox(String(team.id), teamIds, setTeamIds)}
                    />
                    <span>{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* PROGETTI */}
            <div>
              <label className="block text-sm font-semibold mb-1">Progetti</label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-purple-100 bg-purple-50 max-h-28 overflow-y-auto">
                {allProjects.map(project => (
                  <label key={project.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border border-purple-100 hover:bg-purple-100 mb-1">
                    <input
                      type="checkbox"
                      checked={projectIds.includes(String(project.id))}
                      onChange={() => toggleCheckbox(String(project.id), projectIds, setProjectIds)}
                    />
                    <span>{project.title}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* CLIENTI */}
            <div>
              <label className="block text-sm font-semibold mb-1">Clienti</label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-green-100 bg-green-50 max-h-28 overflow-y-auto">
                {allClients.map(client => (
                  <label key={client.id} className="flex items-center gap-2 px-2 py-1 bg-white rounded-full border border-green-100 hover:bg-green-100 mb-1">
                    <input
                      type="checkbox"
                      checked={clientIds.includes(String(client.id))}
                      onChange={() => toggleCheckbox(String(client.id), clientIds, setClientIds)}
                    />
                    <span>{client.surname} {client.name} {client.company && `(${client.company})`}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* TAG */}
            <div>
              <label className="block text-sm font-semibold mb-1">Tag</label>
              <div className="relative w-full">
                <div
                  className="flex flex-wrap gap-1 min-h-[38px] border border-green-200 rounded-xl px-2 py-1 bg-green-50 cursor-pointer"
                  onClick={() => setShowTagSelect(s => !s)}
                  tabIndex={0}
                >
                  {(!tags || tags.length === 0) && (
                    <span className="text-green-600 text-xs opacity-60">Seleziona tag...</span>
                  )}
                  {allTags
                    .filter(tag => tags.includes(String(tag.id)))
                    .map(tag => (
                      <span key={tag.id} className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">{tag.name}</span>
                    ))}
                  <span className="text-green-600 text-xs ml-2">{showTagSelect ? "▲" : "▼"}</span>
                </div>
                {showTagSelect && (
                  <div className="absolute left-0 top-full bg-white border border-green-200 rounded-xl shadow max-h-36 overflow-y-auto z-10 w-full mt-1 p-2">
                    {allTags.map(tag => (
                      <div
                        key={tag.id}
                        className={`px-2 py-1 rounded cursor-pointer hover:bg-green-50 text-sm flex items-center gap-2 ${tags.includes(String(tag.id)) ? "bg-green-100 font-bold" : ""}`}
                        onClick={() => toggleTag(String(tag.id))}
                      >
                        <input
                          type="checkbox"
                          checked={tags.includes(String(tag.id))}
                          readOnly
                          className="accent-green-600"
                        />
                        <span>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Nuovi tag: campo libero (opzionale) */}
              <input
                type="text"
                className="w-full rounded-xl px-3 py-2 border border-blue-200 mt-2"
                value={tags.filter(t => isNaN(t)).join(", ")}
                onChange={e => setTags([...tags.filter(t => !isNaN(t)), ...e.target.value.split(",").map(v => v.trim()).filter(Boolean)])}
                placeholder="Aggiungi nuovi tag separati da virgola"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-6">
          {eventData.id && (
            <button
              type="button"
              className="px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              onClick={handleDelete}
              disabled={saving}
            >
              Elimina
            </button>
          )}
          <div className="flex gap-2 justify-end flex-1">
            <button type="button" className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300" onClick={() => onClose && onClose()} disabled={saving}>
              Chiudi
            </button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition" disabled={saving}>
              Salva
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
