import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { items: blogPosts, loading } = useContentItems<BlogPost>('blog');
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: destinations } = useContentItems<Destination>('destination');
  const post = blogPosts.find((item) => item.id === id);
  const relatedDestinations = destinations.filter((item) => post?.relatedDestinationIds?.includes(item.id));
  const relatedPackages = travelPackages.filter((item) => post?.relatedPackageIds?.includes(item.id));

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/blog');
  };

  if (loading) return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundTitle}>Loading story…</Text></View></SafeAreaView>;
  if (!post) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Ionicons name="book-outline" size={24} color={Colors.primary} /><Text style={styles.notFoundTitle}>Story not found</Text><TouchableOpacity onPress={() => router.replace('/blog')} style={styles.backToStories}><Text style={styles.backToStoriesText}>Browse stories</Text></TouchableOpacity></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <BrandGradientBar style={styles.topBar}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={styles.backButton}><Ionicons name="arrow-back" size={18} color={Colors.white} /></TouchableOpacity>
            <LemonTripBrand size={38} />
            <Text style={styles.breadcrumb}>JOURNAL</Text>
            <View style={styles.topSpacer} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Browse travel stories" onPress={() => router.replace('/blog')} style={styles.journalButton}><Ionicons name="book-outline" size={17} color={Colors.primaryDark} /></TouchableOpacity>
          </BrandGradientBar>
          <Image source={{ uri: post.image }} style={styles.heroImage} />
          <View style={styles.articleHeader}>
            <Text style={styles.category}>{post.category.toUpperCase()}</Text>
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.excerpt}>{post.excerpt}</Text>
            <View style={styles.byline}>{post.author ? <><View style={styles.authorMark}><Text style={styles.authorMarkText}>L</Text></View><Text style={styles.author}>{post.author}</Text></> : null}<Text style={styles.metadata}>{post.date}  ·  {post.readingTime}</Text></View>
          </View>

          <View style={[styles.articleLayout, desktop && styles.articleLayoutDesktop]}>
            <View style={styles.articleBody}>{post.content.map((paragraph) => <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>)}</View>
            <View style={styles.aside}><View style={styles.asideNote}><Ionicons name="sparkles-outline" size={18} color={Colors.primary} /><Text style={styles.asideTitle}>Travel, thoughtfully planned.</Text><Text style={styles.asideText}>Keep this story close while you plan your next journey.</Text></View></View>
          </View>

          {(relatedDestinations.length || relatedPackages.length) ? <View style={styles.relatedSection}><Text style={styles.eyebrow}>KEEP EXPLORING</Text><Text style={styles.relatedTitle}>Make the story part of your trip</Text>{relatedDestinations.length ? <><Text style={styles.relatedLabel}>Related destinations</Text><View style={styles.destinationRow}>{relatedDestinations.map((destination) => <TouchableOpacity key={destination.id} onPress={() => router.push('/(tabs)/explore')} style={styles.destinationCard}><Image source={{ uri: destination.image }} style={styles.destinationImage} /><View style={styles.destinationCopy}><Text style={styles.destinationName}>{destination.name}</Text><Text style={styles.destinationPrice}>From {destination.priceFrom}</Text></View><Ionicons name="arrow-forward" size={15} color={Colors.primary} /></TouchableOpacity>)}</View></> : null}{relatedPackages.length ? <><Text style={styles.relatedLabel}>Related packages</Text><View style={[styles.packageRow, desktop && styles.packageRowDesktop]}>{relatedPackages.map((item) => <TouchableOpacity key={item.id} onPress={() => router.push(`/packages/${item.id}`)} style={[styles.packageCard, desktop && styles.packageCardDesktop]}><Image source={{ uri: item.image }} style={styles.packageImage} /><View style={styles.packageCopy}><Text style={styles.packageDestination}>{item.destination}</Text><Text style={styles.packageName}>{item.title}</Text><Text style={styles.packageMeta}>{item.duration}  ·  From {item.price}</Text></View><Ionicons name="arrow-forward" size={15} color={Colors.primary} /></TouchableOpacity>)}</View></> : null}</View> : null}

          <View style={styles.cta}><View style={styles.ctaCopy}><Text style={styles.ctaEyebrow}>READY TO GO?</Text><Text style={styles.ctaTitle}>Plan this journey</Text><Text style={styles.ctaText}>Turn inspiration into a trip with LemonTrip.</Text></View><TouchableOpacity onPress={() => relatedPackages[0] ? router.push(`/packages/${relatedPackages[0].id}`) : router.push('/(tabs)/explore')} style={styles.ctaButton}><Text style={styles.ctaButtonText}>{relatedPackages[0] ? 'View package' : 'Explore journeys'}</Text><Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} /></TouchableOpacity></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 34 }, content: { width: '100%', maxWidth: 1120, alignSelf: 'center' }, topBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14 }, backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.14)' }, breadcrumb: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, topSpacer: { flex: 1 }, journalButton: { minHeight: 44,  width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: Ui.radius.control, backgroundColor: Colors.accent }, heroImage: { width: '100%', height: 360, backgroundColor: Colors.surfaceMuted }, articleHeader: { maxWidth: 820, alignSelf: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 24 }, category: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 31, lineHeight: 39, fontWeight: '900', marginTop: 7 }, excerpt: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 21, marginTop: 9 }, byline: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 17, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.border }, authorMark: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent }, authorMarkText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '900' }, author: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' }, metadata: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 2 },
  articleLayout: { maxWidth: 820, alignSelf: 'center', width: '100%', paddingHorizontal: 20, paddingTop: 20 }, articleLayoutDesktop: { flexDirection: 'row', gap: 28 }, articleBody: { flex: 1, minWidth: 0 }, paragraph: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, lineHeight: 24, marginBottom: 17 }, aside: { width: 180 }, asideNote: { padding: 13, borderRadius: 13, backgroundColor: Colors.accentSoft }, asideTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, lineHeight: 24, fontWeight: '900', marginTop: 8 }, asideText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 19, marginTop: 4 }, relatedSection: { ...Ui.card, marginTop: 20, padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface }, eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 }, relatedTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '900', marginTop: 5 }, relatedLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 18, marginBottom: 8 }, destinationRow: { gap: 8 }, destinationCard: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.background }, destinationImage: { width: 55, height: 55, borderRadius: 9 }, destinationCopy: { flex: 1, minWidth: 0 }, destinationName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' }, destinationPrice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 18, marginTop: 3 }, packageRow: { gap: 9 }, packageRowDesktop: { flexDirection: 'row' }, packageCard: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.background }, packageCardDesktop: { flex: 1 }, packageImage: { width: 72, height: 62, borderRadius: 9 }, packageCopy: { flex: 1, minWidth: 0 }, packageDestination: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' }, packageName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 2 }, packageMeta: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 4 }, cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, margin: 16, padding: 17, borderRadius: 16, backgroundColor: Colors.primaryDark }, ctaCopy: { flex: 1, minWidth: 0 }, ctaEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, ctaTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 4 }, ctaText: { color: 'rgba(255,255,255,0.72)', fontFamily: 'Manrope', fontSize: 13, marginTop: 3 }, ctaButton: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderRadius: 10, backgroundColor: Colors.accent }, ctaButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900' }, notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, notFoundTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 9 }, backToStories: { marginTop: 13, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent }, backToStoriesText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '900' },
});
