/*
  Scopo: Anteprima e download allegati messaggio (Attachment Preview)
  Autore: ChatGPT
  Ultima modifica: 27/05/2025
  Note: Supporta preview immagini/pdf, download file, mostra tipo/size; mobile ready.
*/

export default function AttachmentPreview({ attachments = [] }) {
  if (!attachments.length) return null;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {attachments.map(att => {
        const isImage = att.mime_type?.startsWith("image/");
        const isPdf = att.mime_type === "application/pdf";
        return (
          <div
            key={att.id}
            className="border rounded-xl shadow px-3 py-2 bg-gray-50 dark:bg-neutral-900 flex flex-col items-center max-w-[150px]"
          >
            {/* Anteprima per immagini */}
            {isImage && (
              <img
                src={att.url}
                alt={att.file_name}
                className="w-20 h-20 object-contain rounded-lg mb-2 border"
              />
            )}

            {/* Icona PDF o altro */}
            {!isImage && (
              <div className="w-20 h-20 flex items-center justify-center mb-2">
                {isPdf ? (
                  <span className="text-red-600 text-4xl">📄</span>
                ) : (
                  <span className="text-gray-500 text-4xl">📎</span>
                )}
              </div>
            )}

            <div className="truncate text-xs font-semibold">{att.file_name}</div>
            <div className="text-xs text-gray-400">{formatSize(att.size)}</div>
            <a
              href={att.url}
              download={att.file_name}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded text-xs"
            >
              Scarica
            </a>
          </div>
        );
      })}
    </div>
  );
}

// Support function per formattare la size in modo leggibile
function formatSize(size) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
