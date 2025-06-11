// Percorso: /pages/components/FilesTreeView.js
import { useEffect, useState } from "react";
import axios from "axios";

function TreeNode({ node, onSelect, selectedId, reloadTree }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState({ folders: [], files: [] });

  // Carica figli se non già espanso
  const handleExpand = async () => {
    if (!expanded) {
      const res = await axios.get("/api/folders", { params: { parent_id: node.id } });
      setChildren({
        folders: res.data?.folders || [],
        files: res.data?.files || []
      });
    }
    setExpanded(!expanded);
  };

  // Reload forzato
  const forceReload = async () => {
    const res = await axios.get("/api/folders", { params: { parent_id: node.id } });
    setChildren({
      folders: res.data?.folders || [],
      files: res.data?.files || []
    });
    setExpanded(true);
  };

  // Altre funzioni (new, rename, delete) come prima

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(node.name);
  const handleRename = () => setEditing(true);
  const confirmRename = async () => {
    await axios.put("/api/folders", { id: node.id, name: newName, is_public: node.is_public });
    setEditing(false);
    forceReload();
  };

  const handleNewFolder = async () => {
    const name = prompt("Nome nuova cartella:");
    if (name) {
      await axios.post("/api/folders", { name, parent_id: node.id, is_public: false });
      forceReload();
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Eliminare la cartella (e tutto il contenuto)?")) {
      await axios.delete("/api/folders", { data: { id: node.id } });
      if (reloadTree) reloadTree();
    }
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          title="Cartella"
          style={{
            fontWeight: selectedId === node.id ? "bold" : "normal",
            cursor: "pointer"
          }}
          onClick={() => onSelect(node)}
        >📁</span>
        {editing ? (
          <>
            <input value={newName} onChange={e => setNewName(e.target.value)} />
            <button onClick={confirmRename} title="Conferma rinomina">✔️</button>
          </>
        ) : (
          <span onClick={() => onSelect(node)} title={node.name} style={{ marginLeft: 6 }}>{node.name}</span>
        )}
        <button onClick={handleExpand} style={{ marginLeft: 10 }} title={expanded ? "Chiudi cartella" : "Espandi cartella"}>{expanded ? "-" : "+"}</button>
        <button onClick={handleNewFolder} title="Nuova sottocartella" style={{ marginLeft: 5 }}>➕</button>
        <button onClick={handleRename} title="Rinomina cartella" style={{ marginLeft: 2 }}>✏️</button>
        <button onClick={handleDelete} title="Elimina cartella" style={{ marginLeft: 2, color: "red" }}>🗑️</button>
      </div>
      {expanded && (
        <div>
          {(children.folders || []).map((f) => (
            <TreeNode
              key={f.id}
              node={f}
              onSelect={onSelect}
              selectedId={selectedId}
              reloadTree={reloadTree}
            />
          ))}
          {(children.files || []).map((file) => (
            <div
              key={file.id}
              style={{ marginLeft: 20, color: "#357", cursor: "pointer" }}
              onClick={() => onSelect(file)}
              title={file.name + " (File)"}
            >📄 {file.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilesTreeView({ onSelect, selectedId, reloadFlag }) {
  const [rootFolders, setRootFolders] = useState({ folders: [], files: [] });

  const reloadTree = () => {
    axios.get("/api/folders", { params: { parent_id: null } }).then((res) => {
      setRootFolders({
        folders: res.data?.folders || [],
        files: res.data?.files || []
      });
    });
  };

  useEffect(() => {
    reloadTree();
    // eslint-disable-next-line
  }, [reloadFlag]);

  const handleNewRootFolder = async () => {
    const name = prompt("Nome nuova cartella:");
    if (name) {
      await axios.post("/api/folders", { name, parent_id: null, is_public: false });
      reloadTree();
    }
  };

  return (
    <div>
      <button onClick={handleNewRootFolder} style={{ marginBottom: 10 }} title="Crea nuova cartella root">➕ Nuova cartella root</button>
      {(rootFolders.folders || []).map((f) => (
        <TreeNode
          key={f.id}
          node={f}
          onSelect={onSelect}
          selectedId={selectedId}
          reloadTree={reloadTree}
        />
      ))}
      {(rootFolders.files || []).map((file) => (
        <div
          key={file.id}
          style={{ marginLeft: 20, color: "#357", cursor: "pointer" }}
          onClick={() => onSelect(file)}
          title={file.name + " (File)"}
        >📄 {file.name}</div>
      ))}
    </div>
  );
}
