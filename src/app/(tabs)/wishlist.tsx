import { Ui } from '@/constants/theme';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { router } from 'expo-router';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
  const wishlist = useWishlist();
  const user = useAuth();
  const { width } = useWindowDimensions();

  const isWide = width >= 900;

  // Show the logged-in user's name and initials.
  const displayName = user?.name?.trim() || 'Traveler';

  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'T';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Saved places" subtitle="Keep the places you want to come back to." eyebrow="YOUR SHORTLIST" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />

      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><TravelArtworkIcon name="saved" size={40} /></View>
          <Text style={styles.emptyTitle}>No saved destinations yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any destination to save it here.
          </Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/packages')} style={{ ...Ui.button, backgroundColor: Colors.accent, paddingHorizontal: 24, marginTop: 20, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: 'Manrope', fontWeight: '800', color: Colors.primaryDark }}>Find your next escape</Text></TouchableOpacity>
        </View>

        {/* Main navigation */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => router.back()}
            >
              <View style={styles.logoCircle}>
                <Text style={styles.logoLetter}>L</Text>
              </View>

              <Text style={styles.logoText}>LemonTrip</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.navScroll}
              contentContainerStyle={styles.nav}
            >
              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Flights</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Hotels</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Buses</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Trains</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => router.push('/packages')}
              >
                <Text style={styles.navText}>Packages</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem}>
                <Text style={styles.navText}>Visa</Text>
              </TouchableOpacity>

              <TouchableOpacity
  style={styles.navItem}
  onPress={() => router.push('/offers')}
>
  <Text style={styles.navText}>Offers</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.navItem}>
  <Text style={styles.navText}>Travel stories</Text>
</TouchableOpacity>
</ScrollView>

            <View style={styles.headerActions}>
              <View style={styles.headerIcon}>
                <Text style={styles.heart}>♡</Text>
              </View>

              <TouchableOpacity style={styles.myTripsButton}>
                <Text style={styles.myTripsText}>My trips</Text>
              </TouchableOpacity>

              <View style={styles.profileButton}>
                <Text style={styles.profileIcon}>♙</Text>
                <Text style={styles.profileText}>{initials}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Main content */}
        <View
          style={[
            styles.content,
            isWide ? styles.contentWide : styles.contentMobile,
          ]}
        >
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <Text style={styles.profileName}>{displayName}</Text>

            <Text style={styles.profileRole}>Explorer member</Text>

            <View style={styles.sidebarMenu}>
<TouchableOpacity
  style={styles.sidebarItem}
  onPress={() => router.push('/bookings')}
>
  <Text style={styles.sidebarText}>My bookings</Text>
</TouchableOpacity>

              <TouchableOpacity
                style={[styles.sidebarItem, styles.sidebarActive]}
              >
                <Text style={[styles.sidebarText, styles.sidebarActiveText]}>
                  Saved journeys
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem}>
                <Text style={styles.sidebarText}>LemonTrip Wallet</Text>
              </TouchableOpacity>

             <TouchableOpacity
  style={styles.sidebarItem}
  onPress={() => router.push('/profile')}
>
  <Text style={styles.sidebarText}>Your profile</Text>
