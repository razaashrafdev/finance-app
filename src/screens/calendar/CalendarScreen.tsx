import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import Card from '../../components/common/Card';
import { calendarEvents } from '../../data/mockData';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';

interface CalendarScreenProps {
  navigation: any;
}

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_TYPE_COLORS: Record<string, string> = {
  bill: '#3B82F6',
  subscription: '#EF4444',
  income: '#10B981',
  loan: '#8B5CF6',
};

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 21));
  const [selectedDay, setSelectedDay] = useState<number>(21);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter((e) => e.date.startsWith(dateStr));
  };

  const selectedEvents = getEventsForDay(selectedDay);

  const upcomingEvents = useMemo(() => {
    const now = new Date(2026, 8, 21);
    return calendarEvents
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, []);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    setCurrentDate(newDate);
    setSelectedDay(1);
  };

  const isToday = (day: number) => {
    return year === 2026 && month === 8 && day === 21;
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financial Calendar</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={[styles.navArrow, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={[styles.navArrow, { backgroundColor: colors.surface }]}>
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Card variant="default" style={styles.calendarCard}>
          <View style={styles.dayHeaders}>
            {DAY_HEADERS.map((day, i) => (
              <Text key={i} style={[styles.dayHeaderText, { color: colors.textTertiary }]}>{day}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const events = getEventsForDay(day);
              const hasEvents = events.length > 0;
              const isSelected = day === selectedDay;
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.dayCell}
                  onPress={() => setSelectedDay(day)}
                >
                  <View
                    style={[
                      styles.dayNumber,
                      isSelected && { backgroundColor: colors.primary, borderRadius: 20 },
                      today && !isSelected && { borderWidth: 2, borderColor: colors.primary, borderRadius: 20 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                        today && !isSelected && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                  {hasEvents && (
                    <View style={styles.dotsRow}>
                      {events.slice(0, 3).map((event, i) => (
                        <View
                          key={i}
                          style={[
                            styles.eventDot,
                            { backgroundColor: EVENT_TYPE_COLORS[event.type] || colors.textTertiary },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <View style={styles.legendRow}>
          {Object.entries(EVENT_TYPE_COLORS).map(([type, color]) => (
            <View key={type} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {MONTH_NAMES[month]} {selectedDay}
          </Text>
          <Card variant="default">
            {selectedEvents.length > 0 ? (
              selectedEvents.map((event, index) => (
                <View key={index}>
                  <View style={styles.eventRow}>
                    <View style={[styles.eventDotLarge, { backgroundColor: EVENT_TYPE_COLORS[event.type] || colors.textTertiary }]} />
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                      <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Text>
                    </View>
                    <Text style={[styles.eventAmount, { color: colors.text }]}>{formatCurrency(event.amount)}</Text>
                  </View>
                  {index < selectedEvents.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No financial events on this day
                </Text>
              </View>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Events</Text>
          <Card variant="default">
            {upcomingEvents.map((event, index) => (
              <View key={index}>
                <View style={styles.eventRow}>
                  <View style={[styles.eventDotLarge, { backgroundColor: EVENT_TYPE_COLORS[event.type] || colors.textTertiary }]} />
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <Text style={[styles.eventAmount, { color: colors.text }]}>{formatCurrency(event.amount)}</Text>
                </View>
                {index < upcomingEvents.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                )}
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  navArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: { fontSize: 20, fontWeight: '700' },
  calendarCard: {
    marginHorizontal: spacing.lg,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dayNumber: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 14, fontWeight: '500' },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontWeight: '500' },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  eventDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  eventTime: { fontSize: 12, fontWeight: '500' },
  eventAmount: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: { fontSize: 14, fontWeight: '500', marginTop: spacing.md },
});

export default CalendarScreen;
