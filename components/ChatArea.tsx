"use client";

import { useEffect, useRef } from "react";
import {
  useMessages,
  useSendMessage,
  useAiSuggestion,
  useConversations,
} from "@/hooks/useApi";
import { useDraft } from "@/hooks/useDraft";

export function ChatArea({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: suggestReply, isPending: isSuggesting } = useAiSuggestion();
  const { draft, updateDraft, clearDraft } = useDraft(conversationId);

  const { data: conversations } = useConversations();
  const chatInfo = conversations?.find((c) => c.id === conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!draft.trim()) return;
    sendMessage({ id: conversationId, text: draft.trim() });
    clearDraft();
  };

  const handleAiSuggest = () => {
    suggestReply(conversationId, {
      onSuccess: (data) => updateDraft(data.suggestion),
    });
  };

  const MessageStatusIcon = ({
    status,
  }: {
    status: "sent" | "delivered" | "read";
  }) => {
    if (status === "sent") {
      return (
        <svg
          className="w-3 h-3 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }
    if (status === "delivered") {
      return (
        <svg
          className="w-4 h-4 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7M5 18l4 4L19 12"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7M5 18l4 4L19 12"
        />
      </svg>
    );
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 text-neutral-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EFEAE2]">
      {/* Header do Chat */}
      <div className="bg-white px-6 py-4 border-b border-neutral-200 flex items-center gap-4">
        {chatInfo && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: chatInfo.avatarColor || "#ccc" }}
          >
            {chatInfo.contactName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-medium text-neutral-900">
            {chatInfo?.contactName || "Carregando..."}
          </h2>
          <p className="text-xs text-neutral-500">{chatInfo?.contactPhone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {isLoading && (
          <div className="text-center text-neutral-500 mt-4">
            Carregando mensagens...
          </div>
        )}

        {messages?.map((msg) => {
          const isOut = msg.direction === "out";
          return (
            <div
              key={msg.id}
              className={`flex ${isOut ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                  isOut
                    ? "bg-[#D9FDD3] text-neutral-900 rounded-tr-none"
                    : "bg-white text-neutral-900 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.body}</p>
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isOut ? "text-green-700" : "text-neutral-400"}`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isOut && <MessageStatusIcon status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t border-neutral-200">
        <div className="flex justify-between mb-2">
          <button
            onClick={handleAiSuggest}
            disabled={isSuggesting}
            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
            title="A IA analisará o contexto e sugerirá uma resposta"
          >
            ✨ {isSuggesting ? "Pensando..." : "Sugerir resposta com IA"}
          </button>
        </div>
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            value={draft}
            onChange={(e) => updateDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 max-h-32 min-h-[44px] bg-neutral-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white rounded-full p-3 h-[44px] w-[44px] flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
