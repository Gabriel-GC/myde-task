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
import { MessageSquare } from "lucide-react";
import { Message } from "@/lib/api";

import { ChatHeader } from "./chat/ChatHeader";
import { ChatSearchBar } from "./chat/ChatSearchBar";
import { MessageList } from "./chat/MessageList";
import { ChatInputArea } from "./chat/ChatInputArea";
import { ChatBanners } from "./chat/ChatBanners";
import { TransferModal } from "./chat/TransferModal";
import { ImagePreviewModal } from "./chat/ImagePreviewModal";

export function ChatArea({ conversationId }: { conversationId: string }) {
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    window.dispatchEvent(
      new CustomEvent("myde_toast", { detail: { message, type } })
    );
  };

  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: suggestReply, isPending: isSuggesting } = useAiSuggestion();
  const { draft, updateDraft, clearDraft } = useDraft(conversationId);
  const { data: conversations } = useConversations();
  const { data: me } = useMe();

  const chatInfo = conversations?.find((c) => c.id === conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastConversationIdRef = useRef<string | null>(null);
  const hasScrolledRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastMsgIdRef = useRef<string | null>(null);

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

  const [aiEnabled, setAiEnabled] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [enterToSend, setEnterToSend] = useState(true);
  const [chatBg, setChatBg] = useState("#EFEAE2");
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [chatStatus, setChatStatus] = useState("active");

  const [macros, setMacros] = useState<Array<{ id: string; shortcut: string; text: string }>>([]);
  const [activeMacroIndex, setActiveMacroIndex] = useState(0);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editCount, setEditCount] = useState(0);

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [searchMatches, setSearchMatches] = useState<string[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

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
    updateSettings();
    window.addEventListener("myde_settings_changed", updateSettings);
    return () => window.removeEventListener("myde_settings_changed", updateSettings);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsBlocked(localStorage.getItem(`myde_blocked_${conversationId}`) === "true");
      setIsMuted(localStorage.getItem(`myde_muted_${conversationId}`) === "true");
    }

    const updateChatStatus = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`myde_chat_status_${conversationId}`);
        if (stored) {
          setChatStatus(stored);
        } else {
          if (conversationId === "c-1003") {
            setChatStatus("unassigned");
          } else if (conversationId === "c-1004") {
            setChatStatus("finished");
          } else {
            setChatStatus("active");
          }
        }
      }
    };
    updateChatStatus();
    window.addEventListener("myde_settings_changed", updateChatStatus);
    return () => window.removeEventListener("myde_settings_changed", updateChatStatus);
  }, [conversationId]);

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

  useEffect(() => {
    const handleEdit = () => setEditCount((prev) => prev + 1);
    window.addEventListener("myde_message_edited", handleEdit);
    return () => window.removeEventListener("myde_message_edited", handleEdit);
  }, []);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsgIdRef.current && lastMsgIdRef.current !== lastMsg.id && lastMsg.direction === "in") {
      if (soundAlerts && !isMuted) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }
    lastMsgIdRef.current = lastMsg.id;
  }, [messages, soundAlerts, isMuted]);

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

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showSearch]);

  const getMacroQuery = (text: string) => {
    const match = text.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);
    return match ? match[1] : null;
  };

  const macroQuery = getMacroQuery(draft);
  const filteredMacros = macroQuery !== null
    ? macros.filter(macro => macro.shortcut.toLowerCase().includes(macroQuery.toLowerCase()))
    : [];

  useEffect(() => {
    setActiveMacroIndex(0);
  }, [filteredMacros.length]);

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

  const getOriginalOrEditedBody = (msg: Message) => {
    if (typeof window !== "undefined") {
      const edited = localStorage.getItem(`myde_edited_${msg.id}`);
      if (edited) return edited;
    }
    return msg.body;
  };

  const isMessageEditable = (msg: Message) => {
    if (msg.direction !== "out") return false;
    if (msg.body.startsWith('{"type":"file"')) return false;
    const sentMsgs = messages?.filter(m => m.direction === "out" && !m.body.startsWith('{"type":"file"')) || [];
    const lastTwoSent = sentMsgs.slice(-2);
    const isOneOfLastTwo = lastTwoSent.some(m => m.id === msg.id);
    if (!isOneOfLastTwo) return false;
    const diffMs = Date.now() - new Date(msg.createdAt).getTime();
    return diffMs < 60000;
  };

  const handleSaveEdit = (msg: Message) => {
    const diffMs = Date.now() - new Date(msg.createdAt).getTime();
    if (diffMs > 60000) {
      showToast("O tempo limite de 1 minuto para edição expirou.", "error");
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

  const handleToggleBlock = () => {
    const nextState = !isBlocked;
    localStorage.setItem(`myde_blocked_${conversationId}`, String(nextState));
    setIsBlocked(nextState);
    showToast(nextState ? "Contato bloqueado com sucesso!" : "Contato desbloqueado com sucesso!", "info");
    window.dispatchEvent(new Event("myde_settings_changed"));
  };

  const handleTransferChat = (agentId: string) => {
    if (!agentId) return;
    const agentName = [
      { id: "agent-2", name: "Bruno Lima" },
      { id: "agent-3", name: "Carla Souza" },
      { id: "agent-4", name: "Diego Rodrigues" },
      { id: "agent-5", name: "Mariana Costa" }
    ].find(a => a.id === agentId)?.name;

    if (window.confirm(`Deseja transferir o atendimento para ${agentName}?`)) {
      try {
        showToast(`Atendimento transferido para ${agentName} com sucesso!`, "success");
        window.dispatchEvent(
          new CustomEvent("myde_chat_transferred", {
            detail: { conversationId, agentId, agentName }
          })
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      showToast("Por favor, selecione um arquivo de até 1.5MB para garantir o envio.", "error");
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

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 text-neutral-400 select-none">
        <MessageSquare className="w-16 h-16 mb-4" strokeWidth={1} />
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full relative"
      style={{ backgroundColor: chatBg }}
    >
      {(showEmojiPicker || showActionsMenu) && (
        <div
          className="fixed inset-0 z-30 cursor-default"
          onClick={() => {
            setShowEmojiPicker(false);
            setShowActionsMenu(false);
          }}
        />
      )}

      <ChatHeader
        chatInfo={chatInfo}
        chatStatus={chatStatus}
        isBlocked={isBlocked}
        meName={me?.name}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        showActionsMenu={showActionsMenu}
        setShowActionsMenu={setShowActionsMenu}
        setShowTransferModal={setShowTransferModal}
        handleToggleBlock={handleToggleBlock}
        showToast={showToast}
        conversationId={conversationId}
      />

      {showSearch && (
        <ChatSearchBar
          ref={searchInputRef}
          chatSearchQuery={chatSearchQuery}
          setChatSearchQuery={setChatSearchQuery}
          searchMatches={searchMatches}
          currentMatchIndex={currentMatchIndex}
          handleChatSearch={handleChatSearch}
          handlePrevMatch={handlePrevMatch}
          handleNextMatch={handleNextMatch}
          searchError={searchError}
          onClose={() => {
            setShowSearch(false);
            setChatSearchQuery("");
            setSearchMatches([]);
          }}
        />
      )}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        chatInfo={chatInfo}
        meName={me?.name}
        highlightedMessageId={highlightedMessageId}
        editingMessageId={editingMessageId}
        setEditingMessageId={setEditingMessageId}
        editingText={editingText}
        setEditingText={setEditingText}
        handleSaveEdit={handleSaveEdit}
        setPreviewImageUrl={setPreviewImageUrl}
        isMessageEditable={isMessageEditable}
        getOriginalOrEditedBody={getOriginalOrEditedBody}
        messagesEndRef={messagesEndRef}
      />

      {isBlocked || chatStatus === "unassigned" || chatStatus === "finished" ? (
        <ChatBanners
          conversationId={conversationId}
          chatStatus={chatStatus}
          isBlocked={isBlocked}
          handleToggleBlock={handleToggleBlock}
          showToast={showToast}
          chatInfoLastMessageAt={chatInfo?.lastMessageAt}
          meName={me?.name}
        />
      ) : (
        <ChatInputArea
          draft={draft}
          updateDraft={updateDraft}
          clearDraft={clearDraft}
          handleSend={handleSend}
          aiEnabled={aiEnabled}
          isSuggesting={isSuggesting}
          aiSuggestion={aiSuggestion}
          setAiSuggestion={setAiSuggestion}
          handleAiSuggest={handleAiSuggest}
          attachment={attachment}
          setAttachment={setAttachment}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          textareaRef={textareaRef}
          fileInputRef={fileInputRef}
          handleAttachmentClick={handleAttachmentClick}
          handleFileChange={handleFileChange}
          filteredMacros={filteredMacros}
          activeMacroIndex={activeMacroIndex}
          setActiveMacroIndex={setActiveMacroIndex}
          handleSelectMacro={handleSelectMacro}
          enterToSend={enterToSend}
          showToast={showToast}
        />
      )}

      {previewImageUrl && (
        <ImagePreviewModal
          previewImageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      )}

      {showTransferModal && (
        <TransferModal
          conversationId={conversationId}
          chatStatus={chatStatus}
          onClose={() => setShowTransferModal(false)}
          handleTransferChat={handleTransferChat}
          showToast={showToast}
        />
      )}
    </div>
  );
}
