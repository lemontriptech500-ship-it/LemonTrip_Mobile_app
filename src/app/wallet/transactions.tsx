
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#075638';
const DARK_GREEN = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';

const transactions = [
  {
    id: '1',
    title: 'Wallet Top-up',
    date: 'Today, 10:25 AM',
    amount: '+ ₹1,000',
    status: 'Successful',
    type: 'add',
    icon: 'wallet-outline' as const,
  },
  {
    id: '2',
    title: 'Bus Booking',
    date: 'Yesterday, 6:40 PM',
    amount: '- ₹750',
    status: 'Successful',
    type: 'payment',
    icon: 'bus-outline' as const,
  },
  {
    id: '3',
    title: 'Wallet Top-up',
    date: '08 Oct 2026, 2:15 PM',
    amount: '+ ₹2,000',
    status: 'Successful',
    type: 'add',
    icon: 'wallet-outline' as const,
  },
  {
    id: '4',
    title: 'Bus Booking',
    date: '07 Oct 2026, 9:30 AM',
    amount: '- ₹450',
    status: 'Successful',
    type: 'payment',
    icon: 'bus-outline' as const,
  },
  {
    id: '5',
    title: 'Wallet Top-up',
    date: '05 Oct 2026, 11:10 AM',
    amount: '+ ₹500',
    status: 'Failed',
    type: 'add',
    icon: 'wallet-outline' as const,
  },
];

export default function TransactionsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/wallet' as any);
            }
          }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>
            Your wallet activity
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="receipt-outline" size={24} color={YELLOW} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: compact ? 16 : 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL TRANSACTIONS</Text>
              <Text style={styles.summaryCount}>
                {transactions.length}
              </Text>
            </View>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="swap-vertical-outline"
                size={27}
                color={DARK_GREEN}
              />
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottom}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#DDF5E7"
            />
            <Text style={styles.summaryFootnote}>
              Keep track of your wallet activity
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionCount}>Latest first</Text>
        </View>

        {transactions.map((item) => {
          const isCredit = item.type === 'add';
          const isFailed = item.status === 'Failed';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.transactionCard}
              activeOpacity={0.75}
              onPress={() => {
                router.push({
                  pathname: '/wallet/transaction-details' as any,
                  params: {
                    id: item.id,
                    title: item.title,
                    date: item.date,
                    amount: item.amount,
                    status: item.status,
                  },
                });
              }}
            >
              <View
                style={[
                  styles.transactionIcon,
                  isCredit ? styles.creditIcon : styles.paymentIcon,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={23}
                  color={isCredit ? GREEN : '#8A6500'}
                />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionDate}>{item.date}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    isFailed ? styles.failedBadge : styles.successBadge,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      isFailed ? styles.failedDot : styles.successDot,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isFailed ? styles.failedText : styles.successText,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.amount,
                    isCredit ? styles.creditAmount : styles.debitAmount,
                  ]}
                >
                  {item.amount}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color="#A0AAA3"
                />
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => router.push('/wallet/add-money' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={22} color={DARK_GREEN} />
          <Text style={styles.addMoneyText}>Add Money to Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Demo transactions shown for UI preview. Live payment data is not
          connected yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D8E8DF',
    fontSize: 13,
    marginTop: 3,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,216,61,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  summaryCard: {
    backgroundColor: DARK_GREEN,
    borderRadius: 22,
    padding: 21,
    marginBottom: 27,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#D4E5DA',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryCount: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '800',
    marginTop: 7,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.17)',
    marginVertical: 17,
  },
  summaryBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryFootnote: {
    color: '#DDF5E7',
    fontSize: 12,
    flexShrink: 1,
  },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#193B2C',
  },
  sectionCount: {
    fontSize: 12,
    color: '#738078',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEE9',
    gap: 11,
  },
  transactionIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditIcon: {
    backgroundColor: '#E5F4EA',
  },
  paymentIcon: {
    backgroundColor: '#FFF3CF',
  },
  transactionInfo: {
    flex: 1,
    minWidth: 0,
  },
  transactionTitle: {
    color: '#20382B',
    fontSize: 14,
    fontWeight: '700',
  },
  transactionDate: {
    color: '#859087',
    fontSize: 11,
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 7,
    gap: 5,
  },
  successBadge: {
    backgroundColor: '#E7F6EB',
  },
  failedBadge: {
    backgroundColor: '#FCEAEA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  successDot: {
    backgroundColor: '#188448',
  },
  failedDot: {
    backgroundColor: '#C43B3B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  successText: {
    color: '#188448',
  },
  failedText: {
    color: '#C43B3B',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontSize: 13,
    fontWeight: '800',
  },
  creditAmount: {
    color: '#168044',
  },
  debitAmount: {
    color: '#26372C',
  },
  addMoneyButton: {
    backgroundColor: YELLOW,
    minHeight: 53,
    borderRadius: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  addMoneyText: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  demoNote: {
    color: '#8A958D',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 17,
    paddingHorizontal: 12,
  },
});
