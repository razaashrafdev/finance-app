import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { NavigationContainer, createNavigationContainerRef, useNavigation } from '@react-navigation/native';
import { BottomTabBar, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CardStyleInterpolators, TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAppStore } from '../store/AppStore';
import BottomSheet from '../components/common/BottomSheet';

// ─── Onboarding Screens ────────────────────────────────────────
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen.tsx';

// ─── Home Screens ──────────────────────────────────────────────
import HomeScreen from '../screens/home/HomeScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import IncomeDetailScreen from '../screens/income/IncomeDetailScreen';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetailScreen';
import AccountDetailScreen from '../screens/accounts/AccountDetailScreen';
import AddIncomeScreen from '../screens/income/AddIncomeScreen';
import AddExpenseScreen from '../screens/expenses/AddExpenseScreen';
import AddTransferScreen from '../screens/transfers/AddTransferScreen';

// ─── Transaction Screens ───────────────────────────────────────
import TransactionsListScreen from '../screens/transactions/TransactionsListScreen';
import AddTransactionScreen from '../screens/transactions/AddTransactionScreen';
import EditTransactionScreen from '../screens/transactions/EditTransactionScreen';

// ─── Budget Screens ────────────────────────────────────────────
import BudgetsListScreen from '../screens/budgets/BudgetsListScreen';
import BudgetDetailScreen from '../screens/budgets/BudgetDetailScreen';
import AddBudgetScreen from '../screens/budgets/AddBudgetScreen';
import GoalsListScreen from '../screens/goals/GoalsListScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import AddGoalScreen from '../screens/goals/AddGoalScreen';

// ─── More Screens ──────────────────────────────────────────────
import MoreMenuScreen from '../screens/more/MoreMenuScreen';
import BillsScreen from '../screens/bills/BillsScreen';
import SubscriptionsScreen from '../screens/bills/SubscriptionsScreen';
import LoansScreen from '../screens/loans/LoansScreen';
import LoanDetailScreen from '../screens/loans/LoanDetailScreen';
import CalculatorsListScreen from '../screens/calculators/CalculatorsListScreen';
import CalculatorDetailScreen from '../screens/calculators/CalculatorDetailScreen';
import InvestmentsScreen from '../screens/investments/InvestmentsScreen';
import InvestmentDetailScreen from '../screens/investments/InvestmentDetailScreen';
import NetWorthScreen from '../screens/reports/NetWorthScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import AIAssistantScreen from '../screens/ai-assistant/AIAssistantScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import AddAccountScreen from '../screens/accounts/AddAccountScreen';
import BankSelectionScreen from '../screens/accounts/BankSelectionScreen';
import BankVerificationScreen from '../screens/accounts/BankVerificationScreen';
import BankConsentScreen from '../screens/accounts/BankConsentScreen';
import BankConnectingScreen from '../screens/accounts/BankConnectingScreen';
import BankConnectedScreen from '../screens/accounts/BankConnectedScreen';
import InitialSyncScreen from '../screens/accounts/InitialSyncScreen';
import SyncCompleteScreen from '../screens/accounts/SyncCompleteScreen';
import SyncFailedScreen from '../screens/accounts/SyncFailedScreen';
import BankStatementScreen from '../screens/accounts/BankStatementScreen';

type RootStackParamList = {
  OnboardingStack:
    | {
        screen?: 'Welcome' | 'Onboarding' | 'Login' | 'SignUp' | 'ForgotPassword' | 'ResetPassword';
      }
    | undefined;
  MainTabs: undefined;
};

type OnboardingParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
};

type HomeParamList = {
  Home: undefined;
  TransactionDetail: { transactionId: string };
  IncomeDetail: { incomeId: string };
  ExpenseDetail: { expenseId: string };
  AccountDetail: { accountId: string };
  AddIncome: undefined;
  AddExpense: undefined;
  AddTransfer: undefined;
  AddGoal: undefined;
};

type TransactionsParamList = {
  TransactionsList: undefined;
  TransactionDetail: { transactionId: string };
  AddTransaction: undefined;
  EditTransaction: { transactionId: string };
};

type BudgetsParamList = {
  BudgetsList: undefined;
  BudgetDetail: { budgetId: string };
  AddBudget: undefined;
  GoalsList: undefined;
  GoalDetail: { goalId: string };
  AddGoal: undefined;
};

