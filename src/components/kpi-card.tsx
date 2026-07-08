"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isUp: boolean };
  isCurrency?: boolean;
  subtitle?: string;
  delay?: number;
}

export default function KpiCard({ title, value, icon, trend, isCurrency, subtitle, delay = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
      </div>
      <p className={cn("text-2xl font-bold mb-1", isCurrency ? "gold-gradient" : "text-white")}>
        {isCurrency ? formatCurrency(Number(value)) : value}
      </p>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={cn("text-xs font-medium", trend.isUp ? "text-green-400" : "text-red-400")}>
            {trend.isUp ? "+" : ""}{trend.value}%
          </span>
        )}
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>
    </motion.div>
  );
}
