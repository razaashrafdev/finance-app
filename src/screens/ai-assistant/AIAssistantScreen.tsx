import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { ScreenScrollView } from '../../components/common/ScreenScroll';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { formatCurrency } from '../../utils/format';
import { spacing, borderRadius } from '../../theme/spacing';

interface AIAssistantScreenProps {
  navigation: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'Where did I spend the most this month?',
  'How much did I save?',
  'What are my biggest expenses?',
  'How much do I need to save for my goal?',
];

const MOCK_RESPONSES: Record<string, string> = {
  'Where did I spend the most this month?':
    `Your biggest spending category this month is Housing at $1,800, followed by Food at $610.58 and Transport at $266. Consider reviewing your Food spending, which is slightly over budget.`,
  'How much did I save?':
    `You saved ${formatCurrency(3300)} this month, which is a ${((3300 / 7500) * 100).toFixed(1)}% savings rate. That's $200 more than last month. Great progress on your Emergency Fund goal!`,
  'What are my biggest expenses?':
    `Your top 3 expenses this month:\n1. Housing (Rent): $1,800\n2. Food (Groceries): $610.58\n3. Transport: $266\n\nThese account for 76.3% of your total spending.`,
  'How much do I need to save for my goal?':
    `For your Emergency Fund goal, you need $5,000 more to reach your $15,000 target. At your current savings rate, you'll reach it in about 1.5 months. For the New Car goal, you need $17,000 more.`,
};

const TypingIndicator = () => {
  const { colors } = useTheme();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 200, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 200, useNativeDriver: true }),
        ])
      );
    };
    const anim = Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ]);
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="sparkles" size={16} color={colors.primary} />
      </View>
      <View style={[styles.typingBubble, { backgroundColor: colors.surface }]}>
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary, transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary, transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.typingDot, { backgroundColor: colors.textTertiary, transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const stickToEnd = useRef(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stickToEnd.current = false;
      };
    }, []),
  );

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim() || 'Tell me about my finances';

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    stickToEnd.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = MOCK_RESPONSES[messageText] ||
        `Based on your financial data, I can see that your total spending this month is $3,802.44 across various categories. Your top spending areas are Housing ($1,800) and Food ($610.58). Would you like me to analyze any specific category in more detail?`;

      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScreenScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 156 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (!stickToEnd.current) return;
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          <ScreenScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedContainer}
          >
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestedChip, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
                onPress={() => handleSend(question)}
              >
                <Text style={[styles.suggestedText, { color: colors.primary }]}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScreenScrollView>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.role === 'user' ? styles.userRow : styles.aiRow,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="sparkles" size={16} color={colors.primary} />
                </View>
              )}
              <View style={styles.messageContent}>
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? [styles.userBubble, { backgroundColor: colors.primary }]
                      : [styles.aiBubble, { backgroundColor: colors.surface }],
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.role === 'user'
                        ? { color: '#FFFFFF' }
                        : { color: colors.text },
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
                <Text style={[styles.messageTime, { color: colors.textTertiary }]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
              {message.role === 'user' && (
                <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
          ))}

          {isTyping && <TypingIndicator />}

          <View style={{ height: spacing.lg }} />
        </ScreenScrollView>

        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Ask me anything about your finances..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSend()}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 40 },
  flex: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.lg },
  suggestedContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  suggestedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  suggestedText: { fontSize: 13, fontWeight: '500' },
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  messageContent: { maxWidth: '75%' },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: spacing.xxs,
  },
  aiBubble: {
    borderBottomLeftRadius: spacing.xxs,
  },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageTime: { fontSize: 11, marginTop: spacing.xs, marginHorizontal: spacing.xs },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: spacing.xxs,
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  inputContainer: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
  },
  textInput: {
    height: 44,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AIAssistantScreen;
