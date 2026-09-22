import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { notifications as mockNotifications } from '../../data/mockData';
import { spacing, borderRadius } from '../../theme/spacing';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

type FilterTab = 'all' | 'unread' | 'bills' | 'budget' | 'goals';

interface NotificationsScreenProps {
  navigation: any;
}

const TYPE_COLORS: Record<string, string> = {
  bill_reminder: '#3B82F6',
  budget_warning: '#F59E0B',
  goal_update: '#10B981',
  loan_payment: '#8B5CF6',
  insight: '#0EA5E9',
  general: '#64748B',
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  bill_reminder: 'receipt-outline',
  budget_warning: 'warning-outline',
  goal_update: 'flag-outline',
  loan_payment: 'card-outline',
  insight: 'bulb-outline',
  general: 'information-circle-outline',
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'bills', label: 'Bills' },
    { key: 'budget', label: 'Budget' },
    { key: 'goals', label: 'Goals' },
  ];

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const getFilteredNotifications = useCallback(() => {
    switch (activeFilter) {
      case 'unread':
        return notifications.filter((n: any) => !n.isRead);
      case 'bills':
        return notifications.filter((n: any) => n.type === 'bill_reminder');
      case 'budget':
        return notifications.filter((n: any) => n.type === 'budget_warning');
      case 'goals':
        return notifications.filter((n: any) => n.type === 'goal_update');
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const filtered = getFilteredNotifications();

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n: any) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n: any) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n: any) => n.id !== id));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getNotificationColor = (type: string): string => {
    return TYPE_COLORS[type] || colors.textTertiary || '#64748B';
  };

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    return TYPE_ICONS[type] || 'notifications-outline';
  };

  const getFilterBadgeType = (type: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    switch (type) {
      case 'bill_reminder':
        return 'info';
      case 'budget_warning':
        return 'warning';
      case 'goal_update':
        return 'success';
      case 'loan_payment':
        return 'neutral';
      case 'insight':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={[styles.markAllRead, { color: colors.primary }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Unread Count */}
        {unreadCount > 0 && (
          <View style={[styles.unreadBanner, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="mail-unread-outline" size={18} color={colors.primary} />
            <Text style={[styles.unreadText, { color: colors.primary }]}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Filter Tabs */}
        <ScreenScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === filter.key ? colors.primary : colors.card,
                  borderColor: activeFilter === filter.key ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: activeFilter === filter.key ? '#FFFFFF' : colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScreenScrollView>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No notifications yet"
            description="You're all caught up! Check back later for updates."
          />
        ) : (
          <View style={styles.listSection}>
            {filtered.map((notification: any) => {
              const typeColor = getNotificationColor(notification.type);
              const typeIcon = getNotificationIcon(notification.type);
              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    {
                      backgroundColor: colors.card,
                      borderLeftColor: typeColor,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={styles.notificationTop}>
                    <View style={[styles.iconCircle, { backgroundColor: typeColor + '15' }]}>
                      <Ionicons name={typeIcon} size={20} color={typeColor} />
                    </View>
                    <View style={styles.notificationBody}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.notificationTitle,
                            { color: colors.text },
                            !notification.isRead && styles.titleUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Text
                        style={[styles.notificationMessage, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                      <View style={styles.notificationMeta}>
                        <Badge
                          label={notification.type.replace('_', ' ')}
                          variant={getFilterBadgeType(notification.type)}
                          size="sm"
                        />
                        <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                          {getRelativeTime(notification.time)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteNotification(notification.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterScroll: {
    marginTop: spacing.lg,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  notificationCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  notificationTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  timeText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default NotificationsScreen;
