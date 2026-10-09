import { Brand } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppRoute = Parameters<typeof router.replace>[0];

const slides = [
  {
    image: require('../../assets/images/onboarding1.png'),
    title: 'Discover',
    accent: 'New Destinations',
    description: 'Explore the world with exclusive deals and unforgettable experiences.',
  },
  {
    image: require('../../assets/images/onboarding2.png'),
    title: 'Best Deals',
    accent: 'on Hotels',
    description: 'Find beautiful stays and unforgettable escapes at great prices.',
  },
  {
    image: require('../../assets/images/onboarding3.png'),
    title: 'Explore More',
    accent: 'Travel Further',
    description: 'Make every trip memorable with experiences worth travelling for.',
  },
  {
    image: require('../../assets/images/onboarding4.png'),
    title: 'Your Journey',
    accent: 'Our Priority',
    description: 'Flights, hotels, buses, trains and more — all in one place.',
  },
];

async function leave(path: AppRoute) {
  await AsyncStorage.setItem('onboardingSeen', '1');
  router.replace(path);
}

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<ScrollView>(null);
  const slideWidth = width;
  const compact = width < 360;

  function goToSlide(index: number) {
    setActiveSlide(index);
    carouselRef.current?.scrollTo({ x: index * slideWidth, animated: true });
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
          setActiveSlide(Math.max(0, Math.min(slides.length - 1, index)));
        }}
        style={styles.carousel}
      >
        {slides.map((item, index) => (
          <View key={item.title} style={[styles.slide, { width: slideWidth }]}>
            <Image source={item.image} contentFit="cover" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(5,31,24,0.03)', 'rgba(5,31,24,0.08)', 'rgba(7,43,32,0.84)', Brand.forest]}
              locations={[0, 0.42, 0.72, 1]}
              style={StyleSheet.absoluteFill}
            />

            {index === 0 ? <View pointerEvents="none" style={styles.planeDecoration}>
              <Ionicons name="airplane" size={48} color="#FFFFFF" />
            </View> : null}

            <View style={styles.content}>
              <Text style={[styles.heading, compact && styles.headingCompact]}>
                {item.title}{'\n'}<Text style={styles.headingAccent}>{item.accent}</Text>
              </Text>
              <Text style={styles.description}>{item.description}</Text>

              <View style={styles.controls}>
                <View style={styles.pagination} accessibilityLabel={`Slide ${index + 1} of ${slides.length}`}>
                  {slides.map((slide, dotIndex) => (
                    <Pressable
                      key={slide.title}
                      accessibilityRole="button"
                      accessibilityLabel={`Show introduction ${dotIndex + 1}`}
                      onPress={() => goToSlide(dotIndex)}
                      hitSlop={8}
                      style={[styles.dot, dotIndex === activeSlide && styles.dotActive]}
                    />
                  ))}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={index === slides.length - 1 ? 'Create account' : 'Next introduction'}
                  onPress={() => index < slides.length - 1 ? goToSlide(index + 1) : leave('/signup')}
                  style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
                >
                  <Ionicons name="arrow-forward" size={23} color={Brand.forest} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.forest },
  carousel: { flex: 1 },
  slide: { flex: 1, overflow: 'hidden', backgroundColor: Brand.forest },
  planeDecoration: { position: 'absolute', top: '31%', left: '47%', transform: [{ rotate: '-24deg' }], opacity: 0.95 },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 27, paddingBottom: 18 },
  heading: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 34, lineHeight: 41, fontWeight: '800' },
  headingCompact: { fontSize: 26, lineHeight: 32 },
  headingAccent: { color: Brand.lemon },
  description: { maxWidth: 350, marginTop: 11, color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 14, lineHeight: 21 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 8, height: 8, backgroundColor: Brand.lemon },
  nextButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: Brand.lemon, alignItems: 'center', justifyContent: 'center' },
  nextButtonPressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
});
