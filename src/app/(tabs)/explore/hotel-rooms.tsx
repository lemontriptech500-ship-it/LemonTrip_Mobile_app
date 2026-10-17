import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaySummary } from '@/components/hotels/HotelBookingCards';
import { Card, EmptyState, FlowScreen, FooterBar, HOTEL_ROUTES, HotelProgress, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { CHECK_IN_TIME, CHECK_OUT_TIME, MAX_GUESTS, MAX_ROOMS, cancellationInfo, getRoomOptions, inr, parsePrice } from '@/data/hotelBooking';
import { getHotelSearch, getSelectedHotel } from '@/utils/hotelSearchStore';
import { currentFare, startHotelBooking, updateSelection, useHotelBooking } from '@/utils/hotelBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function HotelRoomsScreen() {
  useAppLanguage();
  const booking = useHotelBooking();
  const sel = booking.selection;

  // Reached without going through hotel details (deep link): start from the last opened hotel.
  // Runs only while focused so stale screens lower in the stack never fight over the selection.
  useFocusEffect(useCallback(() => {
    if (sel) return;
    const hotel = getSelectedHotel();
    if (hotel) startHotelBooking(hotel, getHotelSearch());
  }, [sel]));

  const derived = currentFare();
  if (!sel || !derived) {
    return (
      <FlowScreen>
        <ScrollView><ScreenHeader title="Choose your room" eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.results)} />
          <EmptyState icon="bed-outline" title={sel ? 'Price unavailable' : 'Choose a stay to continue'} text="Open a hotel from the search results, then pick your room." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} /></ScrollView>
      </FlowScreen>
    );
  }

  const { fare, room, nights } = derived;
  const { hotel } = sel;
  const options = getRoomOptions(hotel);
  const validDates = nights > 0;

  return (
    <FlowScreen footer={
      <FooterBar caption={validDates ? `${nights} night${nights > 1 ? 's' : ''} · ${sel.rooms} room${sel.rooms > 1 ? 's' : ''}` : 'Total'} amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton label="Continue" icon="arrow-forward" disabled={!validDates} onPress={() => goTo(HOTEL_ROUTES.guests)} />} />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title={hotel.name} subtitle={hotel.address ?? hotel.location} eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.details)} />
          <HotelProgress current={0} />
          <StaySummary hotel={hotel} roomName={room.name} checkIn={sel.checkIn} checkOut={sel.checkOut} nights={nights} guests={sel.guests} rooms={sel.rooms} />

          {!validDates ? <Notice tone="warn" icon="alert-circle-outline" title="Check your dates">Check-out must be after check-in. Go back and choose valid dates for your stay.</Notice> : null}

          <Card>
            <SectionTitle eyebrow="STEP 1" title="Choose your room" />
            {options.map((o) => {
              const on = o.id === room.id;
              const policy = cancellationInfo(o, hotel);
              const nightly = parsePrice(o.pricePerNight);
              return (
                <TouchableOpacity key={o.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => updateSelection({ roomId: o.id })} style={[s.option, on && s.optionOn]}>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.optionTitle}>{o.name}</Text>
                    {o.amenities?.length ? <Text style={s.optionMeta}>{o.amenities.join(' · ')}</Text> : null}
                    <View style={s.pills}>
                      {o.breakfast !== undefined ? <Pill icon={o.breakfast ? 'cafe-outline' : 'close-circle-outline'} tone={o.breakfast ? 'good' : 'neutral'} label={o.breakfast ? 'Breakfast included' : 'Room only'} /> : null}
                      <Pill icon={policy.free ? 'shield-checkmark-outline' : 'alert-circle-outline'} tone={policy.free ? 'good' : 'warn'} label={policy.free ? 'Free cancellation' : 'Limited refund'} />
                    </View>
                  </View>
                  <View style={s.priceCol}>
                    <Text style={s.optionFare}>{nightly !== null ? inr(nightly) : o.pricePerNight}</Text>
                    <Text style={s.perNight}>per night</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="STEP 2" title="Guests & rooms" />
            <Stepper icon="people-outline" label="Guests" hint={`Up to ${MAX_GUESTS}`} value={sel.guests} min={1} max={MAX_GUESTS} onChange={(v) => updateSelection({ guests: v })} />
            <View style={s.sep} />
            <Stepper icon="bed-outline" label="Rooms" hint="At least one guest per room" value={sel.rooms} min={1} max={MAX_ROOMS} onChange={(v) => updateSelection({ rooms: v })} />
          </Card>

          <Card>
            <SectionTitle eyebrow="POLICIES" title="Good to know" />
            <View style={s.pills}>
              <Pill icon="log-in-outline" label={`Check-in from ${CHECK_IN_TIME}`} />
              <Pill icon="log-out-outline" label={`Check-out until ${CHECK_OUT_TIME}`} />
              <Pill icon="id-card-outline" label="Photo ID required" />
            </View>
            <Text style={s.hint}>{cancellationInfo(room, hotel).text}</Text>
            {hotel.amenities.length ? (
              <View style={[s.pills, { marginTop: 12 }]}>
                {hotel.amenities.slice(0, 6).map((a) => <Pill key={a} label={a} />)}
              </View>
            ) : null}
          </Card>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Stepper({ icon, label, hint, value, min, max, onChange }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <View style={s.stepper}>
      <View style={s.stepIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.stepLabel}>{label}</Text><Text style={s.hint2}>{hint}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(value - 1)} style={[s.stepBtn, value <= min && { opacity: 0.4 }]}><Ionicons name="remove" size={18} color={Colors.primary} /></TouchableOpacity>
      <Text style={s.stepValue} accessibilityLabel={`${value} ${label}`}>{value}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} style={[s.stepBtn, value >= max && { opacity: 0.4 }]}><Ionicons name="add" size={18} color={Colors.primary} /></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  optionMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 3 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  priceCol: { alignItems: 'flex-end' },
  optionFare: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  perNight: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  hint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 12 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  stepLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  hint2: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 1 },
  stepBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  stepValue: { minWidth: 24, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
});
