
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const GREEN = '#075638';
const DARK_GREEN = '#153C2D';
const YELLOW = '#FFD83D';
const BG = '#F4F8F4';

export default function PaymentMethodSavedScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const params = useLocalSearchParams<{ method?: string }>();

  const method = Array.isArray(params.method)
    ? params.method[0]
    : params.method;

  const methodInfo = {
    upi: {
      title: 'UPI Payment',
      subtitle: 'UPI payment method selected',
      icon: 'phone-portrait-outline' as const,
    },
    card: {
      title: 'Debit / Credit Card',
      subtitle: 'Card payment method selected',
      icon: 'card-outline' as const,
    },
    bank: {
      title: 'Bank Account',
      subtitle: 'Bank payment method selected',
      icon: 'business-outline' as const,
    },
  };

  const selected =
    methodInfo[method as keyof typeof methodInfo] || methodInfo.upi;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="wallet-outline" size={24} color={YELLOW} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>LemonTrip Wallet</Text>
          <Text style={styles.headerSubtitle}>Payment confirmation</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: compact ? 20 : 30 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={48} color={GREEN} />
        </View>

        <Text style={styles.title}>Payment Method Added!</Text>
        <Text style={styles.subtitle}>
          Your payment method has been added successfully.
        </Text>

        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={17} color={GREEN} />
          <Text style={styles.successBadgeText}>Success</Text>
        </View>

        <View style={styles.methodCard}>
          <View style={styles.methodIcon}>
            <Ionicons name={selected.icon} size={28} color={GREEN} />
          </View>

          <View style={styles.methodInfo}>
            <Text style={styles.methodLabel}>Selected Payment Method</Text>
            <Text style={styles.methodTitle}>{selected.title}</Text>
            <Text style={styles.methodSubtitle}>{selected.subtitle}</Text>
          </View>

          <Ionicons name="checkmark-circle" size={24} color="#168044" />
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={23}
            color={GREEN}
          />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>You're all set!</Text>
            <Text style={styles.infoText}>
              You can manage your payment options anytime from your Wallet.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => router.replace('/wallet/payment-methods' as any)}
        >
          <Text style={styles.primaryButtonText}>
            Back to Payment Methods
          </Text>
          <Ionicons name="arrow-forward" size={20} color={DARK_GREEN} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)/wallet' as any)}
        >
          <Ionicons name="wallet-outline" size={20} color={GREEN} />
          <Text style={styles.secondaryButtonText}>Go to Wallet</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          UI demo only. No actual payment details have been saved.
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 17,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,216,61,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D8E8DF',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 38,
    paddingBottom: 35,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#DDF2E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#ECF7EF',
  },
  title: {
    color: DARK_GREEN,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    color: '#758379',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 300,
  },
  successBadge: {
    backgroundColor: '#E1F3E6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: 16,
  },
  successBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '800',
  },
  methodCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E3EBE4',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 31,
  },
  methodIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E7F3E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
    minWidth: 0,
  },
  methodLabel: {
    color: '#859087',
    fontSize: 10,
    marginBottom: 5,
  },
  methodTitle: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  methodSubtitle: {
    color: '#839087',
    fontSize: 11,
    marginTop: 5,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#E7F2E9',
    borderRadius: 17,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginTop: 17,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  infoText: {
    color: '#5D7364',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  primaryButton: {
    width: '100%',
    minHeight: 55,
    backgroundColor: YELLOW,
    borderRadius: 16,
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GREEN,
    backgroundColor: '#FFFFFF',
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  note: {
    color: '#8A958D',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
