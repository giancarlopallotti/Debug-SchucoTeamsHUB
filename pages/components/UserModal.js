// Percorso: /pages/components/UserModal.js
// Scopo: Gestione utenti con AVATAR (come originale) + PATCH gestione errori salvataggio/email duplicata
// Autore: ChatGPT
// Ultima modifica: 24/05/2025  -  Versione V3 (avatar mantenuto, patch errori visivi)
// Note: Mostra errore email duplicata (o altri errori) senza alterare il layout o blocchi originali

import { useState, useEffect, useRef } from "react";

export default function UserModal({ user = {}, onClose, onSave, currentUser, roles = [], tags = [] }) {
  const isNew = !user.id;
  const [form, setForm] = useState({
    ...user,
    tags: Array.isArray(user.tags) ? user.tags : (user.tags ? user.tags.split(",") : []),
    avatar: user.avatar || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef();

  useEffect(() => {
    setForm({
      ...user,
      tags: Array.isArray(user.tags) ? user.tags : (user.tags ? user.tags.split(",") : []),
      avatar: user.avatar || "",
    });
    setError("");
  }, [user]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleTags(tag) {
    setForm(f => {
      let newTags = Array.isArray(f.tags) ? [...f.tags] : [];
      if (newTags.includes(tag)) {
        newTags = newTags.filter(t => t !== tag);
      } else {
        newTags.push(tag);
      }
      return { ...f, tags: newTags };
    });
  }

  // PATCH avatar: caricamento file immagine o da url
  function handleAvatarFile(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = evt => {
        setForm(f => ({ ...f, avatar: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ ...form, tags: (form.tags || []).join(",") });
    } catch (err) {
      let msg = "Errore salvataggio utente. Riprova.";
      if (err.message && err.message.includes("UNIQUE constraint failed: users.email")) {
        msg = "L'email è già in uso. Inserisci un indirizzo email diverso.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    }
    setSaving(false);
  }

  return (
    <div className="modal-user" style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1200,
      background: "rgba(40,50,85,0.14)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff", borderRadius: 18, minWidth: 380, maxWidth: 580,
        boxShadow: "0 2px 24px #0014", padding: 36, margin: 8, width: "100%"
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 21, color: "#26316c", marginBottom: 22 }}>{isNew ? "Nuovo utente" : "Modifica utente"}</h2>
        {error && <div style={{
          background: "#ffe1e1", color: "#b11c1c", fontWeight: 600,
          padding: "10px 18px", borderRadius: 8, marginBottom: 12,
          fontSize: 15, border: "1px solid #ffaeae"
        }}>{error}</div>}
        {/* --- AVATAR --- */}
        <div style={{display:'flex', alignItems:'center', gap:20, marginBottom:22}}>
          <div style={{width:52, height:52, borderRadius:30, background:'#f3f3fa', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:22, color:'#5a638a', border:'2px solid #f0f0ff'}}>
            {form.avatar
              ? <img src={form.avatar} alt="avatar" style={{width:52, height:52, borderRadius:26, objectFit:'cover'}} />
              : `${(form.name?.[0]||'').toUpperCase()}${(form.surname?.[0]||'').toUpperCase()}`}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            <button
              type="button"
              style={{fontWeight:600, fontSize:13, borderRadius:7, background:'#c6d6f7', border:'none', color:'#29437a', padding:'7px 18px', cursor:'pointer', marginBottom:2, minWidth:90, minHeight:30}}
              onClick={() => fileInput.current.click()}
            >Sfoglia immagine</button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFile}
            />
            <input
              type="url"
              placeholder="URL immagine avatar (opzionale)"
              style={{marginTop:2, fontSize:12, borderRadius:7, border:'1px solid #eceffc', padding:'4px 7px', maxWidth:170}}
              value={form.avatar && form.avatar.startsWith('http') ? form.avatar : ''}
              onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
            />
          </div>
        </div>
        {/* --- FIELDS --- */}
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <label>Nome *</label>
            <input required name="name" value={form.name || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Cognome *</label>
            <input required name="surname" value={form.surname || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <label>Email *</label>
            <input required name="email" type="email" value={form.email || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Telefono</label>
            <input name="phone" value={form.phone || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <label>Ruolo *</label>
            <select required name="role" value={form.role || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }}>
              <option value="">Seleziona ruolo</option>
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Stato *</label>
            <select required name="status" value={form.status || ""} onChange={handleChange}
              style={{ width: "100%", marginBottom: 12, borderRadius: 8, border: "1px solid #eee", padding: 8 }}>
              <option value="attivo">attivo</option>
              <option value="bloccato">bloccato</option>
              <option value="archiviato">archiviato</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tag</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {tags.map(tag => (
              <button type="button" key={tag.id}
                style={{
                  background: form.tags.includes(tag.name) ? "#3350ff" : "#f4f5ff",
                  color: form.tags.includes(tag.name) ? "#fff" : "#2b3678",
                  border: "none", borderRadius: 14, padding: "3px 13px", fontSize: 13, margin: "2px 3px",
                  fontWeight: 500, letterSpacing: 0.3,
                  opacity: 0.93, cursor: "pointer"
                }}
                onClick={() => handleTags(tag.name)}
              >{tag.name}</button>
            ))}
          </div>
        </div>
        <div>
          <label>Note</label>
          <textarea name="note" value={form.note || ""} onChange={handleChange}
            style={{ width: "100%", minHeight: 56, resize: "vertical", borderRadius: 8, border: "1px solid #eee", padding: 8 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 26 }}>
          <button type="button" onClick={onClose}
            style={{ background: "#f3f3f6", color: "#2c2c34", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16, padding: "9px 28px", cursor: "pointer" }}>Annulla</button>
          <button type="submit" disabled={saving}
            style={{ background: "#0070f3", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16, padding: "9px 28px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>Salva</button>
        </div>
      </form>
    </div>
  );
}
