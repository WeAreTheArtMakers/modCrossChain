"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { TransactionHistoryItem } from "@/types/bridge";

const STORAGE_KEY = "modCrossChain.transactionHistory";
const MAX_HISTORY_ITEMS = 8;
const subscribers = new Set<() => void>();

export function useTransactionHistory() {
  const items = useSyncExternalStore(subscribe, readHistory, () => []);

  const pushHistoryItem = useCallback((item: TransactionHistoryItem) => {
    const current = readHistory();
    const next = [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, MAX_HISTORY_ITEMS);
    writeHistory(next);
    emitChange();
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    emitChange();
  }, []);

  return {
    clearHistory,
    items,
    pushHistoryItem,
  };
}

function subscribe(callback: () => void) {
  subscribers.add(callback);

  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }

  return () => {
    subscribers.delete(callback);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function emitChange() {
  for (const callback of subscribers) {
    callback();
  }
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
