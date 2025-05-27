// Percorso: /pages/components/ClientModal.js
import React, { useState, useRef, useEffect } from "react";

export default function ClientModal({ client = {}, onClose, onSaved, viewOnly = false }) {
  const [surname, setSurname] = useState(client.surname || "");
  const [name, setName] = useState(client.name || "");
  const [company, setCompany] = useState(client.company || "");
  const [city, setCity] = useState(client.city || "");
  const [province, setProvince] = useState(client.province || "");
  const [address, setAddress] = useState(client.address || "");
  const [cap, setCap] = useState(client.cap || "");
  const [note, setNote] = useState(client.note || "");
  const [main_contact, setMainContact] = useState(client.main_contact || "");
  const [phone, setPhone] = useState(client.phone || "");
  const [mobile, setMobile] = useState(client.mobile || "");
  const [emails, setEmails] = useState(client.emails || "");
  const [documents, setDocuments] = useState(client.documents || "");
  const [avatar, setAvatar] = useState(client.avatar || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    setSurname(client.surname || "");
    setName(client.name || "");
    setCompany(client.company || "");
    setCity(client.city || "");
    setProvince(client.province || "");
    setAddress(client.address || "");
    setCap(client.cap || "");
    setNote(client.note || "");
    setMainContact(client.main_contact || "");
    setPhone(client.phone || "");
    setMobile(client.mobile || "");
    setEmails(client.emails || "");
    setDocuments(client.documents || "");
    setAvatar(client.avatar || "");
    setError("");
  }, [client, viewOnly]);

  // PATCH CRITICA: la scelta POST vs PUT e l'url
  async function handleSave(e) {
    e.preventDefault();
    if (viewOnly) return;
    setError("");
    if (!surname.trim() || !name.trim() || !company.trim()) {
      setError("Cognome, nome e azienda sono obbligatori");
      return;
    }
    setLoading(true);
    const body = { surname, name, company, city, province, address, cap, note, main_contact, phone, mobile, emails, documents, avatar };
    // PATCH: endpoint giusto a seconda della modalità
    const method = client && client.id ? "PUT" : "POST";
    const url = client && client.id ? `/api/clients/${client.id}` : "/api/clients";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setLoading(false);
      onSaved && onSaved(true);
      onClose && onClose(true);
    } catch (err) {
      setLoading(false);
      setError("Errore durante il salvataggio: " + (err.message || err));
    }
  }

  // Avatar upload
  const handleAvatar = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const openFileDialog = () => {
    if (!viewOnly && fileInputRef.current) fileInputRef.current.click();
  };

  // Render campo (input/disabilitato)
  const renderField = (label, value, setValue, required = false, full = false, type = "text") => (
    <div style={{ gridColumn: full ? "1 / span 2" : undefined }}>
      <label>{label}{required && <span style={{ color: "#e53935" }}> *</span>}</label>
      {viewOnly
        ? <div style={inputStyle}>{value}</div>
        : (type === "textarea"
            ? <textarea value={value} onChange={e => setValue(e.target.value)} style={{ ...inputStyle, minHeight: 50 }} />
            : <input type={type} value={value} required={required} onChange={e => setValue(e.target.value)} style={inputStyle} />)
      }
    </div>
  );

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1200,
      background: "rgba(0,0,0,0.20)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSave}
        style={{
          background: "#fff", borderRadius: 18, padding: 32, minWidth: 500, maxWidth: 660,
          boxShadow: "0 2px 18px #0002", margin: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
          position: "relative"
        }}>
        {/* Header con avatar */}
        <div style={{ gridColumn: "1 / span 2", display: "flex", alignItems: "center", gap: 18, marginBottom: 5 }}>
          <div
            style={{
              minWidth: 64, minHeight: 64, width: 64, height: 64, borderRadius: "50%",
              overflow: "hidden", border: "2px solid #d7e3f1", background: "#f5f8fd",
              cursor: viewOnly ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
            onClick={openFileDialog}
            title={viewOnly ? undefined : "Cambia avatar"}
          >
            <img src={avatar || "/default-avatar.png"} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {!viewOnly && (
              <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleAvatar} />
            )}
          </div>
          <h2 style={{ flex: 1, margin: 0 }}>
            {client?.id
              ? (viewOnly ? "Dettaglio Cliente" : "Modifica Cliente")
              : "Nuovo Cliente"}
          </h2>
          <button type="button" onClick={() => onClose(false)} style={{
            background: "none", border: "none", color: "#274B9F", fontSize: 26, fontWeight: 700, cursor: "pointer", marginLeft: 8, marginTop: -6
          }}>&times;</button>
        </div>

        {/* --- CAMPI CLIENTE --- */}
        {renderField("Cognome", surname, setSurname, true)}
        {renderField("Nome", name, setName, true)}
        {renderField("Azienda", company, setCompany, true)}
        {renderField("Città", city, setCity)}
        {renderField("Provincia", province, setProvince)}
        {renderField("CAP", cap, setCap)}
        {renderField("Indirizzo", address, setAddress, false, true)}
        {renderField("Telefono", phone, setPhone)}
        {renderField("Mobile", mobile, setMobile)}
        {renderField("Email", emails, setEmails)}
        {renderField("Contatto Principale", main_contact, setMainContact)}
        {renderField("Documenti", documents, setDocuments, false, true)}
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Note</label>
          {viewOnly
            ? <div style={inputStyle}>{note}</div>
            : <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, minHeight: 50 }} />}
        </div>
        <div style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={() => onClose(false)} style={btnStyle2}>Chiudi</button>
          {!viewOnly && (
            <button type="submit" disabled={loading} style={btnStyle1}>
              {loading ? "Salva..." : "Salva"}
            </button>
          )}
        </div>
        {error && <div style={{ color: "#d32f2f", gridColumn: "1 / span 2", marginBottom: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%", fontSize: 16, padding: "7px 10px",
  borderRadius: 8, border: "1px solid #d7e3f1", marginTop: 3, background: "#f8fafd"
};
const btnStyle1 = {
  background: "#0749a6", color: "#fff", padding: "10px 30px", border: "none",
  borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: "pointer"
};
const btnStyle2 = {
  background: "#f5f7fa", color: "#222", padding: "10px 28px", border: "none",
  borderRadius: 10, fontWeight: 500, fontSize: 16, cursor: "pointer"
};
