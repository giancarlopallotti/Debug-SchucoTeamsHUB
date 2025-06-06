// Percorso: /pages/files/index.js
// File-manager con albero cartelle + grid
import { useState, useEffect } from "react";
import FileTree from "../components/FileTree";
import ProjectFileAssocModal from "../components/FileAssocModal"; // wrapper su files-associa

export default function FileManagerPage() {
  const [selFolder, setSelFolder]   = useState("");
  const [selFile,   setSelFile]     = useState(null);
  const [files,     setFiles]       = useState([]);
  const [showAssoc, setShowAssoc]   = useState(false);

  /* carica file della cartella */
  useEffect(() => {
    if (selFolder === "") return;
    fetch(`/api/files?path=${encodeURIComponent(selFolder)}`)
      .then(r => r.json())
      .then(d => setFiles(Array.isArray(d.files) ? d.files : []));
  }, [selFolder]);

  /* upload handler  */
  const handleUpload = e => {
    const fd = new FormData();
    [...e.target.files].forEach(f => fd.append("files", f));
    fd.append("path", selFolder);
    fetch("/api/files", { method: "POST", body: fd })
      .then(() => fetch(`/api/files?path=${encodeURIComponent(selFolder)}`))
      .then(r => r.json())
      .then(d => setFiles(Array.isArray(d.files) ? d.files : []));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ------------ sidebar albero ------------ */}
      <aside className="w-1/4 bg-gray-50 border-r p-4 overflow-auto">
        <h2 className="font-semibold mb-4">Archivio</h2>
        <FileTree
          onFileClick={node => setSelFile(node)}
          onFolderClick={path => setSelFolder(path)}
        />
      </aside>

      {/* ------------ main panel ------------ */}
      <main className="flex-1 flex flex-col bg-white">
        {/* toolbar */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-100">
          <span className="font-medium">{selFolder || "Seleziona cartella"}</span>
          <div className="flex gap-2">
            <label className="bg-green-600 text-white px-3 py-2 rounded cursor-pointer">
              📤 Upload
              <input type="file" multiple hidden onChange={handleUpload} />
            </label>
            <button
              className="bg-blue-600 text-white px-3 py-2 rounded"
              onClick={() => setShowAssoc(true)}
            >
              🔗 Associa
            </button>
          </div>
        </div>

        {/* grid file */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 overflow-auto flex-1">
          {files.map(f => (
            <div key={f.id} className="border rounded p-4 text-center cursor-pointer"
                 onClick={() => setSelFile({ name: f.name, attributes: f })}>
              <div className="text-4xl">📄</div>
              <div className="mt-2 break-all">{f.name}</div>
            </div>
          ))}
        </div>
      </main>

      {/* pannello dettaglio */}
      {selFile && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white border-l p-6 overflow-auto shadow-lg">
          <button className="absolute top-2 right-2 text-red-600"
                  onClick={() => setSelFile(null)}>✖</button>
          <h3 className="text-xl font-bold mb-4">{selFile.name}</h3>
          <p className="text-sm mb-2"><b>Mimetype:</b> {selFile.attributes.mimetype}</p>
          <p className="text-sm mb-4"><b>Size:</b> {(selFile.attributes.size/1024).toFixed(1)} KB</p>
          <a href={`/api/files/${selFile.attributes.id}/download`}
             className="bg-blue-600 text-white px-4 py-2 rounded">⬇️ Scarica</a>
        </div>
      )}

      {/* modal associazione */}
      {showAssoc && (
        <ProjectFileAssocModal onClose={() => setShowAssoc(false)} />
      )}
    </div>
  );
}
