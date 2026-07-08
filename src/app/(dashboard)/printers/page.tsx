"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { getDateRange, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer as PrinterIcon, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function PrintersPage() {
  const { printers, transactions, expenses, addPrinter, updatePrinter, deletePrinter, timeFilter } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");

  const getInRange = getDateRange(timeFilter);
  const filteredTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= getInRange.start && d < getInRange.end;
  });
  const filteredExp = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= getInRange.start && d < getInRange.end;
  });

  const handleSave = () => {
    if (!name.trim()) return;
    if (editId) {
      updatePrinter(editId, name, model);
    } else {
      addPrinter(name, model);
    }
    setName("");
    setModel("");
    setShowAdd(false);
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gold-gradient">Printers</h1>
          <p className="text-sm text-muted-foreground">Manage your printers and track performance</p>
        </div>
        <Button onClick={() => { setShowAdd(true); setEditId(null); setName(""); setModel(""); }} className="gap-2">
          <Plus size={16} /> Add Printer
        </Button>
      </motion.div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card>
              <CardHeader>
                <CardTitle>{editId ? "Edit Printer" : "Add New Printer"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Printer Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. KYOCERA" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Model</label>
                    <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Kyocera ECOSYS" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</Button>
                  <Button onClick={handleSave}>{editId ? "Update" : "Save"}</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map((printer, i) => {
          const pTxns = filteredTxns.filter((t) => t.printerId === printer.id);
          const pExp = filteredExp.filter((e) => e.printerId === printer.id);
          const revenue = pTxns.reduce((s, t) => s + t.amount, 0);
          const expense = pExp.reduce((s, e) => s + e.amount, 0);
          const profit = revenue - expense;
          const txnCount = pTxns.length;
          const pages = pTxns.reduce((s, t) => s + t.quantity, 0);

          return (
            <motion.div
              key={printer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="relative group hover:border-primary/20 transition-all duration-300">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditId(printer.id); setName(printer.name); setModel(printer.model); setShowAdd(true); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deletePrinter(printer.id)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <PrinterIcon size={20} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-white">{printer.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{printer.model}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                      <p className="text-sm font-bold text-green-400">{formatCurrency(revenue)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Expense</p>
                      <p className="text-sm font-bold text-red-400">{formatCurrency(expense)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1">Profit</p>
                      <p className="text-sm font-bold gold-gradient">{formatCurrency(profit)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                      <p className="text-sm font-bold text-blue-400">{txnCount}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Pages: {pages}</span>
                    <span>Utilization: {txnCount > 0 ? "Active" : "Idle"}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
