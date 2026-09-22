import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import Button from '../../components/common/Button';

interface SyncFailedScreenProps {
  navigation: any;
  route: {
    params: {
      bankId: string;
      bankName: string;
      bankColor: string;
      errorType?: string;
      errorCode?: string;
    };
  };
}

const SyncFailedScreen: React.FC<SyncFailedScreenProps> = ({
  navigation,
  route,
}) => {
  const { colors, isDark } = useTheme();
  const { bankId, bankName, bankColor, errorType = 'Connection Timeout', errorCode = 'ERR_CONN_TIMEOUT' } = route.params;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const errorMessage = "We couldn't establish a connection with your bank. This could be due to a temporary issue.";
  const timestamp = 'September 30, 2026 at 3:45 PM';

  const solutions = [
    "Check if your bank's website is accessible",
    'Verify your login credentials are correct',
    'Try again in a few minutes',
    'Contact your bank if the issue persists',
  ];

  useEffect(() => {
    Animated.sequence([
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -6,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  }, []);

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
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Connection Failed
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScreenScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Icon */}
        <View style={styles.errorIconArea}>
          <Animated.View
            style={[
              styles.errorCircle,
              {
                backgroundColor: colors.negativeLight,
                borderColor: colors.negative,
                transform: [{ scale: circleScale }, { translateX: shakeAnim }],
              },
            ]}
          >
            <Ionicons name="alert" size={48} color={colors.negative} />
          </Animated.View>
        </View>

        {/* Title */}
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Something went wrong
        </Text>

        {/* Error Details Card */}
        <Animated.View
          style={[
            styles.errorCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: contentOpacity,
            },
          ]}
        >
          <View style={styles.errorDetailRow}>
            <Text style={[styles.errorDetailLabel, { color: colors.textSecondary }]}>
              Error Type
            </Text>
            <Text style={[styles.errorDetailValue, { color: colors.text }]}>
              {errorType}
            </Text>
          </View>

          <View style={[styles.errorDivider, { backgroundColor: colors.border }]} />

          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
            {errorMessage}
          </Text>

          <View style={[styles.errorDivider, { backgroundColor: colors.border }]} />

          <View style={styles.errorDetailRow}>
            <Text style={[styles.errorDetailLabel, { color: colors.textSecondary }]}>
              Error Code
            </Text>
            <Text style={[styles.errorCode, { color: colors.textTertiary }]}>
              {errorCode}
            </Text>
          </View>

          <View style={[styles.errorDivider, { backgroundColor: colors.border }]} />

          <View style={styles.errorDetailRow}>
            <Text style={[styles.errorDetailLabel, { color: colors.textSecondary }]}>
              Timestamp
            </Text>
            <Text style={[styles.errorDetailValue, { color: colors.text }]}>
              {timestamp}
            </Text>
          </View>
        </Animated.View>

        {/* Common Solutions */}
        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Common solutions
          </Text>

          <View style={styles.solutionsList}>
            {solutions.map((solution, index) => (
              <View
                key={index}
                style={[
                  styles.solutionItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={[styles.solutionIcon, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="bulb-outline" size={18} color={colors.info} />
                </View>
                <Text style={[styles.solutionText, { color: colors.text }]}>
                  {solution}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScreenScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <Button
          title="Try Again"
          onPress={() =>
            navigation.navigate('BankVerification', {
              bankId,
              bankName,
              bankColor,
            })
          }
          variant="primary"
          size="lg"
          style={{ backgroundColor: bankColor }}
        />
        <Button
          title="Choose Different Bank"
          onPress={() => navigation.navigate('BankSelection')}
          variant="outline"
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
        <TouchableOpacity
          style={styles.supportLink}
          activeOpacity={0.7}
          onPress={() => {}}
        >
          <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
          <Text style={[styles.supportText, { color: colors.primary }]}>
            Contact Support
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: 40,
  },
  errorIconArea: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  errorCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  errorDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  errorDetailLabel: {
    fontSize: 14,
  },
  errorDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  errorDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 22,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  solutionsList: {
    gap: spacing.sm,
  },
  solutionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  solutionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  solutionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  supportText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SyncFailedScreen;
