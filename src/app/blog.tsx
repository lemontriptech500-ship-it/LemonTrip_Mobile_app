import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { blogPosts } from '@/data/blog';

export default function BlogScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Travel Inspiration</Text>
        <Text style={styles.headerSubtitle}>Tips, guides, and stories to inspire your next adventure</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {blogPosts.map((post) => (
          <View key={post.id} style={styles.card}>
            <Image source={{ uri: post.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.metaRow}>
                <Text style={styles.category}>{post.category}</Text>
                <Text style={styles.date}>{post.date}</Text>
              </View>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.excerpt}>{post.excerpt}</Text>
            </View>
          </View>
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
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backArrow: {
    color: Colors.accent,
    fontSize: 14,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 13,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 6,
  },
  excerpt: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
});