type MoreParamList = {
  MoreMenu: undefined;
  BillsScreen: undefined;
  SubscriptionsScreen: undefined;
  LoansScreen: undefined;
  LoanDetail: { loanId: string };
  CalculatorsList: undefined;
  CalculatorDetail: { calculatorId: string };
  InvestmentsScreen: undefined;
  InvestmentDetail: { investmentId: string };
  NetWorthScreen: undefined;
  ReportsScreen: undefined;
  CalendarScreen: undefined;
  AIAssistantScreen: undefined;
  NotificationsScreen: undefined;
  SettingsScreen: undefined;
  ProfileScreen: undefined;
  AccountsScreen: undefined;
  AccountDetail: { accountId: string };
  AddAccount: undefined;
  BankSelection: undefined;
  BankVerification: { bankId: string; bankName: string; bankColor: string };
  BankConsent: { bankId: string; bankName: string; bankColor: string };
  BankConnecting: { bankId: string; bankName: string; bankColor: string };
  BankConnected: { bankId: string; bankName: string; bankColor: string };
  InitialSync: { bankId: string; bankName: string; bankColor: string };
  SyncComplete: { bankId: string; bankName: string; bankColor: string };
  SyncFailed: { bankId: string; bankName: string; bankColor: string };
  BankStatement: undefined;
};

const navigationRef = createNavigationContainerRef<RootStackParamList>();
const RootStack = createStackNavigator<RootStackParamList>();
const OnboardingNavigator = createStackNavigator<OnboardingParamList>();
const HomeNavigator = createStackNavigator<HomeParamList>();
const TransactionsNavigator = createStackNavigator<TransactionsParamList>();
const BudgetsNavigator = createStackNavigator<BudgetsParamList>();
const MoreNavigator = createStackNavigator<MoreParamList>();
const Tab = createBottomTabNavigator();

// ─── Stack Options Helper ──────────────────────────────────────
const defaultStackScreenOptions = (colors: any) => ({
  ...TransitionPresets.SlideFromRightIOS,
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  headerStatusBarHeight: 0,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  cardStyle: { backgroundColor: colors.background },
});

// ─── Onboarding Stack ──────────────────────────────────────────
function OnboardingStack() {
  const { colors } = useTheme();

  return (
    <OnboardingNavigator.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <OnboardingNavigator.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingNavigator.Screen name="Onboarding" component={OnboardingScreen} />
      <OnboardingNavigator.Screen name="Login" component={LoginScreen} />
      <OnboardingNavigator.Screen name="SignUp" component={SignUpScreen} />
      <OnboardingNavigator.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <OnboardingNavigator.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </OnboardingNavigator.Navigator>
  );
}

// ─── Home Stack ────────────────────────────────────────────────
function HomeStack() {
  const { colors } = useTheme();

  return (
    <HomeNavigator.Navigator screenOptions={defaultStackScreenOptions(colors)}>
      <HomeNavigator.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeNavigator.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Transaction Details' }}
      />
      <HomeNavigator.Screen
        name="IncomeDetail"
        component={IncomeDetailScreen}
        options={{ title: 'Income Details' }}
      />
      <HomeNavigator.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{ title: 'Expense Details' }}
      />
      <HomeNavigator.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: 'Account Details' }}
      />
      <HomeNavigator.Screen
        name="AddIncome"
        component={AddIncomeScreen}
        options={{ title: 'Add Income' }}
      />
      <HomeNavigator.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: 'Add Expense' }}
      />
      <HomeNavigator.Screen
        name="AddTransfer"
        component={AddTransferScreen}
        options={{ title: 'Transfer' }}
      />
      <HomeNavigator.Screen
        name="AddGoal"
        component={AddGoalScreen}
        options={{ title: 'Add Goal' }}
      />
    </HomeNavigator.Navigator>
  );
}

// ─── Transactions Stack ────────────────────────────────────────
function TransactionsStack() {
  const { colors } = useTheme();

  return (
    <TransactionsNavigator.Navigator screenOptions={defaultStackScreenOptions(colors)}>
      <TransactionsNavigator.Screen
        name="TransactionsList"
        component={TransactionsListScreen}
        options={{ headerShown: false }}
      />
      <TransactionsNavigator.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ title: 'Transaction Details' }}
      />
      <TransactionsNavigator.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Add Transaction' }}
      />
      <TransactionsNavigator.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ title: 'Edit Transaction' }}
      />
    </TransactionsNavigator.Navigator>
  );
}

