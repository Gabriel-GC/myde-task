"use client";

import React, { forwardRef } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ChatSearchBarProps {
  chatSearchQuery: string;
  setChatSearchQuery: (query: string) => void;
  searchMatches: string[];
  currentMatchIndex: number;
  handleChatSearch: (e: React.FormEvent) => void;
  handlePrevMatch: () => void;
  handleNextMatch: () => void;
  searchError: boolean;
  onClose: () => void;
}

export const ChatSearchBar = forwardRef<HTMLInputElement, ChatSearchBarProps>(
  (
    {
      chatSearchQuery,
      setChatSearchQuery,
      searchMatches,
      currentMatchIndex,
      handleChatSearch,
      handlePrevMatch,
      handleNextMatch,
      searchError,
      onClose,
    },
    ref
  ) => {
    return (
      <div className="bg-white border-b border-neutral-200 px-3 py-2 flex items-center gap-2 animate-in slide-in-from-top duration-150 z-20">
        <form onSubmit={handleChatSearch} className="flex-1 flex items-center relative">
          <span className="absolute left-3 text-neutral-400 pointer-events-none z-10">
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </span>

          <input
            ref={ref}
            type="text"
            value={chatSearchQuery}
            onChange={(e) => {
              setChatSearchQuery(e.target.value);
            }}
            placeholder="Buscar na conversa..."
            className="w-full bg-neutral-100 rounded-lg pl-9 pr-22 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-transparent text-neutral-800"
          />

          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            {searchMatches.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold select-none">
                <span>
                  {currentMatchIndex + 1}/{searchMatches.length}
                </span>
                <div className="flex">
                  <button
                    type="button"
                    onClick={handlePrevMatch}
                    className="p-0.5 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    className="p-0.5 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer"
                    title="Próxima"
                  >
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {searchError && (
              <span className="text-[10px] text-red-500 font-extrabold select-none animate-pulse pr-1">
                Não encontrado
              </span>
            )}
          </div>
        </form>

        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          title="Fechar busca"
        >
          <X className="w-4.5 h-4.5" strokeWidth={2} />
        </button>
      </div>
    );
  }
);

ChatSearchBar.displayName = "ChatSearchBar";
