import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import SearchBar from '../../components/common/SearchBar';
import { availableBanks } from '../../data/banks';

interface BankSelectionScreenProps {
  navigation: any;
}

const BankSelectionScreen: React.FC<BankSelectionScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const popularBanks = useMemo(
    () =>
      availableBanks
        .filter((b) => b.popular)
        .filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [searchQuery]
  );

  const allBanks = useMemo(
    () =>
      availableBanks
        .filter((b) => !b.popular)
        .filter((b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [searchQuery]
  );

  const handleSelectBank = (bank: typeof availableBanks[number]) => {
    navigation.navigate('BankVerification', {
      bankId: bank.id,
      bankName: bank.name,
      bankColor: bank.color,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Select Your Bank
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search banks..."
          />
        </View>

        {searchQuery.length === 0 && popularBanks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Popular Banks
            </Text>
            <View style={styles.popularGrid}>
              {popularBanks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.popularCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSelectBank(bank)}
                >
                  <View
                    style={[styles.popularIconCircle, { backgroundColor: bank.color + '18' }]}
                  >
                    <Ionicons name="business" size={28} color={bank.color} />
                  </View>
                  <Text
                    style={[styles.popularBankName, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {bank.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {allBanks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery.length > 0 ? 'Results' : 'All Banks'}
            </Text>
            <View style={[styles.allBanksContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {allBanks.map((bank, index) => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankRow,
                    index < allBanks.length - 1 && { borderBottomColor: colors.border },
                  ]}
                  activeOpacity={0.6}
                  onPress={() => handleSelectBank(bank)}
                >
                  <View
                    style={[styles.bankRowIcon, { backgroundColor: bank.color + '18' }]}
                  >
                    <Ionicons name="business" size={20} color={bank.color} />
                  </View>
                  <Text style={[styles.bankRowName, { color: colors.text }]}>
                    {bank.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {searchQuery.length > 0 && popularBanks.length === 0 && allBanks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No banks found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try a different search term
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.supportLink} activeOpacity={0.7}>
          <Text style={[styles.supportText, { color: colors.textSecondary }]}>
            Don't see your bank?{' '}
          </Text>
          <Text style={[styles.supportLinkText, { color: colors.primary }]}>
            Contact Support
          </Text>
        </TouchableOpacity>
      </ScreenScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  popularCard: {
    width: '47%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  popularIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  popularBankName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  allBanksContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  bankRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bankRowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  supportLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  supportText: {
    fontSize: 14,
  },
  supportLinkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BankSelectionScreen;
