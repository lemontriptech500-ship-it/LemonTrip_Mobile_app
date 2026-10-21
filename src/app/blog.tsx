import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { SupportPage, goBackOr, goTo } from '@/components/support/SupportKit';
import type { BlogPost } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

const ALL = 'All stories';
// Hero banner artwork (the green collage from assets/images).
const BANNER = require('../../assets/images/Emerald Travel Adventure Collage.png');

export default function BlogScreen() {
  useAppLanguage();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const { items: blogPosts, loading, error } = useContentItems<BlogPost>('blog');
  const categories = useMemo(() => [ALL, ...new Set(blogPosts.map((post) => post.category))], [blogPosts]);
  const visiblePosts = useMemo(
    () => (activeCategory === ALL ? blogPosts : blogPosts.filter((post) => post.category === activeCategory)),
    [activeCategory, blogPosts],
  );

  return (
    <SupportPage
      eyebrow="THE LEMONTRIP JOURNAL"
      title="Travel stories"
      subtitle="Ideas, guides, and places worth taking the long way to."
      onBack={() => goBackOr('/home')}
      hero={{ image: BANNER, topTitle: 'Travel stories', onSettings: () => goTo('/settings') }}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.eyebrow}>BROWSE THE JOURNAL</Text>
        <Text style={styles.sectionTitle}>Stories for wherever you are going</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <TouchableOpacity
              key={category}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setActiveCategory(category)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.sectionHeader, styles.listHeader]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>LATEST NOTES</Text>
          <Text style={styles.sectionTitle}>{activeCategory === ALL ? 'More to read' : activeCategory}</Text>
        </View>
        <Text style={styles.count}>{visiblePosts.length} stories</Text>
      </View>

      <View style={styles.list}>
        {visiblePosts.map((post) => <ArticleCard key={post.id} post={post} />)}
      </View>

      {loading || error || !visiblePosts.length ? (
        <View style={styles.emptyState}>
          <TravelArtworkIcon name="stories" size={40} />
          <Text style={styles.emptyTitle}>{loading ? 'Loading stories…' : error ?? 'More stories are on the way'}</Text>
          <Text style={styles.emptyText}>{error ? 'Please try again later.' : 'Try another journal category.'}</Text>
        </View>
      ) : null}
    </SupportPage>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={post.title}
      onPress={() => router.push(`/blog/${post.id}`)}
      style={styles.card}
      activeOpacity={0.9}
    >
      <Image source={{ uri: post.image }} resizeMode="cover" style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.meta}>
          <Text style={styles.category} numberOfLines={1}>{post.category}</Text>
          <Text style={styles.time}>{post.readingTime}</Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>{post.title}</Text>
        <Text style={styles.date}>{post.date}</Text>
        <View style={styles.footer}>
          <Text style={styles.readStory}>Read story</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.textDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginHorizontal: Ui.space.page, marginBottom: 12 },
  listHeader: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 24 },
  eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, letterSpacing: 0.8 },
  sectionTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.heading, lineHeight: 26, fontWeight: FontWeight.extraBold, marginTop: 3 },
  count: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginBottom: 2 },

  categoryRow: { gap: 8, paddingHorizontal: Ui.space.page },
  chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.pill + 4, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold },
  chipTextActive: { color: Colors.white },

  list: { gap: 12, paddingHorizontal: Ui.space.page },
  card: { ...Ui.card, flexDirection: 'row', overflow: 'hidden', minHeight: 124, borderRadius: 20 },
  cardImage: { width: '42%', alignSelf: 'stretch', backgroundColor: Colors.surfaceMuted },
  cardBody: { flex: 1, paddingHorizontal: 13, paddingTop: 11, paddingBottom: 9 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  category: { flexShrink: 1, color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, textTransform: 'uppercase' },
  time: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge - 1, lineHeight: 20, fontWeight: FontWeight.extraBold, marginTop: 5 },
  date: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 7, borderTopWidth: 1, borderTopColor: Colors.border },
  readStory: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },

  emptyState: { alignItems: 'center', justifyContent: 'center', margin: Ui.space.page, padding: 30, borderRadius: 16, backgroundColor: Colors.surface },
  emptyTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, marginTop: 9 },
  emptyText: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 4 },
});