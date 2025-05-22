// Percorso: /pages/components/sidebar.js

import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isSupervisorOrAdmin = user?.role === "supervisore" || user?.role === "amministratore";

  return (
    <aside className="w-56 min-h-screen bg-[#182764] text-white flex flex-col">
      <div className="p-4 text-center border-b border-white/20">
        <img src="/logo_schuco.png" alt="Logo" className="mx-auto w-20 bg-white rounded-full" />
        <h2 className="text-lg font-bold mt-2">SchucoTeamsHUB</h2>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        <Link href="/dashboard" className="block px-2 py-2 rounded hover:bg-white/10">🏠 Dashboard</Link>
        <Link href="/users" className="block px-2 py-2 rounded hover:bg-white/10">👥 Utenti</Link>
        <Link href="/teams" className="block px-2 py-2 rounded hover:bg-white/10">🧩 Team</Link>
        <Link href="/projects" className="block px-2 py-2 rounded hover:bg-white/10">📁 Progetti</Link>
        <Link href="/clients" className="block px-2 py-2 rounded hover:bg-white/10">🏢 Clienti</Link>
        <Link href="/files" className="block px-2 py-2 rounded hover:bg-white/10">📂 Files</Link>
        {isSupervisorOrAdmin && (
          <Link href="/reports/downloads" className="block px-2 py-2 rounded hover:bg-white/10">📊 Report Download</Link>
        )}
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 rounded"
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
