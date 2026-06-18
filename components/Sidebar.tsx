"use client";

import { useState, useEffect } from "react";
import { useConversations, useMe } from "@/hooks/useApi";
import { useChatPreferences } from "@/hooks/useChatPreferences";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarMobileNav } from "./sidebar/SidebarMobileNav";
import { ProfileTab } from "./sidebar/ProfileTab";
import { ConversationList } from "./sidebar/ConversationList";

interface SidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    window.dispatchEvent(
      new CustomEvent("myde_toast", { detail: { message, type } })
    );
  };

  const { data: conversations, isLoading } = useConversations();
  const { data: me } = useMe();
  const { deletedIds, pinnedIds, toggleAction, resetPreferences } = useChatPreferences();

  const [activeTab, setActiveTab] = useState<"active" | "unassigned" | "finished" | "profile">("active");
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(280, Math.min(e.clientX, 550));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    setActiveMenuId(null);
  }, [activeTab]);

  useEffect(() => {
    const handleTransfer = (e: any) => {
      const { conversationId } = e.detail;
      toggleAction(conversationId, "delete");
      if (activeId === conversationId) {
        onSelect("");
      }
    };
    window.addEventListener("myde_chat_transferred", handleTransfer as any);
    return () =>
      window.removeEventListener("myde_chat_transferred", handleTransfer as any);
  }, [activeId, onSelect, toggleAction]);

  return (
    <div
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
      className="flex h-full w-full md:w-[380px] shrink-0 pb-14 md:pb-0 font-sans bg-white border-r border-neutral-200 relative"
    >
      <SidebarNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        meName={me?.name}
      />

      <aside className="flex-1 border-r border-neutral-200 bg-white flex flex-col h-full select-none relative min-w-0">
        {activeMenuId && (
          <div
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setActiveMenuId(null)}
          />
        )}

        {activeTab === "profile" ? (
          <ProfileTab
            me={me}
            showToast={showToast}
            resetPreferences={resetPreferences}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            activeId={activeId}
            onSelect={onSelect}
            activeTab={activeTab}
            deletedIds={deletedIds}
            pinnedIds={pinnedIds}
            toggleAction={toggleAction}
            showToast={showToast}
            meName={me?.name}
            activeMenuId={activeMenuId}
            setActiveMenuId={setActiveMenuId}
          />
        )}
      </aside>

      <SidebarMobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        meName={me?.name}
      />

      <div
        onMouseDown={() => setIsResizing(true)}
        className="hidden md:block absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/20 active:bg-blue-600/30 transition-colors z-50 group"
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-0.5 h-8 bg-neutral-300 rounded group-hover:bg-blue-500 transition-colors" />
      </div>
    </div>
  );
}
