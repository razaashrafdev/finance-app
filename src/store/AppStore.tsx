import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import * as authApi from '../api/auth';
import { readAuthLink } from '../auth/links';
import {
  clearSession,
  getAccessToken,
  saveSession,
  savePendingSignup,
  getPendingSignup,
  clearPendingSignup,
} from '../storage/session';
import {
  mapToCanonicalState,
  canonicalToAppStore,
  appStoreToCanonical,
  createDefaultUser,
} from '../data/canonicalState';
import {
  encryptState,
  decryptState,
  isEncryptedEnvelope,
  computePayloadHash,
} from '../crypto/encryption';
import {
  saveDurableState,
  loadDurableState,
  saveEncryptedEnvelope,
  clearDurableState,
  clearEncryptedEnvelope,
  setLastSyncTimestamp,
  setPendingSyncState,
} from '../storage/durable';

type UserProfile = ReturnType<typeof createDefaultUser>;
type Account = any;
type Transaction = any;
type Budget = any;
type Goal = any;
type Bill = any;
type Loan = any;
type Investment = any;
type NotificationItem = any;
type Subscription = any;
type ConnectedAccount = any;

type BankStatement = {
  accountId: string;
  bankName: string;
  accountName: string;
  month: string;
  year: number;
  openingBalance: number;
  closingBalance: number;
  newBalance: number;
  transactions: Transaction[];
};

function nextId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function blankUser(): UserProfile {
  return createDefaultUser();
}

