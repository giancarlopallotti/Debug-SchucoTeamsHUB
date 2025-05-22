// Percorso: /pages/reports/downloads.js

/**
 * Scopo: report completo dei download con grafici e statistiche aggregate
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 */

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";

export default function DownloadsReport() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    fetch("/api/reports/downloads")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
          const uniqueUsers = Array.from(new Set(data.map(log => log.user_id)));
          fetch("/api/users")
            .then(res => res.json())
            .then(userData => {
              setUsers(userData.filter(u => uniqueUsers.includes(u.id)));
            });
        } else {
          console.warn("API /reports/downloads ha restituito un tipo non valido:", data);
          setLogs([]);
        }
      });
  }, []);

  const filtered = Array.isArray(logs)
    ? logs.filter(log => (
        (!search || log.file_name?.toLowerCase().includes(search.toLowerCase())) &&
        (!userFilter || log.user_id === Number(userFilter)) &&
        (!from || new Date(log.downloaded_at) >= new Date(from)) &&
        (!to || new Date(log.downloaded_at) <= new Date(to))
      ))
    : [];

  const exportCSV = () => {
    const csv = [
      ["Data", "Utente", "File"],
      ...filtered.map(l => [l.downloaded_at, `${l.user_name} ${l.user_surname}`, l.file_name])
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report_download.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = filtered.reduce((acc, l) => {
    const found = acc.find(x => x.file === l.file_name);
    if (found) found.count += 1;
    else acc.push({ file: l.file_name, count: 1 });
    return acc;
  }, []);

  const dailyData = filtered.reduce((acc, l) => {
    const day = l.downloaded_at.split(" ")[0];
    const found = acc.find(x => x.date === day);
    if (found) found.count += 1;
    else acc.push({ date: day, count: 1 });
    return acc;
  }, []);

  const totalFiles = [...new Set(filtered.map(l => l.file_name))].length;
  const totalUsers = [...new Set(filtered.map(l => l.user_id))].length;
  const totalDownloads = filtered.length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-blue-900">Report Download Files</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="Filtra per nome file..." className="border p-2 rounded" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border p-2 rounded" value={userFilter} onChange={e => setUserFilter(e.target.value)}>
          <option value="">Tutti gli utenti</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} {u.surname}</option>)}
        </select>
        <input type="date" className="border p-2 rounded" value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" className="border p-2 rounded" value={to} onChange={e => setTo(e.target.value)} />
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportCSV}>Esporta CSV</button>
      </div>

      <div className="flex gap-6 text-sm text-center">
        <div className="bg-white shadow p-4 rounded w-40">
          <p className="text-gray-500">File diversi</p>
          <p className="text-2xl font-bold text-blue-800">{totalFiles}</p>
        </div>
        <div className="bg-white shadow p-4 rounded w-40">
          <p className="text-gray-500">Utenti unici</p>
          <p className="text-2xl font-bold text-blue-800">{totalUsers}</p>
        </div>
        <div className="bg-white shadow p-4 rounded w-40">
          <p className="text-gray-500">Download totali</p>
          <p className="text-2xl font-bold text-blue-800">{totalDownloads}</p>
        </div>
      </div>

      <div className="overflow-auto max-h-[50vh] border rounded">
        <table className="w-full text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Utente</th>
              <th className="p-2 text-left">File</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="p-2">{log.downloaded_at}</td>
                <td className="p-2">{log.user_name} {log.user_surname}</td>
                <td className="p-2">{log.file_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="file" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
