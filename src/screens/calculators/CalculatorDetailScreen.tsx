import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { spacing, borderRadius } from '../../theme/spacing';

interface CalculatorDetailScreenProps {
  navigation: any;
  route: any;
}

type CalcConfig = {
  inputs: { key: string; label: string; placeholder: string; prefix?: string; suffix?: string }[];
  outputs: { key: string; label: string }[];
  formula: string;
  mockResults: Record<string, string>;
};

const CALCULATOR_CONFIG: Record<string, CalcConfig> = {
  loan: {
    inputs: [
      { key: 'amount', label: 'Loan Amount', placeholder: '250,000', prefix: '$' },
      { key: 'rate', label: 'Annual Interest Rate', placeholder: '4.5', suffix: '%' },
      { key: 'term', label: 'Loan Term', placeholder: '30', suffix: 'years' },
    ],
    outputs: [
      { key: 'monthly', label: 'Monthly Payment' },
      { key: 'totalInterest', label: 'Total Interest' },
      { key: 'totalPayment', label: 'Total Payment' },
    ],
    formula: 'M = P[r(1+r)^n]/[(1+r)^n - 1]',
    mockResults: { monthly: '$1,266.71', totalInterest: '$205,817.24', totalPayment: '$455,817.24' },
  },
  mortgage: {
    inputs: [
      { key: 'homePrice', label: 'Home Price', placeholder: '350,000', prefix: '$' },
      { key: 'downPayment', label: 'Down Payment', placeholder: '70,000', prefix: '$' },
      { key: 'rate', label: 'Interest Rate', placeholder: '6.5', suffix: '%' },
      { key: 'term', label: 'Loan Term', placeholder: '30', suffix: 'years' },
    ],
    outputs: [
      { key: 'monthly', label: 'Monthly Payment' },
      { key: 'totalInterest', label: 'Total Interest' },
      { key: 'totalPayment', label: 'Total Payment' },
    ],
    formula: 'M = (P - D)[r(1+r)^n]/[(1+r)^n - 1]',
    mockResults: { monthly: '$1,771.28', totalInterest: '$367,660.80', totalPayment: '$647,660.80' },
  },
  emi: {
    inputs: [
      { key: 'principal', label: 'Principal Amount', placeholder: '500,000', prefix: '$' },
      { key: 'rate', label: 'Annual Interest Rate', placeholder: '8.5', suffix: '%' },
      { key: 'tenure', label: 'Tenure', placeholder: '24', suffix: 'months' },
    ],
    outputs: [
      { key: 'emi', label: 'Monthly EMI' },
      { key: 'totalInterest', label: 'Total Interest' },
      { key: 'totalPayment', label: 'Total Payment' },
    ],
    formula: 'EMI = P x r x (1+r)^n / ((1+r)^n - 1)',
    mockResults: { emi: '$22,994.37', totalInterest: '$51,864.88', totalPayment: '$551,864.88' },
  },
  compound: {
    inputs: [
      { key: 'principal', label: 'Principal Amount', placeholder: '10,000', prefix: '$' },
      { key: 'rate', label: 'Annual Interest Rate', placeholder: '7', suffix: '%' },
      { key: 'years', label: 'Time Period', placeholder: '10', suffix: 'years' },
      { key: 'frequency', label: 'Compounding Frequency', placeholder: '12', suffix: 'times/yr' },
    ],
    outputs: [
      { key: 'final', label: 'Final Amount' },
      { key: 'interest', label: 'Total Interest' },
    ],
    formula: 'A = P(1 + r/n)^(nt)',
    mockResults: { final: '$20,096.61', interest: '$10,096.61' },
  },
  simple: {
    inputs: [
      { key: 'principal', label: 'Principal Amount', placeholder: '10,000', prefix: '$' },
      { key: 'rate', label: 'Annual Interest Rate', placeholder: '5', suffix: '%' },
      { key: 'years', label: 'Time Period', placeholder: '5', suffix: 'years' },
    ],
    outputs: [
      { key: 'interest', label: 'Simple Interest' },
      { key: 'total', label: 'Total Amount' },
    ],
    formula: 'I = P x r x t',
    mockResults: { interest: '$2,500.00', total: '$12,500.00' },
  },
  savings: {
    inputs: [
      { key: 'monthly', label: 'Monthly Contribution', placeholder: '500', prefix: '$' },
      { key: 'rate', label: 'Annual Return Rate', placeholder: '6', suffix: '%' },
      { key: 'years', label: 'Time Period', placeholder: '10', suffix: 'years' },
    ],
    outputs: [
      { key: 'balance', label: 'Final Balance' },
      { key: 'contributions', label: 'Total Contributions' },
      { key: 'interest', label: 'Total Interest Earned' },
    ],
    formula: 'FV = PMT x [((1+r)^n - 1) / r]',
    mockResults: { balance: '$81,939.67', contributions: '$60,000.00', interest: '$21,939.67' },
  },
  investment: {
    inputs: [
      { key: 'initial', label: 'Initial Investment', placeholder: '25,000', prefix: '$' },
      { key: 'monthly', label: 'Monthly Contribution', placeholder: '1,000', prefix: '$' },
      { key: 'rate', label: 'Expected Annual Return', placeholder: '10', suffix: '%' },
      { key: 'years', label: 'Investment Period', placeholder: '20', suffix: 'years' },
    ],
    outputs: [
      { key: 'futureValue', label: 'Future Value' },
      { key: 'totalContributed', label: 'Total Contributed' },
      { key: 'totalGain', label: 'Total Investment Gain' },
    ],
    formula: 'FV = PV(1+r)^n + PMT x [((1+r)^n - 1) / r]',
    mockResults: { futureValue: '$793,842.33', totalContributed: '$265,000.00', totalGain: '$528,842.33' },
  },
  debt: {
    inputs: [
      { key: 'balance', label: 'Total Debt', placeholder: '35,000', prefix: '$' },
      { key: 'rate', label: 'Interest Rate', placeholder: '18', suffix: '%' },
      { key: 'payment', label: 'Monthly Payment', placeholder: '1,000', prefix: '$' },
    ],
    outputs: [
      { key: 'months', label: 'Months to Pay Off' },
      { key: 'totalPaid', label: 'Total Amount Paid' },
      { key: 'totalInterest', label: 'Total Interest Paid' },
    ],
    formula: 'n = -log(1 - (B x r / P)) / log(1 + r)',
    mockResults: { months: '42 months', totalPaid: '$41,587.42', totalInterest: '$6,587.42' },
  },
  retirement: {
    inputs: [
      { key: 'age', label: 'Current Age', placeholder: '30' },
      { key: 'retireAge', label: 'Retirement Age', placeholder: '65' },
      { key: 'savings', label: 'Current Savings', placeholder: '150,000', prefix: '$' },
      { key: 'monthly', label: 'Monthly Contribution', placeholder: '1,500', prefix: '$' },
      { key: 'rate', label: 'Expected Return', placeholder: '7', suffix: '%' },
    ],
    outputs: [
      { key: 'nestEgg', label: 'Retirement Nest Egg' },
      { key: 'monthlyIncome', label: 'Monthly Retirement Income' },
    ],
    formula: 'FV = PV(1+r)^n + PMT x [((1+r)^n - 1) / r]',
    mockResults: { nestEgg: '$2,146,587.00', monthlyIncome: '$8,586.35' },
  },
  networth: {
    inputs: [
      { key: 'assets', label: 'Total Assets', placeholder: '500,000', prefix: '$' },
      { key: 'liabilities', label: 'Total Liabilities', placeholder: '200,000', prefix: '$' },
    ],
    outputs: [
      { key: 'netWorth', label: 'Net Worth' },
      { key: 'assetRatio', label: 'Asset-to-Debt Ratio' },
    ],
    formula: 'Net Worth = Total Assets - Total Liabilities',
    mockResults: { netWorth: '$300,000.00', assetRatio: '2.5x' },
  },
  emergency: {
    inputs: [
      { key: 'expenses', label: 'Monthly Expenses', placeholder: '4,000', prefix: '$' },
      { key: 'months', label: 'Months of Coverage', placeholder: '6', suffix: 'months' },
      { key: 'current', label: 'Current Fund Balance', placeholder: '8,000', prefix: '$' },
    ],
    outputs: [
      { key: 'target', label: 'Target Fund Size' },
      { key: 'gap', label: 'Amount Needed' },
    ],
    formula: 'Target = Monthly Expenses x Months of Coverage',
    mockResults: { target: '$24,000.00', gap: '$16,000.00' },
  },
  percentage: {
    inputs: [
      { key: 'value', label: 'Value', placeholder: '50' },
      { key: 'percent', label: 'Percentage', placeholder: '20', suffix: '%' },
      { key: 'of', label: 'Of (total)', placeholder: '200' },
    ],
    outputs: [
      { key: 'result', label: 'Result' },
      { key: 'reverse', label: 'What % is Value of Of?' },
    ],
    formula: 'Result = (Value / Of) x 100',
    mockResults: { result: '10.00', reverse: '25.00%' },
  },
};