// ─── Budgets Stack ─────────────────────────────────────────────
function BudgetsStack() {
  const { colors } = useTheme();

  return (
    <BudgetsNavigator.Navigator screenOptions={defaultStackScreenOptions(colors)}>
      <BudgetsNavigator.Screen
        name="BudgetsList"
        component={BudgetsListScreen}
        options={{ headerShown: false }}
      />
      <BudgetsNavigator.Screen
        name="BudgetDetail"
        component={BudgetDetailScreen}
        options={{ title: 'Budget Details' }}
      />
      <BudgetsNavigator.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{ title: 'Add Budget' }}
      />
      <BudgetsNavigator.Screen
        name="GoalsList"
        component={GoalsListScreen}
        options={{ title: 'Goals' }}
      />
      <BudgetsNavigator.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{ title: 'Goal Details' }}
      />
      <BudgetsNavigator.Screen
        name="AddGoal"
        component={AddGoalScreen}
        options={{ title: 'Add Goal' }}
      />
    </BudgetsNavigator.Navigator>
  );
}

// ─── More Stack ────────────────────────────────────────────────
function MoreStack() {
  const { colors } = useTheme();

  return (
    <MoreNavigator.Navigator screenOptions={defaultStackScreenOptions(colors)}>
      <MoreNavigator.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ headerShown: false }}
      />
      <MoreNavigator.Screen
        name="BillsScreen"
        component={BillsScreen}
        options={{ title: 'Bills' }}
      />
      <MoreNavigator.Screen
        name="SubscriptionsScreen"
        component={SubscriptionsScreen}
        options={{ title: 'Subscriptions' }}
      />
      <MoreNavigator.Screen
        name="LoansScreen"
        component={LoansScreen}
        options={{ title: 'Loans' }}
      />
      <MoreNavigator.Screen
        name="LoanDetail"
        component={LoanDetailScreen}
        options={{ title: 'Loan Details' }}
      />
      <MoreNavigator.Screen
        name="CalculatorsList"
        component={CalculatorsListScreen}
        options={{ title: 'Calculators' }}
      />
      <MoreNavigator.Screen
        name="CalculatorDetail"
        component={CalculatorDetailScreen}
        options={{ title: 'Calculator' }}
      />
      <MoreNavigator.Screen
        name="InvestmentsScreen"
        component={InvestmentsScreen}
        options={{ title: 'Investments' }}
      />
      <MoreNavigator.Screen
        name="InvestmentDetail"
        component={InvestmentDetailScreen}
        options={{ title: 'Investment Details' }}
      />
      <MoreNavigator.Screen
        name="NetWorthScreen"
        component={NetWorthScreen}
        options={{ title: 'Net Worth' }}
      />
      <MoreNavigator.Screen
        name="ReportsScreen"
        component={ReportsScreen}
        options={{ title: 'Reports' }}
      />
      <MoreNavigator.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{ title: 'Calendar' }}
      />
      <MoreNavigator.Screen
        name="AIAssistantScreen"
        component={AIAssistantScreen}
        options={{ title: 'AI Assistant' }}
      />
      <MoreNavigator.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <MoreNavigator.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <MoreNavigator.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <MoreNavigator.Screen
        name="AccountsScreen"
        component={AccountsScreen}
        options={{ title: 'Accounts' }}
      />
      <MoreNavigator.Screen
        name="AccountDetail"
        component={AccountDetailScreen}
        options={{ title: 'Account Details' }}
      />
      <MoreNavigator.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ title: 'Add Account' }}
      />
      <MoreNavigator.Screen
        name="BankSelection"
        component={BankSelectionScreen}
        options={{ title: 'Select Bank' }}
      />
      <MoreNavigator.Screen
        name="BankVerification"
        component={BankVerificationScreen}
        options={{ title: 'Verify Identity' }}
      />
      <MoreNavigator.Screen
        name="BankConsent"
        component={BankConsentScreen}
        options={{ title: 'Grant Access' }}
      />
      <MoreNavigator.Screen
        name="BankConnecting"
        component={BankConnectingScreen}
        options={{ title: 'Connecting', headerLeft: () => null }}
      />
      <MoreNavigator.Screen
        name="BankConnected"
        component={BankConnectedScreen}
        options={{ title: 'Connected', headerLeft: () => null }}
      />
      <MoreNavigator.Screen
        name="InitialSync"
        component={InitialSyncScreen}
        options={{ title: 'Syncing', headerLeft: () => null }}
      />
      <MoreNavigator.Screen
        name="SyncComplete"
        component={SyncCompleteScreen}
        options={{ title: 'Sync Complete' }}
      />
<MoreNavigator.Screen
         name="SyncFailed"
         component={SyncFailedScreen}
         options={{ title: 'Connection Failed' }}
       />
       <MoreNavigator.Screen
         name="BankStatement"
         component={BankStatementScreen}
         options={{ title: 'Import Statement' }}
       />
     </MoreNavigator.Navigator>
  );
}

