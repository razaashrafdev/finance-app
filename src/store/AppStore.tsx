import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  userProfile as mockUser,
  accounts as mockAccounts,
  connectedAccounts as mockConnectedAccounts,
  transactions as mockTransactions,
  budgets as mockBudgets,
  savingsGoals as mockGoals,
  bills as mockBills,
  loans as mockLoans,
  investments as mockInvestments,
  notifications as mockNotifications,
  subscriptions as mockSubscriptions,
} from '../data/mockData';

type UserProfile = typeof mockUser;
type Account = (typeof mockAccounts)[number];
type Transaction = (typeof mockTransactions)[number];
type Budget = (typeof mockBudgets)[number];
type Goal = (typeof mockGoals)[number];
type Bill = (typeof mockBills)[number];
type Loan = (typeof mockLoans)[number];
type Investment = (typeof mockInvestments)[number];
type NotificationItem = (typeof mockNotifications)[number];
type Subscription = (typeof mockSubscriptions)[number];

function nextId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

interface AppStoreValue {
  isAuthenticated: boolean;
  user: UserProfile;
  accounts: Account[];
  connectedAccounts: typeof mockConnectedAccounts;
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: Goal[];
  bills: Bill[];
  loans: Loan[];
  investments: Investment[];
  notifications: NotificationItem[];
  subscriptions: Subscription[];
  login: (email?: string, password?: string) => void;
  signup: (data?: { firstName?: string; lastName?: string; email?: string; password?: string }) => void;
  logout: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  addTransaction: (input: Partial<Transaction> & { type?: string }) => Transaction;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (input: Partial<Account>) => void;
  addBudget: (input: Partial<Budget>) => void;
  updateBudget: (id: string, patch: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addGoal: (input: Partial<Goal>) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addBill: (input: Partial<Bill>) => void;
  markBillPaid: (id: string) => void;
  addLoan: (input: Partial<Loan>) => void;
  payLoan: (id: string, amount?: number) => void;
  deleteLoan: (id: string) => void;
  addInvestment: (input: Partial<Investment>) => void;
  addSubscription: (input: Partial<Subscription>) => void;
  addTransfer: (fromId?: string, toId?: string, amount?: number | string, notes?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({ ...mockUser });
  const [accounts, setAccounts] = useState<Account[]>(() => mockAccounts.map((item) => ({ ...item })));
  const [connectedAccounts, setConnectedAccounts] = useState(() =>
    mockConnectedAccounts.map((item) => ({ ...item }))
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    mockTransactions.map((item) => ({ ...item }))
  );
  const [budgets, setBudgets] = useState<Budget[]>(() => mockBudgets.map((item) => ({ ...item })));
  const [savingsGoals, setSavingsGoals] = useState<Goal[]>(() => mockGoals.map((item) => ({ ...item })));
  const [bills, setBills] = useState<Bill[]>(() => mockBills.map((item) => ({ ...item })));
  const [loans, setLoans] = useState<Loan[]>(() => mockLoans.map((item) => ({ ...item })));
  const [investments, setInvestments] = useState<Investment[]>(() =>
    mockInvestments.map((item) => ({ ...item }))
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    mockNotifications.map((item) => ({ ...item }))
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    mockSubscriptions.map((item) => ({ ...item }))
  );

  const login = (email?: string, _password?: string) => {
    if (email?.trim()) {
      setUser((prev) => ({ ...prev, email: email.trim() }));
    }
    setIsAuthenticated(true);
  };

  const signup = (data?: { firstName?: string; lastName?: string; email?: string; password?: string }) => {
    setUser((prev) => ({
      ...prev,
      firstName: data?.firstName?.trim() || prev.firstName || 'Guest',
      lastName: data?.lastName?.trim() || prev.lastName || 'User',
      email: data?.email?.trim() || prev.email || 'guest@financeflow.app',
    }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updateUser = (patch: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...patch }));
  };

  const addTransaction = (input: Partial<Transaction> & { type?: string }) => {
    const type = (input.type as Transaction['type']) || 'expense';
    const amount = Math.abs(asNumber(input.amount, 100));
    const account = accounts.find((item) => item.id === input.accountId) || accounts[0];
    const created: Transaction = {
      ...mockTransactions[0],
      ...input,
      id: nextId('txn'),
      title: input.title || (type === 'income' ? 'Income' : type === 'transfer' ? 'Transfer' : 'Expense'),
      amount,
      category: input.category || (type === 'income' ? 'Income' : 'Other'),
      date: input.date || new Date().toISOString(),
      accountId: account?.id || 'id_1',
      accountName: input.accountName || account?.name || 'Primary Account',
      type,
      notes: input.notes || '',
      isRecurring: Boolean(input.isRecurring),
    };
    setTransactions((prev) => [created, ...prev]);

    if (account && type !== 'transfer') {
      const delta = type === 'income' ? amount : -amount;
      setAccounts((prev) =>
        prev.map((item) => (item.id === account.id ? { ...item, balance: item.balance + delta } : item))
      );
    }
    return created;
  };

  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  const addAccount = (input: Partial<Account>) => {
    const created: Account = {
      ...mockAccounts[0],
      ...input,
      id: nextId('acc'),
      name: input.name || 'New Account',
      type: input.type || 'checking',
      balance: asNumber(input.balance, 0),
      currency: input.currency || 'USD',
      icon: input.icon || 'bank',
      color: input.color || '#4F46E5',
      last4digits: input.last4digits || '0000',
      institution: input.institution || 'Manual',
    };
    setAccounts((prev) => [created, ...prev]);
    setConnectedAccounts((prev) => [
      {
        ...mockConnectedAccounts[0],
        id: created.id,
        bankId: 'manual',
        bankName: created.institution,
        accountName: created.name,
        accountType: created.type,
        balance: created.balance,
        maskedNumber: `****${created.last4digits || '0000'}`,
        lastSynced: new Date().toISOString(),
        syncStatus: 'synced' as const,
        isActive: true,
        autoSync: false,
        connectedAt: new Date().toISOString(),
        transactionCount: 0,
      },
      ...prev,
    ]);
  };

  const addBudget = (input: Partial<Budget>) => {
    const created: Budget = {
      ...mockBudgets[0],
      ...input,
      id: nextId('bud'),
      category: input.category || 'Other',
      budgeted: asNumber(input.budgeted, 500),
      spent: asNumber(input.spent, 0),
      period: input.period || 'monthly',
      color: input.color || '#4F46E5',
      icon: input.icon || 'wallet',
    };
    setBudgets((prev) => [created, ...prev]);
  };

  const updateBudget = (id: string, patch: Partial<Budget>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((item) => item.id !== id));
  };

  const addGoal = (input: Partial<Goal>) => {
    const created: Goal = {
      ...mockGoals[0],
      ...input,
      id: nextId('goal'),
      name: input.name || 'New Goal',
      targetAmount: asNumber(input.targetAmount, 1000),
      currentAmount: asNumber(input.currentAmount, 0),
      deadline: input.deadline || new Date(Date.now() + 86400000 * 180).toISOString(),
      icon: input.icon || 'flag',
      color: input.color || '#4F46E5',
    };
    setSavingsGoals((prev) => [created, ...prev]);
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setSavingsGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
  };

  const addBill = (input: Partial<Bill>) => {
    const created: Bill = {
      ...mockBills[0],
      ...input,
      id: nextId('bill'),
      name: input.name || 'New Bill',
      amount: asNumber(input.amount, 50),
      dueDate: input.dueDate || new Date().toISOString(),
      isPaid: Boolean(input.isPaid),
    };
    setBills((prev) => [created, ...prev]);
  };

  const markBillPaid = (id: string) => {
    setBills((prev) => prev.map((item) => (item.id === id ? { ...item, isPaid: true } : item)));
  };

  const addLoan = (input: Partial<Loan>) => {
    const remaining = asNumber((input as any).remainingAmount ?? (input as any).remaining, 1000);
    const created: Loan = {
      ...mockLoans[0],
      ...input,
      id: nextId('loan'),
      name: input.name || 'New Loan',
      lender: (input as any).lender || 'Lender',
      totalAmount: asNumber((input as any).totalAmount ?? (input as any).total, remaining || 10000),
      remainingAmount: remaining,
      interestRate: asNumber((input as any).interestRate ?? (input as any).rate, 5),
      monthlyPayment: asNumber((input as any).monthlyPayment ?? (input as any).monthly, 100),
      type: (input as any).type || 'personal',
    };
    setLoans((prev) => [created, ...prev]);
  };

  const payLoan = (id: string, amount?: number) => {
    setLoans((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const payment = asNumber(amount, item.monthlyPayment);
        return {
          ...item,
          remainingAmount: Math.max(0, item.remainingAmount - payment),
        };
      })
    );
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((item) => item.id !== id));
  };

  const addInvestment = (input: Partial<Investment>) => {
    const ticker = (input as any).ticker || 'NEW';
    const buyPrice = asNumber((input as any).buyPrice, 100);
    const quantity = asNumber((input as any).quantity, 1);
    const created: Investment = {
      ...mockInvestments[0],
      ...input,
      id: nextId('inv'),
      name: (input as any).name || ticker,
      ticker,
      type: (input as any).type || 'stock',
      quantity,
      buyPrice,
      currentPrice: asNumber((input as any).currentPrice, buyPrice),
      change: 0,
      changePercent: 0,
    };
    setInvestments((prev) => [created, ...prev]);
  };

  const addSubscription = (input: Partial<Subscription>) => {
    const created: Subscription = {
      ...mockSubscriptions[0],
      ...input,
      id: nextId('sub'),
      name: input.name || 'New Subscription',
      amount: asNumber(input.amount, 9.99),
      billingDate: input.billingDate || new Date().toISOString(),
      category: input.category || 'Entertainment',
      status: input.status || 'active',
    };
    setSubscriptions((prev) => [created, ...prev]);
  };

  const addTransfer = (fromId?: string, toId?: string, amount?: number | string, notes?: string) => {
    const from = accounts.find((item) => item.id === fromId) || accounts[0];
    const to =
      accounts.find((item) => item.id === toId && item.id !== from?.id) ||
      accounts.find((item) => item.id !== from?.id) ||
      accounts[1] ||
      accounts[0];
    const value = Math.abs(asNumber(amount, 50));
    if (!from || !to) return;

    setAccounts((prev) =>
      prev.map((item) => {
        if (item.id === from.id) return { ...item, balance: item.balance - value };
        if (item.id === to.id) return { ...item, balance: item.balance + value };
        return item;
      })
    );

    addTransaction({
      title: `Transfer to ${to.name}`,
      amount: value,
      category: 'Transfer',
      type: 'transfer',
      accountId: from.id,
      accountName: from.name,
      notes: notes || `From ${from.name} to ${to.name}`,
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const value = useMemo<AppStoreValue>(
    () => ({
      isAuthenticated,
      user,
      accounts,
      connectedAccounts,
      transactions,
      budgets,
      savingsGoals,
      bills,
      loans,
      investments,
      notifications,
      subscriptions,
      login,
      signup,
      logout,
      updateUser,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      addBudget,
      updateBudget,
      deleteBudget,
      addGoal,
      updateGoal,
      deleteGoal,
      addBill,
      markBillPaid,
      addLoan,
      payLoan,
      deleteLoan,
      addInvestment,
      addSubscription,
      addTransfer,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      isAuthenticated,
      user,
      accounts,
      connectedAccounts,
      transactions,
      budgets,
      savingsGoals,
      bills,
      loans,
      investments,
      notifications,
      subscriptions,
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return context;
}
