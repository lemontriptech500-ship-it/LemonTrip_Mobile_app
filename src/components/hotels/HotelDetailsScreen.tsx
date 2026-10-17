import { useAppLanguage } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StaySummary } from '@/components/hotels/HotelBookingCards';
import { Card, EmptyState, FlowScreen, FooterBar, HOTEL_ROUTES, HotelProgress, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { MAX_GUESTS, MAX_ROOMS, cancellationInfo, computeHotelFare, getRoomOptions, inr, nightsBetween, parsePrice } from '@/data/hotelBooking';
import { defaultHotelSearch, mockHotels } from '@/data/mockHotels';
import { getHotelSearch, getSelectedHotel, selectHotel } from '@/utils/hotelSearchStore';
import { getHotelBooking, startHotelBooking } from '@/utils/hotelBookingStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

export default function HotelDetailsScreen() {
  useAppLanguage();
  useWishlist();
  const hotel = getSelectedHotel() ?? mockHotels[0] ?? null;
  const search = getHotelSearch();
  const rooms = hotel ? getRoomOptions(hotel) : [];
  // Coming back from a later step ("Change"), restore what the guest had already chosen.
  const resume = hotel && getHotelBooking().selection?.hotel.id === hotel.id ? getHotelBooking().selection : null;
  const [selectedRoomId, setSelectedRoomId] = useState(resume?.roomId ?? rooms[0]?.id ?? '');
  const [guests, setGuests] = useState(resume?.guests ?? (search.guests || defaultHotelSearch.guests));
  const [roomCount, setRoomCount] = useState(resume?.rooms ?? (search.rooms || defaultHotelSearch.rooms));

  if (!hotel) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Hotel details" eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.results)} />
          <EmptyState icon="bed-outline" title="Choose a stay to continue" text="Return to hotel search and open a property to see its details." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} />
        </ScrollView>
      </FlowScreen>
    );
  }

  const room = rooms.find((r) => r.id === selectedRoomId) ?? rooms[0];
  const resolved = {
    destination: search.destination,
    checkIn: search.checkIn || defaultHotelSearch.checkIn,
    checkOut: search.checkOut || defaultHotelSearch.checkOut,
    guests,
    rooms: roomCount,
  };
  const nights = nightsBetween(resolved.checkIn, resolved.checkOut);
  const nightly = parsePrice(room?.pricePerNight) ?? parsePrice(hotel.price);
  const fare = nightly !== null && nights ? computeHotelFare(nightly, nights, resolved.rooms) : null;
  const gallery = hotel.gallery?.length ? hotel.gallery : [hotel.image];
  const policy = cancellationInfo(room, hotel);
  const saved = isInWishlist(hotel.id);

  const handleBook = () => {
    if (!room) { Alert.alert('Select a room', 'Please choose a room type to continue.'); return; }
    if (!nights) { Alert.alert('Select dates', 'Please choose valid check-in and check-out dates to book this stay.'); return; }
    selectHotel(hotel);
    startHotelBooking(hotel, resolved, room.id);
    goTo(HOTEL_ROUTES.guests);
  };

  return (
    <FlowScreen footer={
      <FooterBar
        caption={fare ? `${nights} night${nights > 1 ? 's' : ''} · incl. taxes` : 'per night · pick dates for total'}
        amount={fare ? inr(fare.total) : nightly !== null ? inr(nightly) : hotel.price}
        estimateAmount={fare ? fare.total : nightly ?? undefined}
        action={<PrimaryButton label="Continue" icon="arrow-forward" onPress={handleBook} />}
      />
    }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader
            title={hotel.name}
            subtitle={hotel.address ?? hotel.location}
            eyebrow="LEMONTRIP / HOTELS"
            onBack={() => goBackOr(HOTEL_ROUTES.results)}
            rightAction={{ label: saved ? 'Saved' : 'Save', icon: saved ? 'heart' : 'heart-outline', onPress: () => toggleWishlist({ id: hotel.id, name: hotel.name, image: hotel.image, price: hotel.price, category: 'Hotels', location: hotel.location }) }}
          />
          <HotelProgress current={0} />
          <StaySummary hotel={hotel} roomName={room?.name ?? 'Standard room'} checkIn={resolved.checkIn} checkOut={resolved.checkOut} nights={nights} guests={resolved.guests} rooms={resolved.rooms} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.gallery} style={{ marginBottom: 14 }}>
            {gallery.map((image, i) => <Image key={`${hotel.id}-${i}`} source={{ uri: image }} style={[s.galleryImage, gallery.length === 1 && { width: 320 }]} />)}
          </ScrollView>

          <Card>
            <SectionTitle eyebrow="ABOUT" title="About this stay" right={hotel.propertyType ? <Pill tone="brand" label={hotel.propertyType} /> : undefined} />
            <View style={s.pills}>
              {hotel.reviewScore !== undefined ? <Pill icon="star" tone="warn" label={`${hotel.reviewScore.toFixed(1)}${hotel.reviewCount !== undefined ? ` · ${hotel.reviewCount} reviews` : ''}`} /> : null}
              {hotel.distanceKm !== undefined ? <Pill icon="navigate-outline" label={`${hotel.distanceKm} km from centre`} /> : null}
            </View>
            <Text style={s.body}>{hotel.description}</Text>
          </Card>

          <Card>
            <SectionTitle eyebrow="AT THIS PROPERTY" title="Amenities" />
            <View style={s.amenities}>
              {hotel.amenities.map((a) => <View key={a} style={s.amenity}><Ionicons name="checkmark-circle-outline" size={16} color={Colors.secondary} /><Text style={s.amenityText}>{a}</Text></View>)}
            </View>
          </Card>

          <Card>
            <SectionTitle eyebrow="STEP 1" title="Choose your room" />
            {rooms.map((o) => {
              const on = o.id === room?.id;
              const p = cancellationInfo(o, hotel);
              const price = parsePrice(o.pricePerNight);
              return (
                <TouchableOpacity key={o.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setSelectedRoomId(o.id)} style={[s.option, on && s.optionOn]}>
                  <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.optionTitle}>{o.name}</Text>
                    {o.amenities?.length ? <Text style={s.optionMeta}>{o.amenities.join(' · ')}</Text> : null}
                    <View style={s.pills}>
                      {o.breakfast !== undefined ? <Pill icon={o.breakfast ? 'cafe-outline' : 'close-circle-outline'} tone={o.breakfast ? 'good' : 'neutral'} label={o.breakfast ? 'Breakfast included' : 'Room only'} /> : null}
                      <Pill icon={p.free ? 'shield-checkmark-outline' : 'alert-circle-outline'} tone={p.free ? 'good' : 'warn'} label={p.free ? 'Free cancellation' : 'Limited refund'} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.optionFare}>{price !== null ? inr(price) : o.pricePerNight}</Text>
                    <Text style={s.perNight}>per night</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </Card>

          <Card>
            <SectionTitle eyebrow="STEP 2" title="Guests & rooms" />
            <Stepper icon="people-outline" label="Guests" hint={`Up to ${MAX_GUESTS}`} value={guests} min={1} max={MAX_GUESTS} onChange={(v) => { setGuests(v); if (roomCount > v) setRoomCount(v); }} />
            <View style={s.sep} />
            <Stepper icon="bed-outline" label="Rooms" hint="At least one guest per room" value={roomCount} min={1} max={MAX_ROOMS} onChange={(v) => { setRoomCount(v); if (guests < v) setGuests(v); }} />
          </Card>

          <Card>
            <SectionTitle eyebrow="BEFORE YOU BOOK" title="Policies" />
            <Line icon="calendar-outline" label="Cancellation" value={policy.text} />
            {(room?.breakfast ?? hotel.breakfast) !== undefined ? <Line icon="cafe-outline" label="Breakfast" value={(room?.breakfast ?? hotel.breakfast) ? 'Included' : 'Not included'} /> : null}
            <Line icon="log-in-outline" label="Check-in" value="From 2:00 PM" />
            <Line icon="log-out-outline" label="Check-out" value="Until 11:00 AM" />
          </Card>

          <Card>
            <SectionTitle eyebrow="FIND YOUR WAY" title="Location" />
            <View style={s.location}>
              <View style={s.locationIcon}><Ionicons name="map-outline" size={20} color={Colors.primary} /></View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.locationAddress}>{hotel.address ?? hotel.location}</Text>
                <Text style={s.optionMeta}>{hotel.distanceKm !== undefined ? `${hotel.distanceKm} km from the city centre` : 'Distance details unavailable'}</Text>
              </View>
            </View>
          </Card>

          {hotel.reviews?.length ? (
            <Card>
              <SectionTitle eyebrow="FROM RECENT STAYS" title="Guest reviews" />
              {hotel.reviews.map((r, i) => (
                <View key={r.id} style={[s.review, i > 0 && s.reviewBorder]}>
                  <View style={s.reviewTop}><Text style={s.reviewAuthor}>{r.author}</Text><Pill icon="star" tone="warn" label={r.score.toFixed(1)} /></View>
                  <Text style={s.body}>{r.comment}</Text>
                </View>
              ))}
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Stepper({ icon, label, hint, value, min, max, onChange }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <View style={s.stepper}>
      <View style={s.stepIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View>
      <View style={{ flex: 1, minWidth: 0 }}><Text style={s.stepLabel}>{label}</Text><Text style={s.optionMeta}>{hint}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(value - 1)} style={[s.stepBtn, value <= min && { opacity: 0.4 }]}><Ionicons name="remove" size={18} color={Colors.primary} /></TouchableOpacity>
      <Text style={s.stepValue} accessibilityLabel={`${value} ${label}`}>{value}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(value + 1)} style={[s.stepBtn, value >= max && { opacity: 0.4 }]}><Ionicons name="add" size={18} color={Colors.primary} /></TouchableOpacity>
    </View>
  );
}

function Line({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue}>{value}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  gallery: { paddingHorizontal: Ui.space.page, gap: 10 },
  galleryImage: { width: 270, height: 190, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  body: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight, marginTop: 10 },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  amenity: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 8 },
  amenityText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textDark },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  optionTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  optionMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 3 },
  optionFare: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  perNight: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  stepLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  stepBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  stepValue: { minWidth: 24, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 90 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  location: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  locationAddress: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  review: { paddingVertical: 10 },
  reviewBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewAuthor: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
});