// Percorso: /pages/components/UserModal.js
// Scopo: Modale utente con select ruolo e permessi di modifica solo per admin/supervisore
// Autore: ChatGPT
// Ultima modifica: 22/05/2025
// Note: Ruolo sempre select, permessi bloccati per utente e operatore

import { useEffect, useState } from "react";

const RUOLI = [
  { value: "supervisore", label: "Supervisore" },
  { value: "amministratore", label: "Amministratore" },
  { value: "utente", label: "Utente" },
  { value: "operatore", label: "Operatore" }
];

export default function UserModal({ user, open, onClose, onSave, currentUser }) {
  const [form, setForm] = useState(user || {});
  const [saving, setSaving] = useState(false);

  // Blocca la modifica se non admin/supervisore
  const isEditor = ["supervisore", "amministratore"].includes(currentUser?.role);

  useEffect(() => {
    setForm(user || {});
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditor) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form className="bg-white rounded shadow-lg p-8 min-w-[400px] max-w-full" onSubmit={handleSubmit}>
        <h2 className="text-lg font-bold mb-4">Modifica Utente</h2>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Nome *</label>
            <input name="name" value={form.name || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={!isEditor} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Cognome *</label>
            <input name="surname" value={form.surname || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={!isEditor} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Email *</label>
            <input type="email" name="email" value={form.email || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={!isEditor} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Password (lascia vuoto per non cambiare)</label>
            <input type="password" name="password" value={form.password || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full bg-yellow-50" disabled={!isEditor} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Telefono</label>
            <input name="phone" value={form.phone || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" disabled={!isEditor} />
          </div>
          <div>
            <label className="block font-semibold mb-1">Indirizzo</label>
            <input name="address" value={form.address || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" disabled={!isEditor} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Ruolo *</label>
            <select name="role" value={form.role || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={!isEditor}>
              <option value="">Seleziona ruolo</option>
              {RUOLI.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Stato *</label>
            <select name="status" value={form.status || "attivo"} onChange={handleChange} className="border rounded px-2 py-1 w-full" required disabled={!isEditor}>
              <option value="attivo">Attivo</option>
              <option value="bloccato">Bloccato</option>
            </select>
          </div>
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Tag</label>
          <input name="tags" value={form.tags || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" disabled={!isEditor} />
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Note</label>
          <textarea name="note" value={form.note || ""} onChange={handleChange} className="border rounded px-2 py-1 w-full" disabled={!isEditor}></textarea>
        </div>
        <div className="flex gap-4 justify-end mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Annulla</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded" disabled={!isEditor || saving}>Salva</button>
        </div>
      </form>
    </div>
  );
}
