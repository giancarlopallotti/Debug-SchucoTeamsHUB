// Percorso: /components/LoadingSpinner.js
// Spinner semplice con supporto a una label opzionale

export default function LoadingSpinner({ label = "Caricamento..." }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: 48, height: 48, border: "5px solid #e3e6fa", borderTop: "5px solid #263b8a",
        borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 12
      }} />
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
      <span style={{ color: "#293562", fontWeight: 600, fontSize: 16 }}>{label}</span>
    </div>
  );
}
