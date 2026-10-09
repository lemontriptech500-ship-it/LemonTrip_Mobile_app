import { Brand, Colors, Radius } from '@/constants/colors';
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from '@/constants/support';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { useBookings } from '@/utils/bookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const FONT = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

const SHADOW = {
  shadowColor: '#0F3D2E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useBookings();
  const booking = bookings.find((item) => String(item.id) === String(id));

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings' as never);
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={Brand.lemon} />
          <Text style={styles.notFoundText}>Booking not found</Text>
          <TouchableOpacity style={styles.lemonButton} onPress={goBack}>
            <Text style={styles.lemonButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const status = statusStyles[normalizeStatus(booking.status)];
  const bookingId = shortId(booking.id);
  const hasPhone = SUPPORT_PHONE.trim().length > 0;
  const hasWhatsapp = SUPPORT_WHATSAPP.trim().length > 0;
  const canCancel = booking.status !== 'cancelled' && booking.status !== 'completed';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `LemonTrip booking ${bookingId}\n${booking.itemName}\nTotal: ${booking.price}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleCall = () => {
    if (hasPhone) Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const handleWhatsapp = () => {
    if (hasWhatsapp) Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, '')}`);
  };

  const handleCancel = () => {
    router.push({ pathname: '/booking/cancel', params: { id: String(booking.id) } } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Green header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={22} color={Brand.forest} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={Brand.forest} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eyebrowLemon}>BOOKING VOUCHER</Text>
          <Text style={styles.pageTitle}>{bookingId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon} size={13} color={status.fg} />
            <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
          </View>
        </View>

        {/* Voucher */}
        <View style={styles.voucher}>
          <View style={styles.voucherTop}>
            <View style={styles.voucherIcon}>
              <Ionicons name={serviceIcon(booking.serviceName)} size={26} color={Brand.forest} />
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.eyebrowDark} numberOfLines={1}>
                {(booking.serviceName ?? '').toUpperCase()}
              </Text>
              <Text style={styles.itemName}>{booking.itemName}</Text>
              {booking.destination ? (
                <View style={styles.destRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.destText}>{booking.destination}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.ticketDivider}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.dash} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>

          <View style={styles.detailsRow}>
            <View>
              <Text style={styles.detailLabel}>BOOKING ID</Text>
              <Text style={styles.detailValue}>{bookingId}</Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>{booking.tripDate ? 'TRIP DATE' : 'BOOKED ON'}</Text>
              <Text style={styles.detailValue}>{formatDate(booking.tripDate ?? booking.bookedAt)}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.detailLabel}>TOTAL</Text>
              <Text style={styles.price}>{booking.price}</Text>
            </View>
          </View>

          <View style={styles.qrBox}>
            <QRCode value={bookingId} size={150} color={Brand.forest} backgroundColor="#FFFFFF" />
            <Text style={styles.qrHint}>Show this QR at check-in</Text>
          </View>
        </View>

        {/* 24/7 assist */}
        <View style={styles.assistCard}>
          <View style={styles.assistHead}>
            <View style={styles.assistIcon}>
              <Ionicons name="headset-outline" size={22} color={Brand.forest} />
            </View>
            <View style={styles.assistCopy}>
              <Text style={styles.eyebrowLemon}>24/7 ASSIST</Text>
              <Text style={styles.assistTitle}>Need help with this trip?</Text>
            </View>
          </View>
          <View style={styles.assistButtons}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.assistButton, !hasPhone && styles.disabledButton]}
              onPress={handleCall}
              disabled={!hasPhone}
            >
              <Ionicons name="call-outline" size={18} color={Brand.forest} />
              <Text style={styles.assistButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.assistButton, !hasWhatsapp && styles.disabledButton]}
              onPress={handleWhatsapp}
              disabled={!hasWhatsapp}
            >
              <Ionicons name="logo-whatsapp" size={18} color={Brand.forest} />
              <Text style={styles.assistButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity accessibilityRole="button" style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color={Brand.forest} />
          <Text style={styles.shareButtonText}>Share booking</Text>
        </TouchableOpacity>

        {canCancel ? (
          <TouchableOpacity accessibilityRole="button" style={styles.cancelButton} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={18} color="#C0392B" />
            <Text style={styles.cancelButtonText}>Cancel booking</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  container: { flex: 1, backgroundColor: Brand.cream },
  content: { paddingBottom: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { color: Colors.white, fontFamily: FONT.extra, fontSize: 18 },
  lemonButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor:Brand.lemon },
  lemonButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 64,
    backgroundColor: Brand.forest,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  eyebrowDark: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.4 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 28, marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  statusText: { fontFamily: FONT.extra, fontSize: 10, letterSpacing: 0.8 },

  voucher: {
    marginTop: -40,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  voucherTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  voucherIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Brand.cream,
  },
  voucherInfo: { flex: 1, minWidth: 0 },
  itemName: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 18, lineHeight: 24, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  destText: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 13, flexShrink: 1 },

  ticketDivider: { height: 20, marginVertical: 16, marginHorizontal: -18, flexDirection: 'row', alignItems: 'center' },
  notch: { width: 20, height: 20, borderRadius: 10, backgroundColor: Brand.cream },
  notchLeft: { marginLeft: -10 },
  notchRight: { marginRight: -10 },
  dash: { flex: 1, height: 0, marginHorizontal: 8, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#D5D4CB' },

  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  detailLabel: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 9, letterSpacing: 1.2, marginBottom: 4 },
  detailValue: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },
  priceBox: { alignItems: 'flex-end' },
  price: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 20 },

  qrBox: { alignItems: 'center', marginTop: 22, gap: 10 },
  qrHint: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12 },

  assistCard: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: Brand.forest,
  },
  assistHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assistIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: Brand.lemon,
  },
  assistCopy: { flex: 1 },
  assistTitle: { color: Colors.white, fontFamily: FONT.bold, fontSize: 15, marginTop: 3 },
  assistButtons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  assistButton: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
  },
  assistButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },
  disabledButton: { opacity: 0.4 },

  shareButton: {
    minHeight: 52,
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
  },
  shareButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15 },

  cancelButton: {
    minHeight: 52,
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: '#C0392B',
    backgroundColor: Colors.white,
  },
  cancelButtonText: { color: '#C0392B', fontFamily: FONT.extra, fontSize: 15 },
});