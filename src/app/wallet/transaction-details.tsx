
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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#075638';
const DARK_GREEN = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';

export default function TransactionDetailsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    date?: string;
    amount?: string;
    status?: string;
  }>();

  const title = params.title || 'Wallet Transaction';
  const date = params.date || 'Date unavailable';
  const amount = params.amount || '₹0';
  const status = params.status || 'Successful';
  const isFailed = status.toLowerCase() === 'failed';
  const isCredit = amount.trim().startsWith('+');
  const transactionId = `LT${String(params.id || '001').padStart(6, '0')}`;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/wallet/transactions' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Transaction Details</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: compact ? 17 : 28,
          },
        ]}
      >
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusCircle,
              isFailed ? styles.failedCircle : styles.successCircle,
            ]}
          >
            <Ionicons
              name={isFailed ? 'close' : 'checkmark'}
              size={36}
              color={isFailed ? '#C43B3B' : GREEN}
            />
          </View>

          <Text style={styles.statusHeading}>
            {isFailed ? 'Payment Failed' : 'Transaction Successful'}
          </Text>

          <Text style={styles.statusDescription}>
            {isFailed
              ? 'This transaction was not completed.'
              : 'Your transaction has been recorded.'}
          </Text>

          <Text
            style={[
              styles.amount,
              isCredit ? styles.creditAmount : styles.debitAmount,
            ]}
          >
            {amount}
          </Text>

          <View
            style={[
              styles.statusPill,
              isFailed ? styles.failedPill : styles.successPill,
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
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={GREEN}
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Transaction Type</Text>
              <Text style={styles.detailValue}>{title}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={GREEN}
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="finger-print-outline"
                size={20}
                color={GREEN}
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transactionId}</Text>
              <Text style={styles.helperText}>
                Demo reference number
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={GREEN}
              />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.detailValue,
                  isFailed ? styles.failedText : styles.successText,
                ]}
              >
                {status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={GREEN}
          />
          <Text style={styles.infoText}>
            Keep this information for your records. For payment issues,
            contact customer support with your transaction reference.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.replace('/wallet/transactions' as any)}
        >
          <Ionicons name="list-outline" size={21} color={DARK_GREEN} />
          <Text style={styles.primaryButtonText}>
            Back to Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)/wallet' as any)}
        >
          <Ionicons name="wallet-outline" size={20} color={GREEN} />
          <Text style={styles.secondaryButtonText}>Go to Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Demo screen — transaction information is sample data.
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
    minHeight: 66,
    backgroundColor: GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 13,
    flex: 1,
  },
  headerSpacer: {
    width: 8,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 35,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 18,
    paddingVertical: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EEE8',
    marginBottom: 17,
  },
  statusCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  successCircle: {
    backgroundColor: '#E4F5E9',
  },
  failedCircle: {
    backgroundColor: '#FCE9E9',
  },
  statusHeading: {
    color: DARK_GREEN,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  statusDescription: {
    color: '#7C897F',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
  },
  amount: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 19,
  },
  creditAmount: {
    color: '#168044',
  },
  debitAmount: {
    color: DARK_GREEN,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 7,
    marginTop: 13,
  },
  successPill: {
    backgroundColor: '#E6F5EA',
  },
  failedPill: {
    backgroundColor: '#FCEAEA',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  successDot: {
    backgroundColor: '#188448',
  },
  failedDot: {
    backgroundColor: '#C43B3B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  successText: {
    color: '#188448',
  },
  failedText: {
    color: '#C43B3B',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E7EEE8',
  },
  sectionTitle: {
    fontSize: 17,
    color: DARK_GREEN,
    fontWeight: '800',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 12,
  },
  detailIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EDF5EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  detailLabel: {
    color: '#879188',
    fontSize: 12,
    marginBottom: 5,
  },
  detailValue: {
    color: '#263B2E',
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    color: '#929B94',
    fontSize: 10,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF1ED',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EAF3EC',
    borderRadius: 15,
    padding: 14,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    color: '#486253',
    fontSize: 12,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 53,
    borderRadius: 16,
    backgroundColor: YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 19,
  },
  primaryButtonText: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 51,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 11,
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  demoNote: {
    color: '#8A958D',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 17,
  },
});
