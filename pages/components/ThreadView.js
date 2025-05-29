// ==================================================================
// Percorso: /pages/components/ThreadView.js
// Scopo: Visualizza messaggi di un thread, reply, allegati, azioni rapide
// Autore: ChatGPT
// Ultima modifica: 28/05/2025
// Note: Integrato API avanzate, supporto reply, tagging, allegati
// ==================================================================

import React, { useEffect, useState, useRef } from "react";
import MessageActions from "./MessageActions";
import AttachmentPreview from "./AttachmentPreview";
import TagSelector from "./TagSelector";
import MessageComposerModal from "./MessageComposerModal";

export default function ThreadView({ threadId, onThreadRefresh }) {
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!threadId) return;
    // Carica tutti i messaggi del thread
    async function fetchThread() {
      const res = await fetch(`/api/messages/thread/${threadId}`);
      const data = await res.json();
      setThread(data.thread || null);
      setMessages(data.messages || []);
      setTimeout(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    fetchThread();
  }, [threadId, showReplyModal]);

  if (!threadId) return (
    <div className="flex-1 flex items-center justify-center text-gray-400">
      Seleziona una conversazione per vedere i messaggi.
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header thread */}
      <div className="p-4 border-b bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-bold text-lg">
            {thread?.title || "Conversazione"}
          </div>
          <div className="text-xs text-gray-500">
            {thread?.type && <>Tipo: {thread.type} | </>}
            {thread?.linked_type && thread?.linked_id && (
              <>Collegato a: {thread.linked_type} #{thread.linked_id}</>
            )}
          </div>
        </div>
        <div className="mt-2 md:mt-0 flex gap-2">
          {/* Azioni su thread (es: archivia) eventualmente qui */}
          {/* ... */}
        </div>
      </div>
      {/* Messaggi nel thread */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 && (
          <div className="text-center text-gray-400">Nessun messaggio in questa conversazione.</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="rounded-xl bg-white dark:bg-slate-800 shadow-sm p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{msg.subject || "Messaggio"}</div>
                <div className="text-sm whitespace-pre-line">{msg.body}</div>
                {msg.attachment_urls && JSON.parse(msg.attachment_urls || "[]").length > 0 && (
                  <AttachmentPreview urls={JSON.parse(msg.attachment_urls)} />
                )}
                {msg.tags && JSON.parse(msg.tags || "[]").length > 0 && (
                  <div className="mt-1">
                    <TagSelector value={JSON.parse(msg.tags)} readOnly />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end text-xs text-gray-500">
                <span>{msg.created_at && new Date(msg.created_at).toLocaleString()}</span>
                {/* Altri badge: reply, archiviato, preferito */}
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <MessageActions
                message={msg}
                onReply={() => {
                  setReplyTo(msg);
                  setShowReplyModal(true);
                }}
                onRefresh={onThreadRefresh}
              />
            </div>
          </div>
        ))}
        {/* Ancoraggio in fondo per scroll automatico */}
        <div ref={bottomRef}></div>
      </div>
      {/* Reply/Composer modal */}
      <MessageComposerModal
        show={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        parentMessage={replyTo}
        threadId={threadId}
        onSent={onThreadRefresh}
      />
    </div>
  );
}
