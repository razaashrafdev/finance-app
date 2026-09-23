import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import * as authApi from '../api/auth';
import { readAuthLink } from '../auth/links';
import { clearSession, getAccessToken, saveSession, savePendingSignup, getPendingSignup, clearPendingSignup, saveDrivePromptPending, getDrivePromptAgeMs, clearDrivePromptPending } from '../storage/session';
import {
  createEmptyCanonicalState,
  mapToCanonicalState,
  canonicalToAppStore,
  appStoreToCanonical,
  createDefaultUser,
} from '../data/canonicalState';

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
  return {
    ...prev,
    firstName: names.firstName,
    lastName: names.lastName,
    email,
    phone: profile?.phone || '',
    avatar: profile?.avatar_url || authUser?.user_metadata?.avatar_url || '',
    joinDate: authUser?.created_at || prev.joinDate,
  };
}

interface DriveSyncState {
  status: 'checking' | 'not_connected' | 'connecting' | 'loading' | 'syncing' | 'synced' | 'sync_failed' | 'reconnect_required';
  driveConnected: boolean;
  driveFileId: string | null;
  driveFolderId: string | null;
  lastSyncedAt: string | null;
  error: string | null;
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
  driveSync: DriveSyncState;
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
  connectDrive: () => Promise<void>;
  loadDriveData: () => Promise<void>;
  syncToDrive: (debounced?: boolean) => Promise<void>;
  disconnectDrive: () => Promise<void>;
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

  const [driveSync, setDriveSync] = useState<DriveSyncState>({
    status: 'checking',
    driveConnected: false,
    driveFileId: null,
    driveFolderId: null,
    lastSyncedAt: null,
    error: null,
  });

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSyncingRef = useRef(false);
  const authReadyRef = useRef(false);
  const userIdRef = useRef<string>('');
  const connectDriveRef = useRef<() => Promise<void>>(async () => {});
  const driveStatusRef = useRef('checking');
  driveStatusRef.current = driveSync.status;

  const establishSession = useCallback(
    async (accessToken: string, refreshToken?: string, authUser?: authApi.AuthUser | null) => {
      await saveSession(accessToken, refreshToken);
      if (authUser) {
        setUser((prev) => applyAuthUser(prev, authUser, null));
      }
      setIsAuthenticated(true);
      try {
        const me = await authApi.getMe();
        const u = me.user;
        setUser((prev) => applyAuthUser(prev, me.user, me.profile));
        userIdRef.current = u.id;
      } catch {
        // The sign-in payload already has the user when /me is briefly unavailable.
      }
    },
    []
  );

