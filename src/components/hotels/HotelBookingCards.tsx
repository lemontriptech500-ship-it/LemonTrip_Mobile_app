import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { CHECK_IN_TIME, CHECK_OUT_TIME, formatShortDate, inr, type HotelFare } from '@/data/hotelBooking';
import type { Hotel } from '@/types/content';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';
import { Pill, Row } from './HotelUi';

function DateBlock({ label, date, time, align = 'left' }: { label: string; date: string; time: string; align?: 'left' | 'right' }) {
  return (
    <View style={{ alignItems: align === 'left' ? 'flex-start' : 'flex-end', minWidth: 76 }}>
      <Text style={s.code}>{label}</Text>
      <Text style={s.date}>{date ? formatShortDate(date) : '—'}</Text>
      <Text style={s.sub}>{time}</Text>
    </View>
  );
}

function StayLine({ nights }: { nights: number }) {
  return (
    <View style={s.line}>
      <Text style={s.duration}>{nights ? `${nights} night${nights > 1 ? 's' : ''}` : 'Set dates'}</Text>
      <View style={s.track}><View style={s.dotEnd} /><View style={s.rule} /><Ionicons name="bed" size={14} color={Colors.primary} /><View style={s.rule} /><View style={s.dotEnd} /></View>
    </View>
  );
}

/** Compact stay recap used on every screen of the hotel flow (the hotel equivalent of JourneySummary). */
export function StaySummary({ hotel, roomName, checkIn, checkOut, nights, guests, rooms }: {
  hotel: Hotel; roomName: string; checkIn: string; checkOut: string; nights: number; guests: number; rooms: number;
}) {
  return (
    <View style={s.summary}>
      <View style={s.summaryTop}>
        <Image source={{ uri: hotel.gallery?.[0] ?? hotel.image }} style={s.thumb} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.summaryName} numberOfLines={1}>{hotel.name}</Text>
          <Text style={s.meta} numberOfLines={1}>{roomName}  ·  {hotel.location}</Text>
        </View>
        {hotel.reviewScore !== undefined ? <Pill icon="star" tone="brand" label={hotel.reviewScore.toFixed(1)} /> : null}
      </View>
      <View style={s.times}>
        <DateBlock label="CHECK-IN" date={checkIn} time={`from ${CHECK_IN_TIME}`} />
        <StayLine nights={nights} />
        <DateBlock label="CHECK-OUT" date={checkOut} time={`until ${CHECK_OUT_TIME}`} align="right" />
      </View>
      <Text style={s.guestLine}>{guests} guest{guests > 1 ? 's' : ''}  ·  {rooms} room{rooms > 1 ? 's' : ''}</Text>
    </View>
  );
}

export function HotelFareSummary({ fare, couponCode }: { fare: HotelFare; couponCode?: string | null }) {
  return (
    <View>
      <Row label={`${inr(fare.nightly)} × ${fare.nights} night${fare.nights > 1 ? 's' : ''} × ${fare.rooms} room${fare.rooms > 1 ? 's' : ''}`} value={inr(fare.base)} />
      <Row label={`Taxes & fees (GST ${Math.round(fare.taxRate * 100)}%)`} value={inr(fare.taxes)} />
      <Row label="Convenience fee" value={inr(fare.convenience)} />
      {fare.discount > 0 ? <Row label={`Coupon ${couponCode ?? ''}`.trim()} value={`− ${inr(fare.discount)}`} tone="good" /> : null}
      <View style={s.divider} />
      <Row label="Total payable" value={inr(fare.total)} bold />
    </View>
  );
}

const s = StyleSheet.create({
  summary: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 14, padding: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  summaryName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  meta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  times: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 16 },
  code: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.secondary, letterSpacing: 0.8 },
  date: { fontFamily: FontFamily.sans, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, color: Colors.textDark, marginTop: 2 },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, color: Colors.textLight, marginTop: 1 },
  line: { flex: 1, alignItems: 'center', gap: 4 },
  duration: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  track: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'stretch' },
  rule: { flex: 1, height: 1, backgroundColor: Colors.borderStrong },
  dotEnd: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  guestLine: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, color: Colors.textLight, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
});
