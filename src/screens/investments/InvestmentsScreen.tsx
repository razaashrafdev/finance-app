import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';
import { useToast } from '../../components/common/Toast';

interface InvestmentsScreenProps {
  navigation: any;
}

const TYPE_COLORS: Record<string, string> = {
  stock: '#4F46E5',
  etf: '#10B981',
  crypto: '#F59E0B',
  bond: '#8B5CF6',
};

const TYPE_ALLOCATIONS = [
  { type: 'Stocks', key: 'stock', color: '#4F46E5' },
  { type: 'ETFs', key: 'etf', color: '#10B981' },
  { type: 'Crypto', key: 'crypto', color: '#F59E0B' },
  { type: 'Bonds', key: 'bond', color: '#8B5CF6' },
];

const InvestmentsScreen: React.FC<InvestmentsScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { investments, addInvestment } = useAppStore();
  const toast = useToast();
  const [addVisible, setAddVisible] = useState(false);
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const portfolio = useMemo(() => {
    let totalValue = 0;
    let totalInvested = 0;
    const byType: Record<string, number> = { stock: 0, etf: 0, crypto: 0, bond: 0 };

    investments.forEach((inv: any) => {
      const currentVal = inv.quantity * inv.currentPrice;
      const investedVal = inv.quantity * inv.buyPrice;
      totalValue += currentVal;
      totalInvested += investedVal;
      byType[inv.type] = (byType[inv.type] || 0) + currentVal;
    });

    const profitLoss = totalValue - totalInvested;
    const returnPct = totalInvested > 0 ? ((profitLoss / totalInvested) * 100) : 0;

    const allocations = TYPE_ALLOCATIONS.map((a) => ({
      ...a,
      percentage: totalValue > 0 ? ((byType[a.key] || 0) / totalValue) * 100 : 0,
      amount: byType[a.key] || 0,
    })).filter((a) => a.amount > 0);

    return { totalValue, totalInvested, profitLoss, returnPct, allocations };
  }, [investments]);

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Investments</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Portfolio Value</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(portfolio.totalValue)}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Invested</Text>
              <Text style={[styles.summaryItemValue, { color: colors.text }]}>{formatCurrency(portfolio.totalInvested)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Profit/Loss</Text>
              <Text style={[styles.summaryItemValue, { color: portfolio.profitLoss >= 0 ? colors.positive : colors.negative }]}>
                {formatCurrency(portfolio.profitLoss, true)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemLabel, { color: colors.textSecondary }]}>Return</Text>
              <Text style={[styles.summaryItemValue, { color: portfolio.returnPct >= 0 ? colors.positive : colors.negative }]}>
                {portfolio.returnPct >= 0 ? '+' : ''}{portfolio.returnPct.toFixed(2)}%
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Allocation</Text>
          <Card variant="default" style={styles.allocationCard}>
            <View style={styles.allocationBar}>
              {portfolio.allocations.map((a, i) => (
                <View
                  key={a.key}
                  style={[styles.allocationBarSegment, { backgroundColor: a.color, flex: a.percentage }]}
                />
              ))}
            </View>
            <View style={styles.allocationGrid}>
              {portfolio.allocations.map((a) => (
                <View key={a.key} style={styles.allocationItem}>
                  <View style={styles.allocationItemHeader}>
                    <View style={[styles.allocationDot, { backgroundColor: a.color }]} />
                    <Text style={[styles.allocationType, { color: colors.text }]}>{a.type}</Text>
                  </View>
                  <Text style={[styles.allocationAmount, { color: colors.textSecondary }]}>{formatCurrency(a.amount)}</Text>
                  <Text style={[styles.allocationPercent, { color: colors.textTertiary }]}>{a.percentage.toFixed(1)}%</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Holdings</Text>
          {investments.map((inv: any) => {
            const currentValue = inv.quantity * inv.currentPrice;
            const profitLoss = currentValue - (inv.quantity * inv.buyPrice);
            const isPositive = inv.changePercent >= 0;

            return (
              <Card
                key={inv.id}
                variant="default"
                style={styles.holdingCard}
                onPress={() => navigation.navigate('InvestmentDetail', { investmentId: inv.id })}
              >
                <View style={styles.holdingHeader}>
                  <View style={styles.holdingHeaderLeft}>
                    <View style={[styles.tickerBadge, { backgroundColor: (TYPE_COLORS[inv.type] || colors.primary) + '15' }]}>
                      <Text style={[styles.tickerText, { color: TYPE_COLORS[inv.type] || colors.primary }]}>{inv.ticker}</Text>
                    </View>
                    <View style={styles.holdingInfo}>
                      <Text style={[styles.holdingName, { color: colors.text }]} numberOfLines={1}>{inv.name}</Text>
                      <Badge label={inv.type.charAt(0).toUpperCase() + inv.type.slice(1)} variant="neutral" size="sm" />
                    </View>
                  </View>
                  <View style={styles.holdingPriceRight}>
                    <Text style={[styles.holdingPrice, { color: colors.text }]}>{formatCurrency(inv.currentPrice)}</Text>
                    <Text style={[styles.holdingChange, { color: isPositive ? colors.positive : colors.negative }]}>
                      {isPositive ? '+' : ''}{formatCurrency(inv.change)} ({isPositive ? '+' : ''}{inv.changePercent.toFixed(2)}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.holdingDetails}>
                  <View style={styles.holdingDetailItem}>
                    <Text style={[styles.holdingDetailLabel, { color: colors.textSecondary }]}>Value</Text>
                    <Text style={[styles.holdingDetailValue, { color: colors.text }]}>{formatCurrency(currentValue)}</Text>
                  </View>
                  <View style={styles.holdingDetailItem}>
                    <Text style={[styles.holdingDetailLabel, { color: colors.textSecondary }]}>P/L</Text>
                    <Text style={[styles.holdingDetailValue, { color: profitLoss >= 0 ? colors.positive : colors.negative }]}>
                      {formatCurrency(profitLoss, true)}
                    </Text>
                  </View>
                  <View style={styles.holdingDetailItem}>
                    <Text style={[styles.holdingDetailLabel, { color: colors.textSecondary }]}>Qty</Text>
                    <Text style={[styles.holdingDetailValue, { color: colors.text }]}>{inv.quantity}</Text>
                  </View>
                  <View style={styles.holdingSectorTag}>
                    <Ionicons name="pricetag-outline" size={12} color={colors.textTertiary} />
                    <Text style={[styles.holdingSectorText, { color: colors.textTertiary }]}>{inv.sector}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Add Investment"
            onPress={() => setAddVisible(true)}
            variant="primary"
            size="lg"
            icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={addVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Investment</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Enter investment details below.</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Ticker Symbol</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="e.g. AAPL" placeholderTextColor={colors.textTertiary} value={ticker} onChangeText={setTicker} autoCapitalize="characters" />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Quantity</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Buy Price</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="numeric" value={buyPrice} onChangeText={setBuyPrice} />

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setAddVisible(false)} variant="ghost" size="md" style={{ flex: 1 }} />
              <Button title="Add" onPress={() => {
                addInvestment({ ticker, quantity: parseFloat(quantity) as any, buyPrice: parseFloat(buyPrice) as any });
                setTicker('');
                setQuantity('');
                setBuyPrice('');
                setAddVisible(false);
                toast.show('Investment added', 'success');
              }} variant="primary" size="md" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  summaryCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  summaryLabel: { fontSize: 14, fontWeight: '500', marginBottom: spacing.xs },
  summaryValue: { fontSize: 32, fontWeight: '800', marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryItemLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  summaryItemValue: { fontSize: 15, fontWeight: '700' },
  summaryDivider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: spacing.sm },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  allocationCard: {},
  allocationBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: spacing.lg },
  allocationBarSegment: { height: '100%' },
  allocationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  allocationItem: { width: '47%' },
  allocationItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  allocationDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  allocationType: { fontSize: 14, fontWeight: '600' },
  allocationAmount: { fontSize: 13, fontWeight: '500', marginLeft: 16 },
  allocationPercent: { fontSize: 12, fontWeight: '500', marginLeft: 16 },
  holdingCard: { marginBottom: spacing.sm },
  holdingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  holdingHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: spacing.sm },
  tickerBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm, marginRight: spacing.md,
  },
  tickerText: { fontSize: 13, fontWeight: '700' },
  holdingInfo: { flex: 1 },
  holdingName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  holdingPriceRight: { alignItems: 'flex-end' },
  holdingPrice: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  holdingChange: { fontSize: 12, fontWeight: '500' },
  holdingDetails: {
    flexDirection: 'row', alignItems: 'center', marginTop: spacing.md,
    paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  holdingDetailItem: { flex: 1 },
  holdingDetailLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  holdingDetailValue: { fontSize: 13, fontWeight: '600' },
  holdingSectorTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  holdingSectorText: { fontSize: 12, fontWeight: '500' },
  buttonSection: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalContent: { width: '100%', borderRadius: borderRadius.xl, padding: spacing.xxl },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: spacing.xs },
  modalSubtitle: { fontSize: 14, marginBottom: spacing.xl },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    fontSize: 15, marginBottom: spacing.md,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});

export default InvestmentsScreen;
