
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

const options = [
  { id: 'upi', label: 'UPI ID', icon: 'phone-portrait-outline' as const },
  { id: 'card', label: 'Debit / Credit Card', icon: 'card-outline' as const },
  { id: 'bank', label: 'Bank Account', icon: 'business-outline' as const },
];

export default function AddPaymentMethodScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 600;

  const [type, setType] = useState('upi');
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');
  const [saveDefault, setSaveDefault] = useState(true);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/wallet/payment-methods' as any);
    }
  };

  
const handleSave = () => {
  if (!name.trim() || !detail.trim()) {
    Alert.alert(
      'Missing details',
      'Please enter your name and payment details.'
    );
    return;
  }

  if (type === 'upi' && !detail.includes('@')) {
    Alert.alert(
      'Invalid UPI ID',
      'Please enter a UPI ID like demo@bank.'
    );
    return;
  }

  router.push(
    `/wallet/payment-method-saved?method=${type}` as any
  );
};


  const detailLabel =
    type === 'upi'
      ? 'UPI ID'
      : type === 'card'
        ? 'Card Number'
        : 'Bank Account Number';

  const detailPlaceholder =
    type === 'upi'
      ? 'example@bank'
      : type === 'card'
        ? 'Enter demo card number'
        : 'Enter demo account number';

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
          <Text style={styles.headerTitle}>Add Payment Method</Text>
          <Text style={styles.headerSubtitle}>
            Choose and set up a payment option
          </Text>
        </View>

        <Ionicons name="card-outline" size={26} color={YELLOW} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: compact ? 17 : 28 },
        ]}
      >
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={28}
              color={DARK_GREEN}
            />
          </View>
          <Text style={styles.introTitle}>Add a Payment Method</Text>
          <Text style={styles.introDescription}>
            Select a method and enter sample details to preview the flow.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Payment Type</Text>

        {options.map((item) => {
          const active = type === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setType(item.id);
                setDetail('');
              }}
              activeOpacity={0.8}
              style={[
                styles.optionCard,
                active && styles.optionCardActive,
              ]}
            >
              <View
                style={[
                  styles.optionIcon,
                  active && styles.optionIconActive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={23}
                  color={active ? '#FFFFFF' : GREEN}
                />
              </View>

              <Text style={styles.optionLabel}>{item.label}</Text>

              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#9AA59D"
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.fieldLabel}>{detailLabel}</Text>
          <TextInput
            value={detail}
            onChangeText={setDetail}
            placeholder={detailPlaceholder}
            placeholderTextColor="#9AA59D"
            style={styles.input}
            keyboardType={type === 'upi' ? 'email-address' : 'number-pad'}
            autoCapitalize="none"
            maxLength={type === 'card' ? 19 : undefined}
          />

          <Text style={styles.fieldHint}>
            UI preview only. Do not enter real card or bank details.
          </Text>

          <TouchableOpacity
            style={styles.defaultRow}
            onPress={() => setSaveDefault(!saveDefault)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                saveDefault && styles.checkboxActive,
              ]}
            >
              {saveDefault && (
                <Ionicons name="checkmark" size={15} color="#FFFFFF" />
              )}
            </View>

            <View style={styles.defaultTextContainer}>
              <Text style={styles.defaultTitle}>
                Set as default method
              </Text>
              <Text style={styles.defaultSubtitle}>
                Use as your preferred option (demo)
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <Ionicons name="lock-closed-outline" size={20} color={GREEN} />
          <Text style={styles.securityText}>
            Never share your PIN, password, CVV or OTP. This demo does not
            store the entered details.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={DARK_GREEN} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.replace('/wallet/payment-methods' as any)
          }
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 21,
    gap: 12,
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
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D9E9DF',
    fontSize: 12,
    marginTop: 4,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 35,
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  introCard: {
    backgroundColor: DARK_GREEN,
    borderRadius: 21,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  introTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  introDescription: {
    color: '#D8E8DF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 7,
  },
  sectionTitle: {
    color: DARK_GREEN,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 13,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4EBE5',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 11,
  },
  optionCardActive: {
    borderColor: GREEN,
    backgroundColor: '#F8FCF8',
  },
  optionIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAF4EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconActive: {
    backgroundColor: GREEN,
  },
  optionLabel: {
    flex: 1,
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '700',
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#B8C4BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: GREEN,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: GREEN,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5ECE6',
    marginTop: 12,
  },
  fieldLabel: {
    color: '#344B3A',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 9,
    marginBottom: 8,
  },
  input: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#DFE7E0',
    backgroundColor: '#F9FBF9',
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 14,
    color: DARK_GREEN,
  },
  fieldHint: {
    color: '#8A958D',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 21,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B8C4BA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  defaultTextContainer: {
    flex: 1,
  },
  defaultTitle: {
    color: DARK_GREEN,
    fontSize: 13,
    fontWeight: '700',
  },
  defaultSubtitle: {
    color: '#879188',
    fontSize: 11,
    marginTop: 4,
  },
  securityNote: {
    backgroundColor: '#E9F3EB',
    borderRadius: 14,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 17,
  },
  securityText: {
    flex: 1,
    color: '#53695A',
    fontSize: 11,
    lineHeight: 17,
  },
  saveButton: {
    minHeight: 54,
    backgroundColor: YELLOW,
    borderRadius: 16,
    marginTop: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: DARK_GREEN,
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  cancelButtonText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: '700',
  },
});
