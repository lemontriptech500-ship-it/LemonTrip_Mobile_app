import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import type { BlogPost } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function BlogScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [activeCategory, setActiveCategory] = useState('All stories');
  const { items: blogPosts, loading, error } = useContentItems<BlogPost>('blog');
  const categories = useMemo(() => ['All stories', ...new Set(blogPosts.map((post) => post.category))], [blogPosts]);
  const featured = blogPosts[0];
  const visiblePosts = useMemo(() => activeCategory === 'All stories' ? blogPosts : blogPosts.filter((post) => post.category === activeCategory), [activeCategory, blogPosts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.content}>
          <ScreenHeader title="Travel stories" subtitle="Ideas, guides, and places worth taking the long way to." eyebrow="THE LEMONTRIP JOURNAL" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />

          {featured ? <TouchableOpacity accessibilityRole="button" onPress={() => router.push(`/blog/${featured.id}`)} style={styles.hero} activeOpacity={0.94}>
            <ImageBackground source={{ uri: featured.image }} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
              <View style={styles.heroShade} />
              <View style={styles.heroCopy}>
                <Text style={styles.heroCategory}>{featured.category.toUpperCase()}</Text>
                <Text style={styles.heroTitle}>{featured.title}</Text>
                <Text style={styles.heroDescription}>{featured.excerpt}</Text>
                <View style={styles.heroFooter}><View style={styles.readButton}><Text style={styles.readButtonText}>Read article</Text><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} /></View><Text style={styles.heroTime}>{featured.readingTime}</Text></View>
              </View>
            </ImageBackground>
          </TouchableOpacity> : null}

          <View style={styles.categoryHeader}><View><Text style={styles.eyebrow}>BROWSE THE JOURNAL</Text><Text style={styles.sectionTitle}>Stories for wherever you are going</Text></View></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            {categories.map((category) => <TouchableOpacity key={category} onPress={() => setActiveCategory(category)} style={[styles.categoryChip, activeCategory === category && styles.categoryChipActive]}><Text style={[styles.categoryChipText, activeCategory === category && styles.categoryChipTextActive]}>{category}</Text></TouchableOpacity>)}
          </ScrollView>

          <View style={styles.articleHeader}><View><Text style={styles.eyebrow}>LATEST NOTES</Text><Text style={styles.sectionTitle}>{activeCategory === 'All stories' ? 'More to read' : activeCategory}</Text></View><Text style={styles.articleCount}>{visiblePosts.length} stories</Text></View>
          <View style={[styles.articleGrid, desktop && styles.articleGridDesktop]}>
            {visiblePosts.map((post) => <ArticleCard key={post.id} post={post} desktop={desktop} />)}
          </View>
          {loading || error || !visiblePosts.length ? <View style={styles.emptyState}><TravelArtworkIcon name="stories" size={40} /><Text style={styles.emptyTitle}>{loading ? 'Loading stories…' : error ?? 'More stories are on the way'}</Text><Text style={styles.emptyText}>{error ? 'Please try again later.' : 'Try another journal category.'}</Text></View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ArticleCard({ post, desktop }: { post: BlogPost; desktop: boolean }) {
  return <TouchableOpacity accessibilityRole="button" onPress={() => router.push(`/blog/${post.id}`)} style={[styles.articleCard, desktop && styles.articleCardDesktop]} activeOpacity={0.9}><Image source={{ uri: post.image }} style={styles.articleImage} /><View style={styles.articleBody}><View style={styles.articleMeta}><Text style={styles.articleCategory}>{post.category}</Text><Text style={styles.articleTime}>{post.readingTime}</Text></View><Text style={styles.articleTitle} numberOfLines={2}>{post.title}</Text><Text style={styles.articleDate}>{post.date}</Text><View style={styles.cardFooter}><Text style={styles.readStory}>Read story</Text><Ionicons name="arrow-forward" size={15} color={Colors.primary} /></View></View></TouchableOpacity>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 34 }, content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  hero: { marginHorizontal: 15, overflow: 'hidden', borderRadius: 21, backgroundColor: Colors.primaryDark }, heroImage: { minHeight: 370, justifyContent: 'flex-end' }, heroImageStyle: { borderRadius: 21 }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.heroOverlay }, heroCopy: { maxWidth: 650, padding: 22 }, heroCategory: { color: Colors.accent, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.2 }, heroTitle: { color: Colors.white, fontFamily: FontFamily.sans, fontSize: TextSize.hero, lineHeight: 36, fontWeight: FontWeight.extraBold, marginTop: 8 }, heroDescription: { maxWidth: 570, color: Colors.onDarkMuted, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 7 }, heroFooter: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 16 }, readButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, borderRadius: Ui.radius.control, backgroundColor: Colors.accent }, readButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold }, heroTime: { color: Colors.onDarkMuted, fontFamily: FontFamily.sans, fontSize: TextSize.body },
  categoryHeader: { marginTop: 26, marginHorizontal: Ui.space.page, marginBottom: 11 }, eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1.1 }, sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 4 }, categoryRow: { gap: 7, paddingHorizontal: 16 }, categoryChip: { minHeight: 35, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.pill, backgroundColor: Colors.surface }, categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary }, categoryChipText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold }, categoryChipTextActive: { color: Colors.white },
  articleHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 28, marginHorizontal: Ui.space.page, marginBottom: 11 }, articleCount: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body }, articleGrid: { gap: 12, paddingHorizontal: 16 }, articleGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }, articleCard: { ...Ui.card, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.card, backgroundColor: Colors.surface }, articleCardDesktop: { width: '48.8%' }, articleImage: { width: '100%', height: 170, backgroundColor: Colors.surfaceMuted }, articleBody: { padding: 13 }, articleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, articleCategory: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold }, articleTime: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body }, articleTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, lineHeight: 24, fontWeight: FontWeight.extraBold, marginTop: 8 }, articleDate: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 6 }, cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }, readStory: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold }, emptyState: { alignItems: 'center', justifyContent: 'center', margin: 16, padding: 30, borderRadius: 16, backgroundColor: Colors.surface }, emptyTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 9 }, emptyText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 4 },
});
