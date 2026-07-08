"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { serviceTypes, expenseTypes } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Database, Download, Upload, Info } from "lucide-react";

export default function SettingsPage() {
  const { printers } = useStore();
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const data = localStorage.getItem("ask-designs-storage");
    if (!data) return;
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASK-DESIGNS-Backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          localStorage.setItem("ask-designs-storage", JSON.stringify(data));
          alert("Data restored successfully! Please refresh the page.");
          window.location.reload();
        } catch {
          alert("Invalid backup file.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your business configuration</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info size={16} className="text-primary" /> Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Shop Name</span>
              <span className="font-medium">ASK DESIGNS</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Printers</span>
              <span className="font-medium">{printers.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">Services</span>
              <span className="font-medium">{serviceTypes.length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Expense Categories</span>
              <span className="font-medium">{expenseTypes.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database size={16} className="text-primary" /> Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your data as backup or restore from a previous backup file.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download size={16} /> {exported ? "Exported!" : "Backup Database"}
              </Button>
              <Button onClick={handleImport} variant="outline" className="gap-2">
                <Upload size={16} /> Restore Database
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={16} className="text-primary" /> Manage Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {serviceTypes.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-card border border-white/5 text-sm text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={16} className="text-primary" /> Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expenseTypes.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-card border border-white/5 text-sm text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
