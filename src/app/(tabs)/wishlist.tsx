import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Brand, Radius } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        {/* Top announcement bar */}
        <View style={styles.announcementBar}>
          <View style={styles.announcementItem}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.announcementText}>
              Best price guarantee
            </Text>
          </View>

          <View style={styles.announcementItem}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.announcementText}>
              24/7 India traveler assist
            </Text>
          </View>

          <View style={styles.announcementItem}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.announcementText}>
              100% secure payments
            </Text>
          </View>
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

  /* Announcement bar */
  announcementBar: {
    minHeight: 30,
    backgroundColor: Brand.forest,
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
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },

  announcementText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.semibold,
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
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },

  logoText: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.bodyLarge,
    fontWeight: FontWeight.extraBold,
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
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.semibold,
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
    fontSize: TextSize.displaySmall,
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
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
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
    fontSize: TextSize.body,
  },

  profileText: {
    color: Brand.forest,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
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
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },

  profileName: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    textAlign: 'center',
  },

  profileRole: {
    color: '#718078',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
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
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.semibold,
  },

  sidebarActiveText: {
    color: '#FFFFFF',
  },

  /* Journeys */
  journeysSection: {
    flex: 1,
    minWidth: 0,
  },

  eyebrow: {
    color: Brand.forestLight,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1.3,
    marginBottom: 6,
  },

  pageTitle: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.display,
    fontWeight: FontWeight.extraBold,
    marginBottom: 16,
  },

  cardsContainer: {
    gap: 10,
  },

  card: {
    minHeight: 94,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardImage: {
    width: 82,
    height: 74,
    borderRadius: Radius.md,
    backgroundColor: '#E5ECE8',
  },

  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
    minWidth: 0,
  },

  savedLabel: {
    color: Brand.forestLight,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 0.7,
    marginBottom: 3,
  },

  cardName: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginBottom: 3,
  },

  cardDetails: {
    color: '#64736B',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    marginBottom: 2,
  },

  bookingText: {
    color: '#64736B',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
  },

  wishlistButton: {
    backgroundColor: '#EAF3EE',
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 2,
  },

  wishlistButtonText: {
    color: Brand.forest,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
  },

  /* Empty state */
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 35,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.bodyLarge,
    fontWeight: FontWeight.extraBold,
    marginBottom: 7,
  },

  emptySubtitle: {
    color: '#64736B',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Footer */
  footer: {
    width: '100%',
    maxWidth: 950,
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DCE5DF',
    marginTop: 70,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  footerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 35,
  },

  footerBrand: {
    flex: 1.5,
  },

  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },

  footerLogoText: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.caption,
    fontWeight: FontWeight.extraBold,
  },

  footerDescription: {
    color: '#718078',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    lineHeight: 15,
    maxWidth: 190,
  },

  footerColumn: {
    flex: 0.8,
    gap: 8,
  },

  footerHeading: {
    color: '#10231A',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginBottom: 2,
  },

  footerLink: {
    color: '#718078',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
  },

  supportBox: {
    flex: 1.1,
    minHeight: 62,
    backgroundColor: Brand.forest,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 13,
    justifyContent: 'center',
  },

  supportSmall: {
    color: Brand.lemon,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginBottom: 4,
  },

  supportPhone: {
    color: '#FFFFFF',
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
});