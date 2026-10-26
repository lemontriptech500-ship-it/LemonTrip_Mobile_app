import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { BRAND, FLIGHT_ROUTES, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightSummaryCard, INTER, formatPrice, goBackOr, goTo, replaceTo } from '@/components/flights/FlightFlowUi';
import {
  getFlightBookingDraft,
  updateFlightBookingDraft,
  type FlightAddOns,
} from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatShortDate } from '@/data/trains';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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
  useAppLanguage();
  const selection = getFlightSelection();
  const saved = getFlightBookingDraft();
  const count = Math.max(1, selection?.request.travellers ?? 1);

  const [seats, setSeats] = useState<string[]>(saved.seats);
  const [addOns, setAddOns] = useState<FlightAddOns>(saved.addOns);

  const goBack = () => goBackOr(FLIGHT_ROUTES.travellers);

  if (!selection) {
    return (
      <FlightShell onBack={goBack}>
        <ScrollView>
          <FlightBanner title="Seats and add-ons" text="Seat selection is optional." />
          <EmptyState
            icon="airplane-outline"
            title="No flight selected"
            text="Pick a flight and fare first."
            action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />}
          />
        </ScrollView>
      </FlightShell>
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
    goTo(FLIGHT_ROUTES.review);
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

  const footer = (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption}>Total</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{formatPrice(grandTotal, currency)}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={handleContinue} activeOpacity={0.85} style={s.continue}>
        <Text style={s.continueText}>Review booking</Text>
        <Ionicons name="arrow-forward" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlightShell onBack={goBack} footer={footer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <FlightBanner title="Seats and add-ons" text="Seat selection is optional." />
          <FlightSteps current={2} />
          <FlightSummaryCard offer={offer} fare={fare} date={formatShortDate(selection.request.departureDate)} />

          <View style={s.card}>
            <FlightHeading eyebrow="SEATS" title="Choose your seats" right={<Text style={s.count}>{seats.length} of {count} selected</Text>} />
            <View style={s.legend}>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatFront]} /><Text style={s.legendText}>Front rows</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatSelected]} /><Text style={s.legendText}>Selected</Text></View>
              <View style={s.legendItem}><View style={[s.legendDot, s.seatTaken]} /><Text style={s.legendText}>Taken</Text></View>
            </View>
            <View style={s.seatMap}>
              <View style={s.seatRow}>
                <View style={s.seatGroup}>{LEFT.map((l) => <Text key={l} style={s.colLabel}>{l}</Text>)}</View>
                <View style={s.rowNumber} />
                <View style={s.seatGroup}>{RIGHT.map((l) => <Text key={l} style={s.colLabel}>{l}</Text>)}</View>
              </View>
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
          </View>

          <View style={s.card}>
            <FlightHeading eyebrow="ADD-ONS" title="Make your trip easier" />
            {ADDONS.map((item, index) => {
              const on = addOns[item.key];
              return (
                <TouchableOpacity
                  key={item.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={[s.addOn, on && s.addOnOn, index > 0 && { marginTop: 10 }]}
                  activeOpacity={0.85}
                  onPress={() => setAddOns((current) => ({ ...current, [item.key]: !current[item.key] }))}
                >
                  <View style={s.addOnIcon}><Ionicons name={item.icon} size={22} color={BRAND} /></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.addOnTitle}>{item.title}</Text>
                    <Text style={s.addOnDetail} numberOfLines={2}>{item.detail}</Text>
                  </View>
                  <Text style={s.addOnPrice}>{formatPrice(item.price, currency)}</Text>
                  <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={BRAND} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.notice}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.textLight} />
            <Text style={s.noticeText}>Seat and add-on prices are shown for demonstration until live flight data is connected.</Text>
          </View>
        </View>
      </ScrollView>
    </FlightShell>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  count: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND },
  legend: { flexDirection: 'row', gap: 22, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: Colors.borderStrong },
  legendText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  seatMap: { gap: 8 },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatGroup: { flex: 3, flexDirection: 'row', gap: 8 },
  colLabel: { flex: 1, textAlign: 'center', fontFamily: INTER.bold, fontSize: TextSize.micro, color: BRAND },
  rowNumber: { width: 34, textAlign: 'center', fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  seat: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  seatFront: { backgroundColor: '#E3F0EA', borderColor: '#103D30' },
  seatTaken: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.surfaceMuted },
  seatSelected: { backgroundColor: BRAND, borderColor: BRAND },
  seatText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  seatTextTaken: { color: Colors.textLight, fontFamily: INTER.regular },
  seatTextSelected: { color: Colors.white },
  note: { marginTop: 14, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight },
  addOn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  addOnOn: { borderColor: BRAND, backgroundColor: Colors.surfaceMuted },
  addOnIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#E3F0EA' },
  addOnTitle: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  addOnDetail: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  addOnPrice: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: BRAND, marginRight: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  noticeText: { flex: 1, fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flex: 1, minWidth: 0 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { minWidth: 168, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 27, backgroundColor: '#103D30' },
  continueText: { fontFamily: INTER.bold, color: Colors.white, fontSize: TextSize.bodyLarge },
});