"use client";

import React from "react";
import { Message } from "@/lib/api";
import {
  Check,
  CheckCheck,
  FileDown,
  Pencil,
} from "lucide-react";

interface MessageBubbleProps {
  msg: Message;
  isOut: boolean;
  isFirstOfBlock: boolean;
  avatarColor?: string;
  contactName?: string;
  meName?: string;
  isHighlighted: boolean;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  editingText: string;
  setEditingText: (text: string) => void;
  handleSaveEdit: (msg: Message) => void;
  setPreviewImageUrl: (url: string | null) => void;
  isMessageEditable: (msg: Message) => boolean;
  getOriginalOrEditedBody: (msg: Message) => string;
}

export function MessageBubble({
  msg,
  isOut,
  isFirstOfBlock,
  avatarColor = "#9ca3af",
  contactName = "Contato",
  meName = "Você",
  isHighlighted,
  editingMessageId,
  setEditingMessageId,
  editingText,
  setEditingText,
  handleSaveEdit,
  setPreviewImageUrl,
  isMessageEditable,
  getOriginalOrEditedBody,
}: MessageBubbleProps) {
  const editedBody = getOriginalOrEditedBody(msg);
  const wasEdited = editedBody !== msg.body;

  let isFile = false;
  let fileData: any = null;

  if (msg.body.startsWith('{"type":"file"')) {
    try {
      fileData = JSON.parse(msg.body);
      isFile = fileData.type === "file";
    } catch {
      isFile = false;
    }
  }

  const MessageStatusIcon = ({
    status,
  }: {
    status: "sent" | "delivered" | "read";
  }) => {
    if (status === "sent") {
      return <Check className="w-3 h-3 text-neutral-400" strokeWidth={2} />;
    }
    if (status === "delivered") {
      return <CheckCheck className="w-4 h-4 text-neutral-400" strokeWidth={2} />;
    }
    return <CheckCheck className="w-4 h-4 text-blue-500" strokeWidth={2} />;
  };

  const isEditing = editingMessageId === msg.id;

  return (
    <div
      id={`msg-${msg.id}`}
      className={`flex items-start gap-1.5 md:gap-2.5 ${
        isOut ? "justify-end" : "justify-start"
      } group`}
    >
      {!isOut && (
        isFirstOfBlock ? (
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-[10px] md:text-[11px] font-bold shrink-0 shadow-inner select-none animate-in fade-in zoom-in-90 duration-150"
            style={{ backgroundColor: avatarColor }}
          >
            {contactName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
        )
      )}

      {isOut && !isFile && isMessageEditable(msg) && !isEditing && (
        <button
          onClick={() => {
            setEditingMessageId(msg.id);
            setEditingText(getOriginalOrEditedBody(msg));
          }}
          className="self-center p-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 shadow-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer mr-1 border border-neutral-200/50"
          title="Editar mensagem"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <div
        className={`flex flex-col max-w-[80%] md:max-w-[70%] ${
          isOut ? "items-end" : "items-start"
        }`}
      >
        {isFirstOfBlock && (
          <span className="text-[9px] md:text-[10px] font-bold text-neutral-500 mb-0.5 px-1 select-none animate-in fade-in duration-150">
            {isOut ? meName : contactName}
          </span>
        )}

        <div
          className={`w-full px-3.5 py-1.5 md:py-2 rounded-2xl shadow-sm text-sm transition-all duration-300 ${
            isOut
              ? `bg-[#D9FDD3] text-neutral-900 ${isFirstOfBlock ? "rounded-tr-none" : ""}`
              : `bg-white text-neutral-900 ${isFirstOfBlock ? "rounded-tl-none" : ""}`
          } ${
            isHighlighted
              ? "ring-4 ring-yellow-400 ring-offset-2 scale-102 border-yellow-300"
              : "border-transparent"
          }`}
        >
          {isFile && fileData ? (
            fileData.fileType.startsWith("image/") ? (
              <div className="flex flex-col gap-1.5">
                <img
                  src={fileData.data}
                  alt={fileData.fileName}
                  className="max-w-full max-h-60 rounded-lg object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setPreviewImageUrl(fileData.data)}
                />
                {fileData.caption && (
                  <p className="whitespace-pre-wrap break-words text-sm mt-0.5">
                    {fileData.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <a
                  href={fileData.data}
                  download={fileData.fileName}
                  className="flex items-center gap-2.5 p-2 bg-black/5 rounded-lg border border-black/10 hover:bg-black/10 transition-colors"
                >
                  <div className="p-1.5 bg-white rounded text-neutral-600">
                    <FileDown className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-neutral-850">
                      {fileData.fileName}
                    </p>
                    <p className="text-[10px] text-neutral-500">Clique para baixar</p>
                  </div>
                </a>
                {fileData.caption && (
                  <p className="whitespace-pre-wrap break-words text-sm mt-0.5">
                    {fileData.caption}
                  </p>
                )}
              </div>
            )
          ) : isEditing ? (
            <div className="flex flex-col gap-1.5 py-1 min-w-[200px] text-neutral-800">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit(msg);
                  }
                }}
                className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-neutral-800"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingMessageId(null)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold text-neutral-500 hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(msg)}
                  className="px-2 py-1 rounded-md text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{editedBody}</p>
          )}

          <div
            className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
              isOut ? "text-green-700" : "text-neutral-400"
            }`}
          >
            {wasEdited && (
              <span className="text-[9px] font-semibold opacity-75 mr-1" title="Mensagem editada">
                (editada)
              </span>
            )}
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

      {isOut && (
        isFirstOfBlock ? (
          <div
            className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-[10px] md:text-[11px] font-bold shrink-0 shadow-inner select-none animate-in fade-in zoom-in-90 duration-150"
            style={{ backgroundColor: "#2563eb" }}
          >
            {meName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
        )
      )}
    </div>
  );
}
