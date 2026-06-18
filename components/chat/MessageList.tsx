"use client";

import React from "react";
import { Message, Conversation } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages?: Message[];
  isLoading: boolean;
  chatInfo?: Conversation;
  meName?: string;
  highlightedMessageId: string | null;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  editingText: string;
  setEditingText: (text: string) => void;
  handleSaveEdit: (msg: Message) => void;
  setPreviewImageUrl: (url: string | null) => void;
  isMessageEditable: (msg: Message) => boolean;
  getOriginalOrEditedBody: (msg: Message) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function formatDateLabel(isoString: string) {
  try {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    }
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function MessageList({
  messages = [],
  isLoading,
  chatInfo,
  meName,
  highlightedMessageId,
  editingMessageId,
  setEditingMessageId,
  editingText,
  setEditingText,
  handleSaveEdit,
  setPreviewImageUrl,
  isMessageEditable,
  getOriginalOrEditedBody,
  messagesEndRef,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
      {isLoading && (
        <div className="text-center text-neutral-500 mt-4 select-none">
          Carregando mensagens...
        </div>
      )}

      {!isLoading && messages.length === 0 && (
        <div className="text-center text-neutral-400 mt-8 select-none text-xs">
          Nenhuma mensagem nesta conversa.
        </div>
      )}

      {messages.map((msg, index) => {
        const isOut = msg.direction === "out";
        const msgDate = new Date(msg.createdAt).toDateString();
        const prevMsgDate =
          index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
        const showDivider = msgDate !== prevMsgDate;

        const isFirstOfBlock =
          index === 0 ||
          messages[index - 1].direction !== msg.direction ||
          showDivider;

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              isFirstOfBlock && index > 0 ? "mt-4" : "mt-1"
            }`}
          >
            {showDivider && (
              <div className="flex items-center justify-center my-3 select-none">
                <span className="bg-white/80 backdrop-blur-xs border border-neutral-200/50 text-neutral-500 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                  {formatDateLabel(msg.createdAt)}
                </span>
              </div>
            )}

            <MessageBubble
              msg={msg}
              isOut={isOut}
              isFirstOfBlock={isFirstOfBlock}
              avatarColor={chatInfo?.avatarColor}
              contactName={chatInfo?.contactName}
              meName={meName}
              isHighlighted={highlightedMessageId === msg.id}
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
              editingText={editingText}
              setEditingText={setEditingText}
              handleSaveEdit={handleSaveEdit}
              setPreviewImageUrl={setPreviewImageUrl}
              isMessageEditable={isMessageEditable}
              getOriginalOrEditedBody={getOriginalOrEditedBody}
            />
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
}
