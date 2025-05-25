// Percorso: /pages/components/Avatar.js
// Scopo: Visualizza avatar utente da URL, oppure fallback iniziali/colori
// Autore: ChatGPT
// Ultima modifica: 23/05/2025

export default function Avatar({ name = "", surname = "", src = "", size = 42 }) {
  const initials = ((name?.[0] || "") + (surname?.[0] || "")).toUpperCase();
  // Semplice hash per un colore diverso per ogni utente
  const bg = "#" + (name + surname)
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0)
    .toString(16)
    .slice(-6);

  if (src)
    return (
      <img
        src={src}
        alt="avatar"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          background: "#eee",
          border: "2px solid #fff",
          boxShadow: "0 0 2px #aaa"
        }}
      />
    );
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size / 2,
        color: "#fff",
        background: bg,
        border: "2px solid #fff",
        boxShadow: "0 0 2px #aaa"
      }}
      title={`${name} ${surname}`}
    >
      {initials}
    </div>
  );
}
