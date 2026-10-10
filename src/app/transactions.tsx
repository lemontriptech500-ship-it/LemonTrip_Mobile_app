import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
﻿import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, Chip, EmptyState, FlowScreen, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatDate, serviceIcon, shortId } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value));
  } catch {
    return 'Rs ' + Math.round(value);
  }
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
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="MY TRIPS" title="Transactions" subtitle="Payments and refunds for your bookings." onBack={goBack} />

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

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f.key} label={f.label} selected={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </View>

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
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 24 },
  summary: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  summaryLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.1, marginBottom: 6 },
  summaryValue: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold },
  filters: { flexDirection: 'row', gap: 8, marginHorizontal: Ui.space.page, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  rowIconRefund: { backgroundColor: Colors.successSoft },
  rowInfo: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  rowSub: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 2 },
  rowDate: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 2 },
  rowAmount: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
});
