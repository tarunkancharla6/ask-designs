"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { getDateRange, formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2, ArrowLeftRight } from "lucide-react";
import type { Entry } from "@/lib/types";

export default function TransactionsPage() {
  const { transactions, expenses, printers, deleteEntry, timeFilter, customStart, customEnd } = useStore();
  const [search, setSearch] = useState("");

  const entries: Entry[] = useMemo(() => {
    const { start, end } = getDateRange(timeFilter, customStart, customEnd);
    const combined: Entry[] = [...transactions, ...expenses];
    return combined.filter((e) => {
      const d = new Date(e.date);
      return d >= start && d < end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, expenses, timeFilter, customStart, customEnd]);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) => {
      const printer = printers.find((p) => p.id === e.printerId);
      const data = e as any;
      return (
        data.serviceType?.toLowerCase().includes(q) ||
        data.expenseType?.toLowerCase().includes(q) ||
        printer?.name.toLowerCase().includes(q) ||
        e.remarks?.toLowerCase().includes(q) ||
        e.amount.toString().includes(q) ||
        data.paymentMethod?.toLowerCase().includes(q) ||
        data.paymentMode?.toLowerCase().includes(q) ||
        data.customerName?.toLowerCase().includes(q) ||
        data.vendor?.toLowerCase().includes(q)
      );
    });
  }, [entries, search, printers]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Transactions</h1>
        <p className="text-sm text-muted-foreground">All income and expense records</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight size={18} className="text-primary" />
                All Entries ({filtered.length})
              </CardTitle>
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  placeholder="Search entries..."
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Printer</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Category</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Payment</th>
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Customer/Vendor</th>
                    <th className="text-right py-3 px-2 text-muted-foreground font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => {
                    const printer = printers.find((p) => p.id === entry.printerId);
                    const isIncome = entry.type === "income";
                    return (
                      <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-2">{formatDate(entry.date)}</td>
                        <td className="py-3 px-2">
                          <Badge variant={isIncome ? "success" : "destructive"}>
                            {isIncome ? "INCOME" : "EXPENSE"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{printer?.name || "-"}</td>
                        <td className="py-3 px-2">{isIncome ? (entry as any).serviceType : (entry as any).expenseType}</td>
                        <td className={`py-3 px-2 text-right font-medium ${isIncome ? "text-green-400" : "text-red-400"}`}>
                          {isIncome ? "+" : "-"}{formatCurrency(entry.amount)}
                        </td>
                        <td className="py-3 px-2">{(entry as any).paymentMethod || (entry as any).paymentMode || "-"}</td>
                        <td className="py-3 px-2">{(entry as any).customerName || (entry as any).vendor || "-"}</td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => deleteEntry(entry.id, entry.type)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">No entries found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
