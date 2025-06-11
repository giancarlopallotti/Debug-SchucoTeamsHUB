// Percorso: /components/FileTable.js
// Tabella visualizzazione file, filtri e azioni
// Autore: ChatGPT – 25/05/2025

export default function FileTable({ files, loading, error }) {
  return (
    <>
      {error && <div className="text-red-600 mb-2 text-xs">{error}</div>}
      {loading ? (
        <div className="text-xs">Caricamento...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm bg-white rounded-xl overflow-hidden">
            <thead>
              <tr>
                <th className="p-2 font-semibold text-left">Nome</th>
                <th className="p-2 font-semibold text-left">Tipo</th>
                <th className="p-2 font-semibold text-left">Dimensione</th>
                <th className="p-2 font-semibold text-left">Tag</th>
                <th className="p-2 font-semibold text-left">Note</th>
                <th className="p-2 font-semibold text-left">Utente</th>
                <th className="p-2 font-semibold text-left">Data upload</th>
                <th className="p-2 font-semibold text-left">Pubblico</th>
                <th className="p-2 font-semibold text-left">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    Nessun file trovato.
                  </td>
                </tr>
              ) : (
                files.map(f => (
                  <tr key={f.id} className="border-b last:border-b-0">
                    <td className="p-2">{f.name}</td>
                    <td className="p-2">{f.type}</td>
                    <td className="p-2">{f.size ? (f.size / 1024).toFixed(1) + " KB" : ""}</td>
                    <td className="p-2">
                      {Array.isArray(f.tags)
                        ? f.tags.map((tag, idx) => (
                            <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xxs mr-1 mb-1">{tag}</span>
                          ))
                        : null}
                    </td>
                    <td className="p-2 max-w-[120px] truncate" title={f.note || ""}>
                      {f.note}
                    </td>
                    <td className="p-2">{f.user_name || f.user || ""}</td>
                    <td className="p-2">{f.created_at ? new Date(f.created_at).toLocaleString() : ""}</td>
                    <td className="p-2">
                      {f.is_public ? <span className="text-green-700 font-semibold">Pubblico</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="p-2">
                      <a
                        href={f.url || f.path || "#"}
                        download
                        className="text-blue-700 hover:underline mr-1"
                        title="Download"
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "12px" }}
                      >Scarica</a>
                      <button
                        className="text-red-600 hover:underline"
                        style={{ fontSize: "12px" }}
                        onClick={() => alert("Funzione elimina/disponibile a breve!")}
                        disabled
                        title="Elimina file (prossimamente)"
                      >Elimina</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
