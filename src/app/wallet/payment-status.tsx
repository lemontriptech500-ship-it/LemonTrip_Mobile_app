
import React, { useState } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const GREEN = '#075638';
const DARK = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';
const BORDER = '#DCE8DF';
const MUTED = '#829087';

export default function PaymentStatusScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const params = useLocalSearchParams<{
    amount?: string;
    method?: string;
    source?: string;
  }>();

  const amount = Number(params.amount ?? 1000);
  const method = params.method ?? 'upi';
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>(
    'pending',
  );

  const formattedAmount = Number.isFinite(amount)
    ? amount.toLocaleString('en-IN')
    : '0';

  const methodLabel: Record<string, string> = {
    upi: 'UPI',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking',
  };

  const handleBackToWallet = () => {
    router.replace('/(tabs)/wallet' as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
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
          <Ionicons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.brand}>🍋 LemonTrip</Text>
          <Text style={styles.headerTitle}>Payment Status</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: compact ? 18 : 32,
            maxWidth: 650,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              status === 'success' && styles.successIcon,
              status === 'failed' && styles.failedIcon,
            ]}
          >
            <Ionicons
              name={
                status === 'success'
                  ? 'checkmark-circle'
                  : status === 'failed'
                    ? 'close-circle'
                    : 'time-outline'
              }
              size={52}
              color={
                status === 'success'
                  ? GREEN
                  : status === 'failed'
                    ? '#B42318'
                    : '#C28A00'
              }
            />
          </View>

          <Text style={styles.statusTitle}>
            {status === 'success'
              ? 'Payment Successful!'
              : status === 'failed'
                ? 'Payment Failed'
                : 'Ready to Complete Payment'}
          </Text>

          <Text style={styles.statusSubtitle}>
            {status === 'success'
              ? 'Your demo payment has been marked successful.'
              : status === 'failed'
                ? 'Your demo payment was not completed. You can try again.'
                : 'Review your details below and choose a demo result.'}
          </Text>

          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>₹{formattedAmount}</Text>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment method</Text>
            <Text style={styles.detailValue}>
              {methodLabel[method] ?? method}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction type</Text>
            <Text style={styles.detailValue}>Wallet top-up</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color:
                    status === 'success'
                      ? GREEN
                      : status === 'failed'
                        ? '#B42318'
                        : '#A36C00',
                },
              ]}
            >
              {status === 'success'
                ? 'Successful'
                : status === 'failed'
                  ? 'Failed'
                  : 'Pending'}
            </Text>
          </View>
        </View>

        {status === 'pending' && (
          <View style={styles.demoNotice}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={GREEN}
            />
            <Text style={styles.demoNoticeText}>
              Demo mode: no real payment is being processed. Choose a result
              below to test the navigation and UI.
            </Text>
          </View>
        )}

        {status === 'pending' && (
          <View style={styles.demoActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStatus('success')}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={DARK}
              />
              <Text style={styles.primaryButtonText}>
                Simulate Success
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setStatus('failed')}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={GREEN}
              />
              <Text style={styles.secondaryButtonText}>
                Simulate Failure
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'failed' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStatus('pending')}
          >
            <Ionicons name="refresh-outline" size={20} color={DARK} />
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.walletButton}
          onPress={handleBackToWallet}
        >
          <Ionicons name="wallet-outline" size={20} color={GREEN} />
          <Text style={styles.walletButtonText}>Back to Wallet</Text>
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color={GREEN}
          />
          <Text style={styles.securityText}>
            This screen is for UI testing only. A real payment gateway is
            required to verify transactions and update the wallet balance.
          </Text>
        </View>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    marginBottom: 3,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 22,
    alignItems: 'center',
  },
  statusIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: '#FFF3D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  successIcon: {
    backgroundColor: '#E3F2E7',
  },
  failedIcon: {
    backgroundColor: '#FDE8E7',
  },
  statusTitle: {
    color: DARK,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  amountLabel: {
    color: MUTED,
    fontSize: 12,
    marginTop: 25,
  },
  amount: {
    color: GREEN,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    width: '100%',
    marginVertical: 22,
  },
  detailRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 17,
  },
  detailLabel: {
    color: MUTED,
    fontSize: 12,
    flex: 1,
  },
  detailValue: {
    color: DARK,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    flexShrink: 1,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#E7F2E9',
    borderRadius: 14,
    padding: 13,
    marginTop: 18,
  },
  demoNoticeText: {
    color: DARK,
    fontSize: 11,
    lineHeight: 17,
    flex: 1,
  },
  demoActions: {
    gap: 11,
    marginTop: 19,
  },
  primaryButton: {
    backgroundColor: YELLOW,
    minHeight: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  primaryButtonText: {
    color: DARK,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    minHeight: 51,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '700',
  },
  walletButton: {
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 13,
  },
  walletButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 21,
    paddingHorizontal: 2,
  },
  securityText: {
    flex: 1,
    color: MUTED,
    fontSize: 10,
    lineHeight: 16,
  },
});
