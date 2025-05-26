/*
  /pages/files.js
  Scopo: File manager UI stile Windows con colori e effetti moderni
  Autore: ChatGPT
  Ultima modifica: 25/05/2025
  Note: UI Windows+Color, gradienti, effetti glass, badge animati
*/

import { useEffect, useState } from "react";
import {
  MdUpload, MdDelete, MdDownload, MdLock, MdGroups, MdCloudDownload, MdCloudUpload, MdSettings, MdHistory, MdSearch, MdClose, MdRestore, MdBackup
} from "react-icons/md";

function formatBytes(bytes) {
  if (!bytes) return "";
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
const PRIVACY_LABELS = { 1: "Privato", 0: "Pubblico" };

export default function FilesPage() {
  const [files, setFiles] = useState([]);
  const [filters, setFilters] = useState({ search: "", privacy: "" });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [permData, setPermData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setLoading(true);
    let url = "/api/files?";
    Object.entries(filters).forEach(([k, v]) => {
      if (v) url += `${k}=${encodeURIComponent(v)}&`;
    });
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setFiles(Array.isArray(d.files) ? d.files : []);
        setLoading(false);
      });
  }, [filters]);

  const toggleSelect = id => {
    setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
  };

  function ActionsBar() {
    return (
      <div className="flex flex-row items-center gap-2 p-3 border-b bg-gradient-to-r from-blue-200 via-white to-fuchsia-100 sticky top-0 z-10 shadow-sm">
        <button className="color-btn-blue" onClick={() => document.getElementById("file-upload").click()}>
          <MdUpload size={20} /> <span>Upload</span>
        </button>
        <input id="file-upload" type="file" multiple className="hidden"
          onChange={e => handleUpload(e.target.files)} />
        <button className="color-btn-green" onClick={handleBackup}><MdBackup size={20} /> Backup</button>
        <button className="color-btn-orange" onClick={handleRestore}><MdRestore size={20} /> Restore</button>
        <button className="color-btn-red" disabled={!selected.length} onClick={handleDeleteSelected}><MdDelete size={20} /> Elimina</button>
        <button className="color-btn-cyan" disabled={!selected.length} onClick={handleDownloadSelected}><MdCloudDownload size={20} /> Download ZIP</button>
        <div className="flex-1" />
        <div className="flex gap-1 items-center bg-gray-100 rounded px-2 py-1">
          <MdSearch size={18} className="text-gray-500" />
          <input className="bg-transparent outline-none px-1" placeholder="Cerca file/note..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          {filters.search && <MdClose size={18} onClick={() => setFilters(f => ({ ...f, search: "" }))} className="cursor-pointer" />}
        </div>
        <select className="ml-2 border rounded px-2 py-1 bg-white" value={filters.privacy} onChange={e => setFilters(f => ({ ...f, privacy: e.target.value }))}>
          <option value="">Privacy</option>
          <option value="1">Privato</option>
          <option value="0">Pubblico</option>
        </select>
      </div>
    );
  }

  function FileTable() {
    return (
      <div className="w-full bg-white rounded-xl shadow-lg mt-3 overflow-x-auto">
        <table className="min-w-full text-[15px]">
          <thead className="bg-gradient-to-r from-blue-100 via-white to-pink-100 sticky top-[58px] z-5">
            <tr>
              <th className="py-2 px-3"><input type="checkbox" checked={selected.length === files.length && files.length > 0}
                onChange={e => setSelected(e.target.checked ? files.map(f => f.id) : [])} /></th>
              <th className="py-2 px-3 text-left">Nome</th>
              <th className="py-2 px-3 text-left">Privacy</th>
              <th className="py-2 px-3 text-left">Tags</th>
              <th className="py-2 px-3 text-left">Uploader</th>
              <th className="py-2 px-3 text-left">Data</th>
              <th className="py-2 px-3 text-left">Dimensione</th>
              <th className="py-2 px-3 text-center">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}
                className={`hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 transition-all duration-150 ${selected.includes(file.id) ? "bg-gradient-to-r from-blue-100 to-pink-100" : ""}`}>
                <td className="px-3 py-1">
                  <input type="checkbox" checked={selected.includes(file.id)} onChange={() => toggleSelect(file.id)} />
                </td>
                <td className="px-3 py-1 cursor-pointer" onClick={() => { setActiveFile(file); setShowPreview(true); }}>
                  <span className="font-medium">{file.name}</span>
                </td>
                <td className="px-3 py-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full shadow-sm text-xs transition-all animate-bounce ${file.private ? "bg-gradient-to-r from-pink-200 to-red-300 text-red-700" : "bg-gradient-to-r from-green-200 to-teal-200 text-teal-800"}`}>
                    {file.private ? <MdLock size={14} /> : <MdGroups size={14} />}
                    {PRIVACY_LABELS[file.private]}
                  </span>
                </td>
                <td className="px-3 py-1">
                  {(file.tags || []).map((tag, i) => (
                    <span key={i} className="inline-block mr-1 mb-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-100 to-blue-100 text-xs text-fuchsia-800 shadow">{tag}</span>
                  ))}
                </td>
                <td className="px-3 py-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 text-indigo-700 text-xs shadow">
                    {file.uploader_name || ""}
                  </span>
                </td>
                <td className="px-3 py-1">{file.created_at?.substring(0, 16).replace("T", " ")}</td>
                <td className="px-3 py-1">{formatBytes(file.size)}</td>
                <td className="px-3 py-1 text-center flex gap-2 justify-center">
                  <button className="icon-btn" title="Anteprima" onClick={() => { setActiveFile(file); setShowPreview(true); }}><MdCloudDownload /></button>
                  <button className="icon-btn" title="Download" onClick={() => handleDownload(file)}><MdDownload /></button>
                  <button className="icon-btn" title="Permessi" onClick={() => { setActiveFile(file); openPermModal(file); }}><MdSettings /></button>
                  <button className="icon-btn" title="Storico" onClick={() => { setActiveFile(file); openAuditModal(file); }}><MdHistory /></button>
                  <button className="icon-btn" title="Elimina" onClick={() => handleDelete(file)}><MdDelete /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-center py-6 text-gray-500">Caricamento...</div>}
        {!loading && files.length === 0 && (
          <div className="text-center py-6 text-gray-400">Nessun file trovato.</div>
        )}
        {/* Barra di stato */}
        <div className="flex flex-row items-center px-4 py-2 text-xs text-gray-600 bg-gradient-to-r from-white via-blue-50 to-fuchsia-50 border-t rounded-b-xl">
          {selected.length > 0
            ? <span>{selected.length} file selezionati</span>
            : <span>{files.length} file in totale</span>
          }
        </div>
      </div>
    );
  }

  // --- AZIONI E MODALI ---

  async function handleUpload(fileList) {
    setLoading(true);
    setAlert(null);
    const form = new FormData();
    for (let file of fileList) form.append("files", file);
    const res = await fetch("/api/files", { method: "POST", body: form });
    if (res.ok) {
      setAlert({ message: "Upload riuscito!", error: false });
      setFilters({ ...filters });
    } else {
      setAlert({ message: "Errore upload", error: true });
    }
    setLoading(false);
  }
  function handleDownload(file) {
    fetch(`/api/files/${file.id}?action=download`)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        fetch("/api/files/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file_id: file.id }) });
      });
  }
  function handleDownloadSelected() {
    fetch("/api/files/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: selected })
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "files.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }
  async function handleDelete(file) {
    if (!window.confirm("Eliminare questo file?")) return;
    setLoading(true);
    const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    if (res.ok) setFilters({ ...filters });
    else setAlert({ message: "Errore eliminazione", error: true });
    setLoading(false);
  }
  async function handleDeleteSelected() {
    if (!window.confirm("Eliminare i file selezionati?")) return;
    setLoading(true);
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_ids: selected })
    });
    if (res.ok) setFilters({ ...filters });
    else setAlert({ message: "Errore eliminazione multipla", error: true });
    setSelected([]);
    setLoading(false);
  }
  function handleBackup() {
    fetch("/api/files/backup?action=backup", { method: "POST" })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "backup_files.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }
  function handleRestore() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      const form = new FormData();
      form.append("backup", file);
      const res = await fetch("/api/files/backup?action=restore", { method: "POST", body: form });
      if (res.ok) setAlert({ message: "Restore completato", error: false });
      else setAlert({ message: "Errore restore", error: true });
      setLoading(false);
      setFilters({ ...filters });
    };
    input.click();
  }
  function openPermModal(file) {
    setShowPermModal(true);
    setPermData(null);
    fetch(`/api/files/permissions?fileId=${file.id}`)
      .then(r => r.json())
      .then(d => setPermData(d));
  }
  function PermModal() {
    if (!activeFile || !permData) return null;
    return (
      <div className="glass-modal">
        <div className="glass-modal-content animate-fadein">
          <h3 className="font-bold mb-2">Permessi file: {activeFile.name}</h3>
          <table className="w-full text-[14px] mb-3">
            <thead><tr><th>Utente</th><th>Ruolo Minimo</th><th>Download</th><th>Elimina</th><th></th></tr></thead>
            <tbody>
              {(permData.userPerms || []).map(p => (
                <tr key={"u" + p.user_id}>
                  <td>{p.user_id}</td>
                  <td>{p.min_role}</td>
                  <td>{p.can_download ? "✔️" : ""}</td>
                  <td>{p.can_delete ? "✔️" : ""}</td>
                  <td><button className="icon-btn" onClick={() => removePerm(activeFile.id, p.user_id, null)}>Rimuovi</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="color-btn-blue mt-1" onClick={() => setShowPermModal(false)}>Chiudi</button>
        </div>
      </div>
    );
  }
  async function removePerm(file_id, user_id, team_id) {
    await fetch("/api/files/permissions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id, user_id, team_id })
    });
    openPermModal({ id: file_id });
  }
  function openAuditModal(file) {
    setShowAuditModal(true);
    fetch(`/api/files/audit?file_id=${file.id}`)
      .then(r => r.json())
      .then(d => setAuditLogs(d.logs || []));
  }
  function AuditModal() {
    if (!activeFile || !showAuditModal) return null;
    return (
      <div className="glass-modal">
        <div className="glass-modal-content animate-fadein">
          <h3 className="font-bold mb-2">Storico accessi/download: {activeFile.name}</h3>
          <table className="w-full text-[14px] mb-3">
            <thead><tr><th>Data</th><th>Utente</th><th>Email</th></tr></thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.downloaded_at?.replace("T", " ").substring(0, 16)}</td>
                  <td>{log.user_name} {log.user_surname}</td>
                  <td>{log.user_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="color-btn-blue mt-1" onClick={() => setShowAuditModal(false)}>Chiudi</button>
        </div>
      </div>
    );
  }
  function PreviewModal() {
    if (!activeFile || !showPreview) return null;
    let url = "/uploads/" + activeFile.path;
    return (
      <div className="glass-modal">
        <div className="glass-modal-content animate-fadein">
          <h3 className="font-bold mb-2">Anteprima file: {activeFile.name}</h3>
          {activeFile.mimetype?.startsWith("image") ?
            <img src={url} alt="anteprima" className="max-w-[400px] rounded-xl border shadow-lg" /> :
            <a href={url} download target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Download</a>
          }
          <button className="color-btn-blue mt-2" onClick={() => setShowPreview(false)}>Chiudi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-fuchsia-100 p-0">
      <div className="max-w-6xl mx-auto pt-6">
        <div className="text-2xl font-bold flex items-center gap-2 mb-2 text-gradient bg-gradient-to-r from-blue-700 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
          <MdCloudUpload /> Gestione Files
        </div>
        <ActionsBar />
        <FileTable />
        {alert && <div className={`fixed bottom-5 right-5 px-4 py-2 rounded shadow-lg animate-fadein ${alert.error ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>{alert.message}</div>}
        {showPermModal && <PermModal />}
        {showAuditModal && <AuditModal />}
        {showPreview && <PreviewModal />}
      </div>
      <style>{`
        .color-btn-blue {
          background: linear-gradient(90deg, #7abfff 0%, #3b82f6 100%);
          color: #fff; border: none; border-radius: 8px;
          font-weight: 500; font-size: 15px; cursor: pointer;
          padding: 7px 17px; transition: filter .12s;
          display: inline-flex; align-items: center; gap: 6px;
          box-shadow: 0 1px 6px #7abfff33;
        }
        .color-btn-blue:hover { filter: brightness(1.09); }
        .color-btn-green {
          background: linear-gradient(90deg, #bbf7d0 0%, #22c55e 100%);
          color: #155d33; border: none; border-radius: 8px; font-weight: 500;
          font-size: 15px; cursor: pointer; padding: 7px 17px; transition: filter .12s;
          display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 6px #22c55e25;
        }
        .color-btn-green:hover { filter: brightness(1.09); }
        .color-btn-orange {
          background: linear-gradient(90deg, #ffd6a5 0%, #ff6d00 100%);
          color: #a1450a; border: none; border-radius: 8px; font-weight: 500;
          font-size: 15px; cursor: pointer; padding: 7px 17px; transition: filter .12s;
          display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 6px #ff6d0033;
        }
        .color-btn-orange:hover { filter: brightness(1.09); }
        .color-btn-red {
          background: linear-gradient(90deg, #fecaca 0%, #f87171 100%);
          color: #7f1d1d; border: none; border-radius: 8px; font-weight: 500;
          font-size: 15px; cursor: pointer; padding: 7px 17px; transition: filter .12s;
          display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 6px #f8717133;
        }
        .color-btn-red:disabled, .color-btn-red[disabled] { opacity: .5; cursor: not-allowed; }
        .color-btn-red:hover { filter: brightness(1.09); }
        .color-btn-cyan {
          background: linear-gradient(90deg, #a5f3fc 0%, #0ea5e9 100%);
          color: #0e416e; border: none; border-radius: 8px; font-weight: 500;
          font-size: 15px; cursor: pointer; padding: 7px 17px; transition: filter .12s;
          display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 6px #0ea5e933;
        }
        .color-btn-cyan:disabled, .color-btn-cyan[disabled] { opacity: .5; cursor: not-allowed; }
        .color-btn-cyan:hover { filter: brightness(1.09); }
        .icon-btn {
          background: none; border: none; color: #3b82f6;
          cursor: pointer; padding: 4px; border-radius: 5px; transition: background .12s;
        }
        .icon-btn:hover { background: #f3f5ff; }
        .glass-modal {
          position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; z-index: 99;
          background: rgba(76,0,168,0.08); display: flex; align-items: center; justify-content: center;
        }
        .glass-modal-content {
          background: rgba(255,255,255,0.93); border-radius: 20px; box-shadow: 0 8px 36px 0 #0002;
          min-width: 380px; padding: 28px 34px; max-width: 96vw; max-height: 86vh; overflow: auto;
          border: 1.5px solid #dbeafe;
          animation: fadeInGlass .38s;
        }
        .animate-fadein { animation: fadeInGlass .38s; }
        @keyframes fadeInGlass { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
        .text-gradient {
          background: linear-gradient(90deg,#2e4fff 0%,#ae28d5 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        table th, table td { border-bottom: 1px solid #f2f2f3; }
      `}</style>
    </div>
  );
}
