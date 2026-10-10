import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { ExploreSectionIntro } from '@/components/explore/ExploreSectionIntro';
import type { Offer } from '@/data/mock/offers';
import {
  getOfferCategory,
  getOfferValidity,
  loadOffers,
  type OfferSource,
} from '@/utils/offerApi';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';

const categories = ['Flights', 'Hotels', 'Buses', 'Packages', 'Visa'] as const;

type OfferCategory = typeof categories[number];

function getDiscountLabel(offer: Offer) {
  if (offer.discount) return offer.discount;

  return (
    offer.title.match(
      /(?:up to\s*)?\d+(?:\.\d+)?\s?%|₹\s?[\d,]+/i
    )?.[0] ?? 'SPECIAL DEAL'
  );
}

function formatValidity(validUntil: string | undefined) {
  if (!validUntil) return null;

  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(validUntil)
      ? `${validUntil}T12:00:00`
      : validUntil
  );

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getBookRoute(category: string) {
  const normalized = getOfferCategory(category);

  if (normalized === 'Flights') return '/(tabs)/explore/flights';
  if (normalized === 'Hotels') return '/(tabs)/explore/hotels';
  if (normalized === 'Buses') return '/(tabs)/explore/buses';
  if (normalized === 'Packages') return '/(tabs)/explore/packages';
  if (normalized === 'Visa') return '/(tabs)/explore/visa';

  return null;
}

export default function OffersScreen() {
  const { width } = useWindowDimensions();

  // Figma desktop layout = 3 cards
  // Mobile/tablet = 1 card
  const desktop = width >= 900;

  const [offers, setOffers] = useState<Offer[]>([]);
  const [source, setSource] = useState<OfferSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<
    OfferCategory | 'All'
  >('All');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    loadOffers()
      .then((result) => {
        if (!mounted) return;

        setOffers(result.offers);
        setSource(result.source);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!mounted) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Could not load offers.'
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const unexpiredOffers = useMemo(
    () =>
      offers.filter(
        (offer) => getOfferValidity(offer.validUntil) !== 'expired'
      ),
    [offers]
  );

  const activeOffers = useMemo(
    () =>
      unexpiredOffers.filter(
        (offer) => getOfferValidity(offer.validUntil) === 'active'
      ),
    [unexpiredOffers]
  );

  const visibleOffers = useMemo(
    () =>
      unexpiredOffers.filter((offer) => {
        if (activeCategory === 'All') return true;

        return getOfferCategory(offer.category) === activeCategory;
      }),
    [activeCategory, unexpiredOffers]
  );

  const copyCode = async (offer: Offer) => {
    if (!offer.code) return;

    try {
      const copied = await Clipboard.setStringAsync(offer.code);

      if (copied) {
        setCopiedId(offer.id);

        setTimeout(() => {
          setCopiedId((current) =>
            current === offer.id ? null : current
          );
        }, 2200);
      }
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.page}
      >
        <View style={styles.pageContainer}>

          {/* ================= HERO / TITLE ================= */}

          <ExploreSectionIntro
            eyebrow="TRAVEL MORE, SPEND LESS"
            title="Offers worth travelling for."
            subtitle="Find a little extra value for your next journey."
          />

          {/* ================= DEMO NOTICE ================= */}

          {source === 'demo' ? (
            <View style={styles.sourceNotice}>
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={Colors.textLight}
              />

              <Text style={styles.sourceNoticeText}>
                Demo offers only. Validity dates have not been
                supplied, so booking is disabled until verified.
              </Text>
            </View>
          ) : null}

          {/* ================= CATEGORY ================= */}

          <View style={styles.categorySection}>
            <Text style={styles.filterLabel}>
              SHOP BY CATEGORY
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {(['All', ...categories] as const).map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryChip,
                    activeCategory === category &&
                      styles.categoryChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      activeCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ================= RESULTS TITLE ================= */}

          <View style={styles.resultsHeading}>
            <View>
              <Text style={styles.resultsEyebrow}>
                HANDPICKED FOR YOUR NEXT TRIP
              </Text>

              <Text style={styles.resultsTitle}>
                {activeCategory === 'All'
                  ? 'Current offers'
                  : `${activeCategory} offers`}
              </Text>
            </View>

            <Text style={styles.resultsCount}>
              {visibleOffers.length} deals
            </Text>
          </View>

          {/* ================= OFFERS ================= */}

          {loading ? (
            <View
              style={[
                styles.offerGrid,
                desktop && styles.offerGridDesktop,
              ]}
            >
              {[0, 1, 2].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.skeletonCard,
                    desktop && styles.skeletonCardDesktop,
                  ]}
                >
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonLine} />
                  <View style={styles.skeletonLineShort} />
                </View>
              ))}
            </View>
          ) : error ? (
            <View style={styles.stateCard}>
              <Ionicons
                name="cloud-offline-outline"
                size={25}
                color={Colors.error}
              />

              <Text style={styles.stateTitle}>
                Offers are unavailable
              </Text>

              <Text style={styles.stateText}>
                {error}
              </Text>
            </View>
          ) : visibleOffers.length ? (
            <View
              style={[
                styles.offerGrid,
                desktop && styles.offerGridDesktop,
              ]}
            >
              {visibleOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  desktop={desktop}
                  copied={copiedId === offer.id}
                  source={source ?? 'demo'}
                  onCopy={() => copyCode(offer)}
                />
              ))}
            </View>
          ) : (
            <View style={styles.stateCard}>
              <Ionicons
                name="pricetag-outline"
                size={30}
                color={Colors.primary}
              />

              <Text style={styles.stateTitle}>
                No offers in this category
              </Text>

              <Text style={styles.stateText}>
                Try another travel category.
              </Text>
            </View>
          )}

          {/* ================= VALIDITY NOTE ================= */}

          {source === 'backend' &&
          !activeOffers.length &&
          !loading &&
          !error ? (
            <View style={styles.validityNote}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textLight}
              />

              <Text style={styles.validityNoteText}>
                No offers with a confirmed future validity
                date are currently available.
              </Text>
            </View>
          ) : null}

          {/* ================= FOOTER ================= */}

          <View style={styles.footer}>
            <Image source={require('../../../assets/images/App Logo.png')} style={styles.footerLogoImage} resizeMode="cover" />
            <Text style={styles.footerTagline}>Travel, thoughtfully planned.</Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/explore')}><Text style={styles.footerLink}>Explore</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/explore/packages')}><Text style={styles.footerLink}>Packages</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.navigate('/(tabs)/explore/offers')}><Text style={styles.footerLink}>Offers</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/contact')}><Text style={styles.footerLink}>Support</Text></TouchableOpacity>
            </View>
            <Text style={styles.footerCopyright}>© LemonTrip. Made for the journey.</Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}


