// Percorso: /pages/components/UserModal.js
import { useState, useEffect, useRef } from "react";

export default function UserModal({ user = {}, onClose, roles = [], viewOnly = false, onTagSearch }) {
  const [name, setName] = useState(user.name || "");
  const [surname, setSurname] = useState(user.surname || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [note, setNote] = useState(user.note || "");
  const [role, setRole] = useState(user.role || "");
  const [status, setStatus] = useState(user.status || "attivo");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [tags, setTags] = useState(user.tags || "");
  const [availableTags, setAvailableTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    setName(user.name || "");
    setSurname(user.surname || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setNote(user.note || "");
    setRole(user.role || "");
    setStatus(user.status || "attivo");
    setAvatar(user.avatar || "");
    setTags(user.tags || "");
    setError("");
  }, [user]);

  useEffect(() => {
    fetch("/api/tags")
      .then(res => res.json())
      .then(list => setAvailableTags(list || []));
  }, []);

  function checkRequired() {
    if (!name.trim() || !surname.trim() || !email.trim() || !role.trim() || !status.trim()) {
      setError("Compilare tutti i campi obbligatori (*)");
      return false;
    }
    setError("");
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkRequired()) return;
    setSaving(true);
    const userData = {
      ...user,
      name,
      surname,
      email,
      phone,
      address,
      note,
      role,
      status,
      avatar,
      tags
    };
    try {
      const res = await fetch(`/api/users${user.id ? `/${user.id}` : ""}`, {
        method: user.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        onClose(true);
      } else {
        setError("Errore durante il salvataggio");
      }
    } catch {
      setError("Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    if (!viewOnly && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Tag attivi dell'utente
  const tagArray = (tags || "")
    .split(",")
    .map(t => t.trim())
    .filter(t => t.length);

  // Aggiungi/rimuovi tag
  const toggleTag = (tagName) => {
    if (viewOnly) return;
    let arr = [...tagArray];
    if (arr.includes(tagName)) {
      arr = arr.filter(t => t !== tagName);
    } else {
      arr.push(tagName);
    }
    setTags(arr.join(", "));
  };

  const handleTagClick = (tag) => {
    if (onTagSearch) onTagSearch(tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadein">
      <form
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 mx-2 relative flex flex-col gap-5"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-2 text-blue-900">
          {viewOnly
            ? "Dettaglio utente"
            : (user.id ? "Modifica utente" : "Nuovo utente")
          }
        </h2>
        <div className="mb-2 text-sm text-gray-600">
          I campi contrassegnati da <span className="text-red-500">*</span> sono obbligatori
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2">{error}</div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-100 bg-blue-50 flex items-center justify-center">
            {avatar
              ? <img src={avatar} alt="avatar" className="object-cover w-full h-full" />
              : <span className="text-2xl font-bold text-gray-400">{name ? name[0] : "?"}</span>
            }
          </div>
          {!viewOnly && (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatar}
                ref={fileInputRef}
              />
              <button
                type="button"
                className="ml-2 px-4 py-2 bg-blue-100 text-blue-700 rounded font-semibold hover:bg-blue-200 transition"
                onClick={openFileDialog}
              >
                Cambia immagine
              </button>
            </label>
          )}
        </div>

        {/* Campi principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nome <span className="text-red-500">*</span></label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{name}</div>
            ) : (
              <input required type="text" className="w-full rounded-xl px-3 py-2 border border-blue-200" value={name} onChange={e => setName(e.target.value)} />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Cognome <span className="text-red-500">*</span></label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{surname}</div>
            ) : (
              <input required type="text" className="w-full rounded-xl px-3 py-2 border border-blue-200" value={surname} onChange={e => setSurname(e.target.value)} />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email <span className="text-red-500">*</span></label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{email}</div>
            ) : (
              <input required type="email" className="w-full rounded-xl px-3 py-2 border border-blue-200" value={email} onChange={e => setEmail(e.target.value)} />
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Telefono</label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{phone}</div>
            ) : (
              <input type="text" className="w-full rounded-xl px-3 py-2 border border-blue-200" value={phone} onChange={e => setPhone(e.target.value)} />
            )}
          </div>
        </div>

        {/* Row: Ruolo e Stato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Ruolo <span className="text-red-500">*</span></label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{role}</div>
            ) : (
              <select
                required
                value={role || ""}
                onChange={e => setRole(e.target.value)}
                className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-white text-gray-900"
              >
                <option value="">Seleziona ruolo</option>
                {roles && Array.isArray(roles) && roles.map(roleOpt =>
                  <option key={roleOpt} value={roleOpt}>{roleOpt}</option>
                )}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Stato <span className="text-red-500">*</span></label>
            {viewOnly ? (
              <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{status}</div>
            ) : (
              <select
                required
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-white text-gray-900"
              >
                <option value="attivo">attivo</option>
                <option value="inactive">non attivo</option>
              </select>
            )}
          </div>
        </div>

        {/* Tag disponibili */}
        <div>
          <label className="block text-sm font-semibold mb-1">Tag disponibili</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {availableTags.length === 0 && (
              <span className="text-xs text-gray-400">Nessun tag disponibile</span>
            )}
            {availableTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                className={`px-2 py-0.5 rounded-full text-xs font-semibold border 
                  ${tagArray.includes(tag.name)
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-green-100 text-green-700 border-green-200"}
                  cursor-pointer hover:bg-green-200 transition`}
                style={{ pointerEvents: viewOnly ? "none" : "auto" }}
                onClick={() => toggleTag(tag.name)}
              >
                #{tag.name}
              </button>
            ))}
          </div>
          {/* Mostra tag attivi come badge cliccabili per ricerca */}
          <div className="flex flex-wrap gap-2 mb-2">
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
              className="w-full rounded-xl px-3 py-2 border border-blue-200"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Aggiungi nuovi tag separati da virgola"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Note</label>
          {viewOnly ? (
            <div className="w-full rounded-xl px-3 py-2 border border-blue-200 bg-gray-100">{note}</div>
          ) : (
            <textarea className="w-full rounded-xl px-3 py-2 border border-blue-200" value={note} onChange={e => setNote(e.target.value)} rows={2} />
          )}
        </div>

        {/* Bottoni */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            onClick={() => onClose()}
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
