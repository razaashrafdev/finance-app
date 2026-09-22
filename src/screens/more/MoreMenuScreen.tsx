import React from 'react';
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
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import AppLogo from '../../components/common/AppLogo';
import { useAppStore } from '../../store/AppStore';

interface MoreMenuScreenProps {
  navigation: any;
}

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
  id: string;
  title: string;
  icon: IconName;
  iconColor: string;
  screen: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MoreMenuScreen: React.FC<MoreMenuScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user: userProfile, notifications, bills } = useAppStore();

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;
  const unpaidBillsCount = bills.filter((b: any) => !b.isPaid).length;

  const sections: MenuSection[] = [
    {
      title: 'Financial',
      items: [
        {
          id: 'bills',
          title: 'Bills & Subscriptions',
          icon: 'document-text-outline',
          iconColor: '#3B82F6',
          screen: 'BillsScreen',
          badge: unpaidBillsCount,
        },
        {
          id: 'loans',
          title: 'Loans',
          icon: 'cash-outline',
          iconColor: '#8B5CF6',
          screen: 'LoansScreen',
        },
        {
          id: 'investments',
          title: 'Investments',
          icon: 'trending-up-outline',
          iconColor: '#10B981',
          screen: 'InvestmentsScreen',
        },
        {
          id: 'networth',
          title: 'Net Worth',
          icon: 'wallet-outline',
          iconColor: '#F59E0B',
          screen: 'NetWorthScreen',
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          id: 'calculators',
          title: 'Financial Calculators',
          icon: 'calculator-outline',
          iconColor: '#06B6D4',
          screen: 'CalculatorsList',
        },
        {
          id: 'reports',
          title: 'Reports & Analytics',
          icon: 'bar-chart-outline',
          iconColor: '#EC4899',
          screen: 'ReportsScreen',
        },
        {
          id: 'calendar',
          title: 'Calendar',
          icon: 'calendar-outline',
          iconColor: '#F97316',
          screen: 'CalendarScreen',
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          id: 'ai',
          title: 'AI Assistant',
          icon: 'sparkles-outline',
          iconColor: '#A855F7',
          screen: 'AIAssistantScreen',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications-outline',
          iconColor: '#EF4444',
          screen: 'NotificationsScreen',
          badge: unreadCount,
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: 'settings-outline',
          iconColor: '#64748B',
          screen: 'SettingsScreen',
        },
        {
          id: 'importStatement',
          title: 'Import Statement',
          icon: 'document-text-outline',
          iconColor: '#0EA5E9',
          screen: 'BankStatement',
        },
        {
          id: 'accounts',
          title: 'Accounts',
          icon: 'business-outline',
          iconColor: '#0EA5E9',
          screen: 'AccountsScreen',
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <AppLogo size={36} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <Avatar uri={userProfile.avatar} name={`${userProfile.firstName} ${userProfile.lastName}`} size={56} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {userProfile.email}
            </Text>
            <View style={styles.viewProfileRow}>
              <Text style={[styles.viewProfileText, { color: colors.primary }]}>View Profile</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
              {section.title.toUpperCase()}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight || colors.border },
                  ]}
                  activeOpacity={0.6}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: item.iconColor + '15' }]}>
                    <Ionicons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                  <View style={styles.menuRight}>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge label={String(item.badge)} variant="danger" size="sm" />
                    )}
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScreenScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 2,
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '600',
  },
   section: {
     marginTop: spacing.sectionGap,
     paddingHorizontal: spacing.lg,
   },
   sectionTitle: {
     fontSize: 13,
     fontWeight: '600',
     letterSpacing: 0.5,
     marginBottom: spacing.md,
   },
   sectionCard: {
     borderRadius: borderRadius.lg,
     borderWidth: 1,
     overflow: 'hidden',
   },
   menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});

export default MoreMenuScreen;
