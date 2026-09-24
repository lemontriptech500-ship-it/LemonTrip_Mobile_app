import { Colors } from '@/constants/colors';
import { blogPosts } from '@/data/blog';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/blog');
  };

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFound}>Post not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: post.image }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{post.category}</Text>
            <Text style={styles.date}>{post.date}</Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.excerpt}>{post.excerpt}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textLight,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  content: {
    padding: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 14,
  },
  excerpt: {
    fontSize: 15,
    color: Colors.textLight,
    lineHeight: 22,
  },
});