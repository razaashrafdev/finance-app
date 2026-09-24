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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
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
    <View style={[styles.stepIndicator, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
      {steps.map((s, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        return (
          <View key={s} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor: isCompleted ? colors.primary : isActive ? colors.primary + '25' : colors.inputBg,
                  borderColor: isActive ? colors.primary : isCompleted ? colors.primary : colors.cardBorder || colors.border,
                },
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={13} color="#fff" />
              ) : (
                <Text style={[styles.stepNumber, { color: isActive ? colors.primary : colors.textTertiary }]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: isActive ? colors.primary : isCompleted ? colors.text : colors.textTertiary,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
              numberOfLines={1}
            >
              {s === 'upload' ? 'Upload' : s === 'processing' ? 'Parse' : s === 'preview' ? 'Preview' : s === 'review' ? 'Review' : 'Done'}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: index < currentStepIndex ? colors.primary : colors.borderLight || colors.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderUploadStep = () => (
    <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
      <View style={styles.stepHeader}>
        <Badge variant="primary" label="AI-POWERED STATEMENT PARSING" size="sm" dot />
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.sm }]}>Import Bank Statement</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Upload your PDF statement to automatically extract, categorize, and sync transactions.
        </Text>
      </View>

      <View style={[styles.uploadCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
        <View style={[styles.uploadBox, { borderColor: colors.primary + '50', backgroundColor: colors.primary + '08' }]}>
          <View style={styles.uploadIconBubble}>
            <Ionicons name="cloud-upload" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.uploadTitle, { color: colors.text }]}>Upload Statement PDF</Text>
          <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
            Drag & drop or tap to browse your monthly statement
          </Text>
          <View style={styles.formatBadge}>
            <Ionicons name="document-text-outline" size={13} color={colors.textTertiary} />
            <Text style={[styles.fileFormat, { color: colors.textTertiary }]}>PDF up to 10MB</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '35' }]}
          activeOpacity={0.7}
          onPress={() => toast.show('PDF uploaded: Chase_Statement_Sep_2026.pdf', 'success')}
        >
          <Ionicons name="folder-open" size={18} color={colors.primary} />
          <Text style={[styles.browseButtonText, { color: colors.primary }]}>Browse Files</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.accountSection, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
        <View style={styles.accountSectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Target Account</Text>
          <Text style={[styles.sectionLabelSub, { color: colors.textTertiary }]}>Select destination</Text>
        </View>
        {connectedAccounts.map((account: any) => {
          const isSelected = selectedAccountId === account.id;
          return (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountOption,
                {
                  backgroundColor: isSelected ? colors.primary + '12' : colors.inputBg,
                  borderColor: isSelected ? colors.primary : colors.cardBorder || colors.border,
                },
              ]}
              onPress={() => handleAccountSelect(account.id)}
            >
              <View style={[styles.accountOptionIcon, { backgroundColor: isSelected ? colors.primary + '20' : colors.card }]}>
                <Ionicons name="business" size={20} color={isSelected ? colors.primary : colors.textSecondary} />
              </View>
              <View style={styles.accountOptionInfo}>
                <Text style={[styles.accountOptionName, { color: colors.text }]}>{account.accountName}</Text>
                <Text style={[styles.accountOptionBank, { color: colors.textSecondary }]}>{account.bankName}</Text>
              </View>
              <View style={[styles.radioCircle, { borderColor: isSelected ? colors.primary : colors.border, backgroundColor: isSelected ? colors.primary : 'transparent' }]}>
                {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.xl }}>
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
      <View style={[styles.processingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
        <View style={styles.processingIconBubble}>
          <Ionicons name="cloud-upload" size={40} color={colors.primary} />
        </View>
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
            <Badge
              key={label}
              label={label}
              variant={i <= Math.floor(processingProgress / 33) ? 'primary' : 'gray'}
              size="sm"
            />
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
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={[styles.previewBankName, { color: colors.text }]}>{mockStatement.bankName}</Text>
              <Text style={[styles.previewAccountName, { color: colors.textSecondary }]}>{mockStatement.accountName} ({mockStatement.accountNumber})</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge variant="purple" label={`${mockStatement.month} ${mockStatement.year}`} size="sm" />
              <Text style={[styles.previewAccountType, { color: colors.textTertiary, marginTop: 4 }]}>Checking</Text>
            </View>
          </View>

          <View style={[styles.balanceRow, { borderBottomColor: colors.borderLight || colors.border }]}>
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

        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryItemValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Expenses</Text>
            <Text style={[styles.summaryItemValue, { color: colors.negative || '#EF4444' }]}>{formatCurrency(totalExpense)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Count</Text>
            <Text style={[styles.summaryItemValue, { color: colors.primary }]}>{selectedCount}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.sm }}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 16, marginBottom: 0 }]}>
            Select Transactions ({selectedCount})
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <TouchableOpacity style={[styles.pillBtn, { borderColor: colors.border }]} onPress={selectAll}>
              <Text style={[styles.pillBtnText, { color: colors.primary }]}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pillBtn, { borderColor: colors.border }]} onPress={deselectAll}>
              <Text style={[styles.pillBtnText, { color: colors.textTertiary }]}>Deselect</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScreenScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
          {mockStatement.transactions.map((t) => {
            const isIncluded = includedTxns.has(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.transactionItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: isIncluded ? (colors.cardBorder || colors.border) : 'transparent',
                    opacity: isIncluded ? 1 : 0.6,
                  },
                ]}
                onPress={() => toggleTransaction(t.id)}
              >
                <View style={[styles.transactionCheckbox, { backgroundColor: isIncluded ? colors.primary : 'transparent', borderColor: isIncluded ? colors.primary : colors.border }]}>
                  {isIncluded && <Ionicons name="checkmark" size={13} color="#fff" />}
                </View>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text style={[styles.transactionDesc, { color: colors.text }]} numberOfLines={1}>{t.description}</Text>
                  <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{t.category} • {formatDate(t.date)}</Text>
                </View>
                <Text style={[styles.transactionAmount, { color: t.type === 'income' ? (colors.positive || '#10B981') : (colors.negative || '#EF4444') }]}>
                  {formatCurrency(t.amount, true)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScreenScrollView>

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
      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <View style={[styles.reviewHeader, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
          <Badge variant="primary" label="READY TO IMPORT" size="sm" dot />
          <Text style={[styles.reviewHeaderTitle, { color: colors.text, marginTop: spacing.xs }]}>Import Summary</Text>
          <Text style={[styles.reviewHeaderSubtitle, { color: colors.textSecondary }]}>
            {mockStatement.month} {mockStatement.year} • {mockStatement.bankName}
          </Text>
        </View>

        <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Source</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{mockStatement.bankName} Statement</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight || colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Target Account</Text>
            <Text style={[styles.reviewValue, { color: colors.text }]}>{selectedAccount?.accountName || mockStatement.accountName}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight || colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Transactions</Text>
            <Text style={[styles.reviewValue, { color: colors.primary }]}>{selectedCount}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight || colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Total Income</Text>
            <Text style={[styles.reviewValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={[styles.reviewRow, { borderBottomColor: colors.borderLight || colors.border }]}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
            <Text style={[styles.reviewValue, { color: colors.negative || '#EF4444' }]}>{formatCurrency(totalExpense)}</Text>
          </View>
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Net Change</Text>
            <Text style={[styles.reviewValue, { color: netChange >= 0 ? (colors.positive || '#10B981') : (colors.negative || '#EF4444') }]}>
              {formatCurrency(netChange, true)}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: spacing.lg, fontSize: 16 }]}>Transaction Details</Text>
        <ScreenScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
          {selectedTxns.map((t) => (
            <View key={t.id} style={[styles.reviewTxnItem, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
              <Text style={[styles.reviewTxnDesc, { color: colors.text }]} numberOfLines={1}>{t.description}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                <Text style={[styles.reviewTxnDate, { color: colors.textTertiary }]}>{formatDate(t.date)}</Text>
                <Text style={[styles.reviewTxnAmount, { color: t.type === 'income' ? (colors.positive || '#10B981') : (colors.negative || '#EF4444') }]}>
                  {formatCurrency(t.amount, true)}
                </Text>
              </View>
            </View>
          ))}
        </ScreenScrollView>

        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          <Button title="Confirm & Import" onPress={handleConfirmImport} style={{ width: '100%' }} />
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
        <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.cardBorder || colors.border }]}>
          <View style={[styles.successIcon, { backgroundColor: (colors.success || '#10B981') + '18' }]}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success || '#10B981'} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Statement Imported!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            {selectedCount} transactions from {mockStatement.month} {mockStatement.year} added to your account
          </Text>

          <View style={[styles.successDetails, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder || colors.border }]}>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Total Imported</Text>
              <Text style={[styles.successDetailValue, { color: colors.primary }]}>{formatCurrency(selectedTxns.reduce((s, t) => s + Math.abs(t.amount), 0))}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={[styles.successDetailLabel, { color: colors.textSecondary }]}>Updated Balance</Text>
              <Text style={[styles.successDetailValue, { color: colors.positive || '#10B981' }]}>{formatCurrency(mockStatement.newBalance)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, width: '100%' }}>
            <Button title="View Transactions" onPress={() => navigation.navigate('AccountsScreen')} style={{ flex: 1 }} />
            <Button title="Back" variant="outline" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: spacing.md },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
  stepNumber: { fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 11, marginLeft: 6, marginRight: 4 },
  stepLine: { height: 2, flex: 1, marginRight: 6, borderRadius: 1 },
  stepHeader: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: 13, lineHeight: 18 },
  sectionLabel: { fontSize: 15, fontWeight: '700' },
  sectionLabelSub: { fontSize: 12, marginTop: 2 },
  accountSectionHeader: { marginBottom: spacing.md },
  uploadCard: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  uploadIconBubble: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', marginTop: spacing.xs },
  uploadSubtitle: { fontSize: 13, marginTop: spacing.xs, textAlign: 'center' },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: 'rgba(148,163,184,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  fileFormat: { fontSize: 11, fontWeight: '500' },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.md,
    gap: 8,
  },
  browseButtonText: { fontSize: 14, fontWeight: '700' },
  accountSection: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: 12,
  },
  accountOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountOptionInfo: { flex: 1 },
  accountOptionName: { fontSize: 14, fontWeight: '700' },
  accountOptionBank: { fontSize: 12, marginTop: 2 },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg },
  processingCard: {
    width: '100%',
    padding: spacing.xxl,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  processingIconBubble: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  processingTitle: { fontSize: 20, fontWeight: '800', marginTop: spacing.xs },
  processingSubtitle: { fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.xl },
  progressBar: { height: 8, borderRadius: 999, overflow: 'hidden', width: '100%', marginBottom: spacing.xs },
  progressFill: { height: '100%', borderRadius: 999 },
  progressText: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: spacing.md },
  previewCard: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  previewBankName: { fontSize: 16, fontWeight: '800' },
  previewAccountName: { fontSize: 13, marginTop: 2 },
  previewPeriod: { fontSize: 14, fontWeight: '700' },
  previewAccountType: { fontSize: 11 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1 },
  balanceLabel: { fontSize: 12, marginBottom: 4 },
  balanceValue: { fontSize: 17, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 28, backgroundColor: 'rgba(148,163,184,0.2)' },
  summaryItemLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  summaryItemValue: { fontSize: 16, fontWeight: '800' },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillBtnText: { fontSize: 12, fontWeight: '600' },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  transactionCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginRight: spacing.md,
  },
  transactionDesc: { fontSize: 14, fontWeight: '600' },
  transactionCategory: { fontSize: 12, marginTop: 2 },
  transactionAmount: { fontSize: 15, fontWeight: '700' },
  reviewHeader: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  reviewHeaderTitle: { fontSize: 20, fontWeight: '800' },
  reviewHeaderSubtitle: { fontSize: 13, marginTop: 2 },
  reviewCard: {
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  reviewLabel: { fontSize: 13, fontWeight: '500' },
  reviewValue: { fontSize: 14, fontWeight: '700' },
  reviewTxnItem: { padding: spacing.md, borderRadius: 14, borderWidth: 1, marginBottom: spacing.xs },
  reviewTxnDesc: { fontSize: 14, fontWeight: '600' },
  reviewTxnDate: { fontSize: 12 },
  reviewTxnAmount: { fontSize: 14, fontWeight: '700' },
  successCard: { width: '100%', padding: spacing.xxl, borderRadius: 22, borderWidth: 1, alignItems: 'center' },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: { fontSize: 22, fontWeight: '800', marginTop: spacing.xs },
  successSubtitle: { fontSize: 13, marginTop: spacing.xs, textAlign: 'center', marginBottom: spacing.lg },
  successDetails: { padding: spacing.lg, borderRadius: 16, width: '100%', borderWidth: 1 },
  successDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  successDetailLabel: { fontSize: 13, fontWeight: '500' },
  successDetailValue: { fontSize: 15, fontWeight: '700' },
  cancelText: { fontSize: 14, fontWeight: '500', marginTop: spacing.sm },
});
