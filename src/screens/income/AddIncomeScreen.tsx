import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useAppStore } from '../../store/AppStore';
import { toIonicon } from '../../utils/icons';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/format';
import Button from '../../components/common/Button';
import BottomSheet from '../../components/common/BottomSheet';

interface AddIncomeScreenProps {
  navigation: any;
}

const INCOME_SOURCES = ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other'] as const;
const FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const;

const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const { accounts, addTransaction } = useAppStore();
  const toast = useToast();

  const amountRef = useRef<TextInput>(null);
  const dateRef = useRef<TextInput>(null);
  const notesRef = useRef<TextInput>(null);

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);
  const [frequencySheetVisible, setFrequencySheetVisible] = useState(false);

  const selectedAccount = accounts.find((a: any) => a.id === accountId);

  const handleSave = () => {
    addTransaction({
      title: source || 'Income',
      amount: parseFloat(amount) || 100,
      category: 'Income',
      subcategory: source || 'Other',
      type: 'income',
      accountId: accountId || accounts[0]?.id,
      notes,
      isRecurring,
      date: date || new Date().toISOString(),
    });
    toast.show('Income added', 'success');
    navigation.goBack();
  };

  const fieldShell = (focusedBorder?: boolean) => [
    styles.fieldBox,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
  ];

  const form = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      <View style={styles.amountSection}>
        <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Enter Amount</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
          <TextInput
            ref={amountRef}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            returnKeyType="done"
            style={[styles.amountInput, { color: colors.text }]}
          />
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Income Source</Text>
      <TouchableOpacity
        style={fieldShell()}
        onPress={() => {
          amountRef.current?.blur();
          dateRef.current?.blur();
          notesRef.current?.blur();
          setSourceSheetVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, { color: source ? colors.text : colors.textTertiary }]}>
          {source || 'Select source'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Deposit To</Text>
      <TouchableOpacity
        style={fieldShell()}
        onPress={() => {
          amountRef.current?.blur();
          dateRef.current?.blur();
          notesRef.current?.blur();
          setAccountSheetVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, { color: accountId ? colors.text : colors.textTertiary }]}>
          {selectedAccount ? selectedAccount.name : 'Select account'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date</Text>
      <View style={fieldShell()}>
        <Ionicons name="calendar-outline" size={20} color={colors.textTertiary} style={styles.leadingIcon} />
        <TextInput
          ref={dateRef}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => notesRef.current?.focus()}
          style={[styles.textInput, { color: colors.text }]}
        />
      </View>

      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes (Optional)</Text>
      <View style={[fieldShell(), styles.notesBox]}>
        <Ionicons name="document-text-outline" size={20} color={colors.textTertiary} style={styles.leadingIcon} />
        <TextInput
          ref={notesRef}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add a note..."
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
          blurOnSubmit={false}
          style={[styles.textInput, styles.notesInput, { color: colors.text }]}
        />
      </View>

      <View style={[styles.recurringSection, { borderTopColor: colors.border }]}>
        <View style={styles.recurringRow}>
          <View style={styles.recurringLeft}>
            <View style={[styles.recurringIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="repeat" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recurringTitle, { color: colors.text }]}>Recurring</Text>
              <Text style={[styles.recurringSubtitle, { color: colors.textSecondary }]}>
                Automatically repeat this income
              </Text>
            </View>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={isRecurring ? colors.primary : '#f4f3f4'}
          />
        </View>

        {isRecurring ? (
          <>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              Frequency
            </Text>
            <TouchableOpacity
              style={fieldShell()}
              onPress={() => setFrequencySheetVisible(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.selectorText, { color: frequency ? colors.text : colors.textTertiary }]}
              >
                {frequency || 'Select frequency'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surface || colors.card }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Income</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.headerSaveButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={styles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {form}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{form}</View>
      )}

      <View style={[styles.saveContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button title="Save Income" onPress={handleSave} variant="primary" size="lg" style={styles.saveButton} />
      </View>

      <BottomSheet visible={sourceSheetVisible} onClose={() => setSourceSheetVisible(false)} title="Select Source">
        {INCOME_SOURCES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.sheetOption,
              {
                backgroundColor: source === s ? colors.primary + '15' : 'transparent',
                borderColor: source === s ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setSource(s);
              setSourceSheetVisible(false);
            }}
          >
            <Text style={[styles.sheetOptionText, { color: source === s ? colors.primary : colors.text }]}>
              {s}
            </Text>
            {source === s ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      <BottomSheet visible={accountSheetVisible} onClose={() => setAccountSheetVisible(false)} title="Select Account">
        {accounts.map((a: any) => (
          <TouchableOpacity
            key={a.id}
            style={[
              styles.sheetOption,
              {
                backgroundColor: accountId === a.id ? colors.primary + '15' : 'transparent',
                borderColor: accountId === a.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setAccountId(a.id);
              setAccountSheetVisible(false);
            }}
          >
            <View style={styles.sheetOptionLeft}>
              <View style={[styles.sheetAccountIcon, { backgroundColor: a.color + '15' }]}>
                <Ionicons name={toIonicon(a.icon)} size={18} color={a.color} />
              </View>
              <View>
                <Text
                  style={[styles.sheetOptionText, { color: accountId === a.id ? colors.primary : colors.text }]}
                >
                  {a.name}
                </Text>
                <Text style={[styles.sheetOptionSub, { color: colors.textSecondary }]}>
                  {formatCurrency(a.balance)}
                </Text>
              </View>
            </View>
            {accountId === a.id ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </TouchableOpacity>
        ))}
      </BottomSheet>

      <BottomSheet
        visible={frequencySheetVisible}
        onClose={() => setFrequencySheetVisible(false)}
        title="Select Frequency"
      >
        {FREQUENCIES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.sheetOption,
              {
                backgroundColor: frequency === f ? colors.primary + '15' : 'transparent',
                borderColor: frequency === f ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setFrequency(f);
              setFrequencySheetVisible(false);
            }}
          >
            <Text style={[styles.sheetOptionText, { color: frequency === f ? colors.primary : colors.text }]}>
              {f}
            </Text>
            {frequency === f ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
          </TouchableOpacity>
        ))}
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSaveButton: {
    minWidth: 64,
    height: 36,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSaveText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  amountSection: { alignItems: 'center', marginBottom: 28 },
  amountLabel: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  amountRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  currencySymbol: { fontSize: 36, fontWeight: '300', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 36, fontWeight: '600', paddingVertical: 8 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
    marginBottom: 16,
  },
  notesBox: { alignItems: 'flex-start', minHeight: 110, paddingVertical: 12 },
  leadingIcon: { marginRight: 10, marginTop: 2 },
  textInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  notesInput: { minHeight: 80, paddingTop: 0 },
  selectorText: { flex: 1, fontSize: 16 },
  recurringSection: { marginTop: 8, paddingTop: 20, borderTopWidth: 1 },
  recurringRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recurringLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  recurringIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recurringTitle: { fontSize: 15, fontWeight: '600' },
  recurringSubtitle: { fontSize: 12, marginTop: 2 },
  saveContainer: { paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1 },
  saveButton: { width: '100%' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  sheetOptionText: { fontSize: 16, fontWeight: '500' },
  sheetOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sheetAccountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetOptionSub: { fontSize: 13, marginTop: 2 },
});

export default AddIncomeScreen;


