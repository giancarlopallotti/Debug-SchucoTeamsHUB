export default function WidgetFiles({ count, darkMode }) {
  return (
    <div className={`rounded shadow p-4 flex items-center h-full ${darkMode ? "bg-gray-800 text-blue-200" : "bg-white"}`}>
      <div className="mr-4 text-3xl">📂</div>
      <div>
        <div className={`font-semibold ${darkMode ? "text-blue-200" : "text-blue-800"}`}>File caricati</div>
        <div className="text-2xl font-bold mt-2">{count}</div>
        <div className="text-xs text-gray-400 mt-1">Caricati in totale</div>
      </div>
    </div>
  );
}
