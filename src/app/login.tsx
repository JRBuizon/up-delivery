// src/app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';
const FOREST_GREEN = '#2D6A4F';

export default function LoginScreen() {
  const { login } = useApp();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMsg(null);
    const result = await login(email, password, name);
    if (!result.success) {
      setErrorMsg(result.error || 'Login failed');
      return;
    }

    // If the user came from a restaurant checkout page, return them there with their cart intact
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const fillDemoAccount = (demoName: string, demoEmail: string) => {
    setName(demoName);
    setEmail(demoEmail);
    setPassword('iskolar123');
    setErrorMsg(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={36} color="#FFF" />
          </View>
          <Text style={styles.title}>UP Diliman Delivery</Text>
          <Text style={styles.subtitle}>
            Sign in with your UP Mail to place orders, track deliveries, earn rewards, or deliver for fellow Iskos.
          </Text>

          {/* Domain Restriction Badge */}
          <View style={styles.domainBadge}>
            <Ionicons name="shield-checkmark" size={14} color={FOREST_GREEN} />
            <Text style={styles.domainBadgeText}>Exclusive to @up.edu.ph UP Mail accounts</Text>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#C1121F" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Display Name Input */}
          <Text style={styles.label}>Nickname / First Name (Optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="e.g. Anton"
              placeholderTextColor="#999"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* UP Mail Input */}
          <Text style={styles.label}>UP Mail Address *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="username@up.edu.ph"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMsg) setErrorMsg(null);
              }}
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
            <TextInput
              placeholder="Enter password (min. 4 chars)"
              placeholderTextColor="#999"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleSignIn}>
            <Text style={styles.loginBtnText}>Sign In with UP Mail</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          >
            <Ionicons name="compass-outline" size={16} color="#555" />
            <Text style={styles.guestBtnText}>Continue Browsing as Guest</Text>
          </TouchableOpacity>

          {/* Quick Demo Switchers */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>⚡ Quick Fill Demo Accounts (For Testing P2P):</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoAccount('Anton', 'anton@up.edu.ph')}
              >
                <Text style={styles.demoChipText}>Student A (anton@up.edu.ph)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoChip}
                onPress={() => fillDemoAccount('Bea', 'bea@up.edu.ph')}
              >
                <Text style={styles.demoChipText}>Student B (bea@up.edu.ph)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: UP_MAROON,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 24, fontWeight: '900', color: UP_MAROON, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#D8F3DC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 14,
    marginBottom: 18,
  },
  domainBadgeText: { fontSize: 12, fontWeight: 'bold', color: FOREST_GREEN, marginLeft: 6 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: { color: '#C1121F', fontSize: 12, fontWeight: '600', marginLeft: 8, flex: 1 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#444', marginBottom: 6, marginTop: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#222' },
  loginBtn: {
    backgroundColor: UP_MAROON,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  loginBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  guestBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  guestBtnText: { color: '#555', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  demoSection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 14,
  },
  demoTitle: { fontSize: 11, color: '#777', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  demoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  demoChip: {
    flex: 1,
    backgroundColor: '#FDF0ED',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoChipText: { fontSize: 11, color: UP_MAROON, fontWeight: 'bold' },
});