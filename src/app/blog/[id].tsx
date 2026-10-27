import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';
import { ServiceTopBar } from '@/components/ui/ServiceHeader';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

// Same type scale as Explore.
const TextSize = { micro: 10, caption: 11, body: 13, bodyLarge: 14, title: 16, heading: 18, display: 22 } as const;

export default function BlogDetailScreen() {
  useAppLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: blogPosts, loading } = useContentItems<BlogPost>('blog');
  const { items: travelPackages } = useContentItems<TravelPackage>('package');
  const { items: destinations } = useContentItems<Destination>('destination');
  const post = blogPosts.find((item) => item.id === id);
  const relatedDestinations = destinations.filter((item) => post?.relatedDestinationIds?.includes(item.id));
  const relatedPackages = travelPackages.filter((item) => post?.relatedPackageIds?.includes(item.id));

  if (loading) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.notFound}><Text style={styles.notFoundTitle}>Loading story…</Text></View></SafeAreaView>;
  }
  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Ionicons name="book-outline" size={24} color={Colors.primary} />
          <Text style={styles.notFoundTitle}>Story not found</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/blog')} style={styles.backToStories}>
            <Text style={styles.backToStoriesText}>Browse stories</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstPackage = relatedPackages[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ServiceTopBar title="Travel stories" fallback="/blog" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center' }}>
      <Image source={{ uri: post.image }} resizeMode="cover" style={styles.cover} />

      <View style={styles.header}>
        <Text style={styles.category}>{post.category.toUpperCase()}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.excerpt}>{post.excerpt}</Text>
        <Text style={styles.metadata}>{post.author ? `${post.author}  ·  ` : ''}{post.date}  ·  {post.readingTime}</Text>
      </View>

      <View style={styles.body}>
        {post.content.map((paragraph) => <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>)}
      </View>

      <View style={styles.note}>
        <Ionicons name="sparkles-outline" size={20} color={Colors.primaryDark} />
        <Text style={styles.noteTitle}>Travel, thoughtfully planned.</Text>
        <Text style={styles.noteText}>Keep this story close while you plan your next journey.</Text>
      </View>

      {relatedDestinations.length || relatedPackages.length ? (
        <View style={styles.related}>
          <Text style={styles.eyebrow}>KEEP EXPLORING</Text>
          <Text style={styles.relatedTitle}>Make the story part of your trip</Text>
          {relatedDestinations.length ? (
            <>
              <Text style={styles.relatedLabel}>RELATED DESTINATIONS</Text>
              <View style={styles.relatedList}>
                {relatedDestinations.map((destination) => (
                  <TouchableOpacity key={destination.id} accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.relatedCard}>
                    <Image source={{ uri: destination.image }} style={styles.destinationImage} />
                    <View style={styles.relatedCopy}>
                      <Text style={styles.relatedName}>{destination.name}</Text>
                      <Text style={styles.relatedMeta}>From {destination.priceFrom}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
          {relatedPackages.length ? (
            <>
              <Text style={styles.relatedLabel}>RELATED PACKAGES</Text>
              <View style={styles.relatedList}>
                {relatedPackages.map((item) => (
                  <TouchableOpacity key={item.id} accessibilityRole="button" onPress={() => router.push(`/packages/${item.id}`)} style={styles.relatedCard}>
                    <Image source={{ uri: item.image }} style={styles.packageImage} />
                    <View style={styles.relatedCopy}>
                      <Text style={styles.packageDestination}>{item.destination}</Text>
                      <Text style={styles.relatedName} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.relatedMeta}>{item.duration}  ·  From {item.price}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cta}>
        <View style={styles.ctaCopy}>
          <Text style={styles.ctaEyebrow}>READY TO GO?</Text>
          <Text style={styles.ctaTitle}>Plan this journey</Text>
          <Text style={styles.ctaText}>Turn inspiration into a trip with LemonTrip.</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => (firstPackage ? router.push(`/packages/${firstPackage.id}`) : router.push('/(tabs)/explore'))}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>{firstPackage ? 'View package' : 'Explore journeys'}</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  cover: { marginHorizontal: 16, height: 230, borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  header: { paddingHorizontal: Ui.space.page + 4, paddingTop: 20 },
  category: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, letterSpacing: 0.8 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.display, lineHeight: 28, fontWeight: FontWeight.extraBold, marginTop: 8 },
  excerpt: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 23, marginTop: 12 },
  metadata: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 14, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },

  body: { paddingHorizontal: Ui.space.page + 4, paddingTop: 16 },
  paragraph: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 24, marginBottom: 14 },

  note: { marginHorizontal: 16, marginTop: 6, padding: 16, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  noteTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, lineHeight: 24, fontWeight: FontWeight.extraBold, marginTop: 8 },
  noteText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20, marginTop: 4 },

  related: { ...Ui.card, marginHorizontal: 16, marginTop: 16, padding: 18 },
  eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, letterSpacing: 0.8 },
  relatedTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold, marginTop: 4 },
  relatedLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  relatedList: { gap: 8 },
  relatedCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.background },
  destinationImage: { width: 56, height: 56, borderRadius: 10 },
  packageImage: { width: 72, height: 62, borderRadius: 10 },
  relatedCopy: { flex: 1, minWidth: 0 },
  relatedName: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  relatedMeta: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 3 },
  packageDestination: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginHorizontal: 16, marginTop: 16, padding: 18, borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  ctaCopy: { flex: 1, minWidth: 0 },
  ctaEyebrow: { color: '#1B6B4A', fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, letterSpacing: 0.8 },
  ctaTitle: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold, marginTop: 4 },
  ctaText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 20, marginTop: 4 },
  ctaButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderRadius: Ui.radius.button, backgroundColor: '#103D30' },
  ctaButtonText: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 9 },
  backToStories: { marginTop: 13, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.accent },
  backToStoriesText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
});