// Percorso: /pages/files/index.js
// Scopo: Integrazione ricerca file, TreeView, upload e dettagli con preview/azioni rapide
// Autore: ChatGPT
// Ultima modifica: 07/06/2025

import { useState } from "react";
import FilesSearchBar from "../components/FilesSearchBar";
import FilesTreeView from "../components/FilesTreeView";
import FileDetails from "../components/FileDetails";
import UploadFile from "../components/UploadFile";

export default function FilesPage() {
  const [selected, setSelected] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);

  const reloadTree = () => setReloadFlag(f => !f);

  // Una cartella ha il campo created_by, un file ha folder_id ma non created_by
  const isFolder = selected && selected.created_by !== undefined;
  const isFile = selected && selected.folder_id !== undefined;

  return (
    <div style={{ display: "flex" }}>
      {/* SINISTRA: ricerca + treeview */}
      <div style={{ minWidth: 300, borderRight: "1px solid #eee", position: "relative" }}>
        {/* Barra di ricerca in alto */}
        <FilesSearchBar onSelectFile={setSelected} />
        <FilesTreeView
          onSelect={setSelected}
          selectedId={selected?.id}
          reloadFlag={reloadFlag}
        />
      </div>
      {/* DESTRA: dettaglio file/cartella */}
      <div style={{ flex: 1, padding: 16 }}>
        {selected ? (
          <>
            {isFolder && (
              <div>
                <h2>{selected.name}</h2>
                <UploadFile folderId={selected.id} onUpload={reloadTree} />
              </div>
            )}
            {isFile && (
              <FileDetails
                file={selected}
                onFileMoved={reloadTree}
                onFileDeleted={reloadTree}
              />
            )}
          </>
        ) : (
          <div>Seleziona un file o una cartella dall’albero oppure cerca tra i tuoi file.</div>
        )}
      </div>
    </div>
  );
}
