"use client";

import { useCallback, useEffect, useState } from "react";
import type { TransactionHistoryItem } from "@/types/bridge";

const STORAGE_KEY = "modCrossChain.transactionHistory";
const MAX_HISTORY_ITEMS = 8;

export function useTransactionHistory() {
  const [items, setItems] = useState<TransactionHistoryItem[]>(() => readHistory());

  useEffect(() => {
    function handleStorage() {
      setItems(readHistory());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const pushHistoryItem = useCallback((item: TransactionHistoryItem) => {
    setItems((current) => {
      const next = [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setItems([]);
  }, []);

  return {
    clearHistory,
    items,
    pushHistoryItem,
  };
}

function readHistory(): TransactionHistoryItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as TransactionHistoryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

function writeHistory(items: TransactionHistoryItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
