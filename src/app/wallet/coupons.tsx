
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#075638';
const DARK_GREEN = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';

const coupons = [
  {
    code: 'LEMON100',
    title: 'Flat ₹100 OFF',
    description: 'Save on your next eligible bus booking.',
    condition: 'Minimum booking ₹599',
    color: '#E5F4E9',
    icon: 'ticket-outline' as const,
  },
  {
    code: 'TRAVEL10',
    title: '10% OFF',
    description: 'Get a discount on an eligible trip.',
    condition: 'Terms and conditions apply',
    color: '#FFF3C7',
    icon: 'pricetag-outline' as const,
  },
  {
    code: 'WELCOME50',
    title: 'Flat ₹50 OFF',
    description: 'A little saving for your next journey.',
    condition: 'For eligible bookings',
    color: '#E8EDFF',
    icon: 'gift-outline' as const,
  },
];

export default function CouponsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/wallet' as any);
    }
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();

    if (!normalized) {
      Alert.alert('Enter a promo code', 'Please enter a code first.');
      return;
    }

    const exists = coupons.some((coupon) => coupon.code === normalized);

    if (!exists) {
      setAppliedCode('');
      Alert.alert(
        'Coupon not found',
        'Please check the code. Only demo coupons are available on this screen.'
      );
      return;
    }

    setAppliedCode(normalized);
    setPromoCode(normalized);
    Alert.alert(
      'Coupon selected',
      `${normalized} is selected for demo purposes. The discount is not applied to a real booking yet.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Coupons & Rewards</Text>
          <Text style={styles.headerSubtitle}>
            Save more on your journeys
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="gift-outline" size={24} color={YELLOW} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: compact ? 16 : 28 },
        ]}
      >
        <View style={styles.rewardBanner}>
          <View style={styles.bannerTop}>
            <View style={styles.rewardIcon}>
              <Ionicons name="sparkles-outline" size={27} color={DARK_GREEN} />
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>LEMONTRIP REWARDS</Text>
            </View>
          </View>

          <Text style={styles.bannerTitle}>Your next trip, for less!</Text>
          <Text style={styles.bannerDescription}>
            Choose an available offer and save on eligible bookings.
          </Text>

          <View style={styles.bannerFooter}>
            <Ionicons name="pricetag-outline" size={17} color={YELLOW} />
            <Text style={styles.bannerFooterText}>
              Offers may have minimum booking requirements
            </Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.sectionTitle}>Have a promo code?</Text>
          <Text style={styles.sectionDescription}>
            Enter your code to select an offer.
          </Text>

          <View style={styles.promoInputRow}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="ticket-outline"
                size={20}
                color="#829087"
              />
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor="#9AA59D"
                autoCapitalize="characters"
                value={promoCode}
                onChangeText={setPromoCode}
                returnKeyType="done"
                onSubmitEditing={() => applyCoupon(promoCode)}
              />
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => applyCoupon(promoCode)}
              activeOpacity={0.8}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {appliedCode ? (
            <View style={styles.appliedMessage}>
              <Ionicons
                name="checkmark-circle"
                size={17}
                color="#168044"
              />
              <Text style={styles.appliedText}>
                {appliedCode} selected
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Available Offers</Text>
            <Text style={styles.sectionDescription}>
              Choose an offer for your next trip
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{coupons.length}</Text>
          </View>
        </View>

        {coupons.map((coupon) => {
          const isApplied = appliedCode === coupon.code;

          return (
            <View key={coupon.code} style={styles.couponCard}>
              <View
                style={[
                  styles.couponIcon,
                  { backgroundColor: coupon.color },
                ]}
              >
                <Ionicons
                  name={coupon.icon}
                  size={26}
                  color={GREEN}
                />
              </View>

              <View style={styles.couponInfo}>
                <Text style={styles.couponTitle}>{coupon.title}</Text>
                <Text style={styles.couponDescription}>
                  {coupon.description}
                </Text>
                <Text style={styles.couponCondition}>
                  {coupon.condition}
                </Text>

                <View style={styles.codePill}>
                  <Text style={styles.codeLabel}>CODE</Text>
                  <Text style={styles.codeText}>{coupon.code}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.selectButton,
                  isApplied && styles.selectedButton,
                ]}
                onPress={() => applyCoupon(coupon.code)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectButtonText,
                    isApplied && styles.selectedButtonText,
                  ]}
                >
                  {isApplied ? 'Selected' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.termsCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={GREEN}
          />
          <View style={styles.termsContent}>
            <Text style={styles.termsTitle}>Good to know</Text>
            <Text style={styles.termsText}>
              Offers are sample UI data. Actual coupon eligibility, expiry
              dates and discounts must be verified during booking.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => router.replace('/(tabs)/wallet' as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="wallet-outline" size={21} color={DARK_GREEN} />
          <Text style={styles.walletButtonText}>Back to Wallet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    backgroundColor: GREEN,
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 21,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D9E9DF',
    fontSize: 12,
    marginTop: 4,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,216,61,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 19,
    paddingBottom: 35,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  rewardBanner: {
    backgroundColor: DARK_GREEN,
    borderRadius: 22,
    padding: 20,
    marginBottom: 19,
  },
  bannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
    gap: 8,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  rewardBadgeText: {
    color: '#F9E99A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  bannerDescription: {
    color: '#D8E8DF',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  bannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 17,
  },
  bannerFooterText: {
    color: '#F4E7A4',
    fontSize: 10,
    flex: 1,
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    marginBottom: 25,
  },
  sectionTitle: {
    color: DARK_GREEN,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionDescription: {
    color: '#7D8A81',
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 16,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    backgroundColor: '#F7F9F7',
    borderWidth: 1,
    borderColor: '#E2E9E3',
    borderRadius: 12,
  },
  promoInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 10,
    color: DARK_GREEN,
    fontSize: 12,
  },
  applyButton: {
    minHeight: 48,
    minWidth: 72,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  appliedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  appliedText: {
    color: '#168044',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  countBadge: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: '#E1F0E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  couponCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E6ECE7',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  couponIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponInfo: {
    flex: 1,
    minWidth: 0,
  },
  couponTitle: {
    color: DARK_GREEN,
    fontSize: 16,
    fontWeight: '900',
  },
  couponDescription: {
    color: '#6F7D73',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  couponCondition: {
    color: '#89948C',
    fontSize: 10,
    marginTop: 6,
  },
  codePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#F0F5F0',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 9,
    borderWidth: 1,
    borderColor: '#D8E5D9',
    borderStyle: 'dashed',
  },
  codeLabel: {
    color: '#879187',
    fontSize: 9,
    fontWeight: '700',
  },
  codeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  selectButton: {
    minWidth: 59,
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  selectedButton: {
    backgroundColor: '#E1F2E5',
    borderWidth: 1,
    borderColor: '#B9DCC2',
  },
  selectedButtonText: {
    color: GREEN,
  },
  termsCard: {
    backgroundColor: '#E9F2EB',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  termsContent: {
    flex: 1,
  },
  termsTitle: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  termsText: {
    color: '#607568',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  walletButton: {
    minHeight: 53,
    backgroundColor: YELLOW,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 20,
  },
  walletButtonText: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
});
