import { SupportButton, SupportCard, SupportField, SupportHeading, SupportItem, SupportNotice, SupportPage, goTo } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { travelServices } from '@/constants/navigation';
import { Ui } from '@/constants/theme';
import { useAccountBookings } from '@/utils/accountBookings';
import { useAuth } from '@/utils/authStore';
import { featureRequest } from '@/utils/featureApi';
import { isSearch, isTraveller, usePersonalItems, type SavedTraveller } from '@/utils/personalStore';
import { usePreferences } from '@/utils/preferencesStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Note = { text: string; tone: 'good' | 'error' } | null;

const titles: Record<string, string> = { travellers: 'Saved travellers', 'saved-searches': 'Saved searches', 'recent-searches': 'Recent searches', notifications: 'Notifications', 'notification-settings': 'Notification settings', security: 'Security', language: 'Language', currency: 'Currency', 'edit-profile': 'Edit profile', 'personal-information': 'Personal information', about: 'About LemonTrip', search: 'Find your next journey', 'account-setup': 'Complete your profile', 'reset-password': 'Reset password', 'otp-verification': 'Verify your phone' };

const updateLabels = {
  bookings: { title: 'Booking updates', detail: 'Changes to your trips', icon: 'calendar-outline' },
  offers: { title: 'Offers and inspiration', detail: 'Handpicked deals and ideas', icon: 'pricetag-outline' },
  emails: { title: 'Email updates', detail: 'News and account messages', icon: 'mail-outline' },
} as const;

