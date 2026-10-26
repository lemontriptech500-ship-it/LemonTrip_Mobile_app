import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { JourneySummary } from '@/components/buses/BusCards';
import { BRAND, BUS_ROUTES, BusBanner, BusCardBox, BusFooter, BusHeading, BusNotice, BusShell, BusSteps, BusTag, EmptyState, INTER, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { CANCELLATION_POLICY, formatLongDate, getBoardingPoints, getBookedSeats, getBus, getCity, getDroppingPoints, getLayout, inr, seatPrice, shiftTime, type DeckId } from '@/data/buses';
import { MAX_SEATS, currentFare, selectBus, setBoarding, setDropping, toggleSeat, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function BusDetailsScreen() {
  useAppLanguage();
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
      <BusShell onBack={() => goBackOr(BUS_ROUTES.results)}>
        <ScrollView>
          <BusBanner title="Choose your seats" text="Pick seats, boarding and dropping points." />
          <EmptyState icon="bus-outline" title={bus ? 'Loading journey…' : 'Bus not found'} text="Search for a route to pick a bus." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} />
        </ScrollView>
      </BusShell>
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
    <BusShell onBack={() => goBackOr(BUS_ROUTES.results)} footer={
      <BusFooter caption={count ? `${count} seat${count > 1 ? 's' : ''} · total` : 'Fare from'} amount={inr(count ? fare.total : cheapest)} label={count ? 'Continue' : 'Select a seat'} icon="arrow-forward" disabled={!count} onPress={() => goTo(BUS_ROUTES.passengers)} />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <BusBanner title="Choose your seats" text={`${getCity(sel.fromCode)?.name} → ${getCity(sel.toCode)?.name} · ${bus.operator}`} />
          <BusSteps current={0} />
          <JourneySummary bus={bus} date={sel.date} seats={sel.seats} />

          <BusCardBox>
            <BusHeading eyebrow="STEP 1" title="Choose your seats" right={<BusTag icon="people-outline" label={`${count} selected`} />} />
            {layout.length > 1 ? (
              <View style={s.decks}>{layout.map((d) => (
                <TouchableOpacity key={d.id} accessibilityRole="button" accessibilityState={{ selected: activeDeck.id === d.id }} onPress={() => setDeck(d.id)} style={[s.deck, activeDeck.id === d.id && s.deckOn]} activeOpacity={0.85}>
                  <Ionicons name="layers-outline" size={14} color={activeDeck.id === d.id ? Colors.white : BRAND} />
                  <Text style={[s.deckText, activeDeck.id === d.id && s.deckTextOn]}>{d.label}</Text>
                </TouchableOpacity>
              ))}</View>
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
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="STEP 2" title="Boarding point" />
            {boardingPoints.map((p) => {
              const on = p.id === sel.boardingId; const t = shiftTime(bus.departure, p.offsetMin).time;
              return <PointRow key={p.id} on={on} time={t} name={p.name} note={p.landmark} onPress={() => setBoarding(p.id)} />;
            })}
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="STEP 3" title="Dropping point" />
            {droppingPoints.map((p) => {
              const on = p.id === sel.droppingId; const t = shiftTime(bus.arrival, p.offsetMin).time;
              return <PointRow key={p.id} on={on} time={t} name={p.name} note={p.landmark} onPress={() => setDropping(p.id)} />;
            })}
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="ON BOARD" title="Amenities" right={<BusTag icon="star" label={`${bus.rating.toFixed(1)} · ${bus.reviews.toLocaleString(getAppLocale())} reviews`} />} />
            <View style={s.amenities}>{bus.amenities.map((a) => <BusTag key={a} icon="checkmark-circle-outline" label={a} />)}</View>
          </BusCardBox>

          <BusCardBox>
            <BusHeading eyebrow="POLICY" title="Cancellation charges" />
            {CANCELLATION_POLICY.map((p) => (
              <View key={p.window} style={s.policy}><Text style={s.policyWindow}>{p.window}</Text><Text style={s.policyRefund}>{p.refund}</Text></View>
            ))}
          </BusCardBox>

          <BusNotice>Travelling on {formatLongDate(sel.date)}. Seat layout is illustrative; availability is confirmed at payment.</BusNotice>
        </View>
      </ScrollView>
    </BusShell>
  );
}

function Legend({ style, label }: { style: object | object[]; label: string }) {
  return <View style={s.legendItem}><View style={[style as object, s.legendBox]} /><Text style={s.legendText}>{label}</Text></View>;
}

function PointRow({ on, time, name, note, onPress }: { on: boolean; time: string; name: string; note: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={onPress} style={[s.option, on && s.optionOn]} activeOpacity={0.85}>
      <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.optionTitle} numberOfLines={1}>{name}</Text><Text style={s.optionNote} numberOfLines={1}>{note}</Text></View>
      <Text style={s.optionTime}>{time}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  decks: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  deck: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  deckOn: { backgroundColor: BRAND, borderColor: BRAND },
  deckText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  deckTextOn: { color: Colors.white },
  legend: { flexDirection: 'row', gap: 20, marginBottom: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendBox: { width: 20, height: 20, borderRadius: 6, minWidth: 0 },
  legendText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  bus: { alignSelf: 'center', width: '100%', maxWidth: 320, padding: 14, borderRadius: 24, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: Colors.background },
  front: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  frontText: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1, color: Colors.textLight },
  deckHint: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, textAlign: 'center', marginBottom: 10 },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  aisle: { width: 22 },
  seat: { minWidth: 44, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  berth: { minWidth: 64, height: 44 },
  seatOn: { backgroundColor: BRAND, borderColor: BRAND },
  seatBooked: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.surfaceMuted },
  seatText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  seatTextOn: { color: Colors.white },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  hint: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceMuted, marginBottom: 10 },
  optionOn: { borderColor: BRAND, borderWidth: 1.5, backgroundColor: '#E8F2EE' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: BRAND, borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND },
  optionTitle: { fontFamily: INTER.semibold, fontSize: TextSize.body, color: BRAND },
  optionNote: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  optionTime: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  policy: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border },
  policyWindow: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  policyRefund: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
});