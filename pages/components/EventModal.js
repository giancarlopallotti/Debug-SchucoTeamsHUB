// 📁 File: /components/EventModal.js
// 🧩 Scopo: Componente modale per creazione e modifica eventi calendario
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 06/06/2025
// 📝 Note: Supporta POST, PUT, DELETE con selezione utenti/team/tag, gestione fileIds come allegati

import { useState, useEffect } from 'react';

export default function EventModal({ eventData, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [userIds, setUserIds] = useState([]);
  const [teamIds, setTeamIds] = useState([]);
  const [tagIds, setTagIds] = useState([]);
  const [fileIds, setFileIds] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [allFiles, setAllFiles] = useState([]);

  useEffect(() => {
    fetch('/api/users').then(res => res.json()).then(setAllUsers);
    fetch('/api/teams').then(res => res.json()).then(setAllTeams);
    fetch('/api/tags').then(res => res.json()).then(setAllTags);
    fetch('/api/files')
      .then(res => res.json())
      .then(data => setAllFiles(data.files || []));
  }, []);

  useEffect(() => {
    if (eventData && eventData.id) {
      setTitle(eventData.title || '');
      setDescription(eventData.description || '');
      setStart(eventData.start ? eventData.start.slice(0, 16) : '');
      setEnd(eventData.end ? eventData.end.slice(0, 16) : '');
      setUserIds(eventData.userIds || []);
      setTeamIds(eventData.teamIds || []);
      setTagIds(eventData.tagIds || []);
      setFileIds(eventData.fileIds || []);
    } else {
      const now = new Date();
      const iso = now.toISOString().slice(0, 16);
      setTitle('');
      setDescription('');
      setStart(iso);
      setEnd(iso);
      setUserIds([]);
      setTeamIds([]);
      setTagIds([]);
      setFileIds([]);
    }
  }, [eventData]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">
          {eventData?.id ? 'Modifica Evento' : 'Nuovo Evento'}
        </h2>
        <div className="space-y-4">
          <input type="text" placeholder="Titolo" className="w-full px-4 py-2 border rounded-lg" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea placeholder="Descrizione" className="w-full px-4 py-2 border rounded-lg" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Inizio</label>
              <input type="datetime-local" className="w-full px-4 py-2 border rounded-lg" value={start} onChange={e => setStart(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">Fine</label>
              <input type="datetime-local" className="w-full px-4 py-2 border rounded-lg" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Partecipanti</label>
            <select multiple className="w-full px-4 py-2 border rounded-lg" value={userIds.map(String)} onChange={e => setUserIds(Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value)))}>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Team associati</label>
            <select multiple className="w-full px-4 py-2 border rounded-lg" value={teamIds.map(String)} onChange={e => setTeamIds(Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value)))}>
              {allTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tag</label>
            <select multiple className="w-full px-4 py-2 border rounded-lg" value={tagIds.map(String)} onChange={e => setTagIds(Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value)))}>
              {allTags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Allegati</label>
            <select multiple className="w-full px-4 py-2 border rounded-lg" value={fileIds.map(String)} onChange={e => setFileIds(Array.from(e.target.selectedOptions).map(opt => parseInt(opt.value)))}>
              {allFiles.map(file => <option key={file.id} value={file.id}>{file.filename}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Annulla</button>
          <div className="flex gap-2">
            {eventData?.id && <button onClick={async () => {
              const conferma = confirm('Sei sicuro di voler eliminare questo evento?');
              if (!conferma) return;
              try {
                const res = await fetch('/api/events', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: eventData.id })
                });
                if (res.ok) {
                  onSave();
                  onClose();
                } else {
                  alert('Errore eliminazione evento');
                }
              } catch (err) {
                console.error('Errore richiesta:', err);
              }
            }} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Elimina</button>}
            <button onClick={async () => {
              const payload = { title, description, start, end, userIds, teamIds, tagIds, fileIds };
              const method = eventData?.id ? 'PUT' : 'POST';
              if (eventData?.id) payload.id = eventData.id;
              try {
                const res = await fetch('/api/events', {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (res.ok) {
                  onSave();
                  onClose();
                } else {
                  alert('Errore salvataggio evento');
                }
              } catch (err) {
                console.error('Errore richiesta:', err);
              }
            }} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Salva</button>
          </div>
        </div>
      </div>
    </div>
  );
} // 🔁 Placeholder di fallback per evitare sintassi monca
