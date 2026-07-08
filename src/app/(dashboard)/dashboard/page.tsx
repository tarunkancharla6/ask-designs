"use client";

import { useStore } from "@/lib/store";
import { getDateRange, formatCurrency } from "@/lib/utils";
import KpiCard from "@/components/kpi-card";
import { motion } from "framer-motion";
import {
  IndianRupee, TrendingUp, TrendingDown, ArrowLeftRight,
  Users, Printer, Target, DollarSign, Smartphone,
  Activity, Award, BarChart3, Percent,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useMemo, useState } from "react";

const COLORS = ["#D4AF37", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];

export default function DashboardPage() {
  const { transactions, expenses, printers, timeFilter, customStart, customEnd } = useStore();

  const filteredTransactions = useMemo(
    () => transactions.filter((t) => {
      const { start, end } = getDateRange(timeFilter, customStart, customEnd);
      const d = new Date(t.date);
      return d >= start && d < end;
    }),
    [transactions, timeFilter, customStart, customEnd]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => {
      const { start, end } = getDateRange(timeFilter, customStart, customEnd);
      const d = new Date(e.date);
      return d >= start && d < end;
    }),
    [expenses, timeFilter, customStart, customEnd]
  );

  const todayTxns = useMemo(() => transactions.filter((t) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(t.date);
    return d >= today && d < new Date(today.getTime() + 86400000);
  }), [transactions]);
  const todayExp = useMemo(() => expenses.filter((e) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(e.date);
    return d >= today && d < new Date(today.getTime() + 86400000);
  }), [expenses]);

  const stats = useMemo(() => {
    const revenue = filteredTransactions.reduce((s, t) => s + t.amount, 0);
    const expense = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const todayRevenue = todayTxns.reduce((s, t) => s + t.amount, 0);
    const todayExpense = todayExp.reduce((s, e) => s + e.amount, 0);
    const cashTotal = filteredTransactions.filter((t) => t.paymentMethod === "Cash").reduce((s, t) => s + t.amount, 0);
    const upiTotal = filteredTransactions.filter((t) => t.paymentMethod === "UPI").reduce((s, t) => s + t.amount, 0);
    const customers = new Set(filteredTransactions.map((t) => t.customerName).filter(Boolean)).size;
    const totalPages = filteredTransactions.reduce((s, t) => s + t.quantity, 0);

    const serviceRevenue = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      serviceRevenue.set(t.serviceType, (serviceRevenue.get(t.serviceType) || 0) + t.amount);
    });
    const bestService = [...serviceRevenue.entries()].sort((a, b) => b[1] - a[1])[0];

    const printerRevenue = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      printerRevenue.set(t.printerId, (printerRevenue.get(t.printerId) || 0) + t.amount);
    });
    const bestPrinterId = [...printerRevenue.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestPrinter = printers.find((p) => p.id === bestPrinterId);

    return {
      revenue,
      expense,
      profit: revenue - expense,
      todayRevenue,
      todayExpense,
      todayProfit: todayRevenue - todayExpense,
      totalTxns: filteredTransactions.length,
      cashTotal,
      upiTotal,
      customers,
      totalPages,
      bestService: bestService?.[0] || "N/A",
      bestPrinter: bestPrinter?.name || "N/A",
      avgBill: filteredTransactions.length > 0 ? revenue / filteredTransactions.length : 0,
    };
  }, [filteredTransactions, filteredExpenses, todayTxns, todayExp, printers]);

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const day = new Date(t.date).toLocaleDateString("en-IN", { weekday: "short" });
      map.set(day, (map.get(day) || 0) + t.amount);
    });
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days.map((d) => ({ name: d, revenue: map.get(d) || 0 }));
  }, [filteredTransactions]);

  const serviceDist = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      map.set(t.serviceType, (map.get(t.serviceType) || 0) + t.amount);
    });
    return [...map.entries()].slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const expenseBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((e) => {
      map.set(e.expenseType, (map.get(e.expenseType) || 0) + e.amount);
    });
    return [...map.entries()].slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const pmDist = useMemo(() => {
    const cash = filteredTransactions.filter((t) => t.paymentMethod === "Cash").reduce((s, t) => s + t.amount, 0);
    const upi = filteredTransactions.filter((t) => t.paymentMethod === "UPI").reduce((s, t) => s + t.amount, 0);
    const card = filteredTransactions.filter((t) => t.paymentMethod === "Card").reduce((s, t) => s + t.amount, 0);
    return [
      { name: "Cash", value: cash },
      { name: "UPI", value: upi },
      { name: "Card", value: card },
    ];
  }, [filteredTransactions]);

  const prevMonthTxns = useMemo(() => transactions.filter((t) => {
    const { start, end } = getDateRange("last_month");
    const d = new Date(t.date);
    return d >= start && d < end;
  }), [transactions]);
  const prevMonthExp = useMemo(() => expenses.filter((e) => {
    const { start, end } = getDateRange("last_month");
    const d = new Date(e.date);
    return d >= start && d < end;
  }), [expenses]);
  const prevRevenue = prevMonthTxns.reduce((s, t) => s + t.amount, 0);
  const prevExpense = prevMonthExp.reduce((s, e) => s + e.amount, 0);
  const revGrowth = prevRevenue > 0 ? ((stats.revenue - prevRevenue) / prevRevenue * 100) : 0;
  const expGrowth = prevExpense > 0 ? ((stats.expense - prevExpense) / prevExpense * 100) : 0;

  const kpis = [
    { title: "Today's Revenue", value: stats.todayRevenue, isCurrency: true, icon: <TrendingUp size={18} />, delay: 0 },
    { title: "Today's Expense", value: stats.todayExpense, isCurrency: true, icon: <TrendingDown size={18} />, delay: 0.05 },
    { title: "Today's Profit", value: stats.todayProfit, isCurrency: true, icon: <IndianRupee size={18} />, delay: 0.1, trend: { value: Math.round(revGrowth * 10) / 10, isUp: revGrowth >= 0 } },
    { title: "Total Transactions", value: stats.totalTxns, icon: <ArrowLeftRight size={18} />, delay: 0.15 },
    { title: "Total Customers", value: stats.customers, icon: <Users size={18} />, delay: 0.2 },
    { title: "Pages Printed", value: stats.totalPages, icon: <Printer size={18} />, delay: 0.25 },
    { title: "Best Service", value: stats.bestService, icon: <Award size={18} />, delay: 0.3, subtitle: "by revenue" },
    { title: "Best Printer", value: stats.bestPrinter, icon: <Activity size={18} />, delay: 0.35, subtitle: "highest revenue" },
    { title: "Avg Bill Value", value: stats.avgBill, isCurrency: true, icon: <BarChart3 size={18} />, delay: 0.4 },
    { title: "Cash Collection", value: stats.cashTotal, isCurrency: true, icon: <DollarSign size={18} />, delay: 0.45 },
    { title: "UPI Collection", value: stats.upiTotal, isCurrency: true, icon: <Smartphone size={18} />, delay: 0.5 },
    { title: "Growth", value: `${revGrowth > 0 ? "+" : ""}${revGrowth.toFixed(1)}%`, icon: <Percent size={18} />, delay: 0.55, trend: { value: Math.abs(revGrowth), isUp: revGrowth >= 0 } },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold gold-gradient">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time business overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target size={14} className="text-primary" />
          <span>Target Achievement: <span className="text-primary font-semibold">92%</span></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KpiCard key={i} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Revenue Trend (by Day)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                labelStyle={{ color: "#fff" }}
                formatter={(v: any) => [formatCurrency(Number(v)), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: "Income", value: stats.revenue },
              { name: "Expense", value: stats.expense },
              { name: "Profit", value: stats.profit },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} />
              <YAxis stroke="#a3a3a3" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                formatter={(v: any) => [formatCurrency(Number(v)), ""]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="#D4AF37" />
                <Cell fill="#EF4444" />
                <Cell fill="#10B981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={serviceDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {serviceDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                formatter={(v: any) => [formatCurrency(Number(v)), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="text-sm font-semibold mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                {expenseBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#202020", border: "1px solid #2a2a2a", borderRadius: "8px" }}
                formatter={(v: any) => [formatCurrency(Number(v)), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