</TouchableOpacity>
            </View>
          </View>

          {/* Wishlist content */}
          <View style={styles.journeysSection}>
            <Text style={styles.eyebrow}>YOUR LEMONTRIP</Text>

            <Text style={styles.pageTitle}>Saved journeys</Text>

            {wishlist.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>
                  No saved destinations yet
                </Text>

                <Text style={styles.emptySubtitle}>
                  Tap the heart icon on any destination to save it here.
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {wishlist.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                    />

                    <View style={styles.cardInfo}>
                      <Text style={styles.savedLabel}>SAVED PACKAGE</Text>

                      <Text style={styles.cardName} numberOfLines={2}>
                        {item.name}
                      </Text>

                      <Text style={styles.cardDetails}>
                        {item.price
                          ? `Starting ${item.price}`
                          : 'LemonTrip journey'}
                      </Text>

                      <Text style={styles.bookingText}>
                        Booking available
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => toggleWishlist(item)}
                      style={styles.wishlistButton}
                    >
                      <Text style={styles.wishlistButtonText}>
                        Wishlist
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerTop}>
            <View style={styles.footerBrand}>
              <View style={styles.footerLogoRow}>
                <View style={styles.logoCircle}>
                  <Text style={styles.logoLetter}>L</Text>
                </View>

                <Text style={styles.footerLogoText}>LemonTrip</Text>
              </View>

              <Text style={styles.footerDescription}>
                India's premier luxury and curated travel platform.
              </Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>Explore</Text>
              <TouchableOpacity onPress={() => router.push('/packages')}>
  <Text style={styles.footerLink}>Packages</Text>
</TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/offers')}>
  <Text style={styles.footerLink}>Offers</Text>
</TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/blog')}>
  <Text style={styles.footerLink}>Travel stories</Text>
</TouchableOpacity>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>Support</Text>
              <Text style={styles.footerLink}>Contact</Text>
              <Text style={styles.footerLink}>Services</Text>
              <Text style={styles.footerLink}>Privacy</Text>
            </View>

            <View style={styles.supportBox}>
              <Text style={styles.supportSmall}>
                24/7 TRAVELER ASSIST
              </Text>

              <Text style={styles.supportPhone}>
                +91 11 4123 8888
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.cream,
  },

  page: {
    backgroundColor: Brand.cream,
  },
  backArrow: {
    color: Colors.primary,
    fontFamily: 'Manrope',
    fontSize: 13,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 27,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 30,
    gap: 12,
  },
  card: { ...Ui.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 38,
    paddingHorizontal: 20,
  },

  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  check: {
    color: Brand.lemon,
    fontSize: 10,
    fontWeight: '800',
  },

  announcementText: {
    color: '#FFFFFF',
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '600',
  },

  /* Header */
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECE8',
  },

  headerInner: {
    width: '100%',
    maxWidth: 1040,
    minHeight: 62,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 18,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  logoCircle: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoLetter: {
    color: Brand.forest,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '900',
  },

  logoText: {
    color: '#10231A',
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
  },

  navScroll: {
    flex: 1,
  },

  nav: {
    alignItems: 'center',
    gap: 18,
  },

  navItem: {
    paddingVertical: 10,
  },

  navText: {
    color: '#526159',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '600',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#E1E8E3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heart: {
    color: Brand.forest,
    fontSize: 21,
    lineHeight: 22,
  },

  myTripsButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#E1E8E3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  myTripsText: {
    color: '#10231A',
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '700',
  },

  profileButton: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    backgroundColor: '#EDF4EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  profileIcon: {
    color: Brand.forest,
    fontSize: 14,
  },

  profileText: {
    color: Brand.forest,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Main */
  content: {
    width: '100%',
    maxWidth: 950,
    alignSelf: 'center',
    paddingVertical: 38,
    gap: 24,
  },

  contentWide: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },

  contentMobile: {
    flexDirection: 'column',
    paddingHorizontal: 18,
  },

  /* Sidebar */
  sidebar: {
    width: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: Radius.pill,
    backgroundColor: '#EAF3EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  avatarText: {
    color: Brand.forest,
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
  },

  profileName: {
    color: '#10231A',
    fontFamily: 'Manrope',
    fontSize: 18,
    color: Colors.textLight,
  },

  profileRole: {
    color: '#718078',
    fontFamily: 'Manrope',
    fontSize: 8,
    marginTop: 2,
  },

  sidebarMenu: {
    width: '100%',
    marginTop: 28,
    gap: 4,
  },

  sidebarItem: {
    minHeight: 32,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },

  sidebarActive: {
    backgroundColor: Brand.forest,
  },

  sidebarText: {
    color: '#526159',
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '600',
  },
  emptyIcon: { borderRadius: 28, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 18 },
});