const CalculatorDetailScreen: React.FC<CalculatorDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { calculatorId, calculatorName, calculatorColor } = route.params || {};

  const config = CALCULATOR_CONFIG[calculatorId] || CALCULATOR_CONFIG.loan;
  const accentColor = calculatorColor || colors.primary;

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const updateInput = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setShowResults(false);
  }, []);

  const handleCalculate = () => {
    setShowResults(true);
  };

  const handleReset = () => {
    setInputs({});
    setShowResults(false);
  };

  const showBarChart = ['loan', 'mortgage', 'emi'].includes(calculatorId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.text === '#F8FAFC' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface || colors.card }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerIcon, { backgroundColor: accentColor + '15' }]}>
            <Ionicons
              name="calculator"
              size={18}
              color={accentColor}
            />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {calculatorName}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enter Values</Text>
          {config.inputs.map((input) => (
            <View key={input.key} style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{input.label}</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.inputBg || colors.background, borderColor: colors.border }]}>
                {input.prefix && (
                  <Text style={[styles.inputPrefix, { color: colors.textSecondary }]}>{input.prefix}</Text>
                )}
                <TextInput
                  style={[styles.inputField, { color: colors.text }]}
                  value={inputs[input.key] || ''}
                  onChangeText={(t) => updateInput(input.key, t.replace(/[^0-9.]/g, ''))}
                  placeholder={input.placeholder}
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
                {input.suffix && (
                  <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{input.suffix}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Calculate"
            onPress={handleCalculate}
            variant="primary"
            size="lg"
            icon={<Ionicons name="calculator-outline" size={20} color="#FFFFFF" />}
            style={[styles.calcButton, { backgroundColor: accentColor }]}
          />
          <Button
            title="Reset"
            onPress={handleReset}
            variant="outline"
            size="lg"
            style={styles.resetButton}
          />
        </View>

        {showResults && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Results</Text>
            <Card variant="elevated" style={[styles.resultsCard, { borderColor: accentColor + '30' }]}>
              {config.outputs.map((output, index) => (
                <View key={output.key}>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{output.label}</Text>
                    <Text style={[styles.resultValue, { color: index === 0 ? accentColor : colors.text }]}>
                      {config.mockResults[output.key] || '--'}
                    </Text>
                  </View>
                  {index < config.outputs.length - 1 && (
                    <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </Card>

            {showBarChart && (
              <Card variant="elevated" style={styles.chartCard}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>Payment Breakdown</Text>
                <View style={styles.barChart}>
                  <View style={styles.barColumn}>
                    <View style={[styles.bar, { height: 100, backgroundColor: accentColor }]}>
                      <Text style={styles.barLabel}>Principal</Text>
                    </View>
                    <Text style={[styles.barPercent, { color: accentColor }]}>64%</Text>
                  </View>
                  <View style={styles.barColumn}>
                    <View style={[styles.bar, { height: 60, backgroundColor: '#EF4444' }]}>
                      <Text style={styles.barLabel}>Interest</Text>
                    </View>
                    <Text style={[styles.barPercent, { color: '#EF4444' }]}>36%</Text>
                  </View>
                </View>
              </Card>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Card variant="outlined" style={styles.formulaCard}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <View style={styles.formulaInfo}>
              <Text style={[styles.formulaLabel, { color: colors.textSecondary }]}>Formula Used</Text>
              <Text style={[styles.formulaText, { color: colors.text }]}>{config.formula}</Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  calcButton: {
    flex: 2,
  },
  resetButton: {
    flex: 1,
  },
  resultsCard: {
    borderWidth: 1.5,
    padding: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  resultDivider: {
    height: 1,
  },
  chartCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 140,
    gap: spacing.xxxl,
  },
  barColumn: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  bar: {
    width: 80,
    borderRadius: borderRadius.sm || 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  barPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  formulaCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  formulaInfo: {
    flex: 1,
  },
  formulaLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formulaText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
});

export default CalculatorDetailScreen;
