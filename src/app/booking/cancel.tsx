import { Text } from '@/components/ui/Text';
﻿import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, Chip, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { shortId } from '@/utils/bookingFormat';
import { updateBookingStatus, useBookings } from '@/utils/bookingStore';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const CANCELLATION_FEE_PERCENT = 10;
const REASONS = ['Change of plans', 'Found a better price', 'Booked by mistake', 'Travel dates changed', 'Other'];

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

export default function CancelBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useBookings();
  const booking = bookings.find((item) => String(item.id) === String(id));
  const [reason, setReason] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings' as never);
  };
  const goToTrips = () => router.replace('/(tabs)/bookings' as never);

  if (!booking) {
    return (
      <FlowScreen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Cancel booking" onBack={goBack} />
          <EmptyState
            icon="alert-circle-outline"
            title="Booking not found"
            text="We could not find this booking."
            action={<PrimaryButton label="Go to My Trips" onPress={goToTrips} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const bookingId = shortId(booking.id);
  const amount = parseAmount(booking.price);
  const fee = (amount * CANCELLATION_FEE_PERCENT) / 100;
  const refund = amount - fee;

  if (booking.status === 'cancelled' && !done) {
    return (
      <FlowScreen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Cancel booking" subtitle={bookingId} onBack={goBack} />
          <EmptyState
            icon="close-circle-outline"
            title="Already cancelled"
            text="This booking is already cancelled."
            action={<PrimaryButton label="Back to My Trips" onPress={goToTrips} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const handleConfirm = () => {
    updateBookingStatus(booking.id, 'cancelled');
    setDone(true);
  };

  if (done) {
    return (
      <FlowScreen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScreenHeader eyebrow="CANCELLATION" title="Booking cancelled" subtitle={bookingId} />
          <Card>
            <SectionTitle title="Refund details" right={<Pill label="PROCESSING" tone="warn" icon="time-outline" />} />
            <Row label="Refund amount" value={money(refund)} bold tone="good" />
            <Row label="Timeline" value="5-7 business days" />
            <Row label="Refund to" value="Original payment method" />
          </Card>
          <View style={styles.pad}>
            <PrimaryButton label="Back to My Trips" onPress={goToTrips} variant="dark" icon="arrow-forward" />
          </View>
        </ScrollView>
      </FlowScreen>
    );
  }

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption="Refund amount"
          amount={money(refund)}
          action={<PrimaryButton label="Confirm cancellation" onPress={handleConfirm} disabled={!reason} variant="dark" />}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenHeader eyebrow="CANCELLATION" title="Cancel booking" subtitle={bookingId} onBack={goBack} />

        <Card>
          <SectionTitle eyebrow={(booking.serviceName ?? '').toUpperCase()} title={booking.itemName} />
          {booking.destination ? <Row label="Destination" value={booking.destination} /> : null}
          <Row label="Booking ID" value={bookingId} />
        </Card>

        <Card>
          <SectionTitle title="Reason for cancellation" />
          <View style={styles.chips}>
            {REASONS.map((item) => (
              <Chip key={item} label={item} selected={reason === item} onPress={() => setReason(item)} />
            ))}
          </View>
        </Card>

        <Card>
          <SectionTitle title="Refund summary" />
          <Row label="Booking amount" value={money(amount)} />
          <Row label={'Cancellation fee (' + CANCELLATION_FEE_PERCENT + '%)'} value={'- ' + money(fee)} />
          <View style={styles.separator} />
          <Row label="Refund amount" value={money(refund)} bold tone="good" />
        </Card>

        <Notice icon="information-circle-outline" tone="warn" title="Refund timeline">
          Refund goes to your original payment method in 5-7 business days.
        </Notice>

        <View style={styles.pad}>
          <PrimaryButton label="Keep my booking" onPress={goBack} variant="soft" />
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 24 },
  pad: { marginHorizontal: Ui.space.page, marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  separator: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
});
