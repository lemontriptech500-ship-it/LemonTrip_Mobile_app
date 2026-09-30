import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { blogPosts } from '@/data/blog';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlogScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Stories for the road" subtitle="Notes, guides, and ideas for your next journey." eyebrow="THE LEMON TRIP JOURNAL" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />

      <ScrollView contentContainerStyle={styles.list}>
        {blogPosts.map((post) => (
          <TouchableOpacity key={post.id} style={styles.card} onPress={() => router.push(`/blog/${post.id}`)}>
            <Image source={{ uri: post.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <Text style={styles.category}>{post.category}</Text>
                <Text style={styles.date}>{post.date}</Text>
              </View>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.excerpt}>{post.excerpt}</Text>
              <View style={styles.readMore}><Text style={styles.readMoreText}>Read story</Text><Ionicons name="arrow-forward" size={15} color={Colors.primary} /></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    gap: 21,
  },
  card: {
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 190,
  },
  cardBody: {
    paddingVertical: 13,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  date: {
    fontFamily: 'Manrope',
    fontSize: 10,
    color: Colors.textLight,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  excerpt: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 19,
  },
  readMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  readMoreText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800' },
});