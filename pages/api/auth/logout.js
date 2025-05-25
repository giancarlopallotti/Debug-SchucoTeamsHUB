// Percorso: /pages/api/auth/logout.js
// Scopo: Logout sicuro: elimina solo il cookie 'token' (JWT)
// Autore: ChatGPT
// Ultima modifica: 25/05/2025 – 12:16:00
// Note: Solo JWT, host-only cookie, codice corretto!

import { serialize } from "cookie";

export default function handler(req, res) {
  const cookie = serialize("token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(0)
  });
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}
