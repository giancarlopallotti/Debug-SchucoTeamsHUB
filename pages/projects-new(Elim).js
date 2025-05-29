// /pages/projects-new.js
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

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function NewProject() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "da iniziare",
    priority: "normale",
    deadline: "",
    note: "",
    userIds: [],
    clientIds: [],
  });
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Carica utenti e clienti
  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(setUsers);
    fetch("/api/clients")
      .then(r => r.json())
      .then(setClients);
  }, []);

  const handleChange = e => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      setForm({
        ...form,
        [name]: Array.from(selectedOptions).map(opt => Number(opt.value))
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    if (!form.title) {
      setMsg("Titolo obbligatorio!");
      setLoading(false);
      return;
    }
    // Prepara payload, solo valori usati dalla API
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      deadline: form.deadline,
      note: form.note,
      userIds: form.userIds,
      clientIds: form.clientIds,
    };
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setMsg("Progetto creato!");
      setLoading(false);
      setTimeout(() => {
        router.push("/projects");
      }, 1200);
    } else {
      const err = await res.json();
      setMsg("Errore: " + (err.message || "Impossibile creare progetto"));
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ color: "#2843A1", marginBottom: 24 }}>Nuovo Progetto</h1>
      <form onSubmit={handleSubmit} style={{
        background: "#f5faff", padding: 24, borderRadius: 14, boxShadow: "0 2px 12px #bde2ee44"
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label>Titolo*<br />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label>Stato<br />
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                <option value="da iniziare">Da Iniziare</option>
                <option value="in corso">In Corso</option>
                <option value="terminato">Terminato</option>
              </select>
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label>Priorità<br />
              <select name="priority" value={form.priority} onChange={handleChange} style={inputStyle}>
                <option value="bassa">Bassa</option>
                <option value="normale">Normale</option>
                <option value="alta">Alta</option>
              </select>
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label>Scadenza<br />
              <input
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                style={inputStyle}
              />
            </label>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>Descrizione<br />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: 48, width: "100%", resize: "vertical" }}
            />
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <label>Note<br />
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>
        </div>
        <div style={{ marginTop: 22, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220, flex: 1 }}>
            <label>Utenti assegnati<br />
              <select
                name="userIds"
                multiple
                value={form.userIds}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: 70 }}
              >
                {users.map(u =>
                  <option key={u.id} value={u.id}>
                    {u.name} {u.surname}
                  </option>
                )}
              </select>
            </label>
          </div>
          <div style={{ minWidth: 220, flex: 1 }}>
            <label>Clienti associati<br />
              <select
                name="clientIds"
                multiple
                value={form.clientIds}
                onChange={handleChange}
                style={{ ...inputStyle, minHeight: 70 }}
              >
                {clients.map(c =>
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.surname} ${c.name} (${c.company})` : `${c.surname} ${c.name}`}
                  </option>
                )}
              </select>
            </label>
          </div>
        </div>
        <div style={{ marginTop: 30, display: "flex", gap: 14 }}>
          <button type="submit" disabled={loading} style={buttonStyle}>Crea progetto</button>
          <button type="button" onClick={() => router.push("/projects")}
            style={{ ...buttonStyle, background: "#ddd", color: "#222" }}>
            Annulla
          </button>
        </div>
        {msg && <div style={{ color: msg.startsWith("Errore") ? "#b70d0d" : "#267800", marginTop: 18 }}>{msg}</div>}
      </form>
    </div>
  );
}

const inputStyle = {
  padding: "7px 10px",
  borderRadius: 6,
  border: "1px solid #b2c8e6",
  fontSize: 16,
  width: "100%",
  marginTop: 2,
};
const buttonStyle = {
  background: "#2843A1",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 30px",
  fontWeight: 600,
  fontSize: 16,
  boxShadow: "0 2px 8px #bde2ee55",
  cursor: "pointer"
};
