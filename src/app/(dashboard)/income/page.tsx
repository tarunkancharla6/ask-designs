"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { serviceTypes } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TrendingUp, Plus, X } from "lucide-react";

export default function IncomePage() {
  const { printers, addTransaction, init } = useStore();
  useEffect(() => { init(); }, [init]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    printerId: "",
    serviceType: "",
    quantity: 0,
    rate: 0,
    amount: 0,
    paymentMethod: "Cash" as "Cash" | "UPI" | "Card",
    customerName: "",
    customerPhone: "",
    remarks: "",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "quantity" || field === "rate") {
        updated.amount = Number(updated.quantity) * Number(updated.rate);
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.printerId || !form.serviceType || !form.amount) return;
    addTransaction({
      date: form.date,
      printerId: form.printerId,
      serviceType: form.serviceType,
      quantity: form.quantity,
      rate: form.rate,
      amount: form.amount,
      paymentMethod: form.paymentMethod,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      remarks: form.remarks,
    });
    setForm({
      date: new Date().toISOString().split("T")[0],
      printerId: "",
      serviceType: "",
      quantity: 0,
      rate: 0,
      amount: 0,
      paymentMethod: "Cash",
      customerName: "",
      customerPhone: "",
      remarks: "",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Income Entry</h1>
        <p className="text-sm text-muted-foreground">Add new transaction / income record</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              New Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Date</label>
                  <Input type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Printer</label>
                  <Select
                    value={form.printerId}
                    onChange={(e) => updateField("printerId", e.target.value)}
                    options={printers.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Select printer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Service Type</label>
                  <Select
                    value={form.serviceType}
                    onChange={(e) => updateField("serviceType", e.target.value)}
                    options={serviceTypes.map((s) => ({ value: s, label: s }))}
                    placeholder="Select service"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Quantity</label>
                  <Input type="number" value={form.quantity || ""} onChange={(e) => updateField("quantity", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Rate (₹)</label>
                  <Input type="number" value={form.rate || ""} onChange={(e) => updateField("rate", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount (₹)</label>
                  <Input type="number" value={form.amount || ""} readOnly className="text-primary font-semibold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <Select
                    value={form.paymentMethod}
                    onChange={(e) => updateField("paymentMethod", e.target.value)}
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "UPI", label: "UPI" },
                      { value: "Card", label: "Card" },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Customer Name</label>
                  <Input value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Phone</label>
                  <Input value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <label className="text-sm text-muted-foreground">Remarks</label>
                  <Input value={form.remarks} onChange={(e) => updateField("remarks", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2">
                  <Plus size={16} /> Save Transaction
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
