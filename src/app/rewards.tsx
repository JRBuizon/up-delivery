// src/app/rewards.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp, Voucher } from '../context/AppContext';

const UP_MAROON = '#7B1113';

const REWARD_CATALOG: Voucher[] = [
  {
    id: 'cat-1',
    title: 'Free Campus Delivery',
    description: 'Waives the ₱15 delivery fee on any campus restaurant order.',
    pointsCost: 50,
    discountAmount: 15,
    code: 'FREEDEL',
  },
  {
    id: 'cat-2',
    title: '₱25 Off Student-Owned Stalls',
    description: 'Support fellow Iskos! Valid on any restaurant on campus.',
    pointsCost: 80,
    discountAmount: 25,
    code: 'ISKOPROUD25',
  },
  {
    id: 'cat-3',
    title: '₱50 Barkada Exam Week Treat',
    description: 'Take ₱50 off your next order during Hell Week study sessions.',
    pointsCost: 140,
    discountAmount: 50,
    code: 'UNO50',
  },
];

export default function RewardsScreen() {
  const { points, claimedVouchers, selectedVoucher, redeemVoucher, selectVoucherForCheckout, resetDemoData } = useApp();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRedeem = (voucher: Voucher) => {
    const success = redeemVoucher(voucher);
    if (success) {
      setFeedback(`🎉 Redeemed "${voucher.title}"! Find it under My Vouchers below.`);
    } else {
      setFeedback(`Not enough points yet. Place an order or complete a Rider trip to earn more!`);
    }
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleResetData = () => {
    const performReset = async () => {
      await resetDemoData();
      setFeedback('🧹 Account data and shared orders have been reset successfully.');
      setTimeout(() => setFeedback(null), 4000);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to reset your account data, points, and orders?')) {
        performReset();
      }
    } else {
      Alert.alert(
        'Reset Account Data',
        'Are you sure you want to reset your points, vouchers, and active orders back to default?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: performReset },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Iskolar Rewards ⭐</Text>
          <Text style={styles.headerSubtitle}>Earn 1 point per ₱10 spent or +10 pts per Rider delivery</Text>
        </View>

        {/* Points Hero Banner */}
        <View style={styles.pointsCard}>
          <View>
            <Text style={styles.tierBadge}>🏅 HONOR ROLL FOODIE</Text>
            <Text style={styles.pointsCount}>{points} <Text style={styles.ptsUnit}>pts</Text></Text>
            <Text style={styles.pointsSub}>Redeem points for instant discounts at checkout</Text>
          </View>
          <Ionicons name="ribbon" size={54} color="#F4A261" />
        </View>

        {feedback && (
          <View style={styles.feedbackBanner}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* My Claimed Vouchers */}
        <Text style={styles.sectionTitle}>🎟️ My Vouchers ({claimedVouchers.length})</Text>
        {claimedVouchers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No claimed vouchers yet. Redeem one below!</Text>
          </View>
        ) : (
          claimedVouchers.map((v) => {
            const isApplied = selectedVoucher?.id === v.id;
            return (
              <View key={v.id} style={[styles.voucherCard, isApplied && styles.voucherCardActive]}>
                <View style={styles.voucherIcon}>
                  <Ionicons name="pricetag" size={22} color={UP_MAROON} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.voucherTitle}>{v.title}</Text>
                  <Text style={styles.voucherDesc}>{v.description}</Text>
                  <Text style={styles.voucherCode}>Code: {v.code} • Saves ₱{v.discountAmount}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.useBtn, isApplied && styles.useBtnActive]}
                  onPress={() => {
                    if (isApplied) {
                      selectVoucherForCheckout(null);
                    } else {
                      selectVoucherForCheckout(v);
                      router.push('/');
                    }
                  }}
                >
                  <Text style={styles.useBtnText}>{isApplied ? 'Applied ✓' : 'Use Now'}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Redeem Catalog */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>🎁 Redeem with Points</Text>
        {REWARD_CATALOG.map((reward) => {
          const canAfford = points >= reward.pointsCost;
          return (
            <View key={reward.id} style={styles.catalogCard}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.voucherTitle}>{reward.title}</Text>
                <Text style={styles.voucherDesc}>{reward.description}</Text>
                <View style={styles.costPill}>
                  <Ionicons name="star" size={12} color="#E9C46A" />
                  <Text style={styles.costText}>{reward.pointsCost} Points</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, !canAfford && styles.redeemBtnDisabled]}
                disabled={!canAfford}
                onPress={() => handleRedeem(reward)}
              >
                <Text style={styles.redeemBtnText}>{canAfford ? 'Redeem' : 'Locked'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Reset Account Data Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
          <Ionicons name="trash-outline" size={16} color={UP_MAROON} />
          <Text style={styles.resetButtonText}>Reset My Account Data & Orders</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { marginTop: 16, marginBottom: 14 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: UP_MAROON },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  pointsCard: {
    backgroundColor: UP_MAROON,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  tierBadge: { color: '#F4A261', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.8 },
  pointsCount: { color: '#FFF', fontSize: 36, fontWeight: '900', marginVertical: 4 },
  ptsUnit: { fontSize: 18, fontWeight: 'normal' },
  pointsSub: { color: '#FAD2D2', fontSize: 12 },
  feedbackBanner: {
    backgroundColor: '#D8F3DC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  feedbackText: { color: '#2D6A4F', fontSize: 13, fontWeight: 'bold' },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  emptyBox: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 16 },
  emptyText: { color: '#888', fontSize: 13 },
  voucherCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  voucherCardActive: { borderWidth: 1.5, borderColor: '#2D6A4F' },
  voucherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voucherTitle: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  voucherDesc: { fontSize: 12, color: '#666', marginVertical: 3 },
  voucherCode: { fontSize: 11, color: UP_MAROON, fontWeight: 'bold' },
  useBtn: { backgroundColor: UP_MAROON, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  useBtnActive: { backgroundColor: '#2D6A4F' },
  useBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  catalogCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  costText: { fontSize: 12, fontWeight: 'bold', color: '#B78103', marginLeft: 4 },
  redeemBtn: { backgroundColor: '#F4A261', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  redeemBtnDisabled: { backgroundColor: '#DDD' },
  redeemBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF0ED',
    borderWidth: 1,
    borderColor: '#F5C6CB',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  resetButtonText: { color: UP_MAROON, fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
});