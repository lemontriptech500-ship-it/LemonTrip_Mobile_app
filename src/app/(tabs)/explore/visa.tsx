import { Colors } from '@/constants/colors';
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore'))}>
            <Text style={styles.backArrow}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visa Services</Text>
          <Text style={styles.headerSubtitle}>Global travel, simplified visas</Text>
        </View>

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
                <Text style={styles.checkmark}>✓</Text>
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
                  Application Submitted ✓
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
            {applied ? 'Application Submitted ✓' : 'Start Visa Application'}
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 12,
  },
  visaCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  visaName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  visaDetail: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 2,
  },
  checklistCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    color: Colors.success,
    fontWeight: 'bold',
    marginRight: 8,
  },
  checklistText: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  trackingCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  trackingEmpty: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  applyButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.primaryDark,
    fontSize: 15,
    fontWeight: 'bold',
  },
});