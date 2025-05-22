// pages/dashboard.js

/**
 * Scopo: dashboard utente loggato con layout drag & drop (react-grid-layout)
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 * Note: spostata info utente nella topbar accanto al titolo
 */

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const COLORS = ["#2843A1", "#ffd600", "#a4e1af", "#f78c6c", "#8884d8", "#ffa1b5", "#b8e986"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(res => res.json()),
      fetch("/api/dashboard").then(res => res.json())
    ])
      .then(([userData, statsData]) => {
        setUser(userData);
        setStats(statsData);
        return fetch(`/api/notifications?user_id=${userData.id}`);
      })
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(() => setMsg("Errore nel caricamento dati"))
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats?.statoProgetti
    ? Object.entries(stats.statoProgetti).map(([name, value]) => ({ name, value }))
    : [];

  const layout = [
    { i: "widgets", x: 0, y: 0, w: 12, h: 2 },
    { i: "note", x: 0, y: 2, w: 6, h: 2 },
    { i: "grafico", x: 6, y: 2, w: 6, h: 3 }
  ];

  if (loading) return <div className="p-4">Caricamento...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
          {user && (
            <div className="text-sm text-gray-700 mt-1">
              <p><b>Nome:</b> {user.name} {user.surname}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Ruolo:</b> <span className="uppercase font-medium text-blue-700">{user.role}</span></p>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString()}</span>
      </div>

      <GridLayout className="layout" layout={layout} cols={12} rowHeight={100} width={1200}>
        <div key="widgets" className="bg-white shadow rounded p-4 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Widget label="Progetti Totali" value={stats?.progetti || 0} />
            <Widget label="Progetti Attivi" value={stats?.progettiAttivi || 0} />
            <Widget label="Clienti Totali" value={stats?.clienti || 0} />
            <Widget label="Notifiche da leggere" value={notifications.filter(n => !n.read).length} link="/notifications" color="#F59E0B" />
          </div>
        </div>

        <div key="note" className="bg-yellow-100 border-l-8 border-yellow-500 rounded p-4 overflow-auto">
          <h2 className="text-md font-semibold text-yellow-800 mb-2">📝 Note rapide</h2>
          <textarea
            rows="4"
            className="w-full p-2 border rounded bg-yellow-50"
            placeholder="Scrivi una nota personale qui..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div key="grafico" className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Stato Progetti</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GridLayout>

      {msg && <p className="text-red-500 mt-4">{msg}</p>}
    </div>
  );
}

function Widget({ label, value, color = "#2843A1", link = null }) {
  const content = (
    <div className="bg-white shadow rounded p-4 hover:shadow-md transition cursor-pointer" style={{ borderLeft: `6px solid ${color}` }}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
  return link ? <Link href={link}>{content}</Link> : content;
}
