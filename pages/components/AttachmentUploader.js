// Percorso: /pages/components/AttachmentUploader.js
import { useState, useRef } from "react";
import AttachmentPreviewAdvanced from "./AttachmentPreviewAdvanced";

export default function AttachmentUploader({ messageId, onUploaded, attachments = [] }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function handleChange(e) {
    uploadFiles(e.target.files);
  }

  function uploadFiles(fileList) {
    if (!messageId) return alert("Messaggio non ancora creato.");
    Array.from(fileList).forEach(file => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("message_id", messageId);
      fetch("/api/messages/attachments", {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) onUploaded && onUploaded();
        });
    });
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"} rounded-xl p-4 mb-3 text-center cursor-pointer`}
      style={{ minHeight: 90 }}
      onClick={() => inputRef.current.click()}
      title="Trascina o clicca per caricare"
    >
      <input
        type="file"
        ref={inputRef}
        multiple
        style={{ display: "none" }}
        onChange={handleChange}
      />
      <div className="text-gray-500">Trascina qui i file o <span className="underline">clicca per caricare</span></div>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {attachments.map(att => (
          <AttachmentPreviewAdvanced key={att.id} attachment={att} />
        ))}
      </div>
    </div>
  );
}
