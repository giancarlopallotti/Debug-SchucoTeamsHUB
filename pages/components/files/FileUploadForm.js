// Percorso: /components/FileUploadForm.js
// Form upload file, selezione team/progetto/tag/note/pubblico
// Autore: ChatGPT – 25/05/2025

import { useRef, useState } from "react";
import TagMultiSelect from "./TagMultiSelect";
import TagDropdownSelect from "./TagDropdownSelect";

export default function FileUploadForm({
  teams, projects, tags, selectedTags, setSelectedTags,
  teamId, setTeamId, projectId, setProjectId,
  subfolder, setSubfolder, note, setNote, isPublic, setIsPublic,
  uploadFiles, setUploadFiles, uploading, uploadError, handleUpload, handleTagsChange, handleCreateTag
}) {
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setUploadFiles(Array.from(e.target.files));
  };

  return (
    <form onSubmit={handleUpload} className="mb-4 bg-white rounded-2xl shadow p-3 md:p-6 max-w-2xl space-y-3 md:space-y-5">
      <div className="flex gap-2 md:gap-3">
        <div className="flex-1">
          <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Team</label>
          <select className="border rounded px-2 py-1 w-full text-xs" style={{ height: "28px" }}
            value={teamId} onChange={e => setTeamId(e.target.value)}>
            <option value="">Scegli team...</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Progetto</label>
          <select className="border rounded px-2 py-1 w-full text-xs" style={{ height: "28px" }}
            value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">Scegli progetto...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Tag (puoi usare entrambi i selettori)</label>
        <TagMultiSelect
          tags={tags}
          selectedTags={selectedTags}
          onChange={handleTagsChange}
          onCreate={handleCreateTag}
        />
        <div className="mt-1">
          <TagDropdownSelect
            tags={tags}
            selectedTags={selectedTags}
            onChange={handleTagsChange}
          />
          <span className="text-xs text-gray-500">Selezione rapida da elenco</span>
        </div>
      </div>
      <div>
        <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Note (opzionale)</label>
        <textarea
          className="border rounded px-2 py-1 w-full text-xs"
          style={{ fontSize: "12px", minHeight: "36px", resize: "vertical" }}
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={512}
          placeholder="Annotazioni, commenti o dettagli su questo file"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Sottocartella (opzionale)</label>
        <input className="border rounded px-2 py-1 w-full text-xs"
          type="text" placeholder="es: relazioni_tecniche"
          value={subfolder} onChange={e => setSubfolder(e.target.value.replace(/[\\/]+/g, '_'))}
          maxLength={32}
          style={{ height: "28px" }}
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-semibold mb-1 text-blue-900">Seleziona file (multipli)</label>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="border p-1 rounded w-full text-xs"
          style={{ height: "28px" }}
        />
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="accent-blue-700"
          />
          File pubblico per tutti gli utenti
        </label>
        <span className="text-xs text-gray-500">Se disattivato, visibile solo ai team/progetti associati</span>
      </div>
      {uploadError && <div className="text-red-600 text-xs">{uploadError}</div>}
      <button
        type="submit"
        disabled={uploading}
        className="mt-1 px-3 py-1 bg-blue-700 text-white rounded shadow hover:bg-blue-800 font-semibold text-xs"
        style={{ fontSize: "12px", height: "28px", minWidth: "90px" }}
      >
        {uploading ? "Caricamento..." : "Carica file"}
      </button>
    </form>
  );
}
