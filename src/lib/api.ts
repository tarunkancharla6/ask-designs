const API = process.env.NEXT_PUBLIC_API_URL || "";

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("ask-designs-token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API Error");
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getMe: () => request("/api/auth/me"),

  // Printers
  getPrinters: () => request("/api/printers"),
  createPrinter: (data: { name: string; model: string }) =>
    request("/api/printers", { method: "POST", body: JSON.stringify(data) }),
  updatePrinter: (id: string, data: { name?: string; model?: string }) =>
    request(`/api/printers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePrinter: (id: string) =>
    request(`/api/printers/${id}`, { method: "DELETE" }),

  // Transactions
  getTransactions: (params?: { start_date?: string; end_date?: string; printer_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.set("start_date", params.start_date);
    if (params?.end_date) qs.set("end_date", params.end_date);
    if (params?.printer_id) qs.set("printer_id", params.printer_id);
    const q = qs.toString();
    return request(`/api/transactions${q ? `?${q}` : ""}`);
  },
  createTransaction: (data: any) =>
    request("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
  deleteTransaction: (id: string) =>
    request(`/api/transactions/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: (params?: { start_date?: string; end_date?: string; printer_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.start_date) qs.set("start_date", params.start_date);
    if (params?.end_date) qs.set("end_date", params.end_date);
    if (params?.printer_id) qs.set("printer_id", params.printer_id);
    const q = qs.toString();
    return request(`/api/expenses${q ? `?${q}` : ""}`);
  },
  createExpense: (data: any) =>
    request("/api/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id: string) =>
    request(`/api/expenses/${id}`, { method: "DELETE" }),

  // Customers
  getCustomers: () => request("/api/customers"),
};