// ─── Add Button Bottom Sheet ───────────────────────────────────
function AddButtonBottomSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const options = [
    { label: 'Add Income', icon: 'trending-up' as const, color: colors.positive, route: 'AddIncome' },
    { label: 'Add Expense', icon: 'trending-down' as const, color: colors.negative, route: 'AddExpense' },
    { label: 'Transfer', icon: 'swap-horizontal' as const, color: colors.info, route: 'AddTransfer' },
    { label: 'Add Bill', icon: 'document-text-outline' as const, color: colors.warning, route: 'BillsScreen' },
    { label: 'Add Goal', icon: 'flag-outline' as const, color: colors.primary, route: 'AddGoal' },
  ];

  const handlePress = (route: string) => {
    onClose();
    setTimeout(() => {
      const nav = navigation as any;
      if (route === 'AddIncome' || route === 'AddExpense' || route === 'AddTransfer') {
        nav.navigate('HomeTab', { screen: route });
      } else if (route === 'AddGoal') {
        nav.navigate('BudgetsTab', { screen: route });
      } else if (route === 'BillsScreen') {
        nav.navigate('MoreTab', { screen: route });
      } else {
        nav.navigate(route);
      }
    }, 280);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Quick Add">
      <View style={sheetStyles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.label}
            style={[sheetStyles.option, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => handlePress(option.route)}
          >
            <View style={[sheetStyles.iconContainer, { backgroundColor: option.color + '15' }]}>
              <Ionicons name={option.icon} size={24} color={option.color} />
            </View>
            <View style={sheetStyles.optionTextContainer}>
              <Text style={[sheetStyles.optionLabel, { color: colors.text }]}>{option.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>
  );
}

// ─── Tab Bar Icon Component ────────────────────────────────────
function TabBarIcon({
  name,
  color,
  size,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function FloatingTabBar(props: BottomTabBarProps) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const sideGap = 22;
  const tabBarWidth = windowWidth - sideGap * 2;

  return (
    <View pointerEvents="box-none" style={styles.tabBarDock}>
      <View
        style={[
          styles.tabBarShell,
          {
            width: tabBarWidth,
            backgroundColor: colors.surface,
            shadowColor: '#000',
          },
        ]}
      >
        <BottomTabBar {...props} />
      </View>
    </View>
  );
}

// ─── Main Tabs ─────────────────────────────────────────────────
function MainTabs() {
  const { colors } = useTheme();
  const [addSheetVisible, setAddSheetVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 70,
            paddingTop: 8,
            paddingBottom: 8,
            overflow: 'visible',
          },
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="home" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="TransactionsTab"
          component={TransactionsStack}
          options={{
            tabBarLabel: 'Transactions',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="receipt-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="AddTab"
          component={View}
          options={{
            tabBarLabel: () => null,
            tabBarIcon: () => null,
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.85}
                onPress={() => setAddSheetVisible(true)}
              >
                <View style={[styles.addButtonInner, { backgroundColor: colors.primary }]}>
                  <Ionicons name="add" size={32} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setAddSheetVisible(true);
            },
          }}
        />
        <Tab.Screen
          name="BudgetsTab"
          component={BudgetsStack}
          options={{
            tabBarLabel: 'Budgets',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="wallet-outline" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="MoreTab"
          component={MoreStack}
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ color, size }) => (
              <TabBarIcon name="ellipsis-horizontal" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>

      <AddButtonBottomSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
      />
    </>
  );
}

// ─── Main Navigator ────────────────────────────────────────────
export default function MainNavigator() {
  const { isAuthenticated, recoveryToken } = useAppStore();

  useEffect(() => {
    if (isAuthenticated || !recoveryToken || !navigationRef.isReady()) return;
    navigationRef.navigate('OnboardingStack', { screen: 'ResetPassword' });
  }, [isAuthenticated, recoveryToken]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (!isAuthenticated && recoveryToken && navigationRef.isReady()) {
          navigationRef.navigate('OnboardingStack', { screen: 'ResetPassword' });
        }
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
        }}
      >
        {!isAuthenticated ? (
          <RootStack.Screen name="OnboardingStack" component={OnboardingStack} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: 'center',
  },
  tabBarShell: {
    borderRadius: 32,
    overflow: 'visible',
    elevation: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  addButton: {
    flex: 1,
    top: -28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 10,
  },
});

const sheetStyles = StyleSheet.create({
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
