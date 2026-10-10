
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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

type Method = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const methods: Method[] = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: 'card-outline',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'Pay through your bank',
    icon: 'business-outline',
  },
];

export default function PaymentMethodsScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const [selected, setSelected] = useState('upi');

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/wallet' as any);
    }
  };

 
const handleAddMethod = () => {
  router.push('/wallet/add-payment-method' as any);
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
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <Text style={styles.headerSubtitle}>
            Manage your payment options
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="card-outline" size={23} color={YELLOW} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: compact ? 16 : 28 },
        ]}
      >
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color={DARK_GREEN}
            />
          </View>

          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Safe & Secure Payments</Text>
            <Text style={styles.bannerSubtitle}>
              Choose your preferred way to pay on LemonTrip.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Methods</Text>
          <Text style={styles.sectionSubtitle}>Select one</Text>
        </View>

        {methods.map((method) => {
          const active = selected === method.id;

          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                active && styles.methodCardActive,
              ]}
              onPress={() => setSelected(method.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.methodIcon,
                  active && styles.methodIconActive,
                ]}
              >
                <Ionicons
                  name={method.icon}
                  size={25}
                  color={active ? '#FFFFFF' : GREEN}
                />
              </View>

              <View style={styles.methodText}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodSubtitle}>
                  {method.subtitle}
                </Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  active && styles.radioOuterActive,
                ]}
              >
                {active && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMethod}
          activeOpacity={0.8}
        >
          <View style={styles.addIcon}>
            <Ionicons name="add" size={24} color={GREEN} />
          </View>
          <View style={styles.addTextContainer}>
            <Text style={styles.addTitle}>Add a Payment Method</Text>
            <Text style={styles.addSubtitle}>
              Link a new payment option
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7E8B82" />
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Ionicons
            name="lock-closed-outline"
            size={21}
            color={GREEN}
          />
          <Text style={styles.tipText}>
            Never share your UPI PIN, card PIN or OTP with anyone.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          activeOpacity={0.85}
          onPress={() => {
            router.push({
              pathname: '/wallet/add-money' as any,
              params: { method: selected },
            });
          }}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={DARK_GREEN} />
        </TouchableOpacity>

        <Text style={styles.demoNote}>
          Payment method selection is a UI demo. No bank or card details
          are saved.
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
    paddingTop: 20,
    paddingBottom: 35,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  banner: {
    backgroundColor: '#E4F1E7',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 27,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: '#5F7567',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  sectionTitle: {
    color: DARK_GREEN,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#7E8B82',
    fontSize: 12,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE6',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: GREEN,
    borderWidth: 1.5,
    backgroundColor: '#F8FCF8',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: {
    backgroundColor: GREEN,
  },
  methodText: {
    flex: 1,
    minWidth: 0,
  },
  methodTitle: {
    color: '#243C2D',
    fontSize: 14,
    fontWeight: '800',
  },
  methodSubtitle: {
    color: '#849087',
    fontSize: 11,
    marginTop: 5,
  },
  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#B9C5BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: GREEN,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5ECE6',
    borderStyle: 'dashed',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 7,
  },
  addIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF5C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTextContainer: {
    flex: 1,
  },
  addTitle: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: '800',
  },
  addSubtitle: {
    color: '#849087',
    fontSize: 11,
    marginTop: 5,
  },
  tipCard: {
    backgroundColor: '#EDF4EE',
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
  },
  tipText: {
    flex: 1,
    color: '#53695A',
    fontSize: 12,
    lineHeight: 18,
  },
  continueButton: {
    minHeight: 54,
    backgroundColor: YELLOW,
    borderRadius: 16,
    marginTop: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueText: {
    color: DARK_GREEN,
    fontSize: 15,
    fontWeight: '800',
  },
  demoNote: {
    color: '#8A958D',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 15,
    paddingHorizontal: 8,
  },
});
