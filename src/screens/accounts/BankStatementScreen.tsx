import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useToast } from '../../components/common/Toast';

type Step = 'upload' | 'processing' | 'preview' | 'review' | 'success';

interface MockStatement {
  bankName: string;
  accountName: string;
  accountNumber: string;
  month: string;
  year: number;
  openingBalance: number;
  closingBalance: number;
  newBalance: number;
  transactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
    balance: number;
    included: boolean;
  }[];
}

const mockStatement: MockStatement = {
  bankName: 'Chase Bank',
  accountName: 'Chase Total Checking',
  accountNumber: '****4521',
  month: 'September',
  year: 2026,
  openingBalance: 12450.83,
  closingBalance: 18750.45,
  newBalance: 18750.45,
  transactions: [
    { id: 'txn_1', date: '2026-09-01', description: 'Direct Deposit - Salary', category: 'Income', type: 'income', amount: 5500.00, balance: 17950.83, included: true },
    { id: 'txn_2', date: '2026-09-03', description: 'Whole Foods Market', category: 'Food & Dining', type: 'expense', amount: -127.43, balance: 17823.40, included: true },
    { id: 'txn_3', date: '2026-09-05', description: 'Shell Gas Station', category: 'Transportation', type: 'expense', amount: -52.18, balance: 17771.22, included: true },
    { id: 'txn_4', date: '2026-09-07', description: 'Amazon.com', category: 'Shopping', type: 'expense', amount: -89.99, balance: 17681.23, included: false },
    { id: 'txn_5', date: '2026-09-08', description: 'Starbucks', category: 'Dining', type: 'expense', amount: -6.75, balance: 17674.48, included: true },
    { id: 'txn_6', date: '2026-09-10', description: 'Netflix', category: 'Entertainment', type: 'expense', amount: -15.99, balance: 17658.49, included: true },
    { id: 'txn_7', date: '2026-09-12', description: 'Electric Bill - ConEd', category: 'Utilities', type: 'expense', amount: -142.30, balance: 17516.19, included: true },
    { id: 'txn_8', date: '2026-09-15', description: 'Freelance Payment - Logo Design', category: 'Income', type: 'income', amount: 800.00, balance: 18316.19, included: true },
    { id: 'txn_9', date: '2026-09-18', description: 'Target', category: 'Shopping', type: 'expense', amount: -67.22, balance: 18248.97, included: false },
    { id: 'txn_10', date: '2026-09-20', description: 'CVS Pharmacy', category: 'Health & Fitness', type: 'expense', amount: -34.99, balance: 18213.98, included: true },
    { id: 'txn_11', date: '2026-09-22', description: 'Direct Deposit - ACME Corp', category: 'Income', type: 'income', amount: 3750.00, balance: 21963.98, included: true },
    { id: 'txn_12', date: '2026-09-25', description: 'Movie Tickets', category: 'Entertainment', type: 'expense', amount: -32.00, balance: 21931.98, included: false },
    { id: 'txn_13', date: '2026-09-28', description: 'Internet Bill - ConEd', category: 'Utilities', type: 'expense', amount: -79.99, balance: 21851.99, included: true },
    { id: 'txn_14', date: '2026-09-30', description: 'Restaurant Dinner', category: 'Dining', type: 'expense', amount: -101.54, balance: 21750.45, included: true },
  ],
};

