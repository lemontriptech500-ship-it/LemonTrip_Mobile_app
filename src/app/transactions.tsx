import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Card, EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatDate, serviceIcon, shortId } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;

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
  date: string;
  sub: string;
};

function parseAmount(price: string) {
  return Number(String(price).replace(/[^0-9.]/g, '')) || 0;
}

function money(value: number) {
  try {
    return new Intl.NumberFormat(getAppLocale(), { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value));
  } catch {
    return 'Rs ' + Math.round(value);
  }
}

export default function TransactionsScreen() {
  useAppLanguage();
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
      const amount = parseAmount(b.price);
      list.push({
        key: b.id + '-pay',
        bookingId: String(b.id),
        kind: 'payment',
        title: b.itemName,
        serviceName: b.serviceName,
        amount,
        date: b.bookedAt,
        sub: 'Paid for ' + shortId(b.id),
      });
      spent += amount;

      if (b.status === 'cancelled') {
        const refund = amount - (amount * CANCELLATION_FEE_PERCENT) / 100;
        list.push({
          key: b.id + '-refund',
          bookingId: String(b.id),
          kind: 'refund',
          title: b.itemName,
          serviceName: b.serviceName,
          amount: refund,
          date: b.bookedAt,
          sub: 'Refund for ' + shortId(b.id) + ' - 5-7 business days',
        });
        refunds += refund;
      }
    });

    return { transactions: list, totalSpent: spent, totalRefunds: refunds };
  }, [bookings]);

  const visible = transactions.filter((t) => filter === 'all' || t.kind === filter);

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Transactions</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[styles.topBtn, styles.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Card style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL SPENT</Text>
            <Text style={styles.summaryValue}>{money(totalSpent)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>REFUNDS</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>{money(totalRefunds)}</Text>
          </View>
        </Card>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f.key }}
              onPress={() => setFilter(f.key)}
              style={[styles.tabChip, filter === f.key && styles.tabChipOn]}
            >
              <Text style={[styles.tabChipText, filter === f.key && styles.tabChipTextOn]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {visible.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            text="Your payments and refunds will show up here."
            action={<PrimaryButton label="Back to My Trips" onPress={goBack} variant="soft" />}
          />
        ) : (
          visible.map((t) => {
            const isRefund = t.kind === 'refund';
            return (
              <TouchableOpacity
                key={t.key}
                accessibilityRole="button"
                activeOpacity={0.9}
                onPress={() => router.push(('/booking/' + t.bookingId) as never)}
              >
                <Card style={styles.row}>
                  <View style={[styles.rowIcon, isRefund && styles.rowIconRefund]}>
                    <Ionicons
                      name={isRefund ? 'arrow-down-outline' : serviceIcon(t.serviceName)}
                      size={22}
                      color={isRefund ? Colors.success : Colors.primary}
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{t.sub}</Text>
                    <Text style={styles.rowDate}>{formatDate(t.date)}</Text>
                  </View>
                  <Text style={[styles.rowAmount, isRefund && { color: Colors.success }]}>
                    {(isRefund ? '+ ' : '- ') + money(t.amount)}
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { backgroundColor: Colors.surface, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: '#103D30' },
  scroll: { paddingTop: 14, paddingBottom: 32 },
  summary: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10, borderRadius: 22 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  summaryLabel: { color: Colors.textLight, fontFamily: INTER.extrabold, fontSize: 10, letterSpacing: 1.1, marginBottom: 6 },
  summaryValue: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: TextSize.title },
  filters: { paddingHorizontal: 10, gap: 8, paddingBottom: 14 },
  tabChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  tabChipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabChipText: { fontFamily: INTER.semibold, fontSize: 12, color: Colors.textDark },
  tabChipTextOn: { color: Colors.white },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 10, borderRadius: 22 },
  rowIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: '#E3F0EA' },
  rowIconRefund: { backgroundColor: Colors.successSoft },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: INTER.extrabold, fontSize: 14 },
  rowSub: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: 11, marginTop: 2 },
  rowDate: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: 11, marginTop: 2 },
  rowAmount: { color: Colors.primaryDark, fontFamily: INTER.extrabold, fontSize: 15 },
});