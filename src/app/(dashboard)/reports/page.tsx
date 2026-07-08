"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getDateRange, formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Download, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const { transactions, expenses, printers, timeFilter, customStart, customEnd } = useStore();

  const getInRange = useMemo(() => getDateRange(timeFilter, customStart, customEnd), [timeFilter, customStart, customEnd]);

  const filteredTxns = useMemo(() =>
    transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= getInRange.start && d < getInRange.end;
    }),
    [transactions, getInRange]
  );

  const filteredExp = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= getInRange.start && d < getInRange.end;
    }),
    [expenses, getInRange]
  );

  const allEntries = useMemo(() => [...filteredTxns, ...filteredExp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [filteredTxns, filteredExp]);

  const revenue = filteredTxns.reduce((s, t) => s + t.amount, 0);
  const expense = filteredExp.reduce((s, e) => s + e.amount, 0);
  const profit = revenue - expense;

  const byPrinter = useMemo(() => {
    const map = new Map<string, { revenue: number; expense: number; count: number }>();
    filteredTxns.forEach((t) => {
      const d = map.get(t.printerId) || { revenue: 0, expense: 0, count: 0 };
      d.revenue += t.amount; d.count += 1;
      map.set(t.printerId, d);
    });
    filteredExp.forEach((e) => {
      const d = map.get(e.printerId) || { revenue: 0, expense: 0, count: 0 };
      d.expense += e.amount;
      map.set(e.printerId, d);
    });
    return [...map.entries()].map(([id, v]) => {
      const p = printers.find((pr) => pr.id === id);
      return { printer: p?.name || "Unknown", ...v, profit: v.revenue - v.expense };
    });
  }, [filteredTxns, filteredExp, printers]);

  const handlePrint = () => window.print();
  const handleExportCSV = () => {
    const header = "Date,Type,Printer,Category,Amount,Payment,Customer/Vendor";
    const rows = allEntries.map((e) => {
      const p = printers.find((pr) => pr.id === e.printerId);
      return `${e.date},${e.type},${p?.name || ""},${(e as any).serviceType || (e as any).expenseType || ""},${e.amount},${(e as any).paymentMethod || (e as any).paymentMode || ""},${(e as any).customerName || (e as any).vendor || ""}`;
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ASK-DESIGNS-Report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gold-gradient">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and export business reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2"><Download size={16} /> Excel</Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2"><Printer size={16} /> Print</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-400">{formatCurrency(revenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-400">{formatCurrency(expense)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net Profit</CardTitle></CardHeader>
          <CardContent><p className={`text-3xl font-bold ${profit >= 0 ? "gold-gradient" : "text-red-400"}`}>{formatCurrency(profit)}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList size={16} className="text-primary" /> Printer-wise Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-2 text-muted-foreground">Printer</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Transactions</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Expenses</th>
                  <th className="text-right py-3 px-2 text-muted-foreground">Profit</th>
                </tr>
              </thead>
              <tbody>
                {byPrinter.map((row) => (
                  <tr key={row.printer} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-2 font-medium">{row.printer}</td>
                    <td className="py-3 px-2 text-right">{row.count}</td>
                    <td className="py-3 px-2 text-right text-green-400">{formatCurrency(row.revenue)}</td>
                    <td className="py-3 px-2 text-right text-red-400">{formatCurrency(row.expense)}</td>
                    <td className={`py-3 px-2 text-right font-semibold ${row.profit >= 0 ? "text-yellow-400" : "text-red-400"}`}>{formatCurrency(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byPrinter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="printer" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={(v: any) => [formatCurrency(Number(v)), ""]} />
              <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