export default function BankStatementScreen({ navigation }: { navigation: any }) {
  const { colors, isDark } = useTheme();
  const { importStatement, connectedAccounts } = useAppStore();
  const toast = useToast();
  const [step, setStep] = useState<Step>('upload');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [includedTxns, setIncludedTxns] = useState<Set<string>>(new Set());

  const selectedAccount = connectedAccounts.find((acc: any) => acc.id === selectedAccountId);

  const handleAccountSelect = (id: string) => {
    setSelectedAccountId(id);
  };

  const handleUploadPress = () => {
    if (!selectedAccountId) {
      toast.show('Please select an account', 'info');
      return;
    }
    setStep('processing');
    setProcessingProgress(0);
    setIncludedTxns(new Set(mockStatement.transactions.map((t) => t.id)));
    simulateProcessing();
  };

  const simulateProcessing = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setStep('preview');
        }, 500);
      }
      setProcessingProgress(progress);
    }, 400);
  };

  const toggleTransaction = (id: string) => {
    setIncludedTxns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setIncludedTxns(new Set(mockStatement.transactions.map((t) => t.id)));
  };

  const deselectAll = () => {
    setIncludedTxns(new Set());
  };

  const selectedCount = includedTxns.size;
  const totalSelected = mockStatement.transactions
    .filter((t) => includedTxns.has(t.id))
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const handleConfirmImport = () => {
    const selectedTransactions = mockStatement.transactions
      .filter((t) => includedTxns.has(t.id))
      .map((t) => ({
        ...t,
        id: `import_${t.id}_${Date.now()}`,
      }));

    importStatement({
      accountId: selectedAccountId,
      bankName: mockStatement.bankName,
      accountName: mockStatement.accountName,
      month: mockStatement.month,
      year: mockStatement.year,
      openingBalance: mockStatement.openingBalance,
      closingBalance: mockStatement.closingBalance,
      newBalance: mockStatement.newBalance,
      transactions: selectedTransactions as any,
    });

    setStep('success');
    toast.show(`Successfully imported ${selectedCount} transactions`, 'success');
  };

  const steps = ['upload', 'processing', 'preview', 'review', 'success'];
  const currentStepIndex = steps.indexOf(step);

  const renderStepIndicator = () => (
    <View style={[styles.stepIndicator, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {steps.map((s, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        return (
          <View key={s} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: isCompleted ? colors.primary : isActive ? colors.primary + '20' : colors.inputBg,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text style={[styles.stepNumber, { color: isActive ? colors.primary : colors.textTertiary }]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, { color: isActive ? colors.primary : colors.textTertiary }]}>
              {s === 'upload' ? 'Upload' : s === 'processing' ? 'Processing' : s === 'preview' ? 'Preview' : s === 'review' ? 'Review' : 'Done'}
            </Text>
            {index < steps.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: index < currentStepIndex ? colors.primary : colors.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderUploadStep = () => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Import Bank Statement</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Upload your monthly bank statement PDF to import transactions
      </Text>

      <View style={[styles.uploadCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
          <Ionicons name="document-text-outline" size={48} color={colors.primary} />
          <Text style={[styles.uploadTitle, { color: colors.text }]}>Upload Statement PDF</Text>
          <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
            Tap to browse or drag and drop your bank statement
          </Text>
          <Text style={[styles.fileFormat, { color: colors.textTertiary }]}>PDF up to 10MB</Text>
        </View>

        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
          activeOpacity={0.7}
          onPress={() => toast.show('PDF uploaded: Chase_Statement_Sep_2026.pdf', 'success')}
        >
          <Ionicons name="folder-open-outline" size={20} color={colors.primary} />
          <Text style={[styles.browseButtonText, { color: colors.primary }]}>Browse Files</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.accountSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Select Account</Text>
        {connectedAccounts.map((account: any) => (
          <TouchableOpacity
            key={account.id}
            style={[
              styles.accountOption,
              { backgroundColor: selectedAccountId === account.id ? colors.primary + '10' : colors.inputBg, borderColor: selectedAccountId === account.id ? colors.primary : colors.border },
            ]}
            onPress={() => handleAccountSelect(account.id)}
          >
            <View style={styles.accountOptionInfo}>
              <Text style={[styles.accountOptionName, { color: colors.text }]}>{account.accountName}</Text>
              <Text style={[styles.accountOptionBank, { color: colors.textSecondary }]}>{account.bankName}</Text>
            </View>
            {selectedAccountId === account.id && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          title="Start Import"
          onPress={handleUploadPress}
          disabled={!selectedAccountId}
          style={{ width: '100%' }}
        />
      </View>

      <TouchableOpacity style={{ marginTop: spacing.md, alignItems: 'center' }} onPress={() => navigation.goBack()}>
        <Text style={[styles.cancelText, { color: colors.textTertiary }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProcessingStep = () => (
    <View style={[styles.centeredView, { backgroundColor: colors.background }]}>
      <View style={[styles.processingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="cloud-upload-outline" size={64} color={colors.primary} />
        <Text style={[styles.processingTitle, { color: colors.text }]}>Processing Statement</Text>
        <Text style={[styles.processingSubtitle, { color: colors.textSecondary }]}>
          {mockStatement.bankName} — {mockStatement.month} {mockStatement.year}
        </Text>

        <View style={[styles.progressBar, { backgroundColor: colors.inputBg }]}>
          <View style={[styles.progressFill, { width: `${processingProgress}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>{Math.round(processingProgress)}%</Text>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          {['Extracting', 'Parsing', 'Validating'].map((label, i) => (
            <Text key={label} style={[styles.miniProgressLabel, { color: i === Math.floor(processingProgress / 33) ? colors.primary : colors.textTertiary }]}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPreviewStep = () => {
    const selectedTxns = mockStatement.transactions.filter((t) => includedTxns.has(t.id));
    const totalIncome = selectedTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = selectedTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={[styles.previewBankName, { color: colors.text }]}>{mockStatement.bankName}</Text>
              <Text style={[styles.previewAccountName, { color: colors.textSecondary }]}>{mockStatement.accountName} ({mockStatement.accountNumber})</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.previewPeriod, { color: colors.text }]}>{mockStatement.month} {mockStatement.year}</Text>
              <Text style={[styles.previewAccountType, { color: colors.textTertiary }]}>Checking Account</Text>
            </View>
          </View>

          <View style={[styles.balanceRow, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Opening Balance</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>{formatCurrency(mockStatement.openingBalance)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Closing Balance</Text>
              <Text style={[styles.balanceValue, { color: colors.text }]}>{formatCurrency(mockStatement.closingBalance)}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryItemValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.summaryItemValue, { color: colors.negative || '#EF4444' }]}>{formatCurrency(totalExpense)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Transactions</Text>
            <Text style={[styles.summaryItemValue, { color: colors.primary }]}>{selectedCount}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.lg }]}>
          Selected Transactions ({selectedCount})
        </Text>
        <ScreenScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          {mockStatement.transactions.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.transactionItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleTransaction(t.id)}
            >
              <View style={[styles.transactionCheckbox, { backgroundColor: includedTxns.has(t.id) ? colors.primary : 'transparent', borderColor: colors.primary }]}>
                {includedTxns.has(t.id) && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.transactionDesc, { color: colors.text }]}>{t.description}</Text>
                <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{t.category} — {formatDate(t.date)}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: t.type === 'income' ? colors.positive || '#10B981' : colors.negative || '#EF4444' }]}>
                {formatCurrency(t.amount, true)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScreenScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={deselectAll}>
            <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Deselect All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={selectAll}>
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Select All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Button title="Review Transactions" onPress={() => setStep('review')} style={{ width: '100%' }} />
        </View>
      </View>
    );
  };

  const renderReviewStep = () => {
    const selectedTxns = mockStatement.transactions.filter((t) => includedTxns.has(t.id));
    const totalIncome = selectedTxns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = selectedTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const netChange = totalIncome - totalExpense;

    return (
      <View style={{ flex: 1 }}>
        <View style={[styles.reviewHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.reviewHeaderTitle, { color: colors.text }]}>Import Summary</Text>
          <Text style={[styles.reviewHeaderSubtitle, { color: colors.textSecondary }]}>
            {mockStatement.month} {mockStatement.year} — {mockStatement.bankName}
          </Text>
        </View>

        <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Source</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{mockStatement.bankName} Statement</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Account</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedAccount?.accountName || mockStatement.accountName}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Transactions to Import</Text>
            <Text style={[styles.reviewValue, { color: colors.primary }]}>{selectedCount}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Total Income</Text>
            <Text style={[styles.reviewValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
            <Text style={[styles.reviewValue, { color: colors.negative || '#EF4444' }]}>{formatCurrency(totalExpense)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Net Change</Text>
            <Text style={[styles.reviewValue, { color: netChange >= 0 ? colors.positive || '#10B981' : colors.negative || '#EF4444' }]}>
              {formatCurrency(netChange, true)}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.lg }]}>Transaction Details</Text>
        <ScreenScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          {selectedTxns.map((t) => (
            <View key={t.id} style={[styles.reviewTxnItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.reviewTxnDesc, { color: colors.text }]}>{t.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[styles.reviewTxnDate, { color: colors.textTertiary }]}>{formatDate(t.date)}</Text>
                <Text style={[styles.reviewTxnAmount, { color: t.type === 'income' ? colors.positive || '#10B981' : colors.negative || '#EF4444' }]}>
                  {formatCurrency(t.amount, true)}
                </Text>
              </View>
            </View>
          ))}
        </ScreenScrollView>

        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          <Button title="Confirm Import" onPress={handleConfirmImport} style={{ width: '100%' }} />
          <TouchableOpacity onPress={() => setStep('preview')}>
            <Text style={[styles.cancelText, { color: colors.textTertiary, textAlign: 'center' }]}>Back to Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuccessStep = () => {
    const selectedTxns = mockStatement.transactions.filter((t) => includedTxns.has(t.id));

    return (
      <View style={[styles.centeredView, { backgroundColor: colors.background }]}>
        <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Statement Imported!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            {selectedCount} transactions from {mockStatement.month} {mockStatement.year} added to your account
          </Text>

          <View style={[styles.successDetails, { backgroundColor: colors.inputBg }]}>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Total Imported</Text>
              <Text style={[styles.successDetailValue, { color: colors.primary }]}>{formatCurrency(selectedTxns.reduce((s, t) => s + Math.abs(t.amount), 0))}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Updated Balance</Text>
              <Text style={[styles.successDetailValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(mockStatement.newBalance)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
            <Button title="View Transactions" onPress={() => navigation.navigate('AccountsScreen')} style={{ flex: 1 }} />
            <Button title="Back to Accounts" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Import Statement</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderStepIndicator()}

      <ScreenScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]} showsVerticalScrollIndicator={false}>
        {step === 'upload' && renderUploadStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'success' && renderSuccessStep()}
      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  stepNumber: { fontSize: 14, fontWeight: '700' },
  stepLabel: { fontSize: 11, marginLeft: 6, fontWeight: '500' },
  stepLine: { height: 2, flex: 1, marginLeft: 4, marginRight: 4, borderRadius: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.sm },
  sectionSubtitle: { fontSize: 14, marginBottom: spacing.lg },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: spacing.md },
  uploadCard: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.md },
  uploadBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: borderRadius.xl, padding: spacing.xxl, alignItems: 'center' },
  uploadTitle: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  uploadSubtitle: { fontSize: 13, marginTop: spacing.sm, textAlign: 'center' },
  fileFormat: { fontSize: 12, marginTop: spacing.sm, color: '#94A3B8' },
  browseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.lg },
  browseButtonText: { fontSize: 14, fontWeight: '600', marginLeft: spacing.sm },
  accountSection: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.lg },
  accountOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm },
  accountOptionInfo: { flex: 1 },
  accountOptionName: { fontSize: 15, fontWeight: '600' },
  accountOptionBank: { fontSize: 13, marginTop: 2 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  processingCard: { padding: spacing.xxl, borderRadius: borderRadius.xl, borderWidth: 1, alignItems: 'center' },
  processingTitle: { fontSize: 20, fontWeight: '700', marginTop: spacing.md },
  processingSubtitle: { fontSize: 14, marginTop: spacing.sm, marginBottom: spacing.xl },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', width: '100%', marginBottom: spacing.sm },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
  miniProgressLabel: { fontSize: 12, fontWeight: '500' },
  previewCard: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.md },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg },
  previewBankName: { fontSize: 16, fontWeight: '700' },
  previewAccountName: { fontSize: 13, marginTop: 2 },
  previewPeriod: { fontSize: 16, fontWeight: '600' },
  previewAccountType: { fontSize: 12, marginTop: 2 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: spacing.md, borderBottomWidth: 1 },
  balanceLabel: { fontSize: 12, marginBottom: 4 },
  balanceValue: { fontSize: 18, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginHorizontal: spacing.lg, marginTop: spacing.md },
  summaryItem: { alignItems: 'center' },
  summaryItemLabel: { fontSize: 12, marginBottom: 4 },
  summaryItemValue: { fontSize: 18, fontWeight: '700' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm },
  transactionCheckbox: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginRight: spacing.md },
  transactionDesc: { fontSize: 15, fontWeight: '500', flex: 1 },
  transactionCategory: { fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: '700' },
  actionButton: { padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  reviewHeader: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.md },
  reviewHeaderTitle: { fontSize: 18, fontWeight: '700' },
  reviewHeaderSubtitle: { fontSize: 13, marginTop: spacing.sm },
  reviewCard: { marginHorizontal: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginTop: spacing.md },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  reviewLabel: { fontSize: 14, fontWeight: '500' },
  reviewValue: { fontSize: 14, fontWeight: '600' },
  reviewTxnItem: { padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.sm },
  reviewTxnDesc: { fontSize: 15, fontWeight: '500' },
  reviewTxnDate: { fontSize: 12, marginTop: 2 },
  reviewTxnAmount: { fontSize: 15, fontWeight: '700' },
  successCard: { padding: spacing.xxl, borderRadius: borderRadius.xl, borderWidth: 1, alignItems: 'center' },
  successIcon: { marginBottom: spacing.md },
  successTitle: { fontSize: 24, fontWeight: '800', marginTop: spacing.md },
  successSubtitle: { fontSize: 14, marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.lg },
  successDetails: { padding: spacing.lg, borderRadius: borderRadius.lg, width: '100%' },
  successDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  successDetailLabel: { fontSize: 14 },
  successDetailValue: { fontSize: 16, fontWeight: '700' },
  cancelText: { fontSize: 14, marginTop: spacing.md },
});
