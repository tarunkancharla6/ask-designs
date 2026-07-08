"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { expenseTypes } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TrendingDown, Plus } from "lucide-react";

export default function ExpensePage() {
  const { printers, addExpense } = useStore();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    printerId: "",
    expenseType: "",
    vendor: "",
    amount: 0,
    paymentMode: "Cash",
    remarks: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.printerId || !form.expenseType || !form.amount) return;
    addExpense({
      date: form.date,
      printerId: form.printerId,
      expenseType: form.expenseType,
      vendor: form.vendor,
      amount: form.amount,
      paymentMode: form.paymentMode,
      remarks: form.remarks,
    });
    setForm({
      date: new Date().toISOString().split("T")[0],
      printerId: "",
      expenseType: "",
      vendor: "",
      amount: 0,
      paymentMode: "Cash",
      remarks: "",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Expense Entry</h1>
        <p className="text-sm text-muted-foreground">Record business expenses</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown size={18} className="text-primary" />
              New Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Date</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Printer</label>
                  <Select
                    value={form.printerId}
                    onChange={(e) => setForm({ ...form, printerId: e.target.value })}
                    options={printers.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Select printer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Expense Type</label>
                  <Select
                    value={form.expenseType}
                    onChange={(e) => setForm({ ...form, expenseType: e.target.value })}
                    options={expenseTypes.map((s) => ({ value: s, label: s }))}
                    placeholder="Select type"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Vendor</label>
                  <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount (₹)</label>
                  <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Payment Mode</label>
                  <Select
                    value={form.paymentMode}
                    onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "UPI", label: "UPI" },
                      { value: "Card", label: "Card" },
                      { value: "Bank Transfer", label: "Bank Transfer" },
                    ]}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-sm text-muted-foreground">Remarks</label>
                  <Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2">
                  <Plus size={16} /> Save Expense
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
