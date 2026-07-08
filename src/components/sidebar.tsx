"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard, Printer, TrendingUp, TrendingDown,
  ArrowLeftRight, BarChart3, Users, Settings,
  LogOut, ClipboardList, Menu, X, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/income", icon: TrendingUp, label: "Income Entry" },
  { href: "/expense", icon: TrendingDown, label: "Expense Entry" },
  { href: "/printers", icon: Printer, label: "Printers" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/reports", icon: ClipboardList, label: "Reports" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const logout = useStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-card border border-white/10 rounded-lg p-2 text-white"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 256 }}
        className={cn(
          "hidden lg:flex h-full bg-[#0D0D0D] border-r border-white/5 flex-col overflow-hidden shrink-0",
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/5 min-h-[80px]">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-3 mx-auto">
              <div className="w-12 h-12 rounded-xl gold-gradient border border-primary/30 flex items-center justify-center text-xl font-bold text-black shrink-0">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold gold-gradient tracking-wide">ASK DESIGNS</h1>
                <p className="text-[11px] text-muted-foreground text-center">Business Intelligence</p>
              </div>
            </Link>
          )}
          {collapsed && (
            <div className="w-12 h-12 rounded-xl gold-gradient border border-primary/30 flex items-center justify-center text-xl font-bold text-black mx-auto shrink-0">
              A
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all shrink-0"
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={cn(isActive ? "text-primary" : "", "shrink-0")} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200 whitespace-nowrap",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            className="fixed top-0 left-0 z-50 h-full w-64 bg-[#0D0D0D] border-r border-white/5 flex flex-col overflow-hidden lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/5 min-h-[80px]">
              <Link href="/dashboard" className="flex items-center gap-3 mx-auto">
                <div className="w-12 h-12 rounded-xl gold-gradient border border-primary/30 flex items-center justify-center text-xl font-bold text-black shrink-0">
                  A
                </div>
                <div>
                  <h1 className="text-2xl font-bold gold-gradient tracking-wide">ASK DESIGNS</h1>
                  <p className="text-[11px] text-muted-foreground text-center">Business Intelligence</p>
                </div>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon size={18} className={cn(isActive ? "text-primary" : "")} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavMobile"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-white/5">
              <button
                onClick={logout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
