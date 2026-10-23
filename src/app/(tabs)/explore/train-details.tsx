import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { JourneySummary } from '@/components/trains/TrainCards';
import { BRAND, INTER, Chip, EmptyState, Pill, PrimaryButton, TRAIN_ROUTES, TrainBanner, TrainCardBox, TrainFooter, TrainHeading, TrainNotice, TrainShell, TrainSteps, goBackOr, goTo, replaceTo } from '@/components/trains/TrainFlowUi';
import { Colors } from '@/constants/colors';
import { CLASS_INFO, computeFare, formatDuration, formatLongDate, getAvailability, getClassOptions, getStation, getTrain, inr, type ClassCode, type TrainResult } from '@/data/trains';
import { currentFare, selectTrain, updateSelection, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function TrainDetailsScreen() {
  useAppLanguage();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const booking = useTrainBooking();
  const sel = booking.selection;
  const train = getTrain(id ?? sel?.trainId);

  // Deep link with just a train id: build a default selection from the last search.
  // Runs only while this screen is focused: older train-details screens stay mounted lower in the
  // navigation stack, and two of them with different train ids would otherwise keep overwriting each
  // other's selection in an endless loop.
  useFocusEffect(useCallback(() => {
    if (!train || (sel && sel.trainId === train.id)) return;
    const first = train.route[0]; const last = train.route[train.route.length - 1];
    const from = booking.search.from && train.route.some((r) => r.code === booking.search.from) ? booking.search.from : first.code;
    const to = booking.search.to && train.route.some((r) => r.code === booking.search.to) ? booking.search.to : last.code;
    selectTrain({ trainId: train.id, fromCode: from, toCode: to, date: booking.search.date, classCode: train.classes[0], quota: 'GN' });
  }, [train, sel, booking.search]));

  const derived = currentFare();
  if (!train || !sel || !derived || sel.trainId !== train.id) {
    return (
      <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.results)}>
        <ScrollView><TrainBanner title="Choose your class" text="Pick a class, quota and check the route." />
          <EmptyState icon="train-outline" title={train ? 'Loading journey…' : 'Train not found'} text="Search for a route to pick a train." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} /></ScrollView>
      </TrainShell>
    );
  }

  const { result } = derived;
  const options = getClassOptions(result, sel.date, sel.quota);
  const selected = options.find((o) => o.code === sel.classCode) ?? options[0];
  const fare = computeFare(train, selected.code, result.distanceKm, sel.quota, 1);
  const runsOnDate = train.runsOn.includes(new Date(`${sel.date}T00:00:00`).getDay());
  const start = train.route.findIndex((r) => r.code === sel.fromCode); const end = train.route.findIndex((r) => r.code === sel.toCode);

  return (
    <TrainShell onBack={() => goBackOr(TRAIN_ROUTES.results)} footer={
      <TrainFooter caption={`${selected.code} · per passenger`} amount={inr(fare.perPassenger)} label="Continue" icon="arrow-forward" disabled={!runsOnDate} onPress={() => goTo(TRAIN_ROUTES.passengers)} />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <TrainBanner title="Choose your class" text={`${train.name} #${train.number} · ${getStation(sel.fromCode)?.city} → ${getStation(sel.toCode)?.city}`} />
          <TrainSteps current={0} />
          <JourneySummary result={result as TrainResult} date={sel.date} className={CLASS_INFO[sel.classCode].name} quota={sel.quota} />

          {!runsOnDate ? <TrainNotice tone="warn" icon="alert-circle-outline" title="Not running on this date">This train does not operate on {formatLongDate(sel.date)}. Go back and choose another date.</TrainNotice> : null}

          <TrainCardBox>
            <TrainHeading eyebrow="STEP 1" title="Choose your class" />
            {options.map((o) => {
              const on = o.code === sel.classCode;
              return (
                <TouchableOpacity key={o.code} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => updateSelection({ classCode: o.code as ClassCode })} style={[s.option, on && s.optionOn]}>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.optionTitle}>{o.info.name} <Text style={s.optionCode}>({o.code})</Text></Text>
                    <Text style={[s.avail, o.availability.tone === 'good' ? s.good : o.availability.tone === 'warn' ? s.warn : s.bad]}>{o.availability.label}{o.availability.status === 'AVL' ? ' seats' : ''}</Text>
                  </View>
                  <Text style={s.optionFare}>{inr(o.fare)}</Text>
                </TouchableOpacity>
              );
            })}
          </TrainCardBox>

          <TrainCardBox>
            <TrainHeading eyebrow="STEP 2" title="Booking quota" />
            <View style={s.quota}>
              <Chip icon="people-outline" label="General" selected={sel.quota === 'GN'} onPress={() => updateSelection({ quota: 'GN' })} />
              <Chip icon="flash-outline" label="Tatkal" selected={sel.quota === 'TQ'} onPress={() => updateSelection({ quota: 'TQ' })} />
            </View>
            <Text style={s.hint}>{sel.quota === 'TQ' ? `Tatkal adds ${CLASS_INFO[sel.classCode].ac ? '30%' : '20%'} of the base fare for last-minute confirmed seats.` : 'Standard fare with regular availability. Switch to Tatkal for a higher chance of a confirmed seat.'}</Text>
            <View style={s.currentAvail}><Text style={s.hint}>Availability for {sel.classCode}</Text><Pill label={getAvailability(train.id, sel.classCode, sel.date, sel.quota).label} tone={getAvailability(train.id, sel.classCode, sel.date, sel.quota).tone === 'good' ? 'good' : getAvailability(train.id, sel.classCode, sel.date, sel.quota).tone === 'warn' ? 'warn' : 'bad'} /></View>
          </TrainCardBox>

          <TrainCardBox>
            <TrainHeading eyebrow="ROUTE" title="Journey timeline" right={<Pill icon="time-outline" label={formatDuration(result.durationMin)} />} />
            {train.route.map((stop, i) => {
              const inJourney = i >= start && i <= end; const isEnd = i === start || i === end;
              return (
                <View key={stop.code} style={s.stop}>
                  <View style={s.rail}>
                    <View style={[s.node, inJourney && s.nodeOn, isEnd && s.nodeEnd]} />
                    {i < train.route.length - 1 ? <View style={[s.link, i >= start && i < end && s.linkOn]} /> : null}
                  </View>
                  <View style={{ flex: 1, paddingBottom: 18 }}>
                    <Text style={[s.stopName, !inJourney && { color: Colors.textLight }]}>{getStation(stop.code)?.name} <Text style={s.stopCode}>({stop.code})</Text></Text>
                    <Text style={s.stopMeta}>{i === 0 ? `Departs ${stop.dep}` : stop.dep ? `${stop.arr} · ${stop.dep}` : `Arrives ${stop.arr}`}{stop.day > 0 ? `  ·  Day ${stop.day + 1}` : ''}  ·  {stop.km} km</Text>
                  </View>
                </View>
              );
            })}
          </TrainCardBox>

          <TrainCardBox>
            <TrainHeading eyebrow="SCHEDULE" title="Runs on" />
            <View style={s.days}>{DAYS.map((d, i) => { const on = train.runsOn.includes(i); return <View key={i} style={[s.day, on && s.dayOn]}><Text style={[s.dayText, on && s.dayTextOn]}>{d}</Text></View>; })}</View>
            <View style={s.amenities}>
              <Pill icon={train.pantry ? 'restaurant-outline' : 'close-circle-outline'} label={train.pantry ? 'Meals on board' : 'No pantry car'} tone={train.pantry ? 'good' : 'neutral'} />
              <Pill icon="shield-checkmark-outline" label="Cancellation charges apply" />
            </View>
          </TrainCardBox>
        </View>
      </ScrollView>
    </TrainShell>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optionOn: { borderColor: BRAND, borderWidth: 1.5, backgroundColor: '#FDF3C4' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: BRAND },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND },
  optionTitle: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  optionCode: { color: Colors.textLight, fontFamily: INTER.bold },
  optionFare: { fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, color: BRAND },
  avail: { fontFamily: INTER.extrabold, fontSize: TextSize.caption, marginTop: 3 },
  good: { color: Colors.success }, warn: { color: '#8A6500' }, bad: { color: Colors.error },
  quota: { flexDirection: 'row', gap: 8 },
  hint: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 10 },
  currentAvail: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  stop: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 16 },
  node: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.borderStrong, marginTop: 3 },
  nodeOn: { backgroundColor: Colors.secondary },
  nodeEnd: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.accent, borderWidth: 3, borderColor: Colors.primary, marginTop: 1 },
  link: { flex: 1, width: 2, backgroundColor: Colors.border, marginTop: 2 },
  linkOn: { backgroundColor: Colors.secondary },
  stopName: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: BRAND },
  stopCode: { color: Colors.textLight, fontFamily: INTER.bold },
  stopMeta: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  days: { flexDirection: 'row', gap: 8 },
  day: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  dayOn: { backgroundColor: BRAND, borderColor: BRAND },
  dayText: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: Colors.textLight },
  dayTextOn: { color: Colors.white },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
});