import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FlightProgress, formatPrice } from '@/components/flights/FlightFlowUi';
import { confirmFlightBooking, getFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function FlightPaymentScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const draft = getFlightBookingDraft();

  const payment = useBookingPayment();
  const { processing } = payment;
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/flight-booking/seats' as never);
  };

  if (!selection || draft.travellers.length === 0) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Payment" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState
            icon="card-outline"
            title="No booking to pay for"
            text="Select a flight and add traveller details first."
            action={<PrimaryButton label="Search flights" onPress={() => router.replace('/(tabs)/explore/flights' as never)} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;
  const total = fareTotal + draft.seatTotal + draft.addOnTotal;

  const pay = () => void payment.pay({
    service: 'flights', amount: total, currency, itemName: `${offer.airline.name} ${offer.flightNumber} · ${offer.departure.airportCode} → ${offer.arrival.airportCode}`, tripDate: selection.request.departureDate,
  }, { email: draft.contactEmail, contact: draft.contactPhone }, (verified) => {
    const booking = confirmFlightBooking({ method: 'razorpay', label: 'Razorpay (test)' }, verified);
    if (!booking) throw new Error('Payment verified but the booking details changed. Contact support with payment ID ' + verified.paymentId + '.');
    router.replace('/flight-booking/confirmation' as never);
  });

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption="Amount to pay"
          amount={formatPrice(total, currency)}
          action={<PrimaryButton label={processing ? 'Processing…' : payment.needsVerification ? 'Retry verification' : `Pay ${formatPrice(total, currency)}`} icon="lock-closed" loading={processing} onPress={pay} />}
        />
      }
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Secure payment" subtitle="Complete your booking with Razorpay test checkout." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => !processing && goBack()} />
            <FlightProgress current={3} />

            <Card>
              <SectionTitle eyebrow="PAYMENT METHOD" title="Secure checkout" />
              <RazorpayPaymentDetails error={payment.error} />
            </Card>

            <Card>
              <SectionTitle eyebrow="SUMMARY" title="Price details" />
              <Row label={`${offer.airline.name} ${offer.flightNumber} - ${fare?.name ?? 'Fare'}`} value={formatPrice(fareTotal, currency)} />
              {draft.seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(draft.seatTotal, currency)} /> : null}
              {draft.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(draft.addOnTotal, currency)} /> : null}
              <Row label="Total" value={formatPrice(total, currency)} bold />
            </Card>

            <Notice icon="lock-closed-outline" title="Test booking">Payments use Razorpay test mode. Tickets and vouchers are sample bookings until the travel provider is connected.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RazorpayCheckoutHost />
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
});
