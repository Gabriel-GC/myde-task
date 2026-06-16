import { useState, useEffect } from "react";

export function useDraft(conversationId: string) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`draft-${conversationId}`);
    if (saved) {
      setDraft(saved);
    } else {
      setDraft("");
    }
  }, [conversationId]);

  const updateDraft = (text: string) => {
    setDraft(text);
    localStorage.setItem(`draft-${conversationId}`, text);
  };

  const clearDraft = () => {
    setDraft("");
    localStorage.removeItem(`draft-${conversationId}`);
  };

  return { draft, updateDraft, clearDraft };
}
