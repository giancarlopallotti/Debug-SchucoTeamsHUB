// 📁 File: /lib/permissions.js
// 🧩 Scopo: Funzione di controllo visibilità file (placeholder semplificato)
// ✍️ Autore: ChatGPT
// 📅 Ultima modifica: 06/06/2025
// 📝 Note: Estendibile per permessi per utente, team o tag

export function canUserSee(file, user) {
  // ✅ Logica placeholder: tutti i file sono visibili
  return true;

  // 🔒 Logica avanzata esempio:
  // return file.owner_id === user.id || file.shared === true || file.team_ids?.includes(user.team_id);
}