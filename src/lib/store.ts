"use client";

import { create } from "zustand";
import { api } from "./api";
import { defaultPrinters } from "./utils";
import type { Printer, Transaction, Expense, Customer, Entry, TimeFilter } from "./types";

interface AppState {
  printers: Printer[];
  transactions: Transaction[];
  expenses: Expense[];
  isAuthenticated: boolean;
  user: { username: string; shopName: string } | null;
  loading: boolean;
  timeFilter: TimeFilter;
  customStart: string;
  customEnd: string;

  init: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  addPrinter: (name: string, model: string) => Promise<void>;
  updatePrinter: (id: string, name: string, model: string) => Promise<void>;
  deletePrinter: (id: string) => Promise<void>;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "type">) => Promise<void>;
  addExpense: (e: Omit<Expense, "id" | "createdAt" | "type">) => Promise<void>;
  deleteEntry: (id: string, type: "income" | "expense") => Promise<void>;

  setTimeFilter: (filter: TimeFilter) => void;
  setCustomRange: (start: string, end: string) => void;

  getAllEntries: () => Entry[];
  getCustomers: () => Customer[];
}

function mapPrinter(p: any): Printer {
  return { id: p.id, name: p.name, model: p.model || "", createdAt: p.created_at };
}

function mapTransaction(t: any): Transaction {
  return {
    id: t.id,
    date: t.date,
    printerId: t.printer_id,
    serviceType: t.service_type,
    quantity: t.quantity,
    rate: t.rate,
    amount: t.amount,
    paymentMethod: t.payment_method,
    customerName: t.customer_name,
    customerPhone: t.customer_phone,
    remarks: t.remarks,
    type: "income",
    createdAt: t.created_at,
  };
}

function mapExpense(e: any): Expense {
  return {
    id: e.id,
    date: e.date,
    printerId: e.printer_id,
    expenseType: e.expense_type,
    vendor: e.vendor,
    amount: e.amount,
    paymentMode: e.payment_mode,
    remarks: e.remarks,
    type: "expense",
    createdAt: e.created_at,
  };
}

export const useStore = create<AppState>()((set, get) => ({
  printers: [],
  transactions: [],
  expenses: [],
  isAuthenticated: false,
  user: null,
  loading: true,
  timeFilter: "today",
  customStart: "",
  customEnd: "",

  init: async () => {
    const token = localStorage.getItem("ask-designs-token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const [me, printers, transactions, expenses] = await Promise.all([
        api.getMe(),
        api.getPrinters(),
        api.getTransactions(),
        api.getExpenses(),
      ]);
      set({
        isAuthenticated: true,
        user: { username: me.username, shopName: me.shop_name },
        printers: printers.map(mapPrinter),
        transactions: transactions.map(mapTransaction),
        expenses: expenses.map(mapExpense),
        loading: false,
      });
    } catch {
      localStorage.removeItem("ask-designs-token");
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  login: async (username: string, password: string) => {
    try {
      const res = await api.login(username, password);
      localStorage.setItem("ask-designs-token", res.access_token);
      const me = await api.getMe();
      const [printers, transactions, expenses] = await Promise.all([
        api.getPrinters(),
        api.getTransactions(),
        api.getExpenses(),
      ]);
      set({
        isAuthenticated: true,
        user: { username: me.username, shopName: me.shop_name },
        printers: printers.map(mapPrinter),
        transactions: transactions.map(mapTransaction),
        expenses: expenses.map(mapExpense),
      });
      return true;
    } catch {
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("ask-designs-token");
    set({ isAuthenticated: false, user: null, printers: [], transactions: [], expenses: [] });
  },

  addPrinter: async (name, model) => {
    const p = await api.createPrinter({ name, model });
    set((state) => ({ printers: [...state.printers, mapPrinter(p)] }));
  },

  updatePrinter: async (id, name, model) => {
    await api.updatePrinter(id, { name, model });
    set((state) => ({
      printers: state.printers.map((p) => (p.id === id ? { ...p, name, model } : p)),
    }));
  },

  deletePrinter: async (id) => {
    await api.deletePrinter(id);
    set((state) => ({
      printers: state.printers.filter((p) => p.id !== id),
      transactions: state.transactions.filter((t) => t.printerId !== id),
      expenses: state.expenses.filter((e) => e.printerId !== id),
    }));
  },

  addTransaction: async (t) => {
    const res = await api.createTransaction({
      date: t.date,
      printer_id: t.printerId,
      service_type: t.serviceType,
      quantity: t.quantity,
      rate: t.rate,
      amount: t.amount,
      payment_method: t.paymentMethod,
      customer_name: t.customerName,
      customer_phone: t.customerPhone,
      remarks: t.remarks,
    });
    set((state) => ({ transactions: [...state.transactions, mapTransaction(res)] }));
  },

  addExpense: async (e) => {
    const res = await api.createExpense({
      date: e.date,
      printer_id: e.printerId,
      expense_type: e.expenseType,
      vendor: e.vendor,
      amount: e.amount,
      payment_mode: e.paymentMode,
      remarks: e.remarks,
    });
    set((state) => ({ expenses: [...state.expenses, mapExpense(res)] }));
  },

  deleteEntry: async (id, type) => {
    if (type === "income") {
      await api.deleteTransaction(id);
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
    } else {
      await api.deleteExpense(id);
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
    }
  },

  setTimeFilter: (filter) => {
    set({ timeFilter: filter });
  },

  setCustomRange: (start, end) => {
    set({ customStart: start, customEnd: end, timeFilter: "custom" });
  },

  getAllEntries: () => {
    const { transactions, expenses } = get();
    return [...transactions, ...expenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  getCustomers: () => {
    const { transactions } = get();
    const customerMap = new Map<string, Customer>();
    for (const t of transactions) {
      if (!t.customerName) continue;
      const key = `${t.customerName}-${t.customerPhone}`;
      const existing = customerMap.get(key);
      if (existing) {
        existing.totalSpent += t.amount;
        existing.visitCount += 1;
        if (new Date(t.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = t.date;
        }
      } else {
        customerMap.set(key, {
          name: t.customerName,
          phone: t.customerPhone,
          totalSpent: t.amount,
          visitCount: 1,
          lastVisit: t.date,
        });
      }
    }
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  },
}));
