// pages/dashboard.js

/**
 * Scopo: dashboard utente loggato con dati utente, riepiloghi, grafici e note
 * Autore: ChatGPT
 * Ultima modifica: 21/05/2025
 * Note: layout dashboard migliorato con header, widget dinamici, box note/post-it
 */

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

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

  if (loading) return <div className="p-4">Caricamento...</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-2">
        <h1 className="text-2xl font-bold text-blue-900">Dashboard</h1>
        <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Utente loggato */}
      {user && (
        <div className="p-4 border rounded bg-gray-50">
          <p className="font-semibold">Utente loggato:</p>
          <p>Nome: {user.name} {user.surname}</p>
          <p>Email: {user.email}</p>
          <p>Ruolo: <span className="uppercase font-medium text-blue-700">{user.role}</span></p>
          {user.teams && user.teams.length > 0 && (
            <p>Team: {user.teams.map(t => t.name).join(", ")}</p>
          )}
        </div>
      )}

      {/* Widget riepilogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Widget label="Progetti Totali" value={stats?.progetti || 0} />
        <Widget label="Progetti Attivi" value={stats?.progettiAttivi || 0} />
        <Widget label="Clienti Totali" value={stats?.clienti || 0} />
        <Widget label="Attività Scadute" value={stats?.attivitaScadute || 0} color="#F23" />
        <Widget
          label="Notifiche da leggere"
          value={notifications.filter(n => !n.read).length}
          link="/notifications"
          color="#F59E0B"
        />
      </div>

      {/* Box note post-it */}
      <div className="bg-yellow-100 border-l-8 border-yellow-500 rounded p-4 shadow-inner">
        <h2 className="text-md font-semibold text-yellow-800 mb-2">📝 Note rapide</h2>
        <textarea
          rows="4"
          className="w-full p-2 border rounded bg-yellow-50"
          placeholder="Scrivi una nota personale qui..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Grafico */}
      {pieData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Stato Progetti</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
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
      )}

      {msg && <p className="text-red-500">{msg}</p>}
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
