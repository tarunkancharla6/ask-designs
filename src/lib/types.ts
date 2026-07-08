export interface Printer {
  id: string;
  name: string;
  model: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  printerId: string;
  serviceType: string;
  quantity: number;
  rate: number;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  customerName: string;
  customerPhone: string;
  remarks: string;
  type: 'income';
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  printerId: string;
  expenseType: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  remarks: string;
  type: 'expense';
  createdAt: string;
}

export type Entry = Transaction | Expense;

export interface Customer {
  name: string;
  phone: string;
  totalSpent: number;
  visitCount: number;
  lastVisit: string;
}

export interface Target {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  value: number;
  period: string;
}

export type TimeFilter = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'quarter' | 'year' | 'custom';

export interface FilterState {
  timeFilter: TimeFilter;
  customStart: string;
  customEnd: string;
}
