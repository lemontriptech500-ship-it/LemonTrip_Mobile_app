import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
﻿import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, EmptyState, FlowScreen, Notice, Pill, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { SUPPORT_PHONE, SUPPORT_WHATSAPP } from '@/constants/support';
import { Ui } from '@/constants/theme';
import { formatDate, normalizeStatus, serviceIcon, shortId, statusStyles } from '@/utils/bookingFormat';
import { downloadBookingPdf } from '@/utils/bookingPdf';
import { useBookings } from '@/utils/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

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
      <FlowScreen>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ScreenHeader title="Booking voucher" eyebrow="MY TRIPS" onBack={goBack} />
          <EmptyState
            icon="alert-circle-outline"
            title="Booking not found"
            text="We could not find this booking."
            action={<PrimaryButton label="Go back" onPress={goBack} />}
          />
        </ScrollView>
      </FlowScreen>
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
    <FlowScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.content}>
          <ScreenHeader
            eyebrow="BOOKING VOUCHER"
            title={bookingId}
            subtitle="Show this voucher at check-in."
            onBack={goBack}
          />

          <View style={s.ticket}>
            <View style={s.ticketTop}>
              <View style={s.ticketIcon}>
                <Ionicons name={serviceIcon(booking.serviceName)} size={24} color={Colors.primary} />
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

          <Card>
            <SectionTitle eyebrow="DETAILS" title="Booking summary" />
            <Row label="Service" value={booking.serviceName} />
            <Row label="Booking ID" value={bookingId} />
            <Row label={booking.tripDate ? 'Trip date' : 'Booked on'} value={formatDate(booking.tripDate ?? booking.bookedAt)} />
            {booking.tripDate ? <Row label="Booked on" value={formatDate(booking.bookedAt)} /> : null}
            <Row label="Status" value={status.label} />
          </Card>

          <Card>
            <SectionTitle eyebrow="PAYMENT" title="Receipt" />
            <Row label="Total paid" value={booking.price} bold />
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

          <Card>
            <SectionTitle eyebrow="24/7 ASSIST" title="Need help with this trip?" />
            <View style={s.assistRow}>
              <View style={[s.assistBtn, !hasPhone && { opacity: 0.4 }]}>
                <PrimaryButton label="Call" icon="call-outline" onPress={call} disabled={!hasPhone} />
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
    </FlowScreen>
  );
}

function Action({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={s.action}>
      <View style={s.actionIcon}>
        <Ionicons name={icon} size={19} color={Colors.primary} />
      </View>
      <Text style={s.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  ticket: { ...Ui.card, marginHorizontal: 20, marginBottom: 14, padding: 18, overflow: 'visible' },
  ticketTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  ticketIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  service: { ...Ui.eyebrow, color: Colors.secondary },
  itemName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 3 },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  destText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, flexShrink: 1 },
  perforation: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, height: 20 },
  dash: { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  notch: { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  ticketBottom: { alignItems: 'center', gap: 12 },
  qrWrap: { padding: 10, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border },
  barcode: { flexDirection: 'row', alignItems: 'center', height: 40, overflow: 'hidden', maxWidth: '100%' },
  bookingIdText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight, letterSpacing: 0.5 },
  actions: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 14 },
  action: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  actionLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  assistRow: { flexDirection: 'row', gap: 10 },
  assistBtn: { flex: 1 },
  cancelButton: {
    minHeight: 52,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.surface,
  },
  cancelText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.error },
});
