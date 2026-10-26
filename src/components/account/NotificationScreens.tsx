import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
// Same slightly smaller type scale as Explore.
const TextSize = { micro: 10, caption: 11, body: 13, bodyLarge: 14, title: 16, heading: 18, displaySmall: 20, display: 24 } as const;
import { Text } from '@/components/ui/Text';
import { BrandedPage, BRAND, INTER } from '@/components/account/BrandedPage';
import { Colors } from '@/constants/colors';
import type { AccountBooking } from '@/utils/accountBookings';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

// Banner artwork lives in assets/images (file name as saved in the project).
const BELL_BANNER = require('../../../assets/images/Glossy Travel Alert Bell and Airplane.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export type UpdateKey = 'bookings' | 'offers' | 'emails';

const updateLabels: Record<UpdateKey, { title: string; detail: string; icon: IconName }> = {
  bookings: { title: 'Booking updates', detail: 'Changes to your trips', icon: 'calendar-outline' },
  offers: { title: 'Offers and inspiration', detail: 'Handpicked deals and ideas', icon: 'pricetag-outline' },
  emails: { title: 'Email updates', detail: 'News and account messages', icon: 'mail-outline' },
};

const formatTripDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function NotificationsScreen({ bookings, loading, error }: { bookings: AccountBooking[]; loading: boolean; error: string }) {
  useAppLanguage();
  const go = (href: Href) => router.push(href);
  return (
    <BrandedPage promo={{ title: 'Stay in the loop', text: 'Updates about your journeys, all in one place.' }} banner={BELL_BANNER} title="Notifications" subtitle="Made for the way you travel." eyebrow="LEMONTRIP / ACCOUNT">
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notification settings" onPress={() => go('/manage/notification-settings' as Href)} activeOpacity={0.85} style={s.settingsCard}>
        <View style={s.squareIcon}><Ionicons name="options-outline" size={24} color={BRAND} /></View>
        <View style={s.flex}>
          <Text style={s.rowTitle}>Notification settings</Text>
          <Text style={s.rowDetail}>Choose which updates you receive</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </TouchableOpacity>

      {bookings.length ? (
        <View style={s.card}>
          <Text style={s.cardEyebrow}>YOUR TRIPS</Text>
          <Text style={s.cardTitle}>Trip updates</Text>
          {bookings.map((booking, index) => {
            const when = formatTripDate(booking.tripDate ?? booking.bookedAt);
            return (
              <TouchableOpacity key={booking.id} accessibilityRole="button" onPress={() => go({ pathname: '/booking/[id]', params: { id: booking.id } } as Href)} activeOpacity={0.75} style={[s.trip, index < bookings.length - 1 && s.divider]}>
                <View style={s.squareIcon}><Ionicons name="airplane-outline" size={22} color={BRAND} /></View>
                <View style={s.flex}>
                  <Text style={s.rowTitle} numberOfLines={2}>{booking.itemName}</Text>
                  <Text style={s.rowDetail} numberOfLines={1}>{[capitalise(booking.status ?? 'Booking update'), when].filter(Boolean).join(' · ')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={s.empty}>
          <View style={s.emptyIcon}>{loading ? <ActivityIndicator color={BRAND} /> : <Ionicons name="notifications-outline" size={32} color={BRAND} />}</View>
          <Text style={s.emptyTitle}>{loading ? 'Loading trip updates…' : 'You’re all caught up'}</Text>
          <Text style={s.emptyText}>{error || 'Trip updates will appear here as your bookings progress.'}</Text>
        </View>
      )}
    </BrandedPage>
  );
}

export function NotificationSettingsScreen({ updates, onChange, error }: { updates: Record<UpdateKey, boolean>; onChange: (key: UpdateKey, value: boolean) => void; error?: string | null }) {
  useAppLanguage();
  const keys = Object.keys(updateLabels) as UpdateKey[];
  return (
    <BrandedPage promo={{ title: 'Make it yours', text: 'Choose which updates you want to receive.' }} banner={BELL_BANNER} title="Notification settings" subtitle="Made for the way you travel." eyebrow="LEMONTRIP / ACCOUNT">
      <View style={s.card}>
        <Text style={s.cardEyebrow}>STAY INFORMED</Text>
        <Text style={s.cardTitle}>Choose your updates</Text>
        {keys.map((key, index) => {
          const label = updateLabels[key];
          return (
            <TouchableOpacity key={key} accessibilityRole="button" onPress={() => onChange(key, !updates[key])} activeOpacity={0.75} style={[s.trip, index < keys.length - 1 && s.divider]}>
              <View style={s.squareIcon}><Ionicons name={label.icon} size={22} color={BRAND} /></View>
              <View style={s.flex}>
                <Text style={s.rowTitle}>{label.title}</Text>
                <Text style={s.rowDetail}>{label.detail}</Text>
              </View>
              <Switch accessibilityLabel={label.title} value={updates[key]} onValueChange={(value) => onChange(key, value)} trackColor={{ false: Colors.borderStrong, true: Colors.secondary }} thumbColor={updates[key] ? Colors.accent : Colors.white} />
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View accessibilityRole="alert" style={[s.notice, { backgroundColor: Colors.errorSoft }]}>
          <View style={s.noticeIcon}><Ionicons name="alert-circle" size={22} color={Colors.error} /></View>
          <Text style={[s.noticeText, { color: Colors.error }]}>{error}</Text>
        </View>
      ) : null}
      <View style={s.notice}>
        <View style={s.noticeIcon}><Ionicons name="information-circle-outline" size={22} color={BRAND} /></View>
        <Text style={s.noticeText}>Your preferences are saved on this device. Delivery settings can be applied when account notifications are connected.</Text>
      </View>
    </BrandedPage>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsCard: { marginHorizontal: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  squareIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  rowTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  rowDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },

  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardEyebrow: { fontFamily: INTER.extrabold, color: Colors.secondary, fontSize: TextSize.micro, letterSpacing: 1.2 },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginTop: 4, marginBottom: 6 },
  trip: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },

  empty: { marginHorizontal: 16, alignItems: 'center', padding: 24, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 38, backgroundColor: Colors.surfaceMuted },
  emptyTitle: { marginTop: 14, color: BRAND, fontFamily: INTER.extrabold, fontSize: TextSize.bodyLarge, textAlign: 'center' },
  emptyText: { marginTop: 6, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, textAlign: 'center' },

  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 14, borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  noticeIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.white },
  noticeText: { flex: 1, fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 18 },
});
