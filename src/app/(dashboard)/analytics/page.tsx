"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { getDateRange, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["#D4AF37", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

const fmtTooltip = (v: any) => [formatCurrency(Number(v)), ""];

export default function AnalyticsPage() {
  const { transactions, expenses, printers, timeFilter, customStart, customEnd } = useStore();

  const getInRange = useMemo(() => {
    const { start, end } = getDateRange(timeFilter, customStart, customEnd);
    return { start, end };
  }, [timeFilter, customStart, customEnd]);

  const filteredTxns = useMemo(
    () => transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= getInRange.start && d < getInRange.end;
    }),
    [transactions, getInRange]
  );

  const filteredExp = useMemo(
    () => expenses.filter((e) => {
      const d = new Date(e.date);
      return d >= getInRange.start && d < getInRange.end;
    }),
    [expenses, getInRange]
  );

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredTxns.forEach((t) => {
      const day = new Date(t.date).toLocaleDateString("en-IN", { weekday: "short" });
      map.set(day, (map.get(day) || 0) + t.amount);
    });
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({ name: d, revenue: map.get(d) || 0 }));
  }, [filteredTxns]);

  const profitTrend = useMemo(() => {
    const map = new Map<string, { revenue: number; expense: number }>();
    filteredTxns.forEach((t) => {
      const day = new Date(t.date).toLocaleDateString("en-IN", { weekday: "short" });
      const d = map.get(day) || { revenue: 0, expense: 0 };
      d.revenue += t.amount;
      map.set(day, d);
    });
    filteredExp.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString("en-IN", { weekday: "short" });
      const d = map.get(day) || { revenue: 0, expense: 0 };
      d.expense += e.amount;
      map.set(day, d);
    });
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => {
      const v = map.get(d);
      return { name: d, profit: (v?.revenue || 0) - (v?.expense || 0) };
    });
  }, [filteredTxns, filteredExp]);

  const printerComp = useMemo(() => {
    const map = new Map<string, number>();
    filteredTxns.forEach((t) => {
      map.set(t.printerId, (map.get(t.printerId) || 0) + t.amount);
    });
    return [...map.entries()].map(([id, value]) => {
      const p = printers.find((pr) => pr.id === id);
      return { name: p?.name || "Unknown", revenue: value };
    });
  }, [filteredTxns, printers]);

  const pmDist = useMemo(() => {
    const cash = filteredTxns.filter((t) => t.paymentMethod === "Cash").reduce((s, t) => s + t.amount, 0);
    const upi = filteredTxns.filter((t) => t.paymentMethod === "UPI").reduce((s, t) => s + t.amount, 0);
    const card = filteredTxns.filter((t) => t.paymentMethod === "Card").reduce((s, t) => s + t.amount, 0);
    return [
      { name: "Cash", value: cash },
      { name: "UPI", value: upi },
      { name: "Card", value: card },
    ];
  }, [filteredTxns]);

  const serviceDist = useMemo(() => {
    const map = new Map<string, number>();
    filteredTxns.forEach((t) => {
      map.set(t.serviceType, (map.get(t.serviceType) || 0) + t.amount);
    });
    return [...map.entries()].slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [filteredTxns]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredExp.forEach((e) => {
      map.set(e.expenseType, (map.get(e.expenseType) || 0) + e.amount);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filteredExp]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { revenue: number; expense: number }>();
    [...filteredTxns, ...filteredExp].forEach((entry) => {
      const month = new Date(entry.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const d = map.get(month) || { revenue: 0, expense: 0 };
      if (entry.type === "income") d.revenue += entry.amount;
      else d.expense += entry.amount;
      map.set(month, d);
    });
    return [...map.entries()].map(([name, v]) => ({ name, ...v }));
  }, [filteredTxns, filteredExp]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep insights into your business performance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                  <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Profit Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={profitTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                  <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Income vs Expense</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Printer Comparison</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={printerComp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
                  <YAxis stroke="#a3a3a3" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Payment Method Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pmDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {pmDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={16} className="text-primary" /> Service Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={serviceDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                    {serviceDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }} formatter={fmtTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
