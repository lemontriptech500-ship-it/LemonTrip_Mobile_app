import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { defaultHotelSearch, mockHotels } from '@/data/mockHotels';
import { getHotelSearch, getSelectedHotel, selectHotel } from '@/utils/hotelSearchStore';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { formatINR, getNightCount, parseNightlyPrice } from './HotelCard';

export default function HotelDetailsScreen() {
  useWishlist();
  const hotel = getSelectedHotel() ?? mockHotels[0] ?? null;
  const search = getHotelSearch();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [selectedRoomId, setSelectedRoomId] = useState(hotel?.roomOptions?.[0]?.id ?? null);
  const booked = false;
  const nights = getNightCount(search.checkIn, search.checkOut);
  const selectedRoom = hotel?.roomOptions?.find((room) => room.id === selectedRoomId);
  const selectedNightlyPrice = hotel ? selectedRoom?.pricePerNight ?? hotel.price : '';
  const nightlyPrice = hotel ? parseNightlyPrice(selectedNightlyPrice) : null;
  const total = nightlyPrice !== null && nights ? nightlyPrice * nights : null;

const handleBook = () => {
  const activeHotel = getSelectedHotel();
  const activeSearch = getHotelSearch();

  if (!activeHotel) {
    Alert.alert('Select a stay', 'Please choose a hotel before continuing.');
    return;
  }

  const fallbackRoom = activeHotel.roomOptions?.[0];
  const roomToUse = selectedRoom ?? fallbackRoom;

  if (!roomToUse) {
    Alert.alert('Select a room', 'Please choose a room type to continue.');
    return;
  }

  const resolvedCheckIn = activeSearch.checkIn || defaultHotelSearch.checkIn;
  const resolvedCheckOut = activeSearch.checkOut || defaultHotelSearch.checkOut;
  const resolvedGuests = activeSearch.guests || defaultHotelSearch.guests;
  const resolvedRooms = activeSearch.rooms || defaultHotelSearch.rooms;

  const updatedSearch = {
    ...activeSearch,
    checkIn: resolvedCheckIn,
    checkOut: resolvedCheckOut,
    guests: resolvedGuests,
    rooms: resolvedRooms,
  };

  const finalHotel = { ...activeHotel, roomOptions: activeHotel.roomOptions ?? [roomToUse] };
  selectHotel(finalHotel);

  const finalNights = getNightCount(updatedSearch.checkIn, updatedSearch.checkOut);
  if (!updatedSearch.checkIn || !updatedSearch.checkOut || !finalNights) {
    Alert.alert('Select dates', 'Please choose valid check-in and check-out dates to book this stay.');
    return;
  }

  setSelectedRoomId(roomToUse.id);
  router.push('/hotel-room-selection');
};


  if (!hotel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <TravelArtworkIcon name="hotel" size={44} />
          <Text style={styles.notFoundTitle}>Choose a stay to continue</Text>
          <Text style={styles.notFoundText}>Return to hotel search and open a property to see its details.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/explore/hotels')} style={styles.backButton}><Text style={styles.backButtonText}>Search hotels</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const gallery = hotel.gallery?.length ? hotel.gallery : [hotel.image];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.brandBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backCapsule}>
              <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
            </TouchableOpacity>
            <View style={styles.brandBlock}>
              <View style={styles.brandMark} />
              <Text style={styles.brandText}>LemonTrip</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleWishlist({ id: hotel.id, name: hotel.name, image: hotel.image, price: hotel.price, category: 'Hotels', location: hotel.location })}
              style={styles.saveCapsule}
            >
              <Ionicons name={isInWishlist(hotel.id) ? 'heart' : 'heart-outline'} size={16} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchChipBar}>
            <View style={styles.searchChip}><Ionicons name="location-outline" size={13} color={Colors.primary} /><Text style={styles.searchChipText}>Manali</Text></View>
            <View style={styles.searchChip}><Ionicons name="calendar-outline" size={13} color={Colors.primary} /><Text style={styles.searchChipText}>{search.checkIn ?? '15-17 Oct'}</Text></View>
            <View style={styles.searchChip}><Ionicons name="people-outline" size={13} color={Colors.primary} /><Text style={styles.searchChipText}>{search.guests || 2} guests</Text></View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {gallery.map((image, index) => (
              <Image key={`${hotel.id}-gallery-${index}`} source={{ uri: image }} style={[styles.galleryImage, gallery.length === 1 && styles.singleImage, gallery.length === 1 && { width: Math.min(width, 1120) - 32 }]} />
            ))}
          </ScrollView>

          <View style={[styles.detailsLayout, desktop && styles.detailsLayoutDesktop]}>
            <View style={styles.mainColumn}>
              <View style={styles.titleBlock}>
                <View style={styles.titleRow}>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <View style={styles.propertyBadge}><Text style={styles.propertyBadgeText}>{hotel.propertyType ?? hotel.rating}</Text></View>
                </View>
                <View style={styles.locationRow}><Ionicons name="location-outline" size={15} color={Colors.textLight} /><Text style={styles.location}>{hotel.address ?? hotel.location}</Text></View>
                {hotel.reviewScore !== undefined ? (
                  <View style={styles.reviewsSummary}><Ionicons name="star" size={14} color={Colors.accent} /><Text style={styles.reviewScore}>{hotel.reviewScore.toFixed(1)}</Text><Text style={styles.reviewCount}>{hotel.reviewCount !== undefined ? `· ${hotel.reviewCount} reviews` : ''}</Text></View>
                ) : null}
                <Text style={styles.description}>{hotel.description}</Text>
              </View>

              <Section title="Amenities" eyebrow="AT THIS PROPERTY">
                <View style={styles.amenitiesGrid}>
                  {hotel.amenities.map((amenity) => <View key={amenity} style={styles.amenityItem}><Ionicons name="checkmark-circle-outline" size={16} color={Colors.secondary} /><Text style={styles.amenityText}>{amenity}</Text></View>)}
                </View>
              </Section>

              <Section title="Room options" eyebrow="CHOOSE YOUR STAY">
                {hotel.roomOptions?.length ? (
                  <View style={styles.roomList}>
                    {hotel.roomOptions.map((room) => (
                      <TouchableOpacity key={room.id} onPress={() => setSelectedRoomId(room.id)} style={[styles.roomCard, selectedRoomId === room.id && styles.roomCardSelected]}>
                        <View style={styles.roomSelectIcon}><Ionicons name={selectedRoomId === room.id ? 'radio-button-on' : 'radio-button-off'} size={18} color={selectedRoomId === room.id ? Colors.primary : Colors.textLight} /></View>
                        <View style={styles.roomCopy}>
                          <Text style={styles.roomName}>{room.name}</Text>
                          {room.amenities?.length ? <Text style={styles.roomAmenities}>{room.amenities.join(' · ')}</Text> : null}
                          {room.cancellation ? <Text style={styles.roomPolicy}>{room.cancellation}</Text> : null}
                          {room.breakfast !== undefined ? <Text style={styles.roomPolicy}>{room.breakfast ? 'Breakfast included' : 'Breakfast not included'}</Text> : null}
                        </View>
                        <Text style={styles.roomPrice}>{room.pricePerNight}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Unavailable text="Room types and live availability were not supplied for this property." />
                )}
              </Section>

              <Section title="Policies" eyebrow="BEFORE YOU BOOK">
                {hotel.cancellation ? <InfoRow icon="calendar-outline" label="Cancellation" value={hotel.cancellation} /> : <Unavailable text="Cancellation policy was not provided." />}
                {hotel.roomOptions?.[0]?.breakfast !== undefined || hotel.breakfast !== undefined ? <InfoRow icon="cafe-outline" label="Breakfast" value={(hotel.roomOptions?.[0]?.breakfast ?? hotel.breakfast) ? 'Included' : 'Not included'} /> : null}
              </Section>

              <Section title="Location" eyebrow="FIND YOUR WAY">
                <View style={styles.locationPanel}>
                  <View style={styles.locationIcon}><Ionicons name="map-outline" size={20} color={Colors.primary} /></View>
                  <View style={styles.locationCopy}><Text style={styles.locationAddress}>{hotel.address ?? hotel.location}</Text><Text style={styles.locationNote}>{hotel.distanceKm !== undefined ? `${hotel.distanceKm} km from the city centre` : 'Map and distance details unavailable'}</Text></View>
                </View>
              </Section>

              {hotel.reviews?.length ? (
                <Section title="Guest reviews" eyebrow="FROM RECENT STAYS">
                  {hotel.reviews.map((review) => <View key={review.id} style={styles.reviewCard}><View style={styles.reviewTop}><Text style={styles.reviewAuthor}>{review.author}</Text><View style={styles.reviewRating}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.reviewRatingText}>{review.score.toFixed(1)}</Text></View></View><Text style={styles.reviewComment}>{review.comment}</Text></View>)}
                </Section>
              ) : null}
            </View>

            {desktop ? (
              <View style={styles.summaryColumn}>
                <BookingSummary
                  hotelName={hotel.name}
                  nightlyPrice={selectedNightlyPrice}
                  nights={nights}
                  total={total}
                  checkIn={search.checkIn}
                  checkOut={search.checkOut}
                  guests={search.guests}
                  rooms={search.rooms}
                  booked={booked}
                  onBook={handleBook}
                />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {!desktop ? (
        <View style={styles.mobileBookingBar}>
          <View style={styles.mobilePriceBlock}><Text style={styles.mobilePrice}>{total !== null ? formatINR(total) : hotel.price}</Text><Text style={styles.mobilePriceLabel}>{total !== null ? `${nights} nights total` : 'per night · dates optional'}</Text></View>
          <TouchableOpacity onPress={handleBook} style={[styles.bookButton, booked && styles.bookedButton]}><Text style={styles.bookButtonText}>{booked ? 'View cart' : 'Book stay'}</Text></TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionEyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionBody}>{children}</View></View>;
}

function Unavailable({ text }: { text: string }) {
  return <View style={styles.unavailable}><Ionicons name="information-circle-outline" size={16} color={Colors.textLight} /><Text style={styles.unavailableText}>{text}</Text></View>;
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return <View style={styles.infoRow}><View style={styles.infoIcon}><Ionicons name={icon} size={16} color={Colors.primary} /></View><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function BookingSummary({
  hotelName,
  nightlyPrice,
  nights,
  total,
  checkIn,
  checkOut,
  guests,
  rooms,
  booked,
  onBook,
}: {
  hotelName: string;
  nightlyPrice: string;
  nights: number | null;
  total: number | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  booked: boolean;
  onBook: () => void;
}) {
  const numericNightly = parseNightlyPrice(nightlyPrice);
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryEyebrow}>YOUR STAY</Text>
      <Text style={styles.summaryHotel} numberOfLines={2}>{hotelName}</Text>
      <View style={styles.summaryDates}><Ionicons name="calendar-outline" size={15} color={Colors.textLight} /><Text style={styles.summaryDateText}>{checkIn && checkOut ? `${checkIn} – ${checkOut}` : 'Select dates to see your total'}</Text></View>
      <View style={styles.summaryDates}><Ionicons name="people-outline" size={15} color={Colors.textLight} /><Text style={styles.summaryDateText}>{guests} guests · {rooms} {rooms === 1 ? 'room' : 'rooms'}</Text></View>
      <View style={styles.priceBreakdown}>
        <View style={styles.priceRow}><Text style={styles.priceLabel}>{nightlyPrice} × {nights ?? '—'} nights</Text><Text style={styles.priceValue}>{numericNightly !== null && nights ? formatINR(numericNightly * nights) : '—'}</Text></View>
        <View style={[styles.priceRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{total !== null ? formatINR(total) : 'Dates required'}</Text></View>
      </View>
      <Text style={styles.summaryNote}>Taxes and fees are not itemized in the available listing.</Text>
      <TouchableOpacity onPress={onBook} style={[styles.bookButton, booked && styles.bookedButton]}><Text style={styles.bookButtonText}>{booked ? 'View cart' : 'Book this stay'}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f3' },
  scroll: { flex: 1 },
  page: { paddingBottom: 28 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  brandBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 10, paddingHorizontal: 8, paddingVertical: 10, borderRadius: 18, backgroundColor: '#0d382b', shadowColor: '#0d382b', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  backCapsule: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.white },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandMark: { width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.accent },
  brandText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  saveCapsule: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.white },
  searchChipBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 12, marginBottom: 8 },
  searchChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  searchChipText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  gallery: { paddingHorizontal: 16, gap: 8 },
  galleryImage: { width: 265, height: 205, borderRadius: 15, backgroundColor: Colors.surfaceMuted },
  singleImage: { width: '100%', height: 250 },
  detailsLayout: { marginTop: 7 },
  detailsLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start', gap: 23 },
  mainColumn: { flex: 1, minWidth: 0 },
  titleBlock: { paddingHorizontal: 16, paddingTop: 18 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  hotelName: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, lineHeight: 26, fontWeight: FontWeight.extraBold },
  propertyBadge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: Colors.accentSoft },
  propertyBadgeText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  location: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  reviewsSummary: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  reviewScore: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  reviewCount: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  description: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 12 },
  section: { marginHorizontal: Ui.space.page, marginTop: 22 },
  sectionEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 3 },
  sectionBody: { marginTop: 10 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { width: '46%', minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 6 },
  amenityText: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  roomList: { gap: 8 },
  roomCard: { ...Ui.card, flexDirection: 'row', alignItems: 'center', gap: 9, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  roomCardSelected: { borderColor: Colors.primary },
  roomSelectIcon: { width: 22 },
  roomCopy: { flex: 1, minWidth: 0 },
  roomName: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  roomAmenities: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 4 },
  roomPolicy: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, marginTop: 3 },
  roomPrice: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  unavailable: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 11, borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  unavailableText: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19 },
  infoRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoIcon: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: Colors.accentSoft },
  infoLabel: { width: 88, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  infoValue: { flex: 1, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  locationPanel: { ...Ui.card, flexDirection: 'row', alignItems: 'center', gap: 10, padding: Ui.space.card, borderRadius: Ui.radius.card, backgroundColor: Colors.surface },
  locationIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  locationCopy: { flex: 1 },
  locationAddress: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  locationNote: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 3 },
  reviewCard: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewAuthor: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewRatingText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  reviewComment: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 5 },
  summaryColumn: { width: 310, marginHorizontal: 0, marginTop: 21, marginRight: 16, position: 'sticky' as 'relative', top: 14 },
  summaryCard: { ...Ui.card, padding: Ui.space.card, borderRadius: Ui.radius.card, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  summaryEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  summaryHotel: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 18, fontWeight: FontWeight.extraBold, marginTop: 5 },
  summaryDates: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  summaryDateText: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  priceBreakdown: { marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  priceRow: { minHeight: 29, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  priceLabel: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  priceValue: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.bold },
  totalRow: { minHeight: 40, marginTop: 5, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  totalValue: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  summaryNote: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  bookButton: { minWidth: 132, paddingHorizontal: 20, minHeight: Ui.button.minHeight, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: Ui.radius.button, backgroundColor: Colors.accent },
  bookedButton: { backgroundColor: Colors.success },
  bookButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  mobileBookingBar: { minHeight: 67, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobilePriceBlock: { flex: 1 },
  mobilePrice: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  mobilePriceLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 2 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 11 },
  notFoundText: { maxWidth: 290, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, textAlign: 'center', marginTop: 5 },
  backButton: { minHeight: 44,  marginTop: 13, paddingHorizontal: 13, paddingVertical: 9, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  backButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});