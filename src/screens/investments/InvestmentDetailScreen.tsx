import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/AppStore';

interface InvestmentDetailScreenProps {
  navigation: any;
  route: any;
}

const TYPE_COLORS: Record<string, string> = {
  stock: '#4F46E5',
  etf: '#10B981',
  crypto: '#F59E0B',
  bond: '#8B5CF6',
};

const InvestmentDetailScreen: React.FC<InvestmentDetailScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { investments } = useAppStore();
  const { investmentId } = route.params || {};

  const investment = useMemo(
    () => investments.find((inv: any) => inv.id === investmentId),
    [investmentId, investments]
  );

  if (!investment) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Investment not found.</Text>
      </View>
    );
  }

  const currentValue = investment.quantity * investment.currentPrice;
  const investedValue = investment.quantity * investment.buyPrice;
  const profitLoss = currentValue - investedValue;
  const returnPct = investedValue > 0 ? ((profitLoss / investedValue) * 100) : 0;
  const isPositive = investment.changePercent >= 0;
  const isProfit = profitLoss >= 0;
  const now = new Date();
  const hours = now.getHours();
  const isMarketOpen = hours >= 9.5 && hours < 16 && now.getDay() > 0 && now.getDay() < 6;

  const handleEdit = () => {
    Alert.alert('Edit Investment', 'Navigate to edit screen for this investment.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Investment',
      `Are you sure you want to remove ${investment.name} from your portfolio?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const chartPoints = [
    { x: 0, y: 65 },
    { x: 1, y: 58 },
    { x: 2, y: 70 },
    { x: 3, y: 62 },
    { x: 4, y: 75 },
    { x: 5, y: 80 },
    { x: 6, y: 72 },
    { x: 7, y: 85 },
    { x: 8, y: 90 },
    { x: 9, y: 88 },
    { x: 10, y: 95 },
    { x: 11, y: 100 },
  ];
  const chartW = 300;
  const chartH = 120;
  const maxVal = Math.max(...chartPoints.map((p) => p.y));
  const minVal = Math.min(...chartPoints.map((p) => p.y));
  const range = maxVal - minVal || 1;

  const buildPath = () => {
    return chartPoints
      .map((p, i) => {
        const x = (p.x / (chartPoints.length - 1)) * chartW;
        const y = chartH - ((p.y - minVal) / range) * (chartH - 20) - 10;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

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
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{investment.name}</Text>
          <Text style={[styles.headerTicker, { color: colors.textSecondary }]}>{investment.ticker}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={[styles.currentPrice, { color: colors.text }]}>{formatCurrency(investment.currentPrice)}</Text>
            <Badge
              label={isMarketOpen ? 'Market Open' : 'Market Closed'}
              variant={isMarketOpen ? 'success' : 'warning'}
              size="sm"
            />
          </View>
          <View style={styles.changeRow}>
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={18}
              color={isPositive ? colors.positive : colors.negative}
            />
            <Text style={[styles.changeText, { color: isPositive ? colors.positive : colors.negative }]}>
              {isPositive ? '+' : ''}{formatCurrency(investment.change)} ({isPositive ? '+' : ''}{investment.changePercent.toFixed(2)}%)
            </Text>
          </View>
        </Card>

        <Card variant="default" style={styles.sectionCard}>
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Holding Info</Text>
          <View style={styles.holdingGrid}>
            <View style={styles.holdingGridItem}>
              <Text style={[styles.holdingLabel, { color: colors.textSecondary }]}>Quantity</Text>
              <Text style={[styles.holdingValue, { color: colors.text }]}>{investment.quantity}</Text>
            </View>
            <View style={styles.holdingGridItem}>
              <Text style={[styles.holdingLabel, { color: colors.textSecondary }]}>Buy Price</Text>
              <Text style={[styles.holdingValue, { color: colors.text }]}>{formatCurrency(investment.buyPrice)}</Text>
            </View>
            <View style={styles.holdingGridItem}>
              <Text style={[styles.holdingLabel, { color: colors.textSecondary }]}>Current Value</Text>
              <Text style={[styles.holdingValue, { color: colors.text }]}>{formatCurrency(currentValue)}</Text>
            </View>
            <View style={styles.holdingGridItem}>
              <Text style={[styles.holdingLabel, { color: colors.textSecondary }]}>Invested</Text>
              <Text style={[styles.holdingValue, { color: colors.text }]}>{formatCurrency(investedValue)}</Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" style={[styles.sectionCard, { backgroundColor: isProfit ? colors.positive + '10' : colors.negative + '10' }]}>
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Profit / Loss</Text>
          <View style={styles.plRow}>
            <View style={styles.plItem}>
              <Text style={[styles.plLabel, { color: colors.textSecondary }]}>Total Gain/Loss</Text>
              <Text style={[styles.plValueLarge, { color: isProfit ? colors.positive : colors.negative }]}>
                {formatCurrency(profitLoss, true)}
              </Text>
            </View>
            <View style={styles.plDivider} />
            <View style={styles.plItem}>
              <Text style={[styles.plLabel, { color: colors.textSecondary }]}>Return</Text>
              <Text style={[styles.plValueLarge, { color: isProfit ? colors.positive : colors.negative }]}>
                {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Trend</Text>
          <Card variant="default" style={styles.chartCard}>
            <View style={[styles.chartPlaceholder, { height: chartH }]}>
              {chartPoints.map((p, i) => {
                const x = (p.x / (chartPoints.length - 1)) * chartW;
                const y = chartH - ((p.y - minVal) / range) * (chartH - 20) - 10;
                return i < chartPoints.length - 1 ? (
                  <View
                    key={i}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: Math.sqrt(
                        Math.pow(((chartPoints[i + 1].x / (chartPoints.length - 1)) * chartW) - x, 2) +
                        Math.pow((chartH - ((chartPoints[i + 1].y - minVal) / range) * (chartH - 20) - 10) - y, 2)
                      ),
                      height: 3,
                      backgroundColor: isPositive ? colors.positive : colors.negative,
                      transformOrigin: '0 50%',
                      transform: [{
                        rotate: `${Math.atan2(
                          (chartH - ((chartPoints[i + 1].y - minVal) / range) * (chartH - 20) - 10) - y,
                          ((chartPoints[i + 1].x / (chartPoints.length - 1)) * chartW) - x
                        )}rad`,
                      }],
                    }}
                  />
                ) : null;
              })}
            </View>
            <View style={styles.chartLabels}>
              <Text style={[styles.chartLabel, { color: colors.textTertiary }]}>30d ago</Text>
              <Text style={[styles.chartLabel, { color: colors.textTertiary }]}>Today</Text>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Investment Stats</Text>
          <Card variant="default" style={styles.sectionCard}>
            <View style={styles.statRow}>
              <Ionicons name="briefcase-outline" size={18} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sector</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{investment.sector}</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Ionicons name="folder-outline" size={18} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Type</Text>
              <Badge label={investment.type.charAt(0).toUpperCase() + investment.type.slice(1)} variant="info" size="sm" />
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Purchase Date</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>Jan 15, 2025</Text>
            </View>
          </Card>
        </View>

        <View style={styles.actionsSection}>
          <Button
            title="Edit"
            onPress={handleEdit}
            variant="secondary"
            size="lg"
            icon={<Ionicons name="create-outline" size={20} color={colors.primary} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="danger"
            size="lg"
            icon={<Ionicons name="trash-outline" size={20} color="#FFFFFF" />}
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerTicker: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  priceCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  currentPrice: { fontSize: 34, fontWeight: '800' },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  changeText: { fontSize: 15, fontWeight: '600' },
  sectionCard: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  cardSectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: spacing.md },
  holdingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  holdingGridItem: { width: '47%' },
  holdingLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  holdingValue: { fontSize: 16, fontWeight: '700' },
  plRow: { flexDirection: 'row', alignItems: 'center' },
  plItem: { flex: 1, alignItems: 'center' },
  plLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  plValueLarge: { fontSize: 22, fontWeight: '800' },
  plDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0', marginHorizontal: spacing.md },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  chartCard: {},
  chartPlaceholder: { position: 'relative', overflow: 'hidden' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  chartLabel: { fontSize: 12, fontWeight: '500' },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md },
  statLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  statValue: { fontSize: 14, fontWeight: '600' },
  statDivider: { height: 1 },
  actionsSection: {
    flexDirection: 'row', paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl, gap: spacing.md,
  },
  errorText: { textAlign: 'center', marginTop: 100, fontSize: 16 },
});

export default InvestmentDetailScreen;
