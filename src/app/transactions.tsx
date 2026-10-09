import { Brand, Colors, Radius } from '@/constants/colors';
import { formatDate, serviceIcon, shortId } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FONT = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

const SHADOW = {
  shadowColor: '#0F3D2E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

// Same as CANCELLATION_FEE_PERCENT in booking/cancel.tsx
const CANCELLATION_FEE_PERCENT = 10;

type Filter = 'all' | 'payment' | 'refund';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'payment', label: 'Payments' },
  { key: 'refund', label: 'Refunds' },
];

type Transaction = {
  key: string;
  bookingId: string;
  kind: 'payment' | 'refund';
  title: string;
  serviceName: string;
  amount: number;
  symbol: string;
  date: string;
  sub: string;
};

function parsePrice(price: string) {
  const symbol = price.match(/^[^0-9]*/)?.[0].trim() || '₹';
  const amount = Number(price.replace(/[^0-9.]/g, '')) || 0;
  return { symbol, amount };
}

function money(symbol: string, value: number) {
  return `${symbol}${Math.round(value).toLocaleString('en-IN')}`;
}

export default function TransactionsScreen() {
  const bookings = useBookings();
  const [filter, setFilter] = useState<Filter>('all');

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings' as never);
  };

  const { transactions, totalSpent, totalRefunds } = useMemo(() => {
    const list: Transaction[] = [];
    let spent = 0;
    let refunds = 0;

    const sorted = [...bookings].sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime(),
    );

    sorted.forEach((b) => {
      const { symbol, amount } = parsePrice(b.price);
      list.push({
        key: `${b.id}-pay`,
        bookingId: String(b.id),
        kind: 'payment',
        title: b.itemName,
        serviceName: b.serviceName,
        amount,
        symbol,
        date: b.bookedAt,
        sub: `Paid for ${shortId(b.id)}`,
      });
      spent += amount;

      if (b.status === 'cancelled') {
        const refund = amount - (amount * CANCELLATION_FEE_PERCENT) / 100;
        list.push({
          key: `${b.id}-refund`,
          bookingId: String(b.id),
          kind: 'refund',
          title: b.itemName,
          serviceName: b.serviceName,
          amount: refund,
          symbol,
          date: b.bookedAt,
          sub: `Refund for ${shortId(b.id)} · 5–7 business days`,
        });
        refunds += refund;
      }
    });

    return { transactions: list, totalSpent: spent, totalRefunds: refunds };
  }, [bookings]);

  const visible = transactions.filter((t) => filter === 'all' || t.kind === filter);
  const symbol = transactions[0]?.symbol ?? '₹';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={22} color={Brand.forest} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrowLemon}>MY TRIPS</Text>
          <Text style={styles.pageTitle}>Transactions</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
            <Text style={styles.summaryValue}>{money(symbol, totalSpent)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>REFUNDS</Text>
            <Text style={[styles.summaryValue, styles.refundText]}>{money(symbol, totalRefunds)}</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                accessibilityRole="button"
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* List */}
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={Colors.textLight} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          visible.map((t) => {
            const isRefund = t.kind === 'refund';
            return (
              <TouchableOpacity
                key={t.key}
                accessibilityRole="button"
                style={styles.row}
                onPress={() => router.push(`/booking/${t.bookingId}` as never)}
              >
                <View style={[styles.rowIcon, isRefund && styles.rowIconRefund]}>
                  <Ionicons
                    name={isRefund ? 'arrow-down-outline' : serviceIcon(t.serviceName)}
                    size={22}
                    color={isRefund ? '#1E7B4F' : Brand.forest}
                  />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {t.sub}
                  </Text>
                  <Text style={styles.rowDate}>{formatDate(t.date)}</Text>
                </View>
                <Text style={[styles.rowAmount, isRefund && styles.refundText]}>
                  {isRefund ? '+' : '-'} {money(t.symbol, t.amount)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  container: { flex: 1, backgroundColor: Brand.cream },
  content: { paddingBottom: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 64,
    backgroundColor: Brand.forest,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 28, marginTop: 4 },

  summary: {
    marginTop: -40,
    marginHorizontal: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#E6E5DC' },
  summaryLabel: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 9, letterSpacing: 1.2, marginBottom: 6 },
  summaryValue: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 22 },
  refundText: { color: '#1E7B4F' },

  filters: { flexDirection: 'row', gap: 8, marginTop: 18, marginHorizontal: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: '#D5D4CB',
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Brand.forest, borderColor: Brand.forest },
  chipText: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },
  chipTextActive: { color: Brand.lemon },

  row: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  rowIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Brand.cream,
  },
  rowIconRefund: { backgroundColor: '#E3F4EA' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },
  rowSub: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, marginTop: 2 },
  rowDate: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 11, marginTop: 2 },
  rowAmount: { color: Colors.textDark, fontFamily: FONT.extra, fontSize: 15 },

  empty: { alignItems: 'center', gap: 10, marginTop: 48 },
  emptyText: { color: Colors.textLight, fontFamily: FONT.bold, fontSize: 14 },
});