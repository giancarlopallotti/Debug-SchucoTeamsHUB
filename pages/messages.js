// Percorso: /pages/messages.js
// Scopo: Messaggistica PRO con badge, azioni rapide, polling light, audit base
// Autore: ChatGPT
// Ultima modifica: 22/05/2025

import { useEffect, useState, useRef } from "react";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("inbox");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [compose, setCompose] = useState({ subject: "", body: "", to: [], cc: [] });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showConfirm, setShowConfirm] = useState({show:false, msg:null});
  const pollingRef = useRef(null);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    loadMessages();
    // Attiva polling (refresh inbox ogni 30s SOLO se tab attiva e su inbox)
    clearInterval(pollingRef.current);
    if(view==="inbox") {
      pollingRef.current = setInterval(() => {
        if(document.visibilityState === "visible") loadMessages(true);
      }, 30000);
    }
    return () => clearInterval(pollingRef.current);
    // eslint-disable-next-line
  }, [view, search, sortField, sortDir, dateFrom, dateTo]);

  function loadMessages(silent=false) {
    if(!silent) setLoading(true);
    const params = new URLSearchParams({
      box: view,
      search,
      sort: sortField,
      dir: sortDir,
      from: dateFrom,
      to: dateTo
    });
    fetch(`/api/messages?${params.toString()}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .finally(() => !silent && setLoading(false));
  }

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function openMessage(msg) {
    fetch(`/api/messages/${msg.id}`)
      .then(r => r.json())
      .then(data => setModal(data));
    if (msg.read === 0) {
      fetch(`/api/messages/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: 1 })
      });
      setMessages(msgs => msgs.map(m => m.id === msg.id ? { ...m, read: 1 } : m));
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!compose.subject || !compose.body || compose.to.length === 0) {
      setError("Compila tutti i campi obbligatori");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compose)
    });
    if (res.ok) {
      setSuccess("Messaggio inviato!");
      setCompose({ subject: "", body: "", to: [], cc: [] });
      setComposeOpen(false);
      loadMessages();
    } else {
      setError("Errore invio messaggio");
    }
    setLoading(false);
    setTimeout(() => setSuccess("") || setError("") , 1800);
  }

  function handleArchive(msg) {
    fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: 1 })
    }).then(() => loadMessages());
  }
  function handleDelete(msg) {
    setShowConfirm({show:true,msg});
  }
  function confirmDelete() {
    if(!showConfirm.msg) return;
    fetch(`/api/messages/${showConfirm.msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleted: 1 })
    }).then(() => { loadMessages(); setShowConfirm({show:false,msg:null}); });
  }
  function cancelDelete() {
    setShowConfirm({show:false,msg:null});
  }
  function handleMarkRead(msg) {
    fetch(`/api/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: 1 })
    }).then(() => loadMessages());
  }
  function resetFilters() {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSortField("created_at");
    setSortDir("desc");
    loadMessages();
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Messaggi</h1>
      <div className="flex gap-3 mb-4 flex-wrap">
        <button onClick={() => setView("inbox")}
          className={"px-4 py-2 rounded " + (view==="inbox"?"bg-blue-700 text-white":"bg-gray-200")}>In arrivo</button>
        <button onClick={() => setView("sent")}
          className={"px-4 py-2 rounded " + (view==="sent"?"bg-blue-700 text-white":"bg-gray-200")}>Inviati</button>
        <button onClick={() => setView("cc")}
          className={"px-4 py-2 rounded " + (view==="cc"?"bg-blue-700 text-white":"bg-gray-200")}>CC</button>
        <button className="ml-auto px-4 py-2 bg-green-700 text-white rounded" onClick={() => setComposeOpen(true)}>
          + Nuovo Messaggio
        </button>
      </div>
      {/* Ricerca avanzata */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <input className="border rounded p-2" placeholder="Cerca oggetto, testo, mittente…" value={search} onChange={e => setSearch(e.target.value)} />
        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="border rounded p-2" />
        <span>—</span>
        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="border rounded p-2" />
        <button className="ml-2 px-3 py-2 bg-gray-200 rounded" onClick={loadMessages}>Filtra</button>
        <button className="px-3 py-2" onClick={resetFilters}>Reset</button>
      </div>
      {/* Tabella messaggi */}
      {loading ? <div>Caricamento...</div> :
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left p-2 cursor-pointer" onClick={()=>handleSort('subject')}>Oggetto {sortField==='subject' && (sortDir==='asc'?'▲':'▼')}</th>
            <th className="text-left p-2 cursor-pointer" onClick={()=>handleSort('sender_id')}>Mittente {sortField==='sender_id' && (sortDir==='asc'?'▲':'▼')}</th>
            <th className="text-left p-2 cursor-pointer" onClick={()=>handleSort('created_at')}>Data {sortField==='created_at' && (sortDir==='asc'?'▲':'▼')}</th>
            <th className="text-left p-2">Stato</th>
            <th className="text-left p-2">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {(!Array.isArray(messages) || messages.length === 0) && (
            <tr>
              <td colSpan={6} className="p-2 text-gray-400">Nessun messaggio</td>
            </tr>
          )}
          {Array.isArray(messages) && messages.map(msg => (
            <tr key={msg.id} className={msg.read ? "bg-white" : "bg-blue-50 font-bold"}>
              <td className="p-2 cursor-pointer flex items-center gap-2" onClick={() => openMessage(msg)}>
                {!msg.read && <span title="Non letto" className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                {msg.important && <span title="Importante" className="inline-block text-red-500 font-bold">★</span>}
                {msg.hasAttachment && <span title="Allegato" className="inline-block text-gray-500 ml-1">📎</span>}
                {msg.subject}
              </td>
              <td className="p-2">{msg.sender_name || msg.sender_id}</td>
              <td className="p-2">{msg.created_at?.split("T")[0]}</td>
              <td className="p-2">{msg.read ? "Letto" : "Non letto"}</td>
              <td className="p-2 text-right flex gap-2">
                <button className="text-xs text-yellow-700 mr-2" title="Archivia" onClick={() => handleArchive(msg)}>Archivia</button>
                {!msg.read && <button className="text-xs text-blue-700 mr-2" title="Segna come letto" onClick={() => handleMarkRead(msg)}>✓</button>}
                <button className="text-xs text-red-700" title="Elimina" onClick={() => handleDelete(msg)}>Elimina</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      {success && <div className="text-green-700 mb-2">{success}</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}
      {/* Conferma eliminazione */}
      {showConfirm.show && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 max-w-sm w-full relative">
            <div className="font-bold mb-3 text-lg">Confermi l'eliminazione?</div>
            <div className="mb-4 text-gray-700">{showConfirm.msg?.subject}</div>
            <div className="flex gap-3 justify-end">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={cancelDelete}>Annulla</button>
              <button className="px-4 py-2 bg-red-700 text-white rounded" onClick={confirmDelete}>Elimina</button>
            </div>
          </div>
        </div>
      )}
      {/* Modale lettura messaggio */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded shadow p-6 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setModal(null)}>✖</button>
            <h2 className="font-bold text-xl mb-2">{modal.subject}</h2>
            <div className="mb-1 text-sm text-gray-600">Mittente: {modal.sender_name || modal.sender_id}</div>
            <div className="mb-3 text-sm text-gray-600">Data: {modal.created_at?.split("T")[0]}</div>
            <div className="mb-3 text-gray-800 whitespace-pre-line">{modal.body}</div>
            <div className="text-xs mb-2">CC: {modal.recipients?.filter(r=>r.type==="cc").map(r=>r.name + " " + (r.surname||""))?.join(", ")}</div>
            <button className="mt-2 px-4 py-2 rounded bg-blue-700 text-white" onClick={()=>setModal(null)}>Chiudi</button>
          </div>
        </div>
      )}
      {/* Modale composizione nuovo messaggio */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setComposeOpen(false)}>✖</button>
            <h2 className="font-bold text-lg mb-4">Nuovo Messaggio</h2>
            <form onSubmit={handleSend}>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Destinatari (To):</label>
                <select multiple value={compose.to} onChange={e => {
                  const opts = Array.from(e.target.selectedOptions).map(opt=>opt.value);
                  setCompose(c => ({ ...c, to: opts }));
                }} className="w-full border rounded p-2">
                  {users.map(u => (
                    <option value={u.id} key={u.id}>{u.name} {u.surname} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">CC:</label>
                <select multiple value={compose.cc} onChange={e => {
                  const opts = Array.from(e.target.selectedOptions).map(opt=>opt.value);
                  setCompose(c => ({ ...c, cc: opts }));
                }} className="w-full border rounded p-2">
                  {users.map(u => (
                    <option value={u.id} key={u.id}>{u.name} {u.surname} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Oggetto:</label>
                <input className="w-full border rounded p-2" value={compose.subject} maxLength={80}
                  onChange={e=>setCompose(c => ({ ...c, subject: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-bold mb-1">Testo:</label>
                <textarea className="w-full border rounded p-2" rows={6} value={compose.body}
                  onChange={e=>setCompose(c => ({ ...c, body: e.target.value }))} />
              </div>
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded" disabled={loading}>
                Invia
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