export default function ManageScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const user = useAuth();
  const accountBookings = useAccountBookings(section === 'notifications');
  const bookings = accountBookings.bookings;
  const travellerStore = usePersonalItems('travellers', isTraveller);
  const searchStore = usePersonalItems('saved-searches', isSearch);
  const recentStore = usePersonalItems('recent-searches', isSearch);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [note, setNote] = useState<Note>(null);
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' });
  const preferences = usePreferences();
  const { language, currency } = preferences.value;
  const updates = { bookings: preferences.value.bookings, offers: preferences.value.offers, emails: preferences.value.emails };

  const saveTraveller = async () => {
    if (!firstName.trim() || !lastName.trim()) { setNote({ text: 'Add both names as shown on the traveller’s identity document.', tone: 'error' }); return; }
    const item: SavedTraveller = { id: editing ?? `traveller-${Date.now()}`, firstName: firstName.trim(), lastName: lastName.trim() };
    const next = editing ? travellerStore.items.map((old) => (old.id === editing ? item : old)) : [...travellerStore.items, item];
    if (await travellerStore.save(next)) { setFirstName(''); setLastName(''); setEditing(null); setNote({ text: 'Traveller saved on this device.', tone: 'good' }); }
  };

  const saveProfile = async () => {
    if (!profile.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) { setNote({ text: 'Enter your name and a valid email.', tone: 'error' }); return; }
    try {
      await featureRequest(process.env.EXPO_PUBLIC_ACCOUNT_API_URL, '/profile', { method: 'PATCH', body: profile });
      setNote({ text: 'Your profile update was received.', tone: 'good' });
    } catch (cause) {
      setNote({ text: cause instanceof Error ? cause.message : 'Profile updates are unavailable.', tone: 'error' });
    }
  };

  const searches = section === 'recent-searches' ? recentStore : searchStore;
  const visibleServices = travelServices.filter((service) => `${service.title} ${service.description}`.toLowerCase().includes(query.toLowerCase()));
  const optionList = section === 'language' ? ['English'] : ['INR', 'USD', 'EUR', 'GBP'];
  const selectedOption = section === 'language' ? language : currency;

  let content: ReactNode;
  if (section === 'travellers') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow={editing ? 'EDITING' : 'NEW TRAVELLER'} title={editing ? 'Edit traveller' : 'Add a traveller'} />
          <Text style={s.body}>Save names on this device for easier booking. Use the name on the traveller’s identity document.</Text>
          <View style={s.gap} />
          <SupportField label="First name" placeholder="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <SupportField label="Last name" placeholder="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          <SupportButton label={editing ? 'Save changes' : 'Save traveller'} icon="checkmark" onPress={() => void saveTraveller()} />
          {editing ? <><View style={s.gap} /><SupportButton variant="soft" label="Cancel" onPress={() => { setEditing(null); setFirstName(''); setLastName(''); }} /></> : null}
        </SupportCard>
        {travellerStore.items.length ? (
          <SupportCard>
            <SupportHeading eyebrow="ON THIS DEVICE" title="Saved travellers" />
            {travellerStore.items.map((item, index) => (
              <SupportItem
                key={item.id}
                icon="person-outline"
                title={`${item.firstName} ${item.lastName}`}
                detail="Tap to edit"
                last={index === travellerStore.items.length - 1}
                onPress={() => { setEditing(item.id); setFirstName(item.firstName); setLastName(item.lastName); setNote(null); }}
                trailing={<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.firstName} ${item.lastName}`} hitSlop={8} onPress={() => void travellerStore.save(travellerStore.items.filter((old) => old.id !== item.id))} style={s.iconButton}><Ionicons name="trash-outline" size={17} color={Colors.error} /></TouchableOpacity>}
              />
            ))}
          </SupportCard>
        ) : null}
        {travellerStore.error ? <SupportNotice tone="error">{travellerStore.error}</SupportNotice> : null}
      </>
    );
  } else if (section === 'saved-searches' || section === 'recent-searches') {
    content = searches.items.length ? (
      <>
        {searches.items.map((item) => (
          <SupportCard key={item.id}>
            <SupportHeading eyebrow={item.service.toUpperCase()} title={item.label} />
            <SupportButton label="Search again" icon="search-outline" onPress={() => { const service = travelServices.find((service) => service.shortTitle.toLowerCase() === item.service.toLowerCase()); if (service) router.push({ pathname: typeof service.route === 'string' ? service.route as '/(tabs)/explore/flights' : '/services', params: item.service.toLowerCase() === 'flights' ? { search: item.query } : { query: item.query } }); }} />
            <View style={s.buttonRow}>
              {section === 'recent-searches' ? <View style={s.flex}><SupportButton variant="soft" label="Save search" onPress={() => void searchStore.save([item, ...searchStore.items.filter((old) => old.query !== item.query)])} /></View> : null}
              <View style={s.flex}><SupportButton variant="outline" label="Remove" onPress={() => void searches.save(searches.items.filter((old) => old.id !== item.id))} /></View>
            </View>
          </SupportCard>
        ))}
      </>
    ) : (
      <EmptyCard icon="search-outline" title={section === 'recent-searches' ? 'Start with a new journey' : 'Your favourite searches belong here'} copy="Recent searches can be saved and repeated from this device." action="Search travel services" onPress={() => goTo('/manage/search')} />
    );
  } else if (section === 'search') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow="START HERE" title="What are you planning?" />
          <SupportField label="Search" placeholder="Flights, hotels, rail, holidays…" value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} />
        </SupportCard>
        <SupportCard>
          <SupportHeading eyebrow="TRAVEL SERVICES" title="Choose a service" />
          {visibleServices.map((service, index) => (
            <SupportItem key={service.title} icon={service.icon} title={service.title} detail={service.description} last={index === visibleServices.length - 1} onPress={() => router.push(service.route)} />
          ))}
          {!visibleServices.length ? <Text style={s.body}>No matching service. Try another search.</Text> : null}
        </SupportCard>
        <SupportCard>
          <SupportItem icon="bookmark-outline" title="Saved searches" detail="Repeat a search in one tap" onPress={() => goTo('/manage/saved-searches')} last />
        </SupportCard>
      </>
    );
  } else if (section === 'notifications') {
    content = (
      <>
        <SupportCard>
          <SupportItem icon="options-outline" title="Notification settings" detail="Choose which updates you receive" onPress={() => goTo('/manage/notification-settings')} last />
        </SupportCard>
        {bookings.length ? (
          <SupportCard>
            <SupportHeading eyebrow="YOUR TRIPS" title="Trip updates" />
            {bookings.map((booking, index) => (
              <SupportItem key={booking.id} icon="airplane-outline" title={booking.itemName} detail={`${booking.status ?? 'Booking update'} · ${booking.tripDate ?? booking.bookedAt}`} last={index === bookings.length - 1} onPress={() => router.push({ pathname: '/booking/[id]', params: { id: booking.id } })} />
            ))}
          </SupportCard>
        ) : (
          <EmptyCard icon="notifications-outline" title={accountBookings.loading ? 'Loading trip updates…' : 'You’re all caught up'} copy={accountBookings.error || 'Trip updates will appear here as your bookings progress.'} />
        )}
      </>
    );
  } else if (section === 'notification-settings') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow="STAY INFORMED" title="Choose your updates" />
          {(Object.keys(updates) as (keyof typeof updates)[]).map((key, index, all) => (
            <SupportItem
              key={key}
              icon={updateLabels[key].icon}
              title={updateLabels[key].title}
              detail={updateLabels[key].detail}
              last={index === all.length - 1}
              onPress={() => void preferences.update({ [key]: !updates[key] })}
              trailing={<Switch accessibilityLabel={`${updateLabels[key].title}`} value={updates[key]} onValueChange={(value) => void preferences.update({ [key]: value })} trackColor={{ false: Colors.borderStrong, true: Colors.secondary }} thumbColor={updates[key] ? Colors.accent : Colors.white} />}
            />
          ))}
        </SupportCard>
        <SupportNotice icon="information-circle-outline">Your preferences are saved on this device. Delivery settings can be applied when account notifications are connected.</SupportNotice>
      </>
    );
  } else if (section === 'language' || section === 'currency') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow="PERSONALISE" title={section === 'language' ? 'Display language' : 'Preferred currency'} />
          {optionList.map((option, index) => {
            const selected = option === selectedOption;
            return (
              <SupportItem
                key={option}
                icon={section === 'language' ? 'language-outline' : 'cash-outline'}
                title={option}
                last={index === optionList.length - 1}
                onPress={() => void preferences.update(section === 'language' ? { language: option } : { currency: option })}
                trailing={<Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? Colors.secondary : Colors.borderStrong} />}
              />
            );
          })}
        </SupportCard>
        <SupportNotice icon="information-circle-outline">{section === 'language' ? 'English is currently available throughout the app. More translations are coming.' : 'Prices remain in the currency supplied by the provider. Currency conversion is not applied.'}</SupportNotice>
      </>
    );
  } else if (section === 'edit-profile' || section === 'account-setup') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow="YOUR PROFILE" title="Your details" />
          {(['name', 'email', 'phone'] as const).map((key) => (
            <SupportField key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={profile[key]} onChangeText={(value) => setProfile((current) => ({ ...current, [key]: value }))} keyboardType={key === 'email' ? 'email-address' : key === 'phone' ? 'phone-pad' : 'default'} autoCapitalize={key === 'email' ? 'none' : 'words'} autoCorrect={false} />
          ))}
          <SupportButton label="Save profile" icon="checkmark" disabled={!user || !process.env.EXPO_PUBLIC_ACCOUNT_API_URL} onPress={() => void saveProfile()} />
        </SupportCard>
        <SupportNotice icon="shield-checkmark-outline">{!user ? 'Sign in to manage your account.' : !process.env.EXPO_PUBLIC_ACCOUNT_API_URL ? 'Profile updates are unavailable right now. Contact support to update your details.' : 'Your verified contact details are used for booking updates.'}</SupportNotice>
        <SupportCard>
          <SupportItem icon="headset-outline" title="Account support" detail="Need help changing your details?" onPress={() => goTo('/contact')} last />
        </SupportCard>
      </>
    );
  } else if (section === 'personal-information') {
    content = (
      <SupportCard>
        <SupportHeading eyebrow="YOUR PROFILE" title="Your account" />
        <InfoRow icon="person-outline" label="NAME" value={user?.name ?? 'Guest'} />
        <InfoRow icon="mail-outline" label="EMAIL" value={user?.email ?? 'Not added'} />
        <InfoRow icon="call-outline" label="PHONE" value={user?.phone ?? 'Not added'} />
        <InfoRow icon="checkmark-circle-outline" label="EMAIL VERIFIED" value={user?.emailVerified ? 'Yes' : 'No'} last />
        <View style={s.gap} />
        <SupportButton label={user ? 'Edit profile' : 'Sign in'} icon="arrow-forward" onPress={() => router.push((user ? '/manage/edit-profile' : '/login') as Href)} />
      </SupportCard>
    );
  } else if (section === 'security' || section === 'reset-password' || section === 'otp-verification') {
    content = (
      <>
        <SupportCard>
          <SupportHeading eyebrow="PROTECT" title="Keep your account close" />
          <SupportItem icon="phone-portrait-outline" title="Phone verification / OTP sign-in" detail="Sign in with a one-time SMS code" onPress={() => router.push({ pathname: '/login', params: { mode: 'phone' } })} />
          <SupportItem icon="key-outline" title="Password recovery" detail="Help accessing your account" onPress={() => goTo('/forgot-password')} />
          <SupportItem icon="shield-checkmark-outline" title="Privacy policy" onPress={() => goTo('/privacy')} last />
        </SupportCard>
        <SupportNotice icon="shield-checkmark-outline">Your authentication and verification use the existing LemonTrip account service. Never share an OTP.</SupportNotice>
      </>
    );
  } else if (section === 'about') {
    content = (
      <>
        <View style={s.hero}>
          <View style={s.heroIcon}><Ionicons name="compass-outline" size={30} color={Colors.primaryDark} /></View>
          <Text style={s.heroTitle}>Travel smarter. Travel better.</Text>
          <Text style={s.heroText}>LemonTrip brings flights, hotels, buses, trains, holiday packages, and visa assistance together in one clear travel experience.</Text>
          <Text style={[s.heroText, { marginTop: 8 }]}>Thoughtful escapes, transparent information, and support before and during your journey.</Text>
        </View>
        <SupportCard>
          <SupportHeading eyebrow="GOOD TO KNOW" title="More about LemonTrip" />
          <SupportItem icon="compass-outline" title="Explore travel services" onPress={() => goTo('/services')} />
          <SupportItem icon="headset-outline" title="Contact LemonTrip" onPress={() => goTo('/contact')} />
          <SupportItem icon="document-text-outline" title="Terms & conditions" onPress={() => goTo('/terms')} last />
        </SupportCard>
      </>
    );
  } else {
    content = <EmptyCard icon="chatbubbles-outline" title="Your support conversations" copy="Verified support requests will appear here when support tracking is available. Contact our team for help with an existing request." action="Contact support" onPress={() => goTo('/contact')} />;
  }

  return (
    <SupportPage title={titles[section] ?? 'Your account'} subtitle="Made for the way you travel." eyebrow="LEMONTRIP / ACCOUNT">
      {content}
      {note ? <SupportNotice tone={note.tone}>{note.text}</SupportNotice> : null}
      {preferences.error ? <SupportNotice tone="error">{preferences.error}</SupportNotice> : null}
    </SupportPage>
  );
}

function EmptyCard({ icon, title, copy, action, onPress }: { icon: IconName; title: string; copy: string; action?: string; onPress?: () => void }) {
  return (
    <SupportCard style={s.empty}>
      <View style={s.emptyIcon}><Ionicons name={icon} size={30} color={Colors.primaryDark} /></View>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={[s.body, s.center]}>{copy}</Text>
      {action && onPress ? <View style={s.emptyAction}><SupportButton label={action} icon="arrow-forward" onPress={onPress} /></View> : null}
    </SupportCard>
  );
}

function InfoRow({ icon, label, value, last = false }: { icon: IconName; label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.info, !last && s.infoDivider]}>
      <View style={s.infoIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View>
      <View style={s.flex}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text selectable style={s.infoValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  gap: { height: 12 },
  body: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, color: Colors.textLight },
  center: { textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  iconButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.errorSoft },
  info: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  infoDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  infoLabel: { ...Ui.eyebrow, color: Colors.textLight, marginBottom: 2 },
  infoValue: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent, marginBottom: 12 },
  emptyTitle: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.textDark, marginBottom: 6, textAlign: 'center' },
  emptyAction: { alignSelf: 'stretch', marginTop: 16 },
  hero: { alignItems: 'center', marginHorizontal: Ui.space.page, marginBottom: 14, padding: 22, borderRadius: Ui.radius.card, backgroundColor: Colors.accentSoft },
  heroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  heroTitle: { fontFamily: 'Manrope', fontSize: 21, fontWeight: '800', color: Colors.primaryDark, marginTop: 14, textAlign: 'center' },
  heroText: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, color: Colors.textDark, marginTop: 6, textAlign: 'center' },
});

export function generateStaticParams() { return Object.keys(titles).map((section) => ({ section })); }