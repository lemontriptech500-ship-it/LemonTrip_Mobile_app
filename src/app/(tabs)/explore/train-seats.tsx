import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { JourneySummary } from '@/components/trains/TrainCards';
import { BRAND, INTER, TRAIN_ROUTES, EmptyState, PrimaryButton, TrainBanner, TrainCardBox, TrainFooter, TrainHeading, TrainNotice, TrainShell, TrainSteps, TrainTag, goBackOr, goTo, replaceTo } from '@/components/trains/TrainFlowUi';
import { Colors } from '@/constants/colors';
import { CLASS_INFO, coachCodes, describeSeat, getAvailability, getBookedSeats, getCoachLayout, inr, type CoachSeat } from '@/data/trains';
import { clearSeats, currentFare, seatSelectionOpen, toggleSeat, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const ABBR: Record<string, string> = { Lower: 'LB', Middle: 'MB', Upper: 'UB', 'Side Lower': 'SL', 'Side Upper': 'SU', Window: 'W', Aisle: 'A' };

export default function TrainSeatsScreen() {
  useAppLanguage();
  const booking = useTrainBooking();
  const { selection, passengers, seats } = booking;
  const [coach, setCoach] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState('');
  const derived = currentFare();

  const cls = selection?.classCode;
  const coaches = cls ? coachCodes(cls) : [];
  const activeCoach = coach && coaches.includes(coach) ? coach : coaches[0];
  const layout = useMemo(() => (cls && activeCoach ? getCoachLayout(cls, activeCoach) : null), [cls, activeCoach]);
  const booked = useMemo(() => (selection && cls && activeCoach ? getBookedSeats(selection.trainId, cls, selection.date, activeCoach) : new Set<string>()), [selection, cls, activeCoach]);

  if (!selection || !derived || !cls || !layout) {
    return (
      <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.passengers)}>
        <ScrollView>
          <TrainBanner title="Choose your seats" text="Pick berths or seats for every passenger." />
          <EmptyState icon="train-outline" title="No train selected" text="Pick a train and class before choosing seats." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} />
        </ScrollView>
      </TrainShell>
    );
  }

  const { fare, result } = derived;
  const open = seatSelectionOpen(booking);
  const availability = getAvailability(selection.trainId, cls, selection.date, selection.quota);
  const berth = layout.kind === 'berth';
  const total = passengers.length;
  const count = seats.length;

  const onSeat = (id: string) => {
    if (booked.has(id)) return;
    setLimitMsg(toggleSeat(id) === 'limit' ? `Select up to ${total} seat${total > 1 ? 's' : ''}, one for each passenger. Tap a selected seat to free it.` : '');
  };

  return (
    <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.passengers)} footer={
      <TrainFooter caption={open ? `${count} of ${total} selected · total` : 'Total'} amount={inr(fare.total)} label={open && !count ? 'Skip & review' : 'Review booking'} icon="arrow-forward" onPress={() => goTo(TRAIN_ROUTES.review)} />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <TrainBanner title={berth ? 'Choose your berths' : 'Choose your seats'} text="Seat selection is optional. We allot the rest automatically." />
          <TrainSteps current={2} />
          <JourneySummary result={result} date={selection.date} className={CLASS_INFO[cls].name} quota={selection.quota} />

          {!open ? (
            <TrainNotice tone="warn" icon="alert-circle-outline" title={availability.status === 'WL' ? 'Waitlisted ticket' : 'RAC ticket'}>
              Seats can be picked only for confirmed tickets. {availability.status === 'WL' ? 'Your berths are allotted if the waitlist clears.' : 'RAC passengers share a berth until the chart is prepared.'} You can go back and choose another class or quota, or continue.
            </TrainNotice>
          ) : (
            <>
              <TrainCardBox>
                <TrainHeading eyebrow="STEP 3" title={berth ? 'Pick your berths' : 'Pick your seats'} right={<TrainTag icon="people-outline" label={`${count}/${total} selected`} />} />
                <View style={s.coaches}>
                  {coaches.map((c) => (
                    <TouchableOpacity key={c} accessibilityRole="button" accessibilityLabel={`Coach ${c}`} accessibilityState={{ selected: activeCoach === c }} onPress={() => setCoach(c)} style={[s.coach, activeCoach === c && s.coachOn]} activeOpacity={0.85}>
                      <Ionicons name="train-outline" size={14} color={activeCoach === c ? Colors.white : BRAND} />
                      <Text style={[s.coachText, activeCoach === c && s.coachTextOn]}>Coach {c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.legend}>
                  <Legend style={s.seat} label="Available" /><Legend style={[s.seat, s.seatOn]} label="Selected" /><Legend style={[s.seat, s.seatBooked]} label="Booked" />
                </View>

                <View style={s.coachBody}>
                  <View style={s.front}><Text style={s.frontText}>ENGINE END</Text><Ionicons name="train" size={20} color={Colors.textLight} /></View>
                  <Text style={s.coachHint}>{layout.hint}</Text>
                  {layout.bays.map((bay) => (
                    <View key={bay.id} style={berth ? s.bay : s.chairRow}>
                      {berth ? <Text style={s.bayLabel}>{bay.label}</Text> : <Text style={s.rowNo}>{bay.label.replace('Row ', '')}</Text>}
                      <View style={s.bayGrid}>
                        <View style={{ gap: 6 }}>
                          {bay.rows.map((row, r) => (
                            <View key={r} style={s.seatRow}>
                              {row.map((seat, c) => (seat ? <SeatTile key={seat.id} seat={seat} berth={berth} on={seats.includes(seat.id)} taken={booked.has(seat.id)} onPress={onSeat} /> : <View key={`g${c}`} style={s.aisle} />))}
                            </View>
                          ))}
                        </View>
                        {bay.side.length ? (
                          <View style={s.sideCol}>
                            {bay.side.map((seat) => <SeatTile key={seat.id} seat={seat} berth on={seats.includes(seat.id)} taken={booked.has(seat.id)} onPress={onSeat} />)}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>

                {limitMsg ? <Text style={s.error}>{limitMsg}</Text> : null}
                <Text style={s.hint}>{berth ? 'LB lower · MB middle · UB upper · SL side lower · SU side upper.' : 'W window · A aisle · M middle.'} Seat map is illustrative; final allotment is confirmed at payment.</Text>
              </TrainCardBox>

              <TrainCardBox>
                <TrainHeading eyebrow="ALLOTMENT" title="Your selection" right={count ? (
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear selected seats" onPress={() => { clearSeats(); setLimitMsg(''); }} hitSlop={8} activeOpacity={0.8}><Text style={s.clear}>Clear</Text></TouchableOpacity>
                ) : undefined} />
                {passengers.map((p, i) => (
                  <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                    <View style={s.avatar}><Text style={s.avatarText}>{(p.name.trim().charAt(0) || String(i + 1)).toUpperCase()}</Text></View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.paxName} numberOfLines={1}>{p.name.trim() || `Passenger ${i + 1}`}</Text>
                      <Text style={s.paxMeta} numberOfLines={1}>{p.berth === 'No preference' ? 'No preference' : `Prefers ${p.berth}`}</Text>
                    </View>
                    <Text style={[s.paxSeat, !seats[i] && s.paxSeatAuto]}>{seats[i] ? describeSeat(cls, seats[i]) : 'Auto-allot'}</Text>
                  </View>
                ))}
              </TrainCardBox>
            </>
          )}
        </View>
      </ScrollView>
    </TrainShell>
  );
}

function SeatTile({ seat, berth, on, taken, onPress }: { seat: CoachSeat; berth: boolean; on: boolean; taken: boolean; onPress: (id: string) => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: on, disabled: taken }} accessibilityLabel={`Seat ${seat.id}, ${seat.tier}, ${taken ? 'booked' : on ? 'selected' : 'available'}`}
      disabled={taken} onPress={() => onPress(seat.id)} activeOpacity={0.8} style={[s.seat, berth ? s.berth : s.chair, on && s.seatOn, taken && s.seatBooked]}>
      {taken ? <Ionicons name="close" size={14} color={Colors.textLight} /> : (
        <>
          <Text style={[s.seatText, on && s.seatTextOn]}>{seat.no}</Text>
          <Text style={[s.seatTier, on && s.seatTextOn]}>{ABBR[seat.tier] ?? seat.tier[0]}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function Legend({ style, label }: { style: object | object[]; label: string }) {
  return <View style={s.legendItem}><View style={[style as object, s.legendBox]} /><Text style={s.legendText}>{label}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  coaches: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  coach: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  coachOn: { backgroundColor: BRAND, borderColor: BRAND },
  coachText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  coachTextOn: { color: Colors.white },
  legend: { flexDirection: 'row', gap: 20, marginBottom: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendBox: { width: 20, height: 20, borderRadius: 6, minWidth: 0 },
  legendText: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  coachBody: { alignSelf: 'center', width: '100%', maxWidth: 340, padding: 14, borderRadius: 24, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: Colors.background },
  front: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  frontText: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1, color: Colors.textLight },
  coachHint: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, textAlign: 'center', marginBottom: 10 },
  bay: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  bayLabel: { fontFamily: INTER.semibold, fontSize: TextSize.micro, letterSpacing: 0.6, color: Colors.secondary, marginBottom: 6 },
  bayGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  sideCol: { gap: 6, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: Colors.border },
  chairRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  rowNo: { width: 14, fontFamily: INTER.semibold, fontSize: TextSize.micro, color: Colors.textLight, textAlign: 'right' },
  seatRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  aisle: { width: 12 },
  seat: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  berth: { minWidth: 54, height: 44 },
  chair: { width: 34, height: 44 },
  seatOn: { backgroundColor: BRAND, borderColor: BRAND },
  seatBooked: { backgroundColor: Colors.surfaceMuted, borderColor: Colors.surfaceMuted },
  seatText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  seatTier: { fontFamily: INTER.medium, fontSize: TextSize.micro, color: Colors.textLight, marginTop: -1 },
  seatTextOn: { color: Colors.accent },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 10 },
  hint: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 12 },
  clear: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  paxName: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  paxMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  paxSeat: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: BRAND },
  paxSeatAuto: { fontFamily: INTER.medium, color: Colors.textLight },
});
