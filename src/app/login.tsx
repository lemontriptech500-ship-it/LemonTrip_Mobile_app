import { Colors } from '@/constants/colors';
import { login } from '@/utils/authStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateAndLogin = () => {
    let hasError = false;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email or phone is required');
      hasError = true;
    } else if (email.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    login({ name: email.split('@')[0] || 'User', email: email.trim() });
    router.replace('/(tabs)/profile');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>LemonTrip</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue your journey</Text>

          <Text style={styles.label}>Email or Phone</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Enter your email or phone"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            autoCapitalize="none"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textLight}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            secureTextEntry
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity style={styles.loginButton} onPress={validateAndLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')} style={styles.signupLink}>
            <Text style={styles.signupText}>
              Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBack} style={styles.backLink}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logoText: {
    color: Colors.accent,
    fontSize: 26,
    fontWeight: 'bold',
  },
  form: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 6,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  signupTextBold: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});