  const loadDriveStateAndData = useCallback(async () => {
    try {
      setDriveSync((prev) => ({ ...prev, status: 'checking', error: null }));
      const status = await authApi.checkDriveStatus();
      if (status.connected) {
        await clearDrivePromptPending();
        setDriveSync({
          status: 'loading',
          driveConnected: true,
          driveFileId: status.driveFileId || null,
          driveFolderId: status.driveFolderId || null,
          lastSyncedAt: status.connectedAt || null,
          error: null,
        });
        try {
          const driveData = await authApi.loadDriveData();
          const canonical = mapToCanonicalState(driveData.data);
          const appData = canonicalToAppStore(canonical);
          setUser(appData.user || blankUser());
          setAccounts(appData.accounts || []);
          setConnectedAccounts(appData.connectedAccounts || []);
          setTransactions(appData.transactions || []);
          setBudgets(appData.budgets || []);
          setSavingsGoals(appData.savingsGoals || []);
          setBills(appData.bills || []);
          setLoans(appData.loans || []);
          setInvestments(appData.investments || []);
          setNotifications(appData.notifications || []);
          setSubscriptions(appData.subscriptions || []);
          setCategories(appData.categories || {});
          setDriveSync((prev) => ({
            ...prev,
            status: 'synced',
            lastSyncedAt: new Date().toISOString(),
          }));
        } catch {
          setDriveSync((prev) => ({
            ...prev,
            status: 'sync_failed',
            error: 'Failed to load Drive data',
          }));
        }
        return true;
      }
      setDriveSync({
        status: 'not_connected',
        driveConnected: false,
        driveFileId: null,
        driveFolderId: null,
        lastSyncedAt: null,
        error: null,
      });
      return false;
    } catch {
      setDriveSync({
        status: 'reconnect_required',
        driveConnected: false,
        driveFileId: null,
        driveFolderId: null,
        lastSyncedAt: null,
        error: 'Unable to verify Drive connection',
      });
      return false;
    }
  }, []);

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
      void connectDriveRef.current();
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
      void connectDriveRef.current();
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
    setUser(blankUser());
    setAccounts([]);
    setConnectedAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setBills([]);
    setLoans([]);
    setInvestments([]);
    setNotifications([]);
    setSubscriptions([]);
    setCategories({});
    setIsAuthenticated(false);
    setDriveSync({
      status: 'checking',
      driveConnected: false,
      driveFileId: null,
      driveFolderId: null,
      lastSyncedAt: null,
      error: null,
    });
    setPendingSignup(null);
    await clearPendingSignup();
    await clearDrivePromptPending();
  }, []);

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
  };

  const updateBudget = (id: string, patch: Partial<Budget>) => {
    setBudgets((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((item) => item.id !== id));
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
  };

  const updateGoal = (id: string, patch: Partial<Goal>) => {
    setSavingsGoals((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const deleteGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((item) => item.id !== id));
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
  };

  const markBillPaid = (id: string) => {
    setBills((prev) => prev.map((item) => (item.id === id ? { ...item, isPaid: true } : item)));
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

  const importStatement = (statement: BankStatement) => {
    setTransactions((prev) => [...statement.transactions, ...prev]);
    setConnectedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === statement.accountId
          ? { ...acc, balance: statement.newBalance }
          : acc
      )
    );
  };

  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      syncToDrive(true);
    }, DEBOUNCE_MS);
  }, []);

  const syncToDrive = useCallback(
    async (debounced = false) => {
      if (isSyncingRef.current) return;
      if (!driveSync.driveConnected || !userIdRef.current) return;

      isSyncingRef.current = true;
      setDriveSync((prev) => ({ ...prev, status: 'syncing' }));

      try {
        const canonicalData = appStoreToCanonical(
          {
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
            settings: {},
          },
          userIdRef.current
        );
        await authApi.syncDriveData(canonicalData);
        setDriveSync((prev) => ({
          ...prev,
          status: 'synced',
          lastSyncedAt: new Date().toISOString(),
          error: null,
        }));
      } catch (err: any) {
        setDriveSync((prev) => ({
          ...prev,
          status: 'sync_failed',
          error: err?.message || 'Sync failed',
        }));
      } finally {
        isSyncingRef.current = false;
      }
    },
    [driveSync.driveConnected, user, accounts, connectedAccounts, transactions, budgets, savingsGoals, bills, loans, investments, categories, notifications, subscriptions]
  );

  const connectDrive = useCallback(async () => {
    try {
      setDriveSync((prev) => ({ ...prev, status: 'connecting', error: null }));
      driveStatusRef.current = 'connecting';
      await saveDrivePromptPending();
      const { url } = await authApi.startDriveOAuth();
      if (!url) {
        throw new Error('Google Drive did not return a sign-in link');
      }
      await Linking.openURL(url);
    } catch (err: any) {
      await clearDrivePromptPending();
      driveStatusRef.current = 'reconnect_required';
      setDriveSync({
        status: 'reconnect_required',
        driveConnected: false,
        driveFileId: null,
        driveFolderId: null,
        lastSyncedAt: null,
        error: err?.message || 'Could not open Google Drive access',
      });
    }
  }, []);
  connectDriveRef.current = connectDrive;

  const loadDriveDataFn = useCallback(async () => {
    try {
      setDriveSync((prev) => ({ ...prev, status: 'loading' }));
      const driveData = await authApi.loadDriveData();
      const canonical = mapToCanonicalState(driveData.data);
      const appData = canonicalToAppStore(canonical);
      setUser(appData.user || blankUser());
      setAccounts(appData.accounts || []);
      setConnectedAccounts(appData.connectedAccounts || []);
      setTransactions(appData.transactions || []);
      setBudgets(appData.budgets || []);
      setSavingsGoals(appData.savingsGoals || []);
      setBills(appData.bills || []);
      setLoans(appData.loans || []);
      setInvestments(appData.investments || []);
      setNotifications(appData.notifications || []);
      setSubscriptions(appData.subscriptions || []);
      setCategories(appData.categories || {});
      setDriveSync((prev) => ({ ...prev, status: 'synced', lastSyncedAt: new Date().toISOString() }));
    } catch {
      setDriveSync((prev) => ({ ...prev, status: 'sync_failed', error: 'Failed to load Drive data' }));
    }
  }, []);

  const disconnectDriveFn = useCallback(async () => {
    try {
      await authApi.disconnectDrive();
    } catch {
      // Proceed with local cleanup even if server call fails
    }
    setDriveSync({ status: 'not_connected', driveConnected: false, driveFileId: null, driveFolderId: null, lastSyncedAt: null, error: null });
  }, []);

  useEffect(() => {
    let active = true;

    const openRecovery = (accessToken: string) => {
      setRecoveryToken(accessToken);
      setIsAuthenticated(false);
    };

    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      const url = event.url;
      if (url.includes('drive-connected')) {
        void loadDriveStateAndData();
        return;
      }
      const link = readAuthLink(url);
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
          if (active) {
            setAuthReady(true);
            setDriveSync({ status: 'checking', driveConnected: false, driveFileId: null, driveFolderId: null, lastSyncedAt: null, error: null });
          }
          return;
        }
        const me = await authApi.getMe();
        if (!active) return;
        setUser((prev) => applyAuthUser(prev, me.user, me.profile));
        setIsAuthenticated(true);
        userIdRef.current = me.user.id;
        const driveConnected = await loadDriveStateAndData();
        const drivePromptAge = await getDrivePromptAgeMs();
        const shouldResumeDrivePrompt =
          drivePromptAge !== null && drivePromptAge > 20000 && drivePromptAge < 10 * 60 * 1000;
        if (active && !driveConnected && shouldResumeDrivePrompt) {
          await connectDriveRef.current();
        }
      } catch {
        await clearSession();
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    })();

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      setTimeout(() => {
        void (async () => {
          const age = await getDrivePromptAgeMs();
          const waitingForDrive = driveStatusRef.current === 'connecting' || (age !== null && age < 10 * 60 * 1000);
          if (!waitingForDrive) return;
          const connected = await loadDriveStateAndData();
          if (!connected && age !== null && age > 15000) {
            await clearDrivePromptPending();
          }
        })();
      }, 1200);
    });

    return () => {
      active = false;
      subscription.remove();
      appStateSub.remove();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [establishSession, loadDriveStateAndData]);

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
      driveSync,
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
      connectDrive,
      loadDriveData: loadDriveDataFn,
      syncToDrive,
      disconnectDrive: disconnectDriveFn,
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
      driveSync,
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
      connectDrive,
      loadDriveDataFn,
      syncToDrive,
      disconnectDriveFn,
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
