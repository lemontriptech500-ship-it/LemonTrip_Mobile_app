import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const steps = ['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'];

export default function HotelPassengerDetailsScreen() {
  const params = useLocalSearchParams<{ hotelId?: string; hotelName?: string; roomName?: string; price?: string; checkIn?: string; checkOut?: string; guests?: string; rooms?: string }>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const hotelName = typeof params.hotelName === 'string' ? params.hotelName : 'Hotel stay';
  const roomName = typeof params.roomName === 'string' ? params.roomName : 'Standard room';
  const totalText = typeof params.price === 'string' ? params.price : '₹0';

  const handleContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Full name required', 'Please enter the lead guest name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter an email address for booking confirmation.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone number required', 'Please enter a valid phone number.');
      return;
    }

    router.push({
      pathname: '/hotel-payment',
      params: {
        hotelId: typeof params.hotelId === 'string' ? params.hotelId : '',
        hotelName,
        roomName,
        price: totalText,
        checkIn: typeof params.checkIn === 'string' ? params.checkIn : '',
        checkOut: typeof params.checkOut === 'string' ? params.checkOut : '',
        guests: typeof params.guests === 'string' ? params.guests : '2',
        rooms: typeof params.rooms === 'string' ? params.rooms : '1',
        fullName,
        email,
        phone,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passenger Details</Text>
        <Text style={styles.headerStep}>Step 5/7</Text>
      </View>

      <View style={styles.progressRow}>
        {steps.map((label, index) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.progressDot, index <= 2 && styles.progressDotActive]}>
              <Text style={[styles.progressNumber, index <= 2 && styles.progressNumberActive]}>{index + 1}</Text>
            </View>
            <Text style={[styles.progressLabel, index === 2 && styles.progressLabelActive]}>{label}</Text>
            {index < steps.length - 1 ? <View style={[styles.progressLine, index < 2 && styles.progressLineActive]} /> : null}
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEyebrow}>BOOKING SUMMARY</Text>
          <Text style={styles.hotelName}>{hotelName}</Text>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dates</Text>
            <Text style={styles.summaryValue}>{typeof params.checkIn === 'string' && typeof params.checkOut === 'string' ? `${params.checkIn} - ${params.checkOut}` : 'Choose dates'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{typeof params.guests === 'string' ? params.guests : '2'} guests · {typeof params.rooms === 'string' ? params.rooms : '1'} room</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{totalText}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formEyebrow}>LEAD GUEST</Text>
          <Text style={styles.formTitle}>Enter guest details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput value={fullName} onChangeText={setFullName} placeholder="Full Name" placeholderTextColor={Colors.textLight} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="Email Address" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.textLight} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput value={phone} onChangeText={setPhone} placeholder="Phone Number" keyboardType="phone-pad" placeholderTextColor={Colors.textLight} style={styles.input} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContinue} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6f3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  headerStep: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 10 },
  progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  progressDotActive: { backgroundColor: Colors.primary },
  progressNumber: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  progressNumberActive: { color: Colors.white },
  progressLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 5 },
  progressLabelActive: { color: Colors.primary, fontWeight: FontWeight.extraBold },
  progressLine: { position: 'absolute', top: 12, left: '60%', right: '-40%', height: 1, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.primary },
  page: { paddingHorizontal: 16, paddingBottom: 24 },
  summaryCard: { padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, shadowColor: '#0d382b', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 1 },
  summaryEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  hotelName: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 8 },
  roomName: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, marginTop: 3 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  summaryLabel: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  summaryValue: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
  totalValue: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  formCard: { marginTop: 18, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  formEyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  formTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, marginTop: 5 },
  field: { marginTop: 16 },
  label: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, marginBottom: 8 },
  input: { minHeight: 46, borderRadius: 11, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, paddingHorizontal: 12, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.micro },
  footer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 18, backgroundColor: Colors.surface },
  primaryButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accent },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold },
});
