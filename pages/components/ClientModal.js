import React, { useState } from "react";

export default function ClientModal({ client, onClose, onSaved }) {
  const [surname, setSurname] = useState(client?.surname || "");
  const [name, setName] = useState(client?.name || "");
  const [company, setCompany] = useState(client?.company || "");
  const [city, setCity] = useState(client?.city || "");
  const [province, setProvince] = useState(client?.province || "");
  const [address, setAddress] = useState(client?.address || "");
  const [cap, setCap] = useState(client?.cap || "");
  const [note, setNote] = useState(client?.note || "");
  const [main_contact, setMainContact] = useState(client?.main_contact || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [mobile, setMobile] = useState(client?.mobile || "");
  const [emails, setEmails] = useState(client?.emails || "");
  const [documents, setDocuments] = useState(client?.documents || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!surname.trim() || !name.trim() || !company.trim()) {
      setError("Cognome, nome e azienda sono obbligatori");
      return;
    }
    setLoading(true);
    const body = { surname, name, company, city, province, address, cap, note, main_contact, phone, mobile, emails, documents };
    const method = client?.id ? "PUT" : "POST";
    const url = client?.id ? `/api/clients/${client.id}` : "/api/clients";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      setLoading(false);
      onSaved && onSaved();
    } catch (err) {
      setLoading(false);
      setError("Errore salvataggio: " + (err.message || err));
    }
  }

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 1200,
      background: "rgba(0,0,0,0.20)", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <form onSubmit={handleSave}
        style={{
          background: "#fff", borderRadius: 18, padding: 32, minWidth: 500, maxWidth: 660,
          boxShadow: "0 2px 18px #0002", margin: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16
        }}>
        <div style={{ gridColumn: "1 / span 2" }}>
          <h2 style={{ marginBottom: 18 }}>{client?.id ? "Modifica Cliente" : "Nuovo Cliente"}</h2>
        </div>
        <div>
          <label>Cognome *</label>
          <input type="text" value={surname} onChange={e => setSurname(e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label>Nome *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label>Azienda *</label>
          <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} required />
        </div>
        <div>
          <label>Città</label>
          <input type="text" value={city} onChange={e => setCity(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Provincia</label>
          <input type="text" value={province} onChange={e => setProvince(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>CAP</label>
          <input type="text" value={cap} onChange={e => setCap(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Indirizzo</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Telefono</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Mobile</label>
          <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Email</label>
          <input type="text" value={emails} onChange={e => setEmails(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label>Contatto Principale</label>
          <input type="text" value={main_contact} onChange={e => setMainContact(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Documenti</label>
          <input type="text" value={documents} onChange={e => setDocuments(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label>Note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, minHeight: 50 }} />
        </div>
        <div style={{ gridColumn: "1 / span 2", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={btnStyle2}>Annulla</button>
          <button type="submit" disabled={loading} style={btnStyle1}>
            {loading ? "Salva..." : "Salva"}
          </button>
        </div>
        {error && <div style={{ color: "#d32f2f", gridColumn: "1 / span 2", marginBottom: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
const inputStyle = {
  width: "100%", fontSize: 16, padding: "7px 10px",
  borderRadius: 8, border: "1px solid #d7e3f1", marginTop: 3
};
const btnStyle1 = {
  background: "#0749a6", color: "#fff", padding: "10px 30px", border: "none",
  borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: "pointer"
};
const btnStyle2 = {
  background: "#f5f7fa", color: "#222", padding: "10px 28px", border: "none",
  borderRadius: 10, fontWeight: 500, fontSize: 16, cursor: "pointer"
};
