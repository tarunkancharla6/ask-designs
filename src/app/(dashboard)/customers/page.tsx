"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, IndianRupee, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CustomersPage() {
  const getCustomers = useStore((s) => s.getCustomers);
  const customers = useMemo(() => getCustomers(), [getCustomers]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-gradient">Customers</h1>
        <p className="text-sm text-muted-foreground">Customer insights and loyalty tracking</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Customers</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-white">{customers.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Avg Spend</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold gold-gradient">
              {customers.length > 0 ? formatCurrency(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length) : "₹0"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Top Customer</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white truncate">
              {customers[0]?.name || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            All Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Phone</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Total Spent</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Visits</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                    <td className="py-3 px-2 font-medium text-white">{c.name}</td>
                    <td className="py-3 px-2">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Phone size={12} /> {c.phone || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-green-400 font-medium">{formatCurrency(c.totalSpent)}</td>
                    <td className="py-3 px-2 text-right">
                      <Badge variant="info">{c.visitCount}</Badge>
                    </td>
                    <td className="py-3 px-2 text-right text-muted-foreground">{formatDate(c.lastVisit)}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">No customers yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
