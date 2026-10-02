import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import type { Hotel } from '@/types/content';
import type { HotelSearchCriteria } from '@/utils/hotelSearchStore';

type HotelCardProps = {
  hotel: Hotel;
  search: HotelSearchCriteria;
  onPress: (hotel: Hotel) => void;
};

function getNightCount(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return null;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  return nights > 0 ? nights : null;
}

function parseNightlyPrice(price: string) {
  const match = price.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : null;
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function HotelCard({ hotel, search, onPress }: HotelCardProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 820;
  const nights = getNightCount(search.checkIn, search.checkOut);
  const nightly = parseNightlyPrice(hotel.price);
  const total = nights && nightly !== null ? nightly * nights : null;

  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.92} onPress={() => onPress(hotel)} style={[styles.card, desktop && styles.cardDesktop]}>
      <Image source={{ uri: hotel.image }} style={[styles.image, desktop && styles.imageDesktop]} />
      <View style={styles.imageBadge}><Text style={styles.imageBadgeText}>{hotel.propertyType ?? hotel.rating}</Text></View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={2}>{hotel.name}</Text>
            <View style={styles.locationRow}><Ionicons name="location-outline" size={13} color={Colors.textLight} /><Text style={styles.location} numberOfLines={1}>{hotel.location}</Text></View>
          </View>
          {hotel.reviewScore !== undefined ? (
            <View style={styles.reviewScore}><Ionicons name="star" size={13} color={Colors.accent} /><Text style={styles.score}>{hotel.reviewScore.toFixed(1)}</Text></View>
          ) : null}
        </View>

        <View style={styles.amenities}>
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <View key={amenity} style={styles.amenity}><Text style={styles.amenityText} numberOfLines={1}>{amenity}</Text></View>
          ))}
          {hotel.amenities.length > 3 ? <Text style={styles.moreAmenities}>+{hotel.amenities.length - 3}</Text> : null}
        </View>

        <View style={styles.roomInfo}>
          <Ionicons name="bed-outline" size={14} color={Colors.textLight} />
          <Text style={styles.roomText}>{hotel.roomOptions?.[0]?.name ?? 'Room details unavailable'}</Text>
          {hotel.cancellation || hotel.roomOptions?.[0]?.cancellation ? (
            <Text style={styles.cancelText}>Free cancellation</Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.price}>{hotel.price}</Text>
            {total !== null ? (
              <Text style={styles.total}>Total {formatINR(total)} · {nights} {nights === 1 ? 'night' : 'nights'}</Text>
            ) : (
              <Text style={styles.total}>Per night · dates to calculate total</Text>
            )}
          </View>
          <View style={styles.viewButton}><Text style={styles.viewButtonText}>View stay</Text><Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} /></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export { getNightCount, parseNightlyPrice, formatINR };

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: 17, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  cardDesktop: { flexDirection: 'row', minHeight: 214 },
  image: { width: '100%', height: 205, backgroundColor: Colors.surfaceMuted },
  imageDesktop: { width: 270, height: '100%', minHeight: 214 },
  imageBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: Colors.white },
  imageBadgeText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  content: { flex: 1, minWidth: 0, padding: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleBlock: { flex: 1, minWidth: 0 },
  name: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, lineHeight: 19, fontWeight: '800' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  location: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9 },
  reviewScore: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.primaryDark },
  score: { color: Colors.white, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  amenities: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  amenity: { maxWidth: 108, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.background },
  amenityText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  moreAmenities: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  roomInfo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 11 },
  roomText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700' },
  cancelText: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  bottomRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  priceBlock: { flex: 1, minWidth: 0 },
  price: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' },
  total: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 3 },
  viewButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 10, borderRadius: 9, backgroundColor: Colors.accent },
  viewButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
});