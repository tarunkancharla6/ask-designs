import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TimeFilter, Transaction, Expense, Entry } from "./types";

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDateRange(filter: TimeFilter, customStart?: string, customEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today":
      return { start: today, end: new Date(today.getTime() + 86400000) };
    case "yesterday": {
      const yesterday = new Date(today.getTime() - 86400000);
      return { start: yesterday, end: today };
    }
    case "this_week": {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: new Date(today.getTime() + 86400000) };
    }
    case "last_week": {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart.getTime() + 7 * 86400000);
      return { start: lastWeekStart, end: lastWeekEnd };
    }
    case "this_month":
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: new Date(today.getFullYear(), today.getMonth() + 1, 1) };
    case "last_month":
      return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 1) };
    case "quarter": {
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      return { start: quarterStart, end: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 1) };
    }
    case "year":
      return { start: new Date(today.getFullYear(), 0, 1), end: new Date(today.getFullYear() + 1, 0, 1) };
    case "custom":
      return { start: customStart ? new Date(customStart) : today, end: customEnd ? new Date(customEnd) : new Date(today.getTime() + 86400000) };
    default:
      return { start: today, end: new Date(today.getTime() + 86400000) };
  }
}

export function filterEntries(entries: Entry[], filter: TimeFilter, customStart?: string, customEnd?: string): Entry[] {
  const { start, end } = getDateRange(filter, customStart, customEnd);
  return entries.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d < end;
  });
}

export const serviceTypes = [
  "DTP", "B/W Print", "B/W Xerox", "Color Print", "Color Xerox",
  "PVC Card", "Photo Board", "Lamination", "Spiral Binding", "Others", "Scans", "Stationery",
];

export const expenseTypes = [
  "Paper", "Ink", "Toner", "Electricity", "Salary", "Rent", "Internet", "Maintenance", "Miscellaneous",
];

export const defaultPrinters = [
  { name: "KYOCERA", model: "Kyocera" },
  { name: "KONICA", model: "Konica Minolta" },
  { name: "EPSON", model: "Epson" },
];
