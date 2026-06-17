"use client";

import { useEffect, useRef, useState } from "react";
import {
  useMessages,
  useSendMessage,
  useAiSuggestion,
  useConversations,
  useMe,
} from "@/hooks/useApi";
import { useDraft } from "@/hooks/useDraft";
import { Search, ChevronLeft, ChevronRight, X, Check, CheckCheck, MessageSquare, FileDown, Zap, Sparkles, Copy, Smile, Paperclip, Send, Pencil } from "lucide-react";

const EMOJIS = [
  "😊", "😂", "🤣", "😍", "🥰", "😎", "😉", "😅",
  "😭", "😱", "😡", "🤔", "😴", "🙄", "🥳", "😐",
  "👍", "👎", "👏", "🙌", "🙏", "🤝", "✌️", "👋",
  "❤️", "💙", "🔥", "✨", "🎉", "💯", "🚀", "💡"
];

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

export function ChatArea({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: suggestReply, isPending: isSuggesting } = useAiSuggestion();
  const { draft, updateDraft, clearDraft } = useDraft(conversationId);

  const { data: conversations } = useConversations();
  const chatInfo = conversations?.find((c) => c.id === conversationId);
  const { data: me } = useMe();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastConversationIdRef = useRef<string | null>(null);
  const hasScrolledRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showSearch]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const sh = textarea.scrollHeight;
      textarea.style.height = `${Math.max(36, Math.min(sh, 128))}px`;
      setIsMultiLine(sh > 40 || draft.includes("\n"));
    }
  }, [draft, conversationId]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const [aiEnabled, setAiEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myde_ai_enabled") !== "false";
    }
    return true;
  });
  const [soundAlerts, setSoundAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myde_sound_alerts") !== "false";
    }
    return true;
  });

  const [macros, setMacros] = useState<Array<{ id: string; shortcut: string; text: string }>>([]);
  const [activeMacroIndex, setActiveMacroIndex] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    const handleEdit = () => setEditCount((prev) => prev + 1);
    window.addEventListener("myde_message_edited", handleEdit);
    return () => window.removeEventListener("myde_message_edited", handleEdit);
  }, []);

  useEffect(() => {
    const loadMacros = () => {
      const saved = localStorage.getItem("myde_macros");
      if (saved) {
        setMacros(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "1", shortcut: "saudacao", text: "Olá! Seja muito bem-vindo ao suporte da Myde. Como posso ajudar você hoje?" },
          { id: "2", shortcut: "pix", text: "Nossa chave PIX CNPJ é: 12.345.678/0001-90. Após realizar o pagamento, envie o comprovante por aqui!" },
          { id: "3", shortcut: "suporte", text: "Seu caso foi encaminhado para nossa equipe técnica de segundo nível. Entraremos em contato em até 2 horas." },
          { id: "4", shortcut: "obrigado", text: "Muito obrigado pelo contato! Se precisar de mais alguma coisa, ficamos à inteira disposição. Tenha um ótimo dia!" }
        ];
        localStorage.setItem("myde_macros", JSON.stringify(defaults));
        setMacros(defaults);
      }
    };
    loadMacros();
    window.addEventListener("myde_macros_changed", loadMacros);
    return () => window.removeEventListener("myde_macros_changed", loadMacros);
  }, []);

  const getMacroQuery = (text: string) => {
    const match = text.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    return match ? match[1] : null;
  };

  const handleSelectMacro = (macroText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const text = draft;
    const match = text.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    if (match && match.index !== undefined) {
      const slashIndex = text.lastIndexOf("/", textarea.selectionStart || text.length);
      if (slashIndex !== -1) {
        const before = text.substring(0, slashIndex);
        const after = text.substring(textarea.selectionStart || text.length);
        const newText = before + macroText + after;
        updateDraft(newText);
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = before.length + macroText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }
    }
  };

  const getOriginalOrEditedBody = (msg: any) => {
    if (typeof window !== "undefined") {
      const edited = localStorage.getItem(`myde_edited_${msg.id}`);
      if (edited) return edited;
    }
    return msg.body;
  };

  const isMessageEditable = (msg: any) => {
    if (msg.direction !== "out") return false;
    if (msg.body.startsWith('{"type":"file"')) return false;
    const sentMsgs = messages?.filter(m => m.direction === "out" && !m.body.startsWith('{"type":"file"')) || [];
    const lastTwoSent = sentMsgs.slice(-2);
    const isOneOfLastTwo = lastTwoSent.some(m => m.id === msg.id);
    if (!isOneOfLastTwo) return false;
    const diffMs = Date.now() - new Date(msg.createdAt).getTime();
    return diffMs < 60000;
  };

  const handleSaveEdit = (msg: any) => {
    const diffMs = Date.now() - new Date(msg.createdAt).getTime();
    if (diffMs > 60000) {
      alert("O tempo limite de 1 minuto para edição expirou.");
      setEditingMessageId(null);
      return;
    }
    const cleanText = editingText.trim();
    if (!cleanText) return;
    localStorage.setItem(`myde_edited_${msg.id}`, cleanText);
    const sentMsgs = messages?.filter(m => m.direction === "out") || [];
    const isLastMessage = sentMsgs.length > 0 && sentMsgs[sentMsgs.length - 1].id === msg.id;
    if (isLastMessage) {
      localStorage.setItem(
        `myde_last_edited_${conversationId}`,
        JSON.stringify({ editedText: cleanText, originalText: msg.body })
      );
    }
    window.dispatchEvent(new Event("myde_message_edited"));
    setEditingMessageId(null);
  };

  const query = getMacroQuery(draft);
  const filteredMacros = query !== null
    ? macros.filter(macro => macro.shortcut.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    setActiveMacroIndex(0);
  }, [filteredMacros.length]);

  const [enterToSend, setEnterToSend] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myde_enter_to_send") !== "false";
    }
    return true;
  });
  const [chatBg, setChatBg] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myde_chat_bg") || "#EFEAE2";
    }
    return "#EFEAE2";
  });

  useEffect(() => {
    const updateSettings = () => {
      const ai = localStorage.getItem("myde_ai_enabled") !== "false";
      setAiEnabled(ai);
      if (!ai) {
        setAiSuggestion(null);
      }
      setSoundAlerts(localStorage.getItem("myde_sound_alerts") !== "false");
      setEnterToSend(localStorage.getItem("myde_enter_to_send") !== "false");
      setChatBg(localStorage.getItem("myde_chat_bg") || "#EFEAE2");
    };
    window.addEventListener("myde_settings_changed", updateSettings);
    return () => window.removeEventListener("myde_settings_changed", updateSettings);
  }, []);

  const lastMsgIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsgIdRef.current && lastMsgIdRef.current !== lastMsg.id && lastMsg.direction === "in") {
      if (soundAlerts) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }
    lastMsgIdRef.current = lastMsg.id;
  }, [messages, soundAlerts]);

  if (lastConversationIdRef.current !== conversationId) {
    lastConversationIdRef.current = conversationId;
    hasScrolledRef.current = false;
    setShowEmojiPicker(false);
    setAiSuggestion(null);
    setAttachment(null);
    setPreviewImageUrl(null);
    setShowSearch(false);
    setChatSearchQuery("");
    setHighlightedMessageId(null);
    setSearchError(false);
    setSearchMatches([]);
    setCurrentMatchIndex(0);
    setIsMultiLine(false);
    lastMsgIdRef.current = null;
    setActiveMacroIndex(0);
  }

  useEffect(() => {
    if (!messages) return;
    if (!hasScrolledRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (attachment) {
      const payload = JSON.stringify({
        type: "file",
        fileType: attachment.type,
        fileName: attachment.name,
        data: attachment.dataUrl,
        caption: draft.trim() || undefined
      });
      sendMessage({ id: conversationId, text: payload });
      setAttachment(null);
      clearDraft();
    } else {
      if (!draft.trim()) return;
      sendMessage({ id: conversationId, text: draft.trim() });
      clearDraft();
    }
  };

  const handleAiSuggest = () => {
    setAiSuggestion(null);
    suggestReply(conversationId, {
      onSuccess: (data) => setAiSuggestion(data.suggestion),
    });
  };

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

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Por favor, selecione um arquivo de até 1.5MB para garantir o envio.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAttachment({
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const scrollToMessage = (id: string) => {
    setHighlightedMessageId(id);
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      setHighlightedMessageId(null);
    }, 2500);
  };

  const handleChatSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatSearchQuery.trim() || !messages) return;

    const query = chatSearchQuery.toLowerCase().trim();
    const matches = messages.filter((m) => {
      if (m.body.startsWith('{"type":"file"')) {
        try {
          const parsed = JSON.parse(m.body);
          return parsed.caption && parsed.caption.toLowerCase().includes(query);
        } catch {
          return false;
        }
      }
      return m.body.toLowerCase().includes(query);
    });

    if (matches.length > 0) {
      setSearchError(false);
      const matchIds = matches.map((m) => m.id);
      setSearchMatches(matchIds);
      setCurrentMatchIndex(0);
      scrollToMessage(matchIds[0]);
    } else {
      setSearchError(true);
      setSearchMatches([]);
      setTimeout(() => setSearchError(false), 3000);
    }
  };

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMessage(searchMatches[nextIndex]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIndex);
    scrollToMessage(searchMatches[prevIndex]);
  };

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

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 text-neutral-400">
        <MessageSquare className="w-16 h-16 mb-4" strokeWidth={1} />
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative" style={{ backgroundColor: chatBg }}>
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}

      <div className="bg-white pl-14 pr-4 py-3.5 md:px-6 md:py-4 border-b border-neutral-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {chatInfo && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shrink-0"
              style={{ backgroundColor: chatInfo.avatarColor || "#ccc" }}
            >
              {chatInfo.contactName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-neutral-900 truncate text-sm md:text-base">
              {chatInfo?.contactName || "Carregando..."}
            </h2>
            <p className="text-xs text-neutral-500 truncate">{chatInfo?.contactPhone}</p>
          </div>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-all cursor-pointer ${
            showSearch ? "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200" : ""
          }`}
          title="Buscar mensagens"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {showSearch && (
        <div className="bg-white border-b border-neutral-200 px-3 py-2 flex items-center gap-2 animate-in slide-in-from-top duration-150 z-20">
          <form onSubmit={handleChatSearch} className="flex-1 flex items-center relative">
            <span className="absolute left-3 text-neutral-400 pointer-events-none z-10">
              <Search className="w-4 h-4" strokeWidth={2.5} />
            </span>
            
            <input
              ref={searchInputRef}
              type="text"
              value={chatSearchQuery}
              onChange={(e) => {
                setChatSearchQuery(e.target.value);
                setSearchMatches([]);
              }}
              placeholder="Buscar na conversa..."
              className="w-full bg-neutral-100 rounded-lg pl-9 pr-22 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all border border-transparent"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
              {searchMatches.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold select-none">
                  <span>{currentMatchIndex + 1}/{searchMatches.length}</span>
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
            onClick={() => {
              setShowSearch(false);
              setChatSearchQuery("");
              setSearchMatches([]);
            }}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
            title="Fechar busca"
          >
            <X className="w-4.5 h-4.5" strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
        {isLoading && (
          <div className="text-center text-neutral-500 mt-4">
            Carregando mensagens...
          </div>
        )}

        {messages?.map((msg, index) => {
          const isOut = msg.direction === "out";
          const editedBody = getOriginalOrEditedBody(msg);
          const wasEdited = editedBody !== msg.body;
          const msgDate = new Date(msg.createdAt).toDateString();
          const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
          const showDivider = msgDate !== prevMsgDate;

          const isFirstOfBlock = index === 0 || 
            messages[index - 1].direction !== msg.direction || 
            showDivider;

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

          const isHighlighted = highlightedMessageId === msg.id;

          return (
            <div key={msg.id} id={`msg-${msg.id}`} className={`flex flex-col ${isFirstOfBlock && index > 0 ? "mt-4" : "mt-1"}`}>
              {showDivider && (
                <div className="flex items-center justify-center my-3 select-none">
                  <span className="bg-white/80 backdrop-blur-xs border border-neutral-200/50 text-neutral-500 text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                    {formatDateLabel(msg.createdAt)}
                  </span>
                </div>
              )}
              <div className={`flex items-start gap-1.5 md:gap-2.5 ${isOut ? "justify-end" : "justify-start"} group`}>
                {!isOut && (
                  isFirstOfBlock ? (
                    <div
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white text-[10px] md:text-[11px] font-bold shrink-0 shadow-inner select-none animate-in fade-in zoom-in-90 duration-150"
                      style={{ backgroundColor: chatInfo?.avatarColor || "#9ca3af" }}
                    >
                      {chatInfo?.contactName?.charAt(0).toUpperCase() || "?"}
                    </div>
                  ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
                  )
                )}

                {isOut && !isFile && isMessageEditable(msg) && editingMessageId !== msg.id && (
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

                <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isOut ? "items-end" : "items-start"}`}>
                  {isFirstOfBlock && (
                    <span className="text-[9px] md:text-[10px] font-bold text-neutral-500 mb-0.5 px-1 select-none animate-in fade-in duration-150">
                      {isOut ? (me?.name || "Você") : (chatInfo?.contactName || "Contato")}
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
                            <p className="whitespace-pre-wrap break-words text-sm mt-0.5">{fileData.caption}</p>
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
                              <p className="text-[10px] text-neutral-500">
                                Clique para baixar
                              </p>
                            </div>
                          </a>
                          {fileData.caption && (
                            <p className="whitespace-pre-wrap break-words text-sm mt-0.5">{fileData.caption}</p>
                          )}
                        </div>
                      )
                    ) : (
                      editingMessageId === msg.id ? (
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
                      )
                    )}

                    <div
                      className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isOut ? "text-green-700" : "text-neutral-400"}`}
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
                      {me?.name?.charAt(0).toUpperCase() || "V"}
                    </div>
                  ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 shrink-0" />
                  )
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-3 md:p-4 border-t border-neutral-200">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />

        <div className=" mx-auto w-full relative">
          {showEmojiPicker && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 right-3 sm:left-4 sm:right-auto sm:w-72 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-3 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="aspect-square w-full flex items-center justify-center text-lg rounded-lg hover:bg-neutral-100 transition-colors active:scale-95"
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
                  <span className={`font-bold ${idx === activeMacroIndex ? "text-white" : "text-blue-600"}`}>
                    /{macro.shortcut}
                  </span>
                  <span className={`truncate w-full text-[10px] ${idx === activeMacroIndex ? "text-blue-100" : "text-neutral-500"}`}>
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
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-200 transition-colors"
              >
              <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          )}

          {aiEnabled && (isSuggesting || aiSuggestion) && (
            <div className="mb-3.5 p-3 bg-blue-50/50 backdrop-blur-xs rounded-xl border border-blue-100/80 flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider select-none">
                  <Zap className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                  Sugestão da IA
                </span>
                {!isSuggesting && aiSuggestion && (
                  <button
                    type="button"
                    onClick={() => setAiSuggestion(null)}
                    className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full hover:bg-neutral-100 transition-colors"
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
                    "{aiSuggestion}"
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(aiSuggestion || "");
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

          <form onSubmit={handleSend} className={`bg-neutral-50/80 border border-neutral-200/60 p-2 flex flex-col md:flex-row md:items-end gap-1.5 md:gap-2 shadow-inner focus-within:bg-white focus-within:border-blue-400/50 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200 ${isMultiLine ? "rounded-2xl" : "rounded-3xl md:rounded-full"}`}>
            <div className="hidden md:flex items-center gap-1 md:mb-1">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-600 transition-colors shrink-0 ${
                  showEmojiPicker ? "bg-neutral-200/50 text-neutral-600" : ""
                }`}
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleAttachmentClick}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-600 transition-colors shrink-0 active:scale-95"
                title="Adicionar anexo"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => updateDraft(e.target.value)}
              onKeyDown={(e) => {
                if (filteredMacros.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveMacroIndex((prev) => (prev + 1) % filteredMacros.length);
                    return;
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveMacroIndex((prev) => (prev - 1 + filteredMacros.length) % filteredMacros.length);
                    return;
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSelectMacro(filteredMacros[activeMacroIndex].text);
                    return;
                  }
                }
                if (e.key === "Enter") {
                  if (enterToSend) {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  } else {
                    if (e.ctrlKey || e.metaKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }
                }
              }}
              placeholder={attachment ? "Escreva uma legenda..." : "Digite sua mensagem..."}
              className="w-full md:flex-1 bg-transparent text-sm focus:outline-none resize-none px-2 py-1 min-h-[36px] max-h-32 text-neutral-800 overflow-y-auto"
              rows={1}
            />
            
            <div className="hidden md:flex items-center gap-2 md:mb-0 shrink-0">
              {aiEnabled && (
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isSuggesting}
                  className={`p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all shrink-0 ${
                    isSuggesting ? "animate-pulse" : "active:scale-95"
                  }`}
                  title="Sugerir resposta com IA"
                >
                  <Sparkles className={`w-5 h-5 ${isSuggesting ? "animate-spin" : ""}`} />
                </button>
              )}

              <button
                type="submit"
                disabled={!draft.trim() && !attachment}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white disabled:text-neutral-400 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 shrink-0 shadow-xs"
                title="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex md:hidden items-center justify-between border-t border-neutral-200/40 pt-1.5 px-1 w-full">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-600 transition-colors shrink-0 ${
                    showEmojiPicker ? "bg-neutral-200/50 text-neutral-600" : ""
                  }`}
                  title="Emojis"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {aiEnabled && (
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={isSuggesting}
                    className={`p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 hover:text-blue-600 transition-all shrink-0 ${
                      isSuggesting ? "animate-pulse" : "active:scale-95"
                    }`}
                    title="Sugerir resposta com IA"
                  >
                    <Sparkles className={`w-5 h-5 ${isSuggesting ? "animate-spin" : ""}`} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAttachmentClick}
                  className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-200/50 hover:text-neutral-600 transition-colors shrink-0 active:scale-95"
                  title="Adicionar anexo"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!draft.trim() && !attachment}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-200 text-white disabled:text-neutral-400 rounded-full transition-all flex items-center justify-center cursor-pointer active:scale-95 shrink-0 shadow-xs"
                title="Enviar"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {previewImageUrl && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 cursor-zoom-out"
          onClick={() => setPreviewImageUrl(null)}
        >
          <button
            onClick={() => setPreviewImageUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar"
          >
              <X className="w-6 h-6" />
          </button>
          <img
            src={previewImageUrl}
            alt="Visualização"
            className="max-w-full max-h-[80vh] md:max-h-[90vh] rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-150 cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
