// Percorso: /pages/login.js
// Scopo: Pagina di login utente
// Autore: ChatGPT
// Ultima modifica: 25/05/2025

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Patch: permette il set-cookie
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/"; // O dove preferisci
    } else {
      let msg = "Login fallito";
      try {
        const data = await res.json();
        msg = data.error || msg;
      } catch {}
      setError(msg);
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 350, margin: "70px auto", background: "#fff", padding: 24, borderRadius: 12 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Login</h2>
      <input
        type="email"
        autoFocus
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 14, padding: 10, borderRadius: 8, border: "1px solid #e0e6f2" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: "100%", marginBottom: 18, padding: 10, borderRadius: 8, border: "1px solid #e0e6f2" }}
      />
      <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, background: "#23285A", color: "#fff", fontWeight: 700, fontSize: 17, border: "none" }}>
        Login
      </button>
      {error && <div style={{ color: "#b20000", marginTop: 18, textAlign: "center", fontWeight: 600 }}>{error}</div>}
    </form>
  );
}
