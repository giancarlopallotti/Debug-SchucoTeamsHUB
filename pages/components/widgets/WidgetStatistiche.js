// Percorso: /components/widgets/WidgetStatistiche.js

import { useMemo } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WidgetStatistiche({ darkMode }) {
  // Demo: dati statici (sostituisci con fetch ai tuoi endpoint per dati reali)
  const data = useMemo(() => [
    { settimana: "1", files: 7, utenti: 2 },
    { settimana: "2", files: 15, utenti: 5 },
    { settimana: "3", files: 18, utenti: 6 },
    { settimana: "4", files: 25, utenti: 8 },
    { settimana: "5", files: 12, utenti: 3 },
    { settimana: "6", files: 19, utenti: 7 },
    { settimana: "7", files: 27, utenti: 8 }
  ], []);

  return (
    <div className={`
      rounded shadow p-4 h-full
      ${darkMode ? "bg-gray-800 text-blue-200" : "bg-white"}
    `}>
      <div className="flex items-center mb-3">
        <span className="text-xl mr-2">📊</span>
        <span className={`font-semibold ${darkMode ? "text-blue-200" : "text-blue-800"}`}>
          Statistiche settimanali
        </span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#ddd"} />
          <XAxis dataKey="settimana" stroke={darkMode ? "#aaa" : "#213b63"} />
          <YAxis stroke={darkMode ? "#aaa" : "#213b63"} />
          <Tooltip
            contentStyle={{
              background: darkMode ? "#223" : "#fff",
              color: darkMode ? "#eee" : "#111",
              border: "1px solid #2843A1"
            }}
          />
          <Line type="monotone" dataKey="files" name="Files" stroke="#76CE40" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="utenti" name="Utenti" stroke="#2843A1" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-xs text-gray-400 mt-2">Dati demo, sostituire con API reali</div>
    </div>
  );
}
