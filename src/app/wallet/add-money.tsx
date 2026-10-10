
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

const GREEN = '#075638';
const DARK = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';
const BORDER = '#DCE8DF';
const MUTED = '#829087';

type PaymentMethod = 'upi' | 'card' | 'netbanking';

const amounts = [500, 1000, 2000, 5000];

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard and RuPay',
    icon: 'card-outline',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'Pay using your bank account',
    icon: 'business-outline',
  },
];

export default function AddMoneyScreen() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 360;

  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('upi');

  const amount = customAmount.trim()
    ? Number(customAmount)
    : selectedAmount;

  const validAmount =
    Number.isFinite(amount) &&
    amount >= 100 &&
    amount <= 50000 &&
    (!customAmount.trim() || /^\d+(\.\d{1,2})?$/.test(customAmount.trim()));

  const handleContinue = () => {
    if (!validAmount) {
      Alert.alert(
        'Invalid amount',
        'Please enter an amount between ₹100 and ₹50,000.',
      );
      return;
    }

    router.push({
      pathname: '/wallet/[section]',
      params: {
        section: 'payment-status',
        amount: String(amount),
        method: selectedMethod,
        source: 'wallet',
      },
    });
  };

  const formatAmount = (value: number) =>
    value.toLocaleString('en-IN');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color={GREEN} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.brand}>🍋 LemonTrip</Text>
          <Text style={styles.headerTitle}>Add Money</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 16 : 28,
            maxWidth: 900,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.walletIcon}>
            <Ionicons name="wallet-outline" size={28} color={GREEN} />
          </View>
          <Text style={styles.introTitle}>Top up your wallet</Text>
          <Text style={styles.introSubtitle}>
            Add money and make your next trip easier.
          </Text>
        </View>

        {/* Wallet balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceText}>
            <Text style={styles.balanceLabel}>
              Current wallet balance
            </Text>
            <Text style={styles.balanceAmount}>₹4,250</Text>
          </View>
          <Ionicons
            name="shield-checkmark-outline"
            size={27}
            color={YELLOW}
          />
        </View>

        {/* Amount selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose amount</Text>
          <Text style={styles.sectionSubtitle}>
            Select an amount or enter your own.
          </Text>

          <View
            style={[
              styles.amountGrid,
              { gap: isVerySmallScreen ? 8 : 10 },
            ]}
          >
            {amounts.map((value) => {
              const active =
                !customAmount && selectedAmount === value;

              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    setSelectedAmount(value);
                    setCustomAmount('');
                  }}
                  style={[
                    styles.amountButton,
                    {
                      width: isSmallScreen ? '48%' : '23.5%',
                      minHeight: isSmallScreen ? 52 : 58,
                    },
                    active && styles.amountButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.amountText,
                      active && styles.amountTextActive,
                    ]}
                  >
                    ₹{formatAmount(value)}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={GREEN}
                      style={styles.amountCheck}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Custom amount (₹)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              value={customAmount}
              onChangeText={(value) => {
                setCustomAmount(value.replace(/[^0-9.]/g, ''));
              }}
              placeholder="Enter amount"
              placeholderTextColor="#96A39B"
              keyboardType="decimal-pad"
              style={styles.input}
              maxLength={8}
              accessibilityLabel="Custom amount"
            />
            {customAmount.length > 0 && (
              <TouchableOpacity
                onPress={() => setCustomAmount('')}
                accessibilityLabel="Clear custom amount"
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={MUTED}
                />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.helperText}>
            Minimum ₹100 · Maximum ₹50,000
          </Text>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <Text style={styles.sectionSubtitle}>
            Choose how you want to add money.
          </Text>

          <View style={styles.methodsCard}>
            {paymentMethods.map((item, index) => {
              const active = selectedMethod === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedMethod(item.id)}
                  style={[
                    styles.methodRow,
                    index !== paymentMethods.length - 1 &&
                      styles.methodDivider,
                  ]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <View style={styles.methodIcon}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={GREEN}
                    />
                  </View>

                  <View style={styles.methodInfo}>
                    <Text style={styles.methodTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.methodSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      active
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={20}
                    color={active ? GREEN : '#A8B5AC'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Amount to add</Text>
          <Text style={styles.summaryAmount}>
            ₹{validAmount ? formatAmount(amount) : '—'}
          </Text>
          <Text style={styles.summaryNote}>
            Payment method: {
              paymentMethods.find(
                (item) => item.id === selectedMethod,
              )?.title
            }
          </Text>
        </View>

        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color={GREEN}
          />
          <Text style={styles.securityText}>
            Your payment details should be handled securely by the
            payment provider.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleContinue}
          style={styles.continueButton}
          accessibilityRole="button"
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: GREEN,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    color: '#EAF4EC',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  intro: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 18,
  },
  walletIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#E2F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  introTitle: {
    color: DARK,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  introSubtitle: {
    color: MUTED,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  balanceCard: {
    backgroundColor: GREEN,
    borderRadius: 18,
    padding: 19,
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
  },
  balanceText: {
    flex: 1,
  },
  balanceLabel: {
    color: '#D8E8DE',
    fontSize: 12,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 7,
  },
  section: {
    marginBottom: 23,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 13,
    lineHeight: 18,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    position: 'relative',
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    paddingHorizontal: 6,
  },
  amountButtonActive: {
    borderColor: GREEN,
    borderWidth: 1.4,
    backgroundColor: '#E7F2E9',
  },
  amountText: {
    color: DARK,
    fontSize: 14,
    fontWeight: '700',
  },
  amountTextActive: {
    color: GREEN,
  },
  amountCheck: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  fieldLabel: {
    color: DARK,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 19,
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupeeSymbol: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '800',
    marginRight: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: DARK,
    fontSize: 14,
    paddingVertical: 12,
  },
  helperText: {
    color: '#8A9990',
    fontSize: 10,
    marginTop: 7,
  },
  methodsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 17,
    paddingHorizontal: 13,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    minHeight: 65,
  },
  methodDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1ED',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#E7F2E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  methodInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  methodTitle: {
    color: DARK,
    fontSize: 13,
    fontWeight: '800',
  },
  methodSubtitle: {
    color: MUTED,
    fontSize: 10,
    marginTop: 4,
    flexShrink: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 17,
    padding: 17,
    marginBottom: 15,
  },
  summaryLabel: {
    color: MUTED,
    fontSize: 12,
  },
  summaryAmount: {
    color: GREEN,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 5,
  },
  summaryNote: {
    color: MUTED,
    fontSize: 11,
    marginTop: 6,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  securityText: {
    flex: 1,
    color: '#718076',
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: YELLOW,
    minHeight: 54,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  continueText: {
    color: DARK,
    fontSize: 15,
    fontWeight: '800',
    marginRight: 10,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSpace: {
    height: 12,
  },
});
