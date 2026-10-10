import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
﻿import { ScreenHeader } from '@/components/ScreenHeader';
import { FlightJourney, FlightProgress, formatPrice } from '@/components/flights/FlightFlowUi';
import {
  getFlightBookingDraft,
  updateFlightBookingDraft,
  type FlightAddOns,
} from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, EmptyState, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatShortDate } from '@/data/trains';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Static seat map for now (real seat data will come from the flight service later).
const ROWS = Array.from({ length: 14 }, (_, i) => i + 1);
const LEFT = ['A', 'B', 'C'];
const RIGHT = ['D', 'E', 'F'];
const TAKEN = new Set(['2B', '3E', '5A', '5B', '7C', '8D', '10F', '11A', '12E', '13B']);
const seatPrice = (row: number) => (row <= 3 ? 500 : 300);

const ADDONS: { key: keyof FlightAddOns; title: string; detail: string; price: number; icon: IconName }[] = [
  { key: 'baggage', title: 'Extra baggage', detail: '+5 kg check-in, per traveller', price: 750, icon: 'bag-handle-outline' },
  { key: 'meal', title: 'In-flight meal', detail: 'Hot meal and a drink, per traveller', price: 350, icon: 'restaurant-outline' },
  { key: 'insurance', title: 'Travel insurance', detail: 'Trip cover, per traveller', price: 199, icon: 'shield-checkmark-outline' },
];

export default function SeatsAddOnsScreen() {
  const selection = getFlightSelection();
  const saved = getFlightBookingDraft();
  const count = Math.max(1, selection?.request.travellers ?? 1);

  const [seats, setSeats] = useState<string[]>(saved.seats);
  const [addOns, setAddOns] = useState<FlightAddOns>(saved.addOns);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/flight-booking/traveller' as never);
  };

  if (!selection) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Seats and add-ons" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState
            icon="airplane-outline"
            title="No flight selected"
            text="Pick a flight and fare first."
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

  const seatTotal = seats.reduce((sum, id) => sum + seatPrice(parseInt(id, 10)), 0);
  const addOnTotal = ADDONS.reduce((sum, item) => sum + (addOns[item.key] ? item.price * count : 0), 0);
  const grandTotal = fareTotal + seatTotal + addOnTotal;

  const toggleSeat = (id: string) => {
    setSeats((current) => {
      if (current.includes(id)) return current.filter((seat) => seat !== id);
      if (current.length >= count) return current;
      return [...current, id];
    });
  };

  const handleContinue = () => {
    updateFlightBookingDraft({ seats, addOns, seatTotal, addOnTotal });
    router.push('/flight-booking/payment' as never);
  };

  const renderSeat = (row: number, letter: string) => {
    const id = `${row}${letter}`;
    const taken = TAKEN.has(id);
    const selected = seats.includes(id);
    return (
      <TouchableOpacity
        key={id}
        accessibilityRole="button"
        accessibilityLabel={`Seat ${id}`}
        accessibilityState={{ selected, disabled: taken }}
        disabled={taken}
        onPress={() => toggleSeat(id)}
        style={[s.seat, row <= 3 && s.seatFront, taken && s.seatTaken, selected && s.seatSelected]}
      >
        <Text style={[s.seatText, taken && s.seatTextTaken, selected && s.seatTextSelected]}>{letter}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption="Total"
          amount={formatPrice(grandTotal, currency)}
          action={<PrimaryButton label="Continue to payment" icon="arrow-forward" onPress={handleContinue} />}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Seats and add-ons" subtitle="Seat selection is optional." eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <FlightProgress current={2} />
          <FlightJourney offer={offer} fare={fare} date={formatShortDate(selection.request.departureDate)} />

          <Card>
            <SectionTitle
              eyebrow="SEATS"
              title="Choose your seats"
              right={<Text style={s.count}>{seats.length} of {count} selected</Text>}
            />
            <View style={s.legend}>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatFront]} /><Text style={s.legendText}>Front rows</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatSelected]} /><Text style={s.legendText}>Selected</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatTaken]} /><Text style={s.legendText}>Taken</Text></View>
            </View>
            <View style={s.seatMap}>
              {ROWS.map((row) => (
                <View key={row} style={s.seatRow}>
                  <View style={s.seatGroup}>{LEFT.map((letter) => renderSeat(row, letter))}</View>
                  <Text style={s.rowNumber}>{row}</Text>
                  <View style={s.seatGroup}>{RIGHT.map((letter) => renderSeat(row, letter))}</View>
                </View>
              ))}
            </View>
            <Text style={s.note}>
              Rows 1 to 3: {formatPrice(500, currency)} per seat. Other rows: {formatPrice(300, currency)}.
            </Text>
          </Card>

          <Card>
            <SectionTitle eyebrow="ADD-ONS" title="Make your trip easier" />
            {ADDONS.map((item, index) => {
              const on = addOns[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[s.addOn, on && s.addOnOn, index > 0 && { marginTop: 10 }]}
                  onPress={() => setAddOns((current) => ({ ...current, [item.key]: !current[item.key] }))}
                >
                  <View style={s.addOnIcon}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.addOnTitle}>{item.title}</Text>
                    <Text style={s.addOnDetail}>{item.detail}</Text>
                  </View>
                  <View style={s.addOnRight}>
                    <Text style={s.addOnPrice}>{formatPrice(item.price, currency)}</Text>
                    <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          <Notice icon="information-circle-outline">Seat and add-on prices are shown for demonstration until live flight data is connected.</Notice>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  count: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, color: Colors.textLight },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: Colors.borderStrong },
  legendText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight },
  seatMap: { alignItems: 'center', gap: 8, marginTop: 6 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  seatGroup: { flexDirection: 'row', gap: 8 },
  rowNumber: { width: 22, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, color: Colors.textLight },
  seat: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  seatFront: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent },
  seatTaken: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.surfaceMuted },
  seatSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  seatText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.primary },
  seatTextTaken: { color: Colors.textLight },
  seatTextSelected: { color: Colors.accent },
  note: { marginTop: 14, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight },
  addOn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  addOnOn: { borderColor: Colors.primary, backgroundColor: Colors.surfaceMuted },
  addOnIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.accentSoft },
  addOnTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  addOnDetail: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  addOnRight: { alignItems: 'flex-end', gap: 4 },
  addOnPrice: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
});
