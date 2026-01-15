// src/hooks/useFilteredTransactions.ts
import { useState, useMemo } from "react";
import type { TransactionType } from "@/types/model";

export type TransactionFilterType = "income" | "expense" | "all";

type DateRange = { start?: Date; end?: Date };

export function useFilteredTransactions(transactions: TransactionType[]) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionFilterType>("all");
  const [dateRange, setDateRange] = useState<DateRange>({});

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return transactions.filter((tx) => {
      // --- SEARCH: sesuaikan dengan field yang kamu pakai ---
      const matchesSearch =
        !q ||
        tx.note?.toLowerCase().includes(q) ||
        tx.category_id?.toLowerCase?.().includes(q) || // kalau mau search by id/slug
        tx.category?.name?.toLowerCase?.().includes(q);

      // --- CATEGORY: gunakan snake_case (utama) + fallback ---
      const txCatId =
        tx.category_id ??
        tx.category?.id ??
        // fallback terakhir kalau kamu punya mapper ke camelCase
        (tx as any).categoryId;

      const matchesCategory =
        !category ||
        (typeof txCatId === "string" &&
          txCatId.toLowerCase() === category.toLowerCase());

      // --- WALLET ---
      const matchesWallet =
        !walletId ||
        tx.wallet_id === walletId ||
        tx.related_wallet_id === walletId;

      // --- TYPE ---
      const matchesType =
        type === "all" || tx.type?.toLowerCase() === type.toLowerCase();

      // --- DATE RANGE (optional) ---
      const matchesDate =
        !dateRange.start ||
        !dateRange.end ||
        (new Date(tx.date) >= dateRange.start &&
          new Date(tx.date) <= dateRange.end);

      return matchesSearch && matchesCategory && matchesWallet && matchesType && matchesDate;
    });
  }, [transactions, search, category, walletId, type, dateRange]);

  const resetFilters = () => {
    setSearch("");
    setSearch("");
    setCategory(null);
    setWalletId(null);
    setType("all");
    setDateRange({});
  };

  const toggleCategory = (catId: string | null) => {
    setCategory((prev) => (prev === catId ? null : catId));
  };

  return {
    filteredTransactions,
    search,
    category,
    walletId,
    type,
    dateRange,
    setSearch,
    setCategory,
    setWalletId,
    setType,
    setDateRange,
    toggleCategory,
    resetFilters,
  };
}
