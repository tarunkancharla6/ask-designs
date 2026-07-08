"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Bell, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { TimeFilter } from "@/lib/types";

const filters: { value: TimeFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

export default function Navbar() {
  const user = useStore((s) => s.user);
  const timeFilter = useStore((s) => s.timeFilter);
  const setTimeFilter = useStore((s) => s.setTimeFilter);
  const [time, setTime] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-[#0D0D0D]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{user?.shopName || "ASK DESIGNS"}</h2>
          <p className="text-xs text-muted-foreground">
            {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            <span className="ml-2 text-primary">{time.toLocaleTimeString("en-IN")}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-white/10 text-sm text-muted-foreground hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">{filters.find((f) => f.value === timeFilter)?.label || "Custom"}</span>
          </button>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-2xl shadow-black/40 p-2 z-50"
            >
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => { setTimeFilter(f.value); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    timeFilter === f.value
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
