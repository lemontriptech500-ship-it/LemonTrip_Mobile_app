import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { JourneySummary } from '@/components/buses/BusCards';
import { BUS_ROUTES, BusProgress, Card, Chip, EmptyState, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { CANCELLATION_POLICY, formatLongDate, getBoardingPoints, getBookedSeats, getBus, getCity, getDroppingPoints, getLayout, inr, seatPrice, shiftTime, type DeckId } from '@/data/buses';
import { MAX_SEATS, currentFare, selectBus, setBoarding, setDropping, toggleSeat, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function BusDetailsScreen() {
  const { id, deck: deckParam } = useLocalSearchParams<{ id?: string; deck?: string }>();
  const booking = useBusBooking();
  const sel = booking.selection;
  const bus = getBus(id ?? sel?.busId);
  const [deck, setDeck] = useState<DeckId | null>((deckParam as DeckId | undefined) ?? null);
  const [limitMsg, setLimitMsg] = useState('');

  // Deep link with just a bus id: build a default selection from the last search.
  useEffect(() => {
    if (!bus || (sel && sel.busId === bus.id)) return;
    selectBus({ busId: bus.id, fromCode: bus.fromCode, toCode: bus.toCode, date: booking.search.date });
  }, [bus, sel, booking.search.date]);

  const booked = useMemo(() => (bus && sel ? getBookedSeats(bus, sel.date) : new Set<string>()), [bus, sel?.date]);
  const derived = currentFare();

  if (!bus || !sel || !derived || sel.busId !== bus.id) {
    return (
      <FlowScreen>
        <ScrollView><ScreenHeader title="Bus details" eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.results)} />
          <EmptyState icon="bus-outline" title={bus ? 'Loading journey…' : 'Bus not found'} text="Search for a route to pick a bus." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} /></ScrollView>
      </FlowScreen>
    );
  }

  const { fare } = derived;
  const layout = getLayout(bus);
  const activeDeck = layout.find((d) => d.id === deck) ?? layout[0];
  const boardingPoints = getBoardingPoints(bus);
  const droppingPoints = getDroppingPoints(bus);
  const count = sel.seats.length;
  const cheapest = Math.min(...layout.flatMap((d) => d.rows.flat().filter((x): x is string => !!x)).map((x) => seatPrice(bus, x)));

  const onSeat = (seat: string) => {
    if (booked.has(seat)) return;
    setLimitMsg(toggleSeat(seat) === 'limit' ? `You can book up to ${MAX_SEATS} seats at a time.` : '');
  };

  return (
    <FlowScreen footer={
      <FooterBar caption={count ? `${count} seat${count > 1 ? 's' : ''} · total` : 'Fare from'} amount={inr(count ? fare.total : cheapest)} action={<PrimaryButton label={count ? 'Continue' : 'Select a seat'} icon="arrow-forward" disabled={!count} onPress={() => goTo(BUS_ROUTES.passengers)} />} />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title={bus.operator} subtitle={`${bus.type} · ${getCity(sel.fromCode)?.name} → ${getCity(sel.toCode)?.name}`} eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.results)} />
          <BusProgress current={0} />
          <JourneySummary bus={bus} date={sel.date} seats={sel.seats} />

          <Card>
            <SectionTitle eyebrow="STEP 1" title="Choose your seats" right={<Pill icon="people-outline" label={`${count} selected`} tone={count ? 'brand' : 'neutral'} />} />
            {layout.length > 1 ? (
              <View style={s.decks}>{layout.map((d) => <Chip key={d.id} icon="layers-outline" label={d.label} selected={activeDeck.id === d.id} onPress={() => setDeck(d.id)} />)}</View>
            ) : null}
            <View style={s.legend}>
              <Legend style={s.seat} label="Available" /><Legend style={[s.seat, s.seatOn]} label="Selected" /><Legend style={[s.seat, s.seatBooked]} label="Booked" />
            </View>

            <View style={s.bus}>
              <View style={s.front}><Text style={s.frontText}>FRONT</Text><Ionicons name="disc-outline" size={22} color={Colors.textLight} /></View>
              <Text style={s.deckHint}>{activeDeck.hint}</Text>
              {activeDeck.rows.map((row, r) => (
                <View key={r} style={s.seatRow}>
                  {row.map((seat, c) => {
                    if (!seat) return <View key={`a${c}`} style={s.aisle} />;
                    const isBooked = booked.has(seat); const on = sel.seats.includes(seat);
                    return (
                      <TouchableOpacity key={seat} accessibilityRole="button" accessibilityState={{ selected: on, disabled: isBooked }} accessibilityLabel={`Seat ${seat}, ${inr(seatPrice(bus, seat))}, ${isBooked ? 'booked' : on ? 'selected' : 'available'}`}
                        disabled={isBooked} onPress={() => onSeat(seat)} activeOpacity={0.8} style={[s.seat, bus.sleeper && s.berth, on && s.seatOn, isBooked && s.seatBooked]}>
                        {isBooked ? <Ionicons name="close" size={14} color={Colors.textLight} /> : <Text style={[s.seatText, on && s.seatTextOn]}>{seat}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            {limitMsg ? <Text style={s.error}>{limitMsg}</Text> : null}
            <Text style={s.hint}>{bus.sleeper ? 'Upper berths are slightly cheaper than lower berths.' : 'Window seats (A and D) carry a small premium.'} Selected seats: {count ? sel.seats.join(', ') : 'none yet'}.</Text>
          </Card>

          <Card>
            <SectionTitle eyebrow="STEP 2" title="Boarding point" />
            {boardingPoints.map((p) => {
              const on = p.id === sel.boardingId; const t = shiftTime(bus.departure, p.offsetMin).time;
              return <PointRow key={p.id} on={on} time={t} name={p.name} note={p.landmark} onPress={() => setBoarding(p.id)} />;
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="STEP 3" title="Dropping point" />
            {droppingPoints.map((p) => {
              const on = p.id === sel.droppingId; const t = shiftTime(bus.arrival, p.offsetMin).time;
              return <PointRow key={p.id} on={on} time={t} name={p.name} note={p.landmark} onPress={() => setDropping(p.id)} />;
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="ON BOARD" title="Amenities" right={<Pill icon="star" label={`${bus.rating.toFixed(1)} · ${bus.reviews.toLocaleString('en-IN')} reviews`} />} />
            <View style={s.amenities}>{bus.amenities.map((a) => <Pill key={a} icon="checkmark-circle-outline" label={a} tone="good" />)}</View>
          </Card>

          <Card>
            <SectionTitle eyebrow="POLICY" title="Cancellation charges" />
            {CANCELLATION_POLICY.map((p) => (
              <View key={p.window} style={s.policy}><Text style={s.policyWindow}>{p.window}</Text><Text style={s.policyRefund}>{p.refund}</Text></View>
            ))}
          </Card>

          <Notice icon="information-circle-outline">Travelling on {formatLongDate(sel.date)}. Seat layout is illustrative; availability is confirmed at payment.</Notice>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Legend({ style, label }: { style: object | object[]; label: string }) {
  return <View style={s.legendItem}><View style={[style as object, s.legendBox]} /><Text style={s.legendText}>{label}</Text></View>;
}

function PointRow({ on, time, name, note, onPress }: { on: boolean; time: string; name: string; note: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={[s.option, on && s.optionOn]}>
      <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.optionTitle} numberOfLines={1}>{name}</Text><Text style={s.optionNote} numberOfLines={1}>{note}</Text></View>
      <Text style={s.optionTime}>{time}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  decks: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 18, height: 18, borderRadius: 5, minWidth: 0 },
  legendText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, fontWeight: FontWeight.bold },
  bus: { alignSelf: 'center', width: '100%', maxWidth: 320, padding: 14, borderRadius: 24, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: Colors.background },
  front: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  frontText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1, color: Colors.textLight },
  deckHint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, textAlign: 'center', marginBottom: 10 },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  aisle: { width: 22 },
  seat: { minWidth: 44, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  berth: { minWidth: 64, height: 44 },
  seatOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  seatBooked: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.border },
  seatText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  seatTextOn: { color: Colors.white },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  hint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  optionNote: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  optionTime: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  policy: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  policyWindow: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textDark },
  policyRefund: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
});
