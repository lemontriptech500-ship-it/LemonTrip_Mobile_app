import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { formatINR, getNightCount, parseNightlyPrice } from '@/components/hotels/HotelCard';
import { Colors } from '@/constants/colors';
import { mockHotels } from '@/data/mockHotels';
import { getHotelSearch, getSelectedHotel } from '@/utils/hotelSearchStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = ['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'];

export default function HotelRoomSelectionScreen() {
  const hotel = getSelectedHotel() ?? mockHotels[0] ?? null;
  const search = getHotelSearch();
  const [selectedRoomId, setSelectedRoomId] = useState(hotel?.roomOptions?.[0]?.id ?? '');

  if (!hotel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyState}>
          <Ionicons name="bed-outline" size={30} color={Colors.primary} />
          <Text style={styles.emptyTitle}>Choose a stay to continue</Text>
          <Text style={styles.emptyText}>Open a hotel first, then choose your room.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/explore/hotels')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to hotels</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const rooms = hotel.roomOptions ?? [];
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];
  const nights = getNightCount(search.checkIn, search.checkOut);
  const nightlyPrice = selectedRoom ? parseNightlyPrice(selectedRoom.pricePerNight) : null;
  const total = nightlyPrice !== null && nights ? nightlyPrice * nights : null;

  const handleContinue = () => {
    if (!selectedRoom) {
      return;
    }

    router.push({
      pathname: '/hotel-passenger-details',
      params: {
        hotelId: String(hotel.id),
        hotelName: hotel.name,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        price: total !== null ? formatINR(total) : selectedRoom.pricePerNight,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: String(search.guests),
        rooms: String(search.rooms),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Selection</Text>
        <Text style={styles.headerStep}>Step 4/7</Text>
      </View>

      <View style={styles.progressRow}>
        {steps.map((label, index) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, index <= 1 && styles.progressDotActive]}>
              <Text style={[styles.progressNumber, index <= 1 && styles.progressNumberActive]}>{index + 1}</Text>
            </View>
            <Text style={[styles.progressLabel, index === 1 && styles.progressLabelActive]}>{label}</Text>
            {index < steps.length - 1 ? <View style={[styles.progressLine, index < 1 && styles.progressLineActive]} /> : null}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.card}>
          <Image source={{ uri: hotel.image }} style={styles.image} />
          <View style={styles.cardBody}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textLight} />
              <Text style={styles.metaText}>{hotel.location}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={Colors.accent} />
              <Text style={styles.ratingText}>{hotel.reviewScore?.toFixed(1) ?? hotel.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionEyebrow}>CHOOSE YOUR ROOM</Text>
          <Text style={styles.sectionTitle}>Select a room type</Text>
        </View>

        <View style={styles.roomList}>
          {rooms.length ? (
            rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                activeOpacity={0.9}
                onPress={() => setSelectedRoomId(room.id)}
                style={[styles.roomCard, selectedRoom?.id === room.id && styles.roomCardSelected]}
              >
                <View style={styles.roomOption}>
                  <View style={styles.radioWrap}>
                    <Ionicons
                      name={selectedRoom?.id === room.id ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selectedRoom?.id === room.id ? Colors.primary : Colors.textLight}
                    />
                  </View>
                  <View style={styles.roomMeta}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    {room.amenities?.length ? <Text style={styles.roomFeatures}>{room.amenities.join(' · ')}</Text> : null}
                    {room.breakfast !== undefined ? (
                      <Text style={styles.roomPolicy}>{room.breakfast ? 'Breakfast included' : 'Breakfast not included'}</Text>
                    ) : null}
                    {room.cancellation ? <Text style={styles.roomPolicy}>{room.cancellation}</Text> : null}
                  </View>
                  <Text style={styles.roomPrice}>{room.pricePerNight}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.unavailableBox}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.textLight} />
              <Text style={styles.unavailableText}>Room availability details are not available for this stay.</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Booking summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Stay</Text>
            <Text style={styles.summaryValue}>{search.checkIn || '—'} to {search.checkOut || '—'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Guests</Text>
            <Text style={styles.summaryValue}>{search.guests || 2} guests · {search.rooms || 1} room</Text>
          </View>
          <View style={styles.summaryRowTotal}>
            <Text style={styles.summaryTotalText}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total !== null ? formatINR(total) : selectedRoom?.pricePerNight ?? 'Price unavailable'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  headerStep: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 10 },
  progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  progressDotActive: { backgroundColor: Colors.primary },
  progressNumber: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  progressNumberActive: { color: Colors.white },
  progressLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 5 },
  progressLabelActive: { color: Colors.primary, fontWeight: FontWeight.extraBold },
  progressLine: { position: 'absolute', top: 12, left: '60%', right: '-40%', height: 1, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.primary },
  page: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, shadowColor: '#0d382b', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  image: { width: '100%', height: 170, backgroundColor: Colors.surfaceMuted },
  cardBody: { padding: 16 },
  hotelName: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  metaText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  ratingText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  sectionTitleRow: { marginTop: 24 },
  sectionEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 5 },
  roomList: { marginTop: 12, gap: 10 },
  roomCard: { padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  roomCardSelected: { borderColor: Colors.primary, backgroundColor: '#f3faf6' },
  roomOption: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioWrap: { width: 22, alignItems: 'center', justifyContent: 'center' },
  roomMeta: { flex: 1 },
  roomName: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  roomFeatures: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 4 },
  roomPolicy: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, marginTop: 3 },
  roomPrice: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  unavailableBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  unavailableText: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, lineHeight: 15 },
  summaryCard: { marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  summaryLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  summaryText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  summaryValue: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  summaryRowTotal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  summaryTotalText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  summaryTotalValue: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, backgroundColor: Colors.surface },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 12 },
  emptyText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, lineHeight: 16, textAlign: 'center', marginTop: 6 },
});
