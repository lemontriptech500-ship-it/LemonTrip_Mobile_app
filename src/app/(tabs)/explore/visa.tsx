import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const visaTypes = [
  { name: 'Tourist Visa', countries: 'UAE, Thailand, Singapore', processing: '3-5 days' },
  { name: 'Business Visa', countries: 'USA, UK, Schengen', processing: '10-15 days' },
  { name: 'Student Visa', countries: 'Canada, Australia, UK', processing: '15-30 days' },
];

const documentChecklist = [
  'Valid Passport (6+ months validity)',
  'Passport-size Photographs',
  'Proof of Travel Booking',
  'Bank Statements (last 3 months)',
  'Proof of Accommodation',
];

export default function VisaScreen() {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScreenHeader title="Visa, made clearer" subtitle="Expert guidance for your next border crossing." eyebrow="LEMON TRIP / VISA" onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore'))} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visa Types</Text>
          {visaTypes.map((visa, index) => (
            <View key={index} style={styles.visaCard}>
              <Text style={styles.visaName}>{visa.name}</Text>
              <Text style={styles.visaDetail}>Countries: {visa.countries}</Text>
              <Text style={styles.visaDetail}>Processing: {visa.processing}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Checklist</Text>
          <View style={styles.checklistCard}>
            {documentChecklist.map((doc, index) => (
              <View key={index} style={styles.checklistRow}>
                <Ionicons name="checkmark-circle-outline" size={17} color={Colors.secondary} style={styles.checkmark} />
                <Text style={styles.checklistText}>{doc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Tracking</Text>
          <View style={styles.trackingCard}>
            {applied ? (
              <>
                <Text style={[styles.trackingEmpty, { color: Colors.primary, fontWeight: 'bold', marginBottom: 6 }]}>
                  Application submitted
                </Text>
                <Text style={styles.trackingEmpty}>
                  Status: Under Review · We'll notify you once processing begins.
                </Text>
              </>
            ) : (
              <Text style={styles.trackingEmpty}>
                No active visa applications. Start a new application to track its progress here.
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.applyButton, applied && { backgroundColor: Colors.success }]}
          disabled={applied}
          onPress={handleApply}>
          <Text style={styles.applyButtonText}>
            {applied ? 'Application submitted' : 'Start visa application'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: 22,
    paddingTop: 21,
  },
  sectionTitle: {
    fontFamily: 'Manrope',
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
  },
  visaCard: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 13,
    marginBottom: 10,
  },
  visaName: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  visaDetail: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textLight,
    marginBottom: 2,
  },
  checklistCard: {
    backgroundColor: Colors.white,
    padding: 15,
    gap: 10,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.success,
    fontWeight: 'bold',
    marginRight: 9,
  },
  checklistText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textDark,
    flex: 1,
  },
  trackingCard: {
    backgroundColor: Colors.surfaceMuted,
    padding: 17,
  },
  trackingEmpty: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  applyButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
  },
});