/* =========================================================
   OFFER CARD
========================================================= */

function OfferCard({
  offer,
  desktop,
  copied,
  source,
  onCopy,
}: {
  offer: Offer;
  desktop: boolean;
  copied: boolean;
  source: OfferSource;
  onCopy: () => void;
}) {
  const validity = getOfferValidity(offer.validUntil);
  const validUntil = formatValidity(offer.validUntil);
  const route = getBookRoute(offer.category);

  const isBookable =
    source === 'backend' &&
    validity === 'active' &&
    route !== null;

  const discount = getDiscountLabel(offer);

  return (
    <View
      style={[
        styles.offerCard,
        desktop && styles.offerCardDesktop,
      ]}
    >
      {/* IMAGE */}

      <View style={styles.imageWrap}>
        <Image
          source={{ uri: offer.image }}
          style={styles.offerImage}
        />

        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>
            {discount}
          </Text>
        </View>
      </View>

      {/* BODY */}

      <View style={styles.offerBody}>

        <View style={styles.offerMeta}>
          <Text style={styles.offerCategory}>
            {getOfferCategory(offer.category) ??
              offer.category}
          </Text>

          <Text
            style={[
              styles.validityBadge,
              validity === 'active' &&
                styles.validityActive,
              validity === 'expired' &&
                styles.validityExpired,
            ]}
          >
            {validity === 'active'
              ? 'ACTIVE'
              : validity === 'expired'
              ? 'EXPIRED'
              : 'UNVERIFIED'}
          </Text>
        </View>

        <Text style={styles.offerTitle}>
          {offer.title}
        </Text>

        <Text
          style={styles.offerDescription}
          numberOfLines={3}
        >
          {offer.description}
        </Text>

        <View style={styles.validityRow}>
          <Ionicons
            name="calendar-outline"
            size={13}
            color={Colors.textLight}
          />

          <Text style={styles.validityText}>
            {validUntil
              ? `Valid until ${validUntil}`
              : 'Validity date unavailable'}
          </Text>
        </View>

        {/* COUPON */}

        <View style={styles.couponRow}>
          {offer.code ? (
            <View style={styles.couponInfo}>
              <Text style={styles.couponLabel}>
                COUPON
              </Text>

              <Text style={styles.couponCode}>
                {offer.code}
              </Text>
            </View>
          ) : (
            <Text style={styles.noCoupon}>
              No coupon code supplied
            </Text>
          )}

          {offer.code ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Copy coupon ${offer.code}`}
              onPress={onCopy}
              activeOpacity={0.8}
              style={[
                styles.copyButton,
                copied && styles.copyButtonDone,
              ]}
            >
              <Ionicons
                name={
                  copied ? 'checkmark' : 'copy-outline'
                }
                size={13}
                color={
                  copied
                    ? Colors.white
                    : Colors.primary
                }
              />

              <Text
                style={[
                  styles.copyText,
                  copied && styles.copyTextDone,
                ]}
              >
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {copied ? (
          <Text
            accessibilityRole="alert"
            style={styles.copyConfirmation}
          >
            Coupon copied to clipboard
          </Text>
        ) : null}

        {/* TERMS */}

        <View style={styles.termsArea}>
          <Text style={styles.termsLabel}>
            TERMS
          </Text>

          <Text
            style={styles.termsText}
            numberOfLines={2}
          >
            {offer.terms ??
              'Terms not provided by the offer source.'}
          </Text>
        </View>

        {/* BOOK BUTTON */}

        <TouchableOpacity
          disabled={!isBookable}
          onPress={() => {
            if (route) {
              router.push(route);
            }
          }}
          activeOpacity={0.8}
          style={[
            styles.bookButton,
            !isBookable &&
              styles.bookButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.bookButtonText,
              !isBookable &&
                styles.bookButtonTextDisabled,
            ]}
          >
            {isBookable
              ? 'Book now'
              : validity === 'expired'
              ? 'Offer expired'
              : 'Not bookable yet'}
          </Text>

          {isBookable ? (
            <Ionicons
              name="arrow-forward"
              size={14}
              color={Colors.primaryDark}
            />
          ) : (
            <Ionicons
              name="lock-closed-outline"
              size={13}
              color={Colors.textLight}
            />
          )}
        </TouchableOpacity>

      </View>
    </View>
  );
}


/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surfaceMuted },
  page: { paddingBottom: 28 },
  pageContainer: { width: '100%', maxWidth: 1380, alignSelf: 'center' },
  sourceNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 20, marginTop: 18, padding: 13, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  sourceNoticeText: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  categorySection: { marginTop: 22 },
  filterLabel: { paddingHorizontal: 20, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.1 },
  categoryRow: { gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  categoryChip: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  categoryText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  categoryTextActive: { color: Colors.white },
  resultsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, marginTop: 22, marginBottom: 12 },
  resultsEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  resultsTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold, marginTop: 4 },
  resultsCount: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  offerGrid: { gap: 14, paddingHorizontal: 20 },
  offerGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  offerCard: { overflow: 'hidden', borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  offerCardDesktop: { width: '31.8%', marginBottom: 14 },
  imageWrap: { height: 190, position: 'relative', backgroundColor: Colors.surfaceMuted },
  offerImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.accent },
  discountText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  offerBody: { padding: 15 },
  offerMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  offerCategory: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.5 },
  validityBadge: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.4 },
  validityActive: { color: Colors.secondary },
  validityExpired: { color: Colors.error },
  offerTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, lineHeight: 23, fontWeight: FontWeight.extraBold, marginTop: 7 },
  offerDescription: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 6 },
  validityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  validityText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  couponRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 12, backgroundColor: Colors.background },
  couponInfo: { flex: 1 },
  couponLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.7 },
  couponCode: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, marginTop: 2 },
  noCoupon: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  copyButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: Colors.surface },
  copyButtonDone: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  copyText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  copyTextDone: { color: Colors.white },
  copyConfirmation: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, marginTop: 5 },
  termsArea: { marginTop: 12 },
  termsLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.7 },
  termsText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, lineHeight: 16, marginTop: 3 },
  bookButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 13, borderRadius: 15, backgroundColor: Colors.accent },
  bookButtonDisabled: { backgroundColor: Colors.surfaceMuted },
  bookButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  bookButtonTextDisabled: { color: Colors.textLight },
  skeletonCard: { overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, paddingBottom: 16 },
  skeletonCardDesktop: { width: '31.8%' },
  skeletonImage: { height: 190, backgroundColor: Colors.surfaceMuted },
  skeletonLine: { width: '60%', height: 12, marginTop: 14, marginHorizontal: 15, borderRadius: 6, backgroundColor: Colors.surfaceMuted },
  skeletonLineShort: { width: '38%', height: 9, marginTop: 9, marginHorizontal: 15, borderRadius: 6, backgroundColor: Colors.surfaceMuted },
  stateCard: { minHeight: 190, alignItems: 'center', justifyContent: 'center', gap: 9, marginHorizontal: 20, padding: 22, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  stateTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, textAlign: 'center' },
  stateText: { maxWidth: 320, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, textAlign: 'center' },
  validityNote: { flexDirection: 'row', gap: 7, alignItems: 'center', marginHorizontal: 20, marginTop: 12 },
  validityNoteText: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  footer: { marginTop: 24, paddingTop: 16, paddingHorizontal: 20, paddingBottom: 6, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerLogoImage: { width: 118, height: 38 },
  footerTagline: { flex: 1, color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  footerLink: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  footerCopyright: { width: '100%', color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
});
