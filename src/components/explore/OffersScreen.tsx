import { Colors } from '@/constants/colors';
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
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

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

          <View style={styles.heroSection}>
            <Text style={styles.heroEyebrow}>
              LIMITED-TIME COLLECTION
            </Text>

            <Text style={styles.heroTitle}>
              Offers worth packing for.
            </Text>

            <Text style={styles.heroSubtitle}>
              Member-only fares and curated package savings,
              with every condition shown upfront.
            </Text>
          </View>

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

            <View style={styles.footerBrandSection}>
              <View style={styles.footerLogoRow}>
                <View style={styles.footerLogo}>
                  <Text style={styles.footerLogoText}>L</Text>
                </View>

                <Text style={styles.footerBrand}>
                  LemonTrip
                </Text>
              </View>

              <Text style={styles.footerDescription}>
                India's premier luxury and curated travel
                platform.
              </Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>
                Explore
              </Text>

              <TouchableOpacity
                onPress={() => router.navigate('/(tabs)/explore/packages')}
              >
                <Text style={styles.footerLink}>
                  Packages
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.navigate('/(tabs)/explore/offers')}
              >
                <Text style={styles.footerLink}>
                  Offers
                </Text>
              </TouchableOpacity>

              <Text style={styles.footerLink}>
                Travel stories
              </Text>
            </View>

            <View style={styles.footerColumn}>
              <Text style={styles.footerHeading}>
                Support
              </Text>

              <Text style={styles.footerLink}>
                Contact
              </Text>

              <Text style={styles.footerLink}>
                Services
              </Text>

              <Text style={styles.footerLink}>
                Privacy
              </Text>
            </View>

            <View style={styles.assistCard}>
              <Text style={styles.assistSmall}>
                24/7 TRAVELER ASSIST
              </Text>

              <Text style={styles.assistNumber}>
                +91 11 4123 8888
              </Text>
            </View>

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
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F5',
  },

  page: {
    paddingBottom: 40,
  },

  pageContainer: {
    width: '100%',
    maxWidth: 1380,
    alignSelf: 'center',
  },

  /* ================= HERO ================= */

  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 25,
  },

  heroEyebrow: {
    color: Colors.secondary,
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
  },

  heroTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },

  heroSubtitle: {
    maxWidth: 650,
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 9,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 7,
  },

  /* ================= NOTICE ================= */

  sourceNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginHorizontal: 22,
    marginBottom: 10,
    padding: 10,
    borderRadius: 11,
    backgroundColor: Colors.surfaceMuted,
  },

  sourceNoticeText: {
    flex: 1,
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 8,
    lineHeight: 13,
  },

  /* ================= CATEGORY ================= */

  categorySection: {
    marginTop: 8,
  },

  filterLabel: {
    paddingHorizontal: 22,
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  categoryRow: {
    gap: 7,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },

  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  categoryText: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '700',
  },

  categoryTextActive: {
    color: Colors.white,
  },

  /* ================= RESULTS ================= */

  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 28,
    marginBottom: 13,
  },

  resultsEyebrow: {
    color: Colors.secondary,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  resultsTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },

  resultsCount: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 8,
  },

  /* ================= GRID ================= */

  offerGrid: {
    gap: 14,
    paddingHorizontal: 22,
  },

  offerGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  /* ================= OFFER CARD ================= */

  offerCard: {
    overflow: 'hidden',
    borderRadius: 17,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E4EBE6',
  },

  offerCardDesktop: {
    width: '31.8%',
    marginBottom: 14,
  },

  imageWrap: {
    height: 190,
    position: 'relative',
    backgroundColor: Colors.surfaceMuted,
  },

  offerImage: {
    width: '100%',
    height: '100%',
  },

  discountBadge: {
    position: 'absolute',
    top: 11,
    left: 11,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },

  discountText: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '900',
  },

  offerBody: {
    padding: 13,
  },

  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },

  offerCategory: {
    color: Colors.secondary,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  validityBadge: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  validityActive: {
    color: Colors.secondary,
  },

  validityExpired: {
    color: Colors.error,
  },

  offerTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    marginTop: 6,
  },

  offerDescription: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 8,
    lineHeight: 13,
    marginTop: 5,
  },

  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },

  validityText: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
  },

  /* ================= COUPON ================= */

  couponRow: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#FAFCFA',
  },

  couponInfo: {
    flex: 1,
  },

  couponLabel: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  couponCode: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
  },

  noCoupon: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 8,
  },

  copyButton: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },

  copyButtonDone: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },

  copyText: {
    color: Colors.primary,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '800',
  },

  copyTextDone: {
    color: Colors.white,
  },

  copyConfirmation: {
    color: Colors.secondary,
    fontFamily: 'Manrope',
    fontSize: 7,
    fontWeight: '800',
    marginTop: 4,
  },

  /* ================= TERMS ================= */

  termsArea: {
    marginTop: 9,
  },

  termsLabel: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 6,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  termsText: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
    lineHeight: 11,
    marginTop: 3,
  },

  /* ================= BOOK ================= */

  bookButton: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 11,
    borderRadius: 9,
    backgroundColor: Colors.accent,
  },

  bookButtonDisabled: {
    backgroundColor: Colors.surfaceMuted,
  },

  bookButtonText: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '800',
  },

  bookButtonTextDisabled: {
    color: Colors.textLight,
  },

  /* ================= STATES ================= */

  skeletonCard: {
    overflow: 'hidden',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },

  skeletonCardDesktop: {
    width: '31.8%',
  },

  skeletonImage: {
    height: 190,
    backgroundColor: Colors.surfaceMuted,
  },

  skeletonLine: {
    width: '60%',
    height: 11,
    marginTop: 13,
    marginHorizontal: 13,
    borderRadius: 6,
    backgroundColor: Colors.surfaceMuted,
  },

  skeletonLineShort: {
    width: '38%',
    height: 8,
    marginTop: 8,
    marginBottom: 15,
    marginHorizontal: 13,
    borderRadius: 6,
    backgroundColor: Colors.surfaceMuted,
  },

  stateCard: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 22,
    padding: 20,
    borderRadius: 17,
    backgroundColor: Colors.white,
  },

  stateTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },

  stateText: {
    maxWidth: 300,
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 8,
    lineHeight: 13,
    textAlign: 'center',
  },

  validityNote: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginHorizontal: 22,
    marginTop: 10,
  },

  validityNoteText: {
    flex: 1,
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
    lineHeight: 12,
  },

  /* ================= FOOTER ================= */

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 35,
    marginTop: 80,
    marginHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  footerBrandSection: {
    width: 230,
  },

  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  footerLogo: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogoText: {
    color: Colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },

  footerBrand: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '900',
  },

  footerDescription: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
    lineHeight: 12,
    marginTop: 9,
    maxWidth: 180,
  },

  footerColumn: {
    minWidth: 100,
    gap: 7,
  },

  footerHeading: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 3,
  },

  footerLink: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 7,
  },

  assistCard: {
    width: 190,
    minHeight: 70,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  assistSmall: {
    color: Colors.accent,
    fontFamily: 'Manrope',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  assistNumber: {
    color: Colors.white,
    fontFamily: 'Manrope',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 5,
  },
});
