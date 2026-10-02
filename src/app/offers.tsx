import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { Offer } from '@/data/offers';
import { getOfferCategory, getOfferValidity, loadOffers, type OfferSource } from '@/utils/offerApi';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['Flights', 'Hotels', 'Buses', 'Packages', 'Visa'] as const;
type OfferCategory = typeof categories[number];

function getDiscountLabel(offer: Offer) {
  if (offer.discount) return offer.discount;
  return offer.title.match(/(?:up to\s*)?\d+(?:\.\d+)?\s?%|₹\s?[\d,]+/i)?.[0] ?? 'SPECIAL DEAL';
}

function formatValidity(validUntil: string | undefined) {
  if (!validUntil) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(validUntil) ? `${validUntil}T12:00:00` : validUntil);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getBookRoute(category: string) {
  const normalized = getOfferCategory(category);
  if (normalized === 'Flights') return '/(tabs)/explore/flights';
  if (normalized === 'Hotels') return '/(tabs)/explore/hotels';
  if (normalized === 'Buses') return '/(tabs)/explore/buses';
  if (normalized === 'Packages') return '/packages';
  if (normalized === 'Visa') return '/(tabs)/explore/visa';
  return null;
}

export default function OffersScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 850;
  const [offers, setOffers] = useState<Offer[]>([]);
  const [source, setSource] = useState<OfferSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<OfferCategory | 'All'>('All');
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
        setError(loadError instanceof Error ? loadError.message : 'Could not load offers.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const unexpiredOffers = useMemo(() => offers.filter((offer) => getOfferValidity(offer.validUntil) !== 'expired'), [offers]);
  const activeOffers = useMemo(() => unexpiredOffers.filter((offer) => getOfferValidity(offer.validUntil) === 'active'), [unexpiredOffers]);
  const visibleOffers = useMemo(() => unexpiredOffers.filter((offer) => {
    if (activeCategory === 'All') return true;
    return getOfferCategory(offer.category) === activeCategory;
  }), [activeCategory, unexpiredOffers]);

  const copyCode = async (offer: Offer) => {
    if (!offer.code) return;
    try {
      const copied = await Clipboard.setStringAsync(offer.code);
      if (copied) {
        setCopiedId(offer.id);
        setTimeout(() => setCopiedId((current) => current === offer.id ? null : current), 2200);
      }
    } catch {
      setCopiedId(null);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <ScreenHeader title="Offers" subtitle="Fresh deals for your next trip." eyebrow="LEMONTRIP / OFFERS" onBack={handleBack} />

          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1500&q=90' }} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>A GOOD DEAL, A GREAT GETAWAY</Text>
              <Text style={styles.heroTitle}>Travel more.{"\n"}Spend smarter.</Text>
              <Text style={styles.heroText}>{activeOffers.length ? `${activeOffers.length} offers with confirmed validity` : 'Browse travel deals and find a reason to go.'}</Text>
            </View>
          </ImageBackground>

          {source === 'demo' ? (
            <View style={styles.sourceNotice}><Ionicons name="information-circle-outline" size={15} color={Colors.textLight} /><Text style={styles.sourceNoticeText}>Demo offers only. Validity dates have not been supplied, so booking is disabled until verified.</Text></View>
          ) : null}

          <View style={styles.categorySection}>
            <Text style={styles.filterLabel}>SHOP BY CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {(['All', ...categories] as const).map((category) => (
                <TouchableOpacity key={category} onPress={() => setActiveCategory(category)} style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}>
                  <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.resultsHeading}>
            <View><Text style={styles.resultsEyebrow}>HANDPICKED FOR YOUR NEXT TRIP</Text><Text style={styles.resultsTitle}>{activeCategory === 'All' ? 'Current offers' : `${activeCategory} offers`}</Text></View>
            <Text style={styles.resultsCount}>{visibleOffers.length} deals</Text>
          </View>

          {loading ? (
            <View style={[styles.offerGrid, desktop && styles.offerGridDesktop]}>{[0, 1, 2].map((item) => <View key={item} style={[styles.skeletonCard, desktop && styles.skeletonCardDesktop]}><View style={styles.skeletonImage} /><View style={styles.skeletonLine} /><View style={styles.skeletonLineShort} /></View>)}</View>
          ) : error ? (
            <View style={styles.stateCard}><Ionicons name="cloud-offline-outline" size={23} color={Colors.error} /><Text style={styles.stateTitle}>Offers are unavailable</Text><Text style={styles.stateText}>{error}</Text></View>
          ) : visibleOffers.length ? (
            <View style={[styles.offerGrid, desktop && styles.offerGridDesktop]}>
              {visibleOffers.map((offer) => <OfferCard key={offer.id} offer={offer} desktop={desktop} copied={copiedId === offer.id} source={source ?? 'demo'} onCopy={() => copyCode(offer)} />)}
            </View>
          ) : (
            <View style={styles.stateCard}><Ionicons name="pricetag-outline" size={23} color={Colors.primary} /><Text style={styles.stateTitle}>No offers in this category</Text><Text style={styles.stateText}>Try another travel category.</Text></View>
          )}

          {source === 'backend' && !activeOffers.length && !loading && !error ? (
            <View style={styles.validityNote}><Ionicons name="time-outline" size={14} color={Colors.textLight} /><Text style={styles.validityNoteText}>No offers with a confirmed future validity date are currently available.</Text></View>
          ) : null}
          <View style={styles.footer}><Text style={styles.footerBrand}>LemonTrip</Text><Text style={styles.footerText}>Terms and availability are provided by each offer.</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OfferCard({ offer, desktop, copied, source, onCopy }: { offer: Offer; desktop: boolean; copied: boolean; source: OfferSource; onCopy: () => void }) {
  const validity = getOfferValidity(offer.validUntil);
  const validUntil = formatValidity(offer.validUntil);
  const route = getBookRoute(offer.category);
  const isBookable = source === 'backend' && validity === 'active' && route !== null;
  const discount = getDiscountLabel(offer);

  return (
    <View style={[styles.offerCard, desktop && styles.offerCardDesktop]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: offer.image }} style={styles.offerImage} />
        <View style={styles.discountBadge}><Text style={styles.discountText}>{discount}</Text></View>
      </View>
      <View style={styles.offerBody}>
        <View style={styles.offerMeta}><Text style={styles.offerCategory}>{getOfferCategory(offer.category) ?? offer.category}</Text><Text style={[styles.validityBadge, validity === 'active' && styles.validityActive, validity === 'expired' && styles.validityExpired]}>{validity === 'active' ? 'ACTIVE' : validity === 'expired' ? 'EXPIRED' : 'UNVERIFIED'}</Text></View>
        <Text style={styles.offerTitle}>{offer.title}</Text>
        <Text style={styles.offerDescription} numberOfLines={3}>{offer.description}</Text>

        <View style={styles.validityRow}><Ionicons name="calendar-outline" size={13} color={Colors.textLight} /><Text style={styles.validityText}>{validUntil ? `Valid until ${validUntil}` : 'Validity date unavailable'}</Text></View>

        <View style={styles.couponRow}>
          {offer.code ? <View style={styles.couponInfo}><Text style={styles.couponLabel}>COUPON</Text><Text style={styles.couponCode}>{offer.code}</Text></View> : <Text style={styles.noCoupon}>No coupon code supplied</Text>}
          {offer.code ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Copy coupon ${offer.code}`} onPress={onCopy} style={[styles.copyButton, copied && styles.copyButtonDone]}><Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={13} color={copied ? Colors.white : Colors.primary} /><Text style={[styles.copyText, copied && styles.copyTextDone]}>{copied ? 'Copied' : 'Copy'}</Text></TouchableOpacity> : null}
        </View>
        {copied ? <Text accessibilityRole="alert" style={styles.copyConfirmation}>Coupon copied to clipboard</Text> : null}

        <View style={styles.termsArea}><Text style={styles.termsLabel}>TERMS</Text><Text style={styles.termsText} numberOfLines={2}>{offer.terms ?? 'Terms not provided by the offer source.'}</Text></View>
        <TouchableOpacity disabled={!isBookable} onPress={() => route && router.push(route)} style={[styles.bookButton, !isBookable && styles.bookButtonDisabled]}>
          <Text style={[styles.bookButtonText, !isBookable && styles.bookButtonTextDisabled]}>{isBookable ? 'Book now' : validity === 'expired' ? 'Offer expired' : 'Not bookable yet'}</Text>
          {isBookable ? <Ionicons name="arrow-forward" size={14} color={Colors.primaryDark} /> : <Ionicons name="lock-closed-outline" size={13} color={Colors.textLight} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  hero: { minHeight: 285, justifyContent: 'flex-end', marginHorizontal: 15, overflow: 'hidden', borderRadius: 20, backgroundColor: Colors.primaryDark },
  heroImage: { borderRadius: 20 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 34, 24, 0.42)' },
  heroContent: { maxWidth: 520, padding: 19 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 1.2 },
  heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 29, lineHeight: 35, fontWeight: '900', marginTop: 7 },
  heroText: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Manrope', fontSize: 9, marginTop: 6 },
  sourceNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 11, backgroundColor: Colors.surfaceMuted },
  sourceNoticeText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13 },
  categorySection: { marginTop: 19 },
  filterLabel: { paddingHorizontal: 16, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.9 },
  categoryRow: { gap: 6, paddingHorizontal: 16, paddingTop: 8 },
  categoryChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  categoryChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  categoryText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '700' },
  categoryTextActive: { color: Colors.white },
  resultsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 22, marginBottom: 11 },
  resultsEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.9 },
  resultsTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', marginTop: 3 },
  resultsCount: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  offerGrid: { gap: 11, paddingHorizontal: 15 },
  offerGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  offerCard: { overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderRadius: 15, backgroundColor: Colors.surface },
  offerCardDesktop: { width: '48.8%', marginBottom: 2 },
  imageWrap: { height: 165, position: 'relative', backgroundColor: Colors.surfaceMuted },
  offerImage: { width: '100%', height: '100%' },
  discountBadge: { position: 'absolute', top: 10, left: 10, maxWidth: '82%', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7, backgroundColor: Colors.accent },
  discountText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 7, fontWeight: '900' },
  offerBody: { padding: 12 },
  offerMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  offerCategory: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', letterSpacing: 0.7 },
  validityBadge: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '900', letterSpacing: 0.6 },
  validityActive: { color: Colors.secondary },
  validityExpired: { color: Colors.error },
  offerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 18, fontWeight: '800', marginTop: 6 },
  offerDescription: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, marginTop: 5 },
  validityRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  validityText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7 },
  couponRow: { minHeight: 47, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginTop: 9, paddingHorizontal: 9, borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed', borderRadius: 10, backgroundColor: Colors.background },
  couponInfo: { flex: 1 },
  couponLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800', letterSpacing: 0.6 },
  couponCode: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', marginTop: 2 },
  noCoupon: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8 },
  copyButton: { minHeight: 31, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.surface },
  copyButtonDone: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  copyText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800' },
  copyTextDone: { color: Colors.white },
  copyConfirmation: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 7, fontWeight: '800', marginTop: 4 },
  termsArea: { marginTop: 9 },
  termsLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 6, fontWeight: '800', letterSpacing: 0.7 },
  termsText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 11, marginTop: 3 },
  bookButton: { minHeight: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 11, borderRadius: 9, backgroundColor: Colors.accent },
  bookButtonDisabled: { backgroundColor: Colors.surfaceMuted },
  bookButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  bookButtonTextDisabled: { color: Colors.textLight },
  skeletonCard: { overflow: 'hidden', borderRadius: 15, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  skeletonCardDesktop: { width: '48.8%' },
  skeletonImage: { height: 165, backgroundColor: Colors.surfaceMuted },
  skeletonLine: { width: '60%', height: 11, marginTop: 13, marginHorizontal: 12, borderRadius: 6, backgroundColor: Colors.surfaceMuted },
  skeletonLineShort: { width: '38%', height: 8, marginTop: 8, marginBottom: 15, marginHorizontal: 12, borderRadius: 6, backgroundColor: Colors.surfaceMuted },
  stateCard: { minHeight: 175, alignItems: 'center', justifyContent: 'center', gap: 7, marginHorizontal: 15, padding: 20, borderRadius: 15, backgroundColor: Colors.surface },
  stateTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  stateText: { maxWidth: 300, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, textAlign: 'center' },
  validityNote: { flexDirection: 'row', gap: 6, alignItems: 'center', marginHorizontal: 16, marginTop: 10 },
  validityNoteText: { flex: 1, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, lineHeight: 12 },
  footer: { marginTop: 25, paddingHorizontal: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  footerBrand: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  footerText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 7, marginTop: 3 },
});