import { useState, useEffect } from "react";

export function useChatPreferences() {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    const localDeleted = JSON.parse(
      localStorage.getItem("deletedChats") || "[]",
    );
    const localPinned = JSON.parse(localStorage.getItem("pinnedChats") || "[]");
    const localArchived = JSON.parse(
      localStorage.getItem("archivedChats") || "[]",
    );

    setDeletedIds(localDeleted);
    setPinnedIds(localPinned);
    setArchivedIds(localArchived);
  }, []);

  const toggleAction = (id: string, type: "delete" | "pin" | "archive") => {
    let updatedList: string[];

    if (type === "delete") {
      updatedList = [...deletedIds, id];
      setDeletedIds(updatedList);
      localStorage.setItem("deletedChats", JSON.stringify(updatedList));
    } else if (type === "pin") {
      updatedList = pinnedIds.includes(id)
        ? pinnedIds.filter((i) => i !== id)
        : [...pinnedIds, id];
      setPinnedIds(updatedList);
      localStorage.setItem("pinnedChats", JSON.stringify(updatedList));
    } else if (type === "archive") {
      updatedList = archivedIds.includes(id)
        ? archivedIds.filter((i) => i !== id)
        : [...archivedIds, id];
      setArchivedIds(updatedList);
      localStorage.setItem("archivedChats", JSON.stringify(updatedList));
    }
  };

  const resetPreferences = () => {
    setDeletedIds([]);
    setPinnedIds([]);
    setArchivedIds([]);
    localStorage.removeItem("deletedChats");
    localStorage.removeItem("pinnedChats");
    localStorage.removeItem("archivedChats");
  };

  return { deletedIds, pinnedIds, archivedIds, toggleAction, resetPreferences };
}
