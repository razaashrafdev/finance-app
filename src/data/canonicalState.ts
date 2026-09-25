export function createDefaultUser() {
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalSavings: 0,
    netWorth: 0,
    joinDate: '',
  };
}

export function createEmptyAccounts() {
  return [];
}

export function createEmptyConnectedAccounts() {
  return [];
}

export function createEmptyTransactions() {
  return [];
}

export function createEmptyBudgets() {
  return [];
}

export function createEmptyGoals() {
  return [];
}

export function createEmptyBills() {
  return [];
}

export function createEmptyLoans() {
  return [];
}

export function createEmptyInvestments() {
  return [];
}

export function createEmptyNotifications() {
  return [];
}

export function createEmptySubscriptions() {
  return [];
}

export function createEmptyCategories() {
  return {};
}

export function createDefaultSettings() {
  return {
    currency: 'USD',
    theme: 'system',
    firstDayOfWeek: 0,
    dateFormat: 'MM/DD/YYYY',
    currencyLocale: 'en-US',
  };
}

export function createEmptyCanonicalState(userId = '') {
  return {
    version: 1,
    user: createDefaultUser(),
    accounts: createEmptyAccounts(),
    transactions: createEmptyTransactions(),
    budgets: createEmptyBudgets(),
    savingsGoals: createEmptyGoals(),
    bills: createEmptyBills(),
    loans: createEmptyLoans(),
    investments: createEmptyInvestments(),
    categories: createEmptyCategories(),
    notifications: createEmptyNotifications(),
    subscriptions: createEmptySubscriptions(),
    connectedAccounts: createEmptyConnectedAccounts(),
    settings: createDefaultSettings(),
    metadata: {
      userId,
      lastSyncedAt: null,
      version: 1,
    },
  };
}

export function mapToCanonicalState(data: Record<string, any>) {
  if (!data || typeof data !== 'object') {
    return createEmptyCanonicalState();
  }
  return {
    version: data.version || 1,
    user: data.user || createDefaultUser(),
    accounts: Array.isArray(data.accounts) ? data.accounts : [],
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    budgets: Array.isArray(data.budgets) ? data.budgets : [],
    savingsGoals: Array.isArray(data.savingsGoals) ? data.savingsGoals : [],
    bills: Array.isArray(data.bills) ? data.bills : [],
    loans: Array.isArray(data.loans) ? data.loans : [],
    investments: Array.isArray(data.investments) ? data.investments : [],
    categories: data.categories || createEmptyCategories(),
    notifications: Array.isArray(data.notifications) ? data.notifications : [],
    subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : [],
    connectedAccounts: Array.isArray(data.connectedAccounts) ? data.connectedAccounts : [],
    settings: data.settings || createDefaultSettings(),
    metadata: data.metadata || {
      userId: '',
      lastSyncedAt: null,
      version: 1,
    },
  };
}

export function canonicalToAppStore(state: Record<string, any>) {
  return {
    user: state.user || createDefaultUser(),
    accounts: state.accounts || [],
    connectedAccounts: state.connectedAccounts || [],
    transactions: state.transactions || [],
    budgets: state.budgets || [],
    savingsGoals: state.savingsGoals || [],
    bills: state.bills || [],
    loans: state.loans || [],
    investments: state.investments || [],
    notifications: state.notifications || [],
    subscriptions: state.subscriptions || [],
    categories: state.categories || {},
    settings: { ...createDefaultSettings(), ...(state.settings || {}) },
  };
}

export function appStoreToCanonical(storeState: Record<string, any>, userId = '') {
  return {
    version: 1,
    user: storeState.user || createDefaultUser(),
    accounts: storeState.accounts || [],
    transactions: storeState.transactions || [],
    budgets: storeState.budgets || [],
    savingsGoals: storeState.savingsGoals || [],
    bills: storeState.bills || [],
    loans: storeState.loans || [],
    investments: storeState.investments || [],
    categories: storeState.categories || createEmptyCategories(),
    notifications: storeState.notifications || [],
    subscriptions: storeState.subscriptions || [],
    connectedAccounts: storeState.connectedAccounts || [],
    settings: { ...createDefaultSettings(), ...(storeState.settings || {}) },
    metadata: {
      userId,
      lastSyncedAt: new Date().toISOString(),
      version: 1,
    },
  };
}
