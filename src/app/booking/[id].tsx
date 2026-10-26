import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Card, EmptyState, Notice, Pill, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from '@/constants/support';
import { Ui } from '@/constants/theme';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { downloadBookingPdf } from '@/utils/bookingPdf';
import { useBookings } from '@/utils/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;

/** Label / value row, same type scale as the My Trips cards. */
function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={s.infoRow}>
      <Text style={[s.infoLabel, bold && s.infoBold]}>{label}</Text>
      <Text style={[s.infoValue, bold && s.infoBold]}>{value}</Text>
    </View>
  );
}

/** Decorative barcode derived from the booking id (demo only). */
function Barcode({ value }: { value: string }) {
  const bars = (value + value + value).split('').map((ch, i) => ({
    w: 1 + ((ch.charCodeAt(0) + i) % 3),
    gap: 1 + ((ch.charCodeAt(0) * 7 + i) % 2),
  }));
  return (
    <View style={s.barcode} accessible={false}>
      {bars.map((b, i) => (
        <View key={i} style={{ width: b.w, height: 40, marginRight: b.gap, backgroundColor: Colors.primaryDark }} />
      ))}
    </View>
  );
}

export default function BookingDetailScreen() {
  useAppLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useBookings();
  const booking = bookings.find((item) => String(item.id) === String(id));
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/bookings' as never);
  };

  if (!booking) {
    return (
      <AppScreen edges={['top']} headerTone="light">
        <View style={s.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.topBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Booking voucher</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[s.topBtn, s.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <EmptyState
            icon="alert-circle-outline"
            title="Booking not found"
            text="We could not find this booking."
            action={<PrimaryButton label="Go back" onPress={goBack} variant="dark" />}
          />
        </ScrollView>
      </AppScreen>
    );
  }

  const normalized = normalizeStatus(booking.status);
  const status = statusStyles[normalized];
  const tone = normalized === 'cancelled' ? 'bad' : normalized === 'completed' ? 'neutral' : 'good';
  const bookingId = shortId(booking.id);
  const hasPhone = SUPPORT_PHONE.trim().length > 0;
  const hasWhatsapp = SUPPORT_WHATSAPP.trim().length > 0;
  const canCancel = normalized === 'upcoming';

  const summary = [
    'LemonTrip booking voucher',
    'Booking ID ' + bookingId,
    booking.itemName,
    booking.destination ? 'Destination: ' + booking.destination : '',
    (booking.tripDate ? 'Trip date: ' : 'Booked on: ') + formatDate(booking.tripDate ?? booking.bookedAt),
    'Total: ' + booking.price,
    'Status: ' + status.label,
  ]
    .filter(Boolean)
    .join('\n');

  const share = () => void Share.share({ title: 'LemonTrip booking ' + bookingId, message: summary });

  const download = async () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      await downloadBookingPdf({
        bookingId,
        serviceName: booking.serviceName ?? '',
        itemName: booking.itemName,
        destination: booking.destination,
        dateLabel: booking.tripDate ? 'Trip date' : 'Booked on',
        dateValue: formatDate(booking.tripDate ?? booking.bookedAt),
        price: booking.price,
        statusLabel: status.label,
      });
    } catch (error) {
      console.warn('PDF download failed:', error);
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  const call = () => {
    if (hasPhone) void Linking.openURL('tel:' + SUPPORT_PHONE);
  };
  const whatsapp = () => {
    if (hasWhatsapp) void Linking.openURL('https://wa.me/' + SUPPORT_WHATSAPP.replace(/\D/g, ''));
  };
  const cancel = () => router.push({ pathname: '/booking/cancel', params: { id: String(booking.id) } } as never);

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.topBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textDark} />
        </TouchableOpacity>
        <Text style={s.topTitle}>Booking voucher</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[s.topBtn, s.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[s.content, { marginTop: 14 }]}>

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={s.ticketIcon}>
                <Ionicons name={serviceIcon(booking.serviceName)} size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.service} numberOfLines={1}>{(booking.serviceName ?? '').toUpperCase()}</Text>
                <Text style={s.itemName}>{booking.itemName}</Text>
                {booking.destination ? (
                  <View style={s.destRow}>
                    <Ionicons name="location-outline" size={13} color={Colors.textLight} />
                    <Text style={s.destText} numberOfLines={1}>{booking.destination}</Text>
                  </View>
                ) : null}
              </View>
              <Pill label={status.label} tone={tone} icon={status.icon} />
            </View>

            <View style={s.perforation}>
              <View style={[s.notch, { left: -10 }]} />
              <View style={s.dash} />
              <View style={[s.notch, { right: -10 }]} />
            </View>

            <View style={s.ticketBottom}>
              <View style={s.qrWrap}>
                <QRCode value={bookingId} size={150} color={Colors.primaryDark} backgroundColor="#FFFFFF" />
              </View>
              <Barcode value={bookingId} />
              <Text style={s.bookingIdText}>Booking ID {bookingId}</Text>
            </View>
          </View>

          <Card style={s.cardBase}>
            <Text style={s.eyebrow}>DETAILS</Text>
            <Text style={s.cardTitle}>Booking summary</Text>
            <InfoRow label="Service" value={booking.serviceName} />
            <InfoRow label="Booking ID" value={bookingId} />
            <InfoRow label={booking.tripDate ? 'Trip date' : 'Booked on'} value={formatDate(booking.tripDate ?? booking.bookedAt)} />
            {booking.tripDate ? <InfoRow label="Booked on" value={formatDate(booking.bookedAt)} /> : null}
            <InfoRow label="Status" value={status.label} />
          </Card>

          <Card style={s.cardBase}>
            <Text style={s.eyebrow}>PAYMENT</Text>
            <Text style={s.cardTitle}>Receipt</Text>
            <InfoRow label="Total paid" value={booking.price} bold />
          </Card>

          <View style={s.actions}>
            <Action icon="share-social-outline" label="Share" onPress={share} />
            <Action
              icon="download-outline"
              label={downloading ? 'Preparing...' : 'Download'}
              onPress={() => void download()}
            />
            <Action icon="receipt-outline" label="Transactions" onPress={() => router.push('/transactions' as never)} />
          </View>

          {downloadError ? (
            <Notice icon="alert-circle-outline" tone="warn" title="Could not create PDF">
              Something went wrong while creating the PDF. Please try again, or use the Share button.
            </Notice>
          ) : null}

          <Card style={s.cardBase}>
            <Text style={s.eyebrow}>24/7 ASSIST</Text>
            <Text style={s.cardTitle}>Need help with this trip?</Text>
            <View style={s.assistRow}>
              <View style={[s.assistBtn, !hasPhone && { opacity: 0.4 }]}>
                <PrimaryButton label="Call" icon="call-outline" onPress={call} disabled={!hasPhone} variant="dark" />
              </View>
              <View style={[s.assistBtn, !hasWhatsapp && { opacity: 0.4 }]}>
                <PrimaryButton label="WhatsApp" icon="logo-whatsapp" onPress={whatsapp} disabled={!hasWhatsapp} variant="soft" />
              </View>
            </View>
          </Card>

          {canCancel ? (
            <TouchableOpacity accessibilityRole="button" style={s.cancelButton} onPress={cancel}>
              <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
              <Text style={s.cancelText}>Cancel booking</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}>
      <View style={s.actionIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  topBar: { backgroundColor: Colors.surface, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16 },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: '#103D30' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  cardBase: { marginHorizontal: 10, borderRadius: 22 },
  eyebrow: { ...Ui.eyebrow, color: Colors.secondary },
  cardTitle: { fontFamily: INTER.extrabold, fontSize: 14, color: Colors.textDark, marginTop: 3, marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 8 },
  infoLabel: { fontFamily: INTER.regular, fontSize: 12, color: Colors.textLight },
  infoValue: { fontFamily: INTER.bold, fontSize: 12, color: Colors.textDark, flexShrink: 1, textAlign: 'right' },
  infoBold: { fontFamily: INTER.extrabold, fontSize: 15, color: Colors.primaryDark },
  ticket: { ...Ui.card, marginHorizontal: 10, marginBottom: 14, padding: 16, borderRadius: 22, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  ticketIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  service: { ...Ui.eyebrow, color: Colors.secondary },
  itemName: { fontFamily: INTER.extrabold, fontSize: 14, color: Colors.textDark, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  destText: { fontFamily: INTER.regular, fontSize: 11, color: Colors.textLight, flexShrink: 1 },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 12 },
  qrWrap: { padding: 10, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 40, overflow: 'hidden', maxWidth: '100%' },
  bookingIdText: { fontFamily: INTER.bold, fontSize: 11, color: Colors.textLight, letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 10, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E3F0EA' },
  actionLabel: { fontFamily: INTER.bold, fontSize: 12, color: Colors.textDark },
  assistRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  assistBtn: { flex: 1 },
  cancelButton: { minHeight: 52, marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, borderWidth: 1.5, borderColor: Colors.error, backgroundColor: Colors.surface },
  cancelText: { fontFamily: INTER.extrabold, fontSize: 14, color: Colors.error },
});