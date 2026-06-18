"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  Copy,
  Check,
  Smile,
  Paperclip,
  Sparkles,
  Send,
  FileDown,
} from "lucide-react";

const EMOJIS = [
  "😊", "😂", "🤣", "😍", "🥰", "😎", "😉", "😅",
  "😭", "😱", "😡", "🤔", "😴", "🙄", "🥳", "😐",
  "👍", "👎", "👏", "🙌", "🙏", "🤝", "✌️", "👋",
  "❤️", "💙", "🔥", "✨", "🎉", "💯", "🚀", "💡",
];

interface ChatInputAreaProps {
  draft: string;
  updateDraft: (text: string) => void;
  clearDraft: () => void;
  handleSend: (e?: React.FormEvent) => void;
  aiEnabled: boolean;
  isSuggesting: boolean;
  aiSuggestion: string | null;
  setAiSuggestion: (s: string | null) => void;
  handleAiSuggest: () => void;
  attachment: any;
  setAttachment: (a: any) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleAttachmentClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredMacros: any[];
  activeMacroIndex: number;
  setActiveMacroIndex: React.Dispatch<React.SetStateAction<number>>;
  handleSelectMacro: (text: string) => void;
  enterToSend: boolean;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function ChatInputArea({
  draft,
  updateDraft,
  clearDraft,
  handleSend,
  aiEnabled,
  isSuggesting,
  aiSuggestion,
  setAiSuggestion,
  handleAiSuggest,
  attachment,
  setAttachment,
  showEmojiPicker,
  setShowEmojiPicker,
  textareaRef,
  fileInputRef,
  handleAttachmentClick,
  handleFileChange,
  filteredMacros,
  activeMacroIndex,
  setActiveMacroIndex,
  handleSelectMacro,
  enterToSend,
  showToast,
}: ChatInputAreaProps) {
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [textareaRows, setTextareaRows] = useState(1);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const sh = textarea.scrollHeight;
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const maxHeight = isMobile ? 76 : 128;
      textarea.style.height = `${Math.max(36, Math.min(sh, maxHeight))}px`;
      setIsMultiLine(sh > 40 || draft.includes("\n"));
      if (isMobile && draft.trim().length > 0 && sh > 72) {
        setTextareaRows(3);
      } else {
        setTextareaRows(1);
      }
    }
  }, [draft, textareaRef]);

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      const newDraft = before + emoji + after;
      updateDraft(newDraft);

      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + emoji.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      updateDraft(draft + emoji);
    }
  };

  return (
    <div className="bg-white p-3 md:p-4 border-t border-neutral-200">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
      />

      <div className="mx-auto w-full relative">
        {showEmojiPicker && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 sm:left-4 sm:right-auto sm:w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="aspect-square w-full flex items-center justify-center text-lg rounded-lg hover:bg-neutral-100 transition-colors active:scale-95 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredMacros.length > 0 && (
          <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 sm:left-4 sm:right-auto sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 p-2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 flex flex-col gap-1 max-h-60 overflow-y-auto">
            {filteredMacros.map((macro, idx) => (
              <button
                key={macro.id}
                type="button"
                onClick={() => handleSelectMacro(macro.text)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex flex-col gap-0.5 cursor-pointer ${
                  idx === activeMacroIndex
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-neutral-100 text-neutral-800"
                }`}
              >
                <span
                  className={`font-bold ${
                    idx === activeMacroIndex ? "text-white" : "text-blue-600"
                  }`}
                >
                  /{macro.shortcut}
                </span>
                <span
                  className={`truncate w-full text-[10px] ${
                    idx === activeMacroIndex ? "text-blue-100" : "text-neutral-500"
                  }`}
                >
                  {macro.text}
                </span>
              </button>
            ))}
          </div>
        )}

        {attachment && (
          <div className="mb-3.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3 min-w-0">
              {attachment.type.startsWith("image/") ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="w-11 h-11 rounded-lg object-cover border border-neutral-200 shrink-0"
                />
              ) : (
                <div className="w-11 h-11 bg-neutral-200 rounded-lg flex items-center justify-center text-neutral-600 shrink-0">
                  <FileDown className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-705 truncate">
                  {attachment.name}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {aiEnabled && (isSuggesting || aiSuggestion) && (
          <div className="mb-3.5 p-3 bg-blue-50/50 backdrop-blur-xs rounded-xl border border-blue-100/80 flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-200 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider select-none">
                <Zap className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                Sugestão da IA
              </span>
              {!isSuggesting && aiSuggestion && (
                <button
                  type="button"
                  onClick={() => setAiSuggestion(null)}
                  className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Descartar sugestão"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            {isSuggesting ? (
              <div className="flex flex-col gap-1.5 py-1">
                <div className="h-3 bg-blue-100 rounded animate-pulse w-full" />
                <div className="h-3 bg-blue-100 rounded animate-pulse w-3/4" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-neutral-850 leading-relaxed break-words italic bg-white/70 p-2.5 rounded-lg border border-blue-50/50">
                  &quot;{aiSuggestion}&quot;
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(aiSuggestion || "");
                      showToast("Sugestão copiada!", "success");
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-neutral-600 bg-white hover:bg-neutral-50 border border-neutral-200 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-neutral-400" />
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateDraft(aiSuggestion || "");
                      setAiSuggestion(null);
                      textareaRef.current?.focus();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3 h-3 text-white" />
                    Usar resposta
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className={`w-full flex flex-col md:flex-row md:items-end md:gap-2 bg-neutral-50/80 border border-neutral-200/60 p-2 transition-all duration-300 focus-within:bg-white focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-500/10 ${
            isMultiLine ? "rounded-2xl" : "rounded-3xl md:rounded-full"
          }`}
        >
          <div className="hidden md:flex items-center gap-1.5 pb-0.5">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 rounded-full transition-colors cursor-pointer"
              title="Inserir emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleAttachmentClick}
              className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 rounded-full transition-colors cursor-pointer"
              title="Anexar arquivo"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={textareaRows}
            value={draft}
            onChange={(e) => updateDraft(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-1.5 focus:outline-none resize-none max-h-32 text-neutral-800 placeholder-neutral-400"
            onKeyDown={(e) => {
              if (filteredMacros.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveMacroIndex((prev) => (prev + 1) % filteredMacros.length);
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveMacroIndex(
                    (prev) => (prev - 1 + filteredMacros.length) % filteredMacros.length
                  );
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSelectMacro(filteredMacros[activeMacroIndex].text);
                  return;
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  updateDraft(draft.replace(/\/([a-zA-Z0-9]*)$/, ""));
                  return;
                }
              }
              if (e.key === "Enter" && !e.shiftKey) {
                if (enterToSend) {
                  e.preventDefault();
                  handleSend();
                }
              }
            }}
          />

          <div className="hidden md:flex items-center gap-1.5 pb-0.5">
            {aiEnabled && (
              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isSuggesting}
                className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                title="Sugestão de resposta com IA"
              >
                <Sparkles
                  className={`w-5 h-5 ${isSuggesting ? "animate-spin text-blue-500" : ""}`}
                />
              </button>
            )}
            <button
              type="submit"
              disabled={!draft.trim() && !attachment}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white disabled:text-neutral-400 transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
              title="Enviar"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex md:hidden items-center justify-between w-full mt-2 pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 rounded-full transition-colors cursor-pointer"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleAttachmentClick}
                className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/50 rounded-full transition-colors cursor-pointer"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isSuggesting}
                  className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles
                    className={`w-5 h-5 ${isSuggesting ? "animate-spin text-blue-500" : ""}`}
                  />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!draft.trim() && !attachment}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white disabled:text-neutral-400 transition-all cursor-pointer active:scale-95 shrink-0 shadow-xs"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
