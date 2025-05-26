// Percorso: /pages/components/TeamModal.js
import { useEffect, useState } from "react";

export default function TeamModal({ team = {}, onClose, users = [], viewOnly = false, onTagSearch }) {
  const [name, setName] = useState(team.name || "");
  const [manager, setManager] = useState(team.manager || "");
  const [description, setDescription] = useState(team.description || "");
  const [members, setMembers] = useState(
    Array.isArray(team.members)
      ? team.members
      : typeof team.members === "string"
        ? team.members.split(",").map(m => m.trim()).filter(Boolean)
        : []
  );
  const [tags, setTags] = useState(team.tags || "");
  const [availableTags, setAvailableTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showTagSelect, setShowTagSelect] = useState(false);

  // Filtra admin
  const isAdmin = u =>
    (typeof u.role === "string" && u.role.toLowerCase() === "admin") ||
    (Array.isArray(u.roles) && u.roles.map(r => r.toLowerCase()).includes("admin"));

  const adminUsers = users.filter(isAdmin);

  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(list => setAvailableTags(list || []));
  }, []);

  useEffect(() => {
    setName(team.name || "");
    setManager(team.manager || "");
    setDescription(team.description || "");
    setMembers(
      Array.isArray(team.members)
        ? team.members
        : typeof team.members === "string"
          ? team.members.split(",").map(m => m.trim()).filter(Boolean)
          : []
    );
    setTags(team.tags || "");
    setError("");
  }, [team]);

  function checkRequired() {
    if (!name.trim() || !manager || members.length === 0) {
      setError("Compilare tutti i campi obbligatori (*) e selezionare almeno un admin e un membro");
      return false;
    }
    setError("");
    return true;
  }

  const tagArray = (tags || "")
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length);

  const toggleTag = (tagName) => {
    if (viewOnly) return;
    let arr = [...tagArray];
    if (arr.includes(tagName)) arr = arr.filter(t => t !== tagName);
    else arr.push(tagName);
    setTags(arr.join(", "));
  };

  const handleTagClick = (tag) => {
    if (onTagSearch) onTagSearch(tag);
  };

  const handleMemberCheckbox = (id) => {
    if (viewOnly) return;
    let arr = [...members];
    if (arr.includes(String(id))) arr = arr.filter(m => m !== String(id));
    else arr.push(String(id));
    setMembers(arr);
  };

  // Salvataggio con DEBUG
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkRequired()) return;
    setSaving(true);

    // Serializza membri come stringa
    const membersStr = Array.isArray(members) ? members.map(String).join(",") : (members || "");
    const teamData = {
      ...team,
      name,
      manager,
      description,
      members: membersStr,
      tags
    };

    console.log("[TeamModal] Invio payload teamData:", teamData);

    try {
      const res = await fetch(`/api/teams${team.id ? `/${team.id}` : ""}`, {
        method: team.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData)
      });

      let responseData = {};
      try {
        responseData = await res.json();
      } catch {}

      console.log("[TeamModal] Risposta API:", res.status, responseData);

      if (res.ok) {
        onClose(true);
      } else {
        setError(
          responseData?.error ||
          "Errore durante il salvataggio. " +
          (responseData?.details ? `Dettagli: ${responseData.details}` : "")
        );
      }
    } catch (e) {
      setError("Errore durante il salvataggio (connessione o JS).");
      console.error("[TeamModal] Errore JS/fetch:", e);
    } finally {
      setSaving(false);
    }
  };

  const teamTitle = name || team.name || (team.id ? `ID ${team.id}` : "Nuovo Team");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 mx-2 relative flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-2 text-blue-900">
          {viewOnly
            ? `Dettaglio Team: ${teamTitle}`
            : (team.id ? `Modifica Team: ${teamTitle}` : "Nuovo Team")
          }
        </h2>
        <div className="mb-2 text-sm text-gray-600">
          I campi contrassegnati da <span className="text-red-500">*</span> sono obbligatori
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 whitespace-pre-line">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Colonna 1: Nome, Descrizione */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Nome Team <span className="text-red-500">*</span></label>
              {viewOnly ? (
                <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{name}</div>
              ) : (
                <input type="text" required className="w-full rounded-xl px-3 py-2 border border-blue-200" value={name} onChange={e => setName(e.target.value)} />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Descrizione</label>
              {viewOnly ? (
                <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{description}</div>
              ) : (
                <textarea className="w-full rounded-xl px-3 py-2 border border-blue-200" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
              )}
            </div>
          </div>

          {/* Colonna 2: Manager (admin) */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Admin Team <span className="text-red-500">*</span></label>
              {viewOnly ? (
                <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">
                  {adminUsers.find(u => String(u.id) === String(manager))
                    ? `${adminUsers.find(u => String(u.id) === String(manager)).surname} ${adminUsers.find(u => String(u.id) === String(manager)).name}`
                    : "-"}
                </div>
              ) : (
                <select
                  required
                  value={manager}
                  onChange={e => setManager(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-white text-gray-900"
                >
                  <option value="">Scegli admin...</option>
                  {adminUsers.map(u =>
                    <option key={u.id} value={u.id}>
                      {u.surname} {u.name} ({u.email})
                    </option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Colonna 3: Membri + Tag */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Membri <span className="text-red-500">*</span></label>
              <div className="flex flex-col gap-1 p-2 rounded-xl border border-blue-100 bg-blue-50 max-h-64 overflow-y-auto">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer text-sm font-normal px-2 py-1 bg-white rounded-full border border-blue-100 shadow hover:bg-blue-100 mb-1">
                    <input
                      type="checkbox"
                      checked={members.includes(String(u.id))}
                      value={u.id}
                      onChange={() => handleMemberCheckbox(u.id)}
                      disabled={viewOnly}
                    />
                    <img src={u.avatar || "/default-avatar.png"} alt="" className="w-7 h-7 rounded-full border mr-1" />
                    {u.surname} {u.name}
                  </label>
                ))}
              </div>
            </div>
            {/* Tag: dropdown compatto */}
            <div>
              <label className="block text-sm font-semibold mb-1">Tag disponibili</label>
              <div className="relative w-full">
                {/* Mostra tag scelti come badge + icona dropdown */}
                <div
                  className="flex flex-wrap gap-1 min-h-[38px] border border-green-200 rounded-xl px-2 py-1 bg-green-50 cursor-pointer"
                  onClick={() => setShowTagSelect(s => !s)}
                  tabIndex={0}
                >
                  {tagArray.length === 0 && (
                    <span className="text-green-600 text-xs opacity-60">Seleziona tag...</span>
                  )}
                  {tagArray.map(tag => (
                    <span key={tag} className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">{tag}</span>
                  ))}
                  <span className="text-green-600 text-xs ml-2">{showTagSelect ? "▲" : "▼"}</span>
                </div>
                {showTagSelect && (
                  <div className="absolute left-0 top-full bg-white border border-green-200 rounded-xl shadow max-h-36 overflow-y-auto z-10 w-full mt-1 p-2">
                    {availableTags.map(tag => (
                      <div
                        key={tag.id}
                        className={`px-2 py-1 rounded cursor-pointer hover:bg-green-50 text-sm flex items-center gap-2 ${tagArray.includes(tag.name) ? "bg-green-100 font-bold" : ""}`}
                        onClick={() => toggleTag(tag.name)}
                      >
                        <input
                          type="checkbox"
                          checked={tagArray.includes(tag.name)}
                          readOnly
                          className="accent-green-600"
                        />
                        <span>{tag.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Tag attivi come badge cliccabili ricerca */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tagArray.map(tag =>
                  <button
                    key={tag}
                    type="button"
                    className="bg-green-200 text-green-900 border border-green-300 rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer hover:bg-green-300 transition"
                    onClick={() => handleTagClick(tag)}
                    title={`Cerca per tag: ${tag}`}
                  >
                    #{tag}
                  </button>
                )}
              </div>
              {!viewOnly && (
                <input
                  type="text"
                  className="w-full rounded-xl px-3 py-2 border border-blue-200 mt-2"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="Aggiungi nuovi tag separati da virgola"
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottoni */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            onClick={() => onClose(true)}
            disabled={saving}
          >
            Chiudi
          </button>
          {!viewOnly && (
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              disabled={saving}
            >
              Salva
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
