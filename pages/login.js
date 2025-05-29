// ==================================================================
// Percorso: /pages/login.js
// Scopo: Pagina di login utente con "occhio" mostra/nascondi password
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// ==================================================================

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <--- NEW!
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      window.location.href = "/";
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
      <div style={{ position: "relative", marginBottom: 18 }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e0e6f2", paddingRight: 40 }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#23285A",
            fontSize: 18,
            opacity: 0.65
          }}
          tabIndex={-1}
          aria-label={showPassword ? "Nascondi password" : "Mostra password"}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
      <button type="submit" style={{ width: "100%", padding: 12, borderRadius: 8, background: "#23285A", color: "#fff", fontWeight: 700, fontSize: 17, border: "none" }}>
        Login
      </button>
      {error && <div style={{ color: "#b20000", marginTop: 18, textAlign: "center", fontWeight: 600 }}>{error}</div>}
    </form>
  );
}
