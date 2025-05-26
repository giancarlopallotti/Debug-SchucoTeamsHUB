export default function WidgetNote({ darkMode }) {
  return (
    <div className={`border-l-8 border-yellow-500 rounded p-4 h-full ${darkMode ? "bg-yellow-900 text-yellow-100" : "bg-yellow-100"}`}>
      <h2 className="text-md font-semibold text-yellow-800 mb-2">📝 Note rapide</h2>
      <textarea
        rows="4"
        className="w-full p-2 border rounded bg-yellow-50"
        placeholder="Scrivi una nota personale qui..."
        style={darkMode ? { background: "#654", color: "#ffe" } : {}}
      />
    </div>
  );
}