function splitName(fullName: string, email: string) {
  const cleaned = fullName.trim();
  if (!cleaned) {
    const local = email.split('@')[0] || 'User';
    return { firstName: local, lastName: '' };
  }
  const [firstName, ...rest] = cleaned.split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

function applyAuthUser(
  prev: UserProfile,
  authUser: authApi.AuthUser | null,
  profile: authApi.AuthProfile
): UserProfile {
  const fullName = profile?.full_name || authUser?.user_metadata?.full_name || '';
  const email = profile?.email || authUser?.email || prev.email;
  const names = splitName(fullName, email || '');
  // Prefer explicit names from profile/metadata; keep previous names if metadata is empty.
  const firstName = fullName.trim() ? names.firstName : prev.firstName || names.firstName;
  const lastName = fullName.trim() ? names.lastName : prev.lastName || names.lastName;
  return {
    ...prev,
    firstName,
    lastName,
    email,
    phone: profile?.phone || prev.phone || '',
    avatar: profile?.avatar_url || authUser?.user_metadata?.avatar_url || prev.avatar || '',
    joinDate: authUser?.created_at || prev.joinDate,
  };
}

function mergeFinanceUser(authUser: UserProfile, financeUser?: UserProfile | null): UserProfile {
  const finance = financeUser || blankUser();
  return {
    ...finance,
    firstName: authUser.firstName || finance.firstName || '',
    lastName: authUser.lastName || finance.lastName || '',
    email: authUser.email || finance.email || '',
    phone: authUser.phone || finance.phone || '',
    avatar: authUser.avatar || finance.avatar || '',
    joinDate: authUser.joinDate || finance.joinDate || '',
  };
}

function applyCanonicalToState(
  parsedState: Record<string, any>,
  setters: {
    setUser: (v: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
    setAccounts: (v: Account[]) => void;
    setConnectedAccounts: (v: ConnectedAccount[]) => void;
    setTransactions: (v: Transaction[]) => void;
    setBudgets: (v: Budget[]) => void;
    setSavingsGoals: (v: Goal[]) => void;
    setBills: (v: Bill[]) => void;
    setLoans: (v: Loan[]) => void;
    setInvestments: (v: Investment[]) => void;
    setNotifications: (v: NotificationItem[]) => void;
    setSubscriptions: (v: Subscription[]) => void;
    setCategories: (v: Record<string, any>) => void;
  }
) {
  const appData = canonicalToAppStore(parsedState);
  // Never wipe auth identity with an empty finance snapshot user.
  setters.setUser((prev) => mergeFinanceUser(prev, appData.user));
  setters.setAccounts(appData.accounts || []);
  setters.setConnectedAccounts(appData.connectedAccounts || []);
  setters.setTransactions(appData.transactions || []);
  setters.setBudgets(appData.budgets || []);
  setters.setSavingsGoals(appData.savingsGoals || []);
  setters.setBills(appData.bills || []);
  setters.setLoans(appData.loans || []);
  setters.setInvestments(appData.investments || []);
  setters.setNotifications(appData.notifications || []);
  setters.setSubscriptions(appData.subscriptions || []);
  setters.setCategories(appData.categories || {});
}

function resetFinanceCollections(setters: {
  setAccounts: (v: Account[]) => void;
  setConnectedAccounts: (v: ConnectedAccount[]) => void;
  setTransactions: (v: Transaction[]) => void;
  setBudgets: (v: Budget[]) => void;
  setSavingsGoals: (v: Goal[]) => void;
  setBills: (v: Bill[]) => void;
  setLoans: (v: Loan[]) => void;
  setInvestments: (v: Investment[]) => void;
  setNotifications: (v: NotificationItem[]) => void;
  setSubscriptions: (v: Subscription[]) => void;
  setCategories: (v: Record<string, any>) => void;
}) {
  setters.setAccounts([]);
  setters.setConnectedAccounts([]);
  setters.setTransactions([]);
  setters.setBudgets([]);
  setters.setSavingsGoals([]);
  setters.setBills([]);
  setters.setLoans([]);
  setters.setInvestments([]);
  setters.setNotifications([]);
  setters.setSubscriptions([]);
  setters.setCategories({});
}

interface AppStoreValue {
  authReady: boolean;
  isAuthenticated: boolean;
  recoveryToken: string | null;
  pendingSignup: { email: string; fullName: string } | null;
  user: UserProfile;
  accounts: Account[];
  connectedAccounts: ConnectedAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: Goal[];
  bills: Bill[];
  loans: Loan[];
  investments: Investment[];
  notifications: NotificationItem[];
  subscriptions: Subscription[];
  categories: Record<string, any>;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }) => Promise<{ needsVerification: boolean }>;
  verifySignupCode: (email: string, code: string) => Promise<void>;
  resendSignupCode: (email: string) => Promise<void>;
  cancelPendingSignup: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearRecovery: () => void;
  updateUser: (patch: Partial<UserProfile>) => Promise<void>;
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
  importStatement: (statement: BankStatement) => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

const DEBOUNCE_MS = 1500;

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [pendingSignup, setPendingSignup] = useState<{ email: string; fullName: string } | null>(null);
  const [user, setUser] = useState<UserProfile>(blankUser);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Record<string, any>>({});

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const userIdRef = useRef<string>('');
  const isAuthenticatedRef = useRef(false);
  const persistFinanceRef = useRef<(debounced?: boolean) => Promise<void>>(async () => {});
  const loadFinanceRef = useRef<() => Promise<void>>(async () => {});

  const financeSnapshotRef = useRef({
    user: blankUser() as UserProfile,
    accounts: [] as Account[],
    connectedAccounts: [] as ConnectedAccount[],
    transactions: [] as Transaction[],
    budgets: [] as Budget[],
    savingsGoals: [] as Goal[],
    bills: [] as Bill[],
    loans: [] as Loan[],
    investments: [] as Investment[],
    categories: {} as Record<string, any>,
    notifications: [] as NotificationItem[],
    subscriptions: [] as Subscription[],
  });

  financeSnapshotRef.current = {
    user,
    accounts,
    connectedAccounts,
    transactions,
    budgets,
    savingsGoals,
    bills,
    loans,
    investments,
    categories,
    notifications,
    subscriptions,
  };
  isAuthenticatedRef.current = isAuthenticated;

  const stateSetters = useMemo(
    () => ({
      setUser,
      setAccounts,
      setConnectedAccounts,
      setTransactions,
      setBudgets,
      setSavingsGoals,
      setBills,
      setLoans,
      setInvestments,
      setNotifications,
      setSubscriptions,
      setCategories,
    }),
    []
  );

  const applyLoadedState = useCallback(
    (parsedState: Record<string, any>) => {
      applyCanonicalToState(parsedState, stateSetters);
    },
    [stateSetters]
  );

  const loadFinanceData = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) {
      resetFinanceCollections(stateSetters);
      return;
    }

    try {
      const response = await authApi.getFinanceData();
      if (!response.exists || !response.data?.encryptedPayload) {
        // New user / no cloud snapshot yet — keep auth profile, clear finance collections only.
        resetFinanceCollections(stateSetters);
        return;
      }

      let envelope: any;
      try {
        envelope = JSON.parse(response.data.encryptedPayload);
      } catch {
        resetFinanceCollections(stateSetters);
        return;
      }

      let parsedState: Record<string, any>;
      if (isEncryptedEnvelope(envelope)) {
        try {
          const decrypted = await decryptState(envelope, userId);
          parsedState = JSON.parse(decrypted);
        } catch {
          // Device key missing/changed — cannot decrypt; start clean for this device.
          resetFinanceCollections(stateSetters);
          return;
        }
      } else {
        parsedState = mapToCanonicalState(envelope);
      }

      applyLoadedState(mapToCanonicalState(parsedState));
      try {
        await saveDurableState(parsedState, userId);
        if (isEncryptedEnvelope(envelope)) {
          await saveEncryptedEnvelope(envelope);
        }
      } catch {
        // Local durable cache is best-effort.
      }
    } catch {
      // Network failure: keep durable cache if present, otherwise empty finance collections.
      try {
        const durable = await loadDurableState();
        if (durable?.state) {
          applyLoadedState(mapToCanonicalState(durable.state));
          return;
        }
      } catch {
        // ignore
      }
      resetFinanceCollections(stateSetters);
    }
  }, [applyLoadedState, stateSetters]);
  loadFinanceRef.current = loadFinanceData;

  const establishSession = useCallback(
    async (accessToken: string, refreshToken?: string, authUser?: authApi.AuthUser | null) => {
      await saveSession(accessToken, refreshToken);
      if (authUser) {
        setUser((prev) => applyAuthUser(prev, authUser, null));
        if (authUser.id) userIdRef.current = authUser.id;
      }
      setIsAuthenticated(true);
      try {
        const me = await authApi.getMe();
        setUser((prev) => applyAuthUser(prev, me.user, me.profile));
        userIdRef.current = me.user.id;
      } catch {
        // The sign-in payload already has the user when /me is briefly unavailable.
      }
      await loadFinanceRef.current();
    },
    []
  );

  const scheduleSync = () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      void persistFinanceRef.current(true);
    }, DEBOUNCE_MS);
  };

  const persistFinanceData = useCallback(async () => {
    if (isSyncingRef.current) return;
    if (!isAuthenticatedRef.current || !userIdRef.current) return;

    isSyncingRef.current = true;
    try {
      const snapshot = financeSnapshotRef.current;
      const canonicalData = appStoreToCanonical(
        {
          user: snapshot.user,
          accounts: snapshot.accounts,
          connectedAccounts: snapshot.connectedAccounts,
          transactions: snapshot.transactions,
          budgets: snapshot.budgets,
          savingsGoals: snapshot.savingsGoals,
          bills: snapshot.bills,
          loans: snapshot.loans,
          investments: snapshot.investments,
          categories: snapshot.categories,
          notifications: snapshot.notifications,
          subscriptions: snapshot.subscriptions,
          settings: {},
        },
        userIdRef.current
      );
      const stateStr = JSON.stringify(canonicalData);
      const stateVersion = Date.now();
      const envelope = await encryptState(stateStr, userIdRef.current);
      envelope.stateVersion = stateVersion;
      const payloadHash = await computePayloadHash(stateStr);

      await saveDurableState(canonicalData, userIdRef.current);
      await saveEncryptedEnvelope(envelope);
      await setPendingSyncState(canonicalData, stateVersion);
      await setLastSyncTimestamp(new Date().toISOString());

      await authApi.putFinanceData({
        encryptedPayload: JSON.stringify(envelope),
        payloadVersion: stateVersion,
        encryptionVersion: envelope.version,
        payloadHash,
      });
    } catch {
      // Keep local durable cache; next change or restart can retry.
    } finally {
      isSyncingRef.current = false;
    }
  }, []);
  persistFinanceRef.current = persistFinanceData;

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.signIn(email.trim(), password);
      if (!result.accessToken) {
        throw new Error('Sign in did not return a session. Verify your email, then try again.');
      }
      await establishSession(result.accessToken, result.refreshToken, result.user);
    },
    [establishSession]
  );

  const signup = useCallback(
    async (data: { firstName?: string; lastName?: string; email?: string; password?: string }) => {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      const result = await authApi.signUp((data.email || '').trim(), data.password || '', fullName);
      if (!result.accessToken) {
        await savePendingSignup((data.email || '').trim(), fullName);
        setPendingSignup({ email: (data.email || '').trim(), fullName });
        return { needsVerification: true };
      }
      await clearPendingSignup();
      setPendingSignup(null);
      await establishSession(result.accessToken, result.refreshToken, result.user);
      return { needsVerification: false };
    },
    [establishSession]
  );

  const verifySignupCode = useCallback(
    async (email: string, code: string) => {
      const result = await authApi.verifySignupCode(email.trim(), code.trim());
      if (!result.accessToken) {
        throw new Error('That code did not create a session. Request a new code and try again.');
      }
      await clearPendingSignup();
      setPendingSignup(null);
      await establishSession(result.accessToken, result.refreshToken, result.user);
    },
    [establishSession]
  );

  const cancelPendingSignup = useCallback(async () => {
    setPendingSignup(null);
    await clearPendingSignup();
  }, []);

  const resendSignupCode = useCallback(async (email: string) => {
    await authApi.resendSignupCode(email.trim());
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.signOut();
    } catch {
      // Clear the local session even if the server cannot be reached.
    }
    await clearSession();
    await clearDurableState();
    await clearEncryptedEnvelope();
    resetFinanceCollections(stateSetters);
    setUser(blankUser());
    userIdRef.current = '';
    setIsAuthenticated(false);
    setPendingSignup(null);
    await clearPendingSignup();
  }, [stateSetters]);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword(email.trim());
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    await authApi.resetPassword(email.trim(), code.trim(), newPassword);
    await clearSession();
    setRecoveryToken(null);
    setUser(blankUser());
    setIsAuthenticated(false);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authApi.changePassword(currentPassword, newPassword);
  }, []);

  const clearRecovery = useCallback(() => {
    setRecoveryToken(null);
  }, []);

  const updateUser = useCallback(async (patch: Partial<UserProfile>) => {
    const fullName = `${patch.firstName || ''} ${patch.lastName || ''}`.trim();
    await authApi.updateProfile({
      fullName,
      email: patch.email,
    });
    setUser((prev) => ({ ...prev, ...patch }));
    void scheduleSync();
  }, []);

  const addTransaction = (input: Partial<Transaction> & { type?: string }) => {
    const type = (input.type as Transaction['type']) || 'expense';
    const amount = Math.abs(asNumber(input.amount, 100));
    const account = accounts.find((item) => item.id === input.accountId) || accounts[0];
    const created: Transaction = {
      id: nextId('txn'),
      ...input,
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
    void scheduleSync();
    return created;
  };

  const updateTransaction = (id: string, patch: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    void scheduleSync();
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
    void scheduleSync();
  };

  const addAccount = (input: Partial<Account>) => {
    const created: Account = {
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
        id: created.id,
        bankId: 'manual',
        bankName: created.institution,
        accountName: created.name,
        accountType: created.type,
        balance: created.balance,
        maskedNumber: `****${created.last4digits || '0000'}`,
        lastSynced: new Date().toISOString(),
        syncStatus: 'synced',
        isActive: true,
        autoSync: false,
        connectedAt: new Date().toISOString(),
        transactionCount: 0,
      },
      ...prev,
    ]);
    void scheduleSync();
  };

  const addBudget = (input: Partial<Budget>) => {
    const created: Budget = {
      id: nextId('bud'),
      category: input.category || 'Other',
      budgeted: asNumber(input.budgeted, 500),
      spent: asNumber(input.spent, 0),
      period: input.period || 'monthly',
      color: input.color || '#4F46E5',
      icon: input.icon || 'wallet',
    };
    setBudgets((prev) => [created, ...prev]);
    void scheduleSync();
  };

  const updateBudget = (id: string, patch: Partial<Budget>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    void scheduleSync();
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((item) => item.id !== id));
    void scheduleSync();
  };

  const addGoal = (input: Partial<Goal>) => {
    const created: Goal = {
      id: nextId('goal'),
      name: input.name || 'New Goal',
      targetAmount: asNumber(input.targetAmount, 1000),
      currentAmount: asNumber(input.currentAmount, 0),
      deadline: input.deadline || new Date(Date.now() + 86400000 * 180).toISOString(),
      icon: input.icon || 'flag',
      color: input.color || '#4F46E5',
    };
    setSavingsGoals((prev) => [created, ...prev]);
    void scheduleSync();
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setSavingsGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    void scheduleSync();
  };

  const deleteGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
    void scheduleSync();
  };

  const addBill = (input: Partial<Bill>) => {
    const created: Bill = {
      id: nextId('bill'),
      name: input.name || 'New Bill',
      amount: asNumber(input.amount, 50),
      dueDate: input.dueDate || new Date().toISOString(),
      isPaid: Boolean(input.isPaid),
    };
    setBills((prev) => [created, ...prev]);
    void scheduleSync();
  };

  const markBillPaid = (id: string) => {
    setBills((prev) => prev.map((item) => (item.id === id ? { ...item, isPaid: true } : item)));
    void scheduleSync();
  };

  const addLoan = (input: Partial<Loan>) => {
    const remaining = asNumber((input as any).remainingAmount ?? (input as any).remaining, 1000);
    const created: Loan = {
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
    void scheduleSync();
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
    void scheduleSync();
  };

  const deleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((item) => item.id !== id));
    void scheduleSync();
  };

  const addInvestment = (input: Partial<Investment>) => {
    const ticker = (input as any).ticker || 'NEW';
    const buyPrice = asNumber((input as any).buyPrice, 100);
    const quantity = asNumber((input as any).quantity, 1);
    const created: Investment = {
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
    void scheduleSync();
  };

  const addSubscription = (input: Partial<Subscription>) => {
    const created: Subscription = {
      id: nextId('sub'),
      name: input.name || 'New Subscription',
      amount: asNumber(input.amount, 9.99),
      billingDate: input.billingDate || new Date().toISOString(),
      category: input.category || 'Entertainment',
      status: input.status || 'active',
    };
    setSubscriptions((prev) => [created, ...prev]);
    void scheduleSync();
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
    void scheduleSync();
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    void scheduleSync();
  };

  const importStatement = (statement: BankStatement) => {
    setTransactions((prev) => [...statement.transactions, ...prev]);
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === statement.accountId ? { ...acc, balance: statement.newBalance } : acc
      )
    );
    void scheduleSync();
  };

  useEffect(() => {
    let active = true;

    const openRecovery = (accessToken: string) => {
      setRecoveryToken(accessToken);
      setIsAuthenticated(false);
    };

    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      const link = readAuthLink(event.url);
      if (!link.accessToken) return;
      if (link.type === 'recovery') {
        openRecovery(link.accessToken);
        return;
      }
      void establishSession(link.accessToken, link.refreshToken);
    });

    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const initialLink = initialUrl ? readAuthLink(initialUrl) : null;
        if (initialLink?.type === 'recovery' && initialLink.accessToken) {
          if (active) openRecovery(initialLink.accessToken);
          return;
        }
        if (initialLink?.accessToken) {
          await establishSession(initialLink.accessToken, initialLink.refreshToken);
          return;
        }
        const token = await getAccessToken();
        if (!token) {
          const pending = await getPendingSignup();
          if (pending) {
            setPendingSignup(pending);
          }
          return;
        }
        const me = await authApi.getMe();
        if (!active) return;
        setUser((prev) => applyAuthUser(prev, me.user, me.profile));
        setIsAuthenticated(true);
        userIdRef.current = me.user.id;
        await loadFinanceRef.current();
      } catch {
        await clearSession();
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    })();

    return () => {
      active = false;
      subscription.remove();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [establishSession]);

  const value = useMemo<AppStoreValue>(
    () => ({
      authReady,
      isAuthenticated,
      recoveryToken,
      pendingSignup,
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
      categories,
      login,
      signup,
      verifySignupCode,
      resendSignupCode,
      cancelPendingSignup,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      clearRecovery,
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
      importStatement,
    }),
    [
      authReady,
      isAuthenticated,
      recoveryToken,
      pendingSignup,
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
      categories,
      login,
      signup,
      verifySignupCode,
      resendSignupCode,
      cancelPendingSignup,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      clearRecovery,
      updateUser,
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
