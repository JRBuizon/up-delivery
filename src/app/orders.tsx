// src/app/orders.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OrderStatus, useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';
const STATUS_STEPS: OrderStatus[] = ['Confirmed', 'Preparing', 'On the Way', 'Delivered'];

export default function OrdersScreen() {
  const { user, orders, advanceOrderStatus } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  // Show orders placed by the logged-in student (plus initial seed order)
  const myOrders = orders.filter(
    (o) => !o.customerEmail || o.customerEmail === user?.email
  );
  const activeOrders = myOrders.filter((o) => o.status !== 'Delivered');
  const pastOrders = myOrders.filter((o) => o.status === 'Delivered');
  const displayedOrders = tab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerSubtitle}>Track your campus food deliveries in real time</Text>
      </View>

      {/* Tabs */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'active' && styles.segmentBtnActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.segmentText, tab === 'active' && styles.segmentTextActive]}>
            Active ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, tab === 'past' && styles.segmentBtnActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.segmentText, tab === 'past' && styles.segmentTextActive]}>
            Past Orders ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {displayedOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fast-food-outline" size={56} color="#CCC" />
            <Text style={styles.emptyTitle}>
              {tab === 'active' ? 'No active orders right now' : 'No past orders yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              Craving sisig, pastil, or milk tea between classes?
            </Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/')}>
              <Text style={styles.browseBtnText}>Browse Campus Eats</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayedOrders.map((order) => {
            const stepIndex = STATUS_STEPS.indexOf(order.status);
            const timeSinceOrdered = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Top Row */}
                <View style={styles.cardTop}>
                  <Image source={{ uri: order.restaurantImage }} style={styles.restImage} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.restName}>{order.restaurantName}</Text>
                      <Text style={styles.orderIdText}>{order.id}</Text>
                    </View>
                    <Text style={styles.metaText}>{timeSinceOrdered} minute{timeSinceOrdered !== 1 && "s"} ago • 📍 {order.dropoffLocation}</Text>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{order.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Progress Stepper for Active Orders */}
                {order.status !== 'Delivered' && (
                  <View style={styles.stepperContainer}>
                    <View style={styles.stepsRow}>
                      {STATUS_STEPS.map((step, idx) => {
                        const reached = idx <= stepIndex;
                        return (
                          <View key={step} style={styles.stepItem}>
                            <View
                              style={[
                                styles.stepCircle,
                                reached && { backgroundColor: UP_MAROON },
                              ]}
                            >
                              <Ionicons
                                name={reached ? 'checkmark' : 'ellipse'}
                                size={12}
                                color="#FFF"
                              />
                            </View>
                            <Text
                              style={[
                                styles.stepLabel,
                                reached && { color: UP_MAROON, fontWeight: 'bold' },
                              ]}
                            >
                              {step}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    <View style={styles.riderBanner}>
                      <Ionicons name="bicycle" size={18} color={UP_MAROON} />
                      <Text style={styles.riderText}>Rider: {order.riderName}</Text>
                      <TouchableOpacity
                        style={styles.simulateBtn}
                        onPress={() => advanceOrderStatus(order.id)}
                      >
                        <Text style={styles.simulateBtnText}>Advance Status ▸</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Items List */}
                <View style={styles.itemsDivider} />
                {order.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemQty}>{item.quantity}x</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₱{item.price * item.quantity}</Text>
                  </View>
                ))}

                {/* Totals & Action */}
                <View style={styles.itemsDivider} />
                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.totalLabel}>
                      Total Paid (incl. ₱{order.deliveryFee} delivery
                      {order.discount > 0 ? ` - ₱${order.discount} voucher` : ''})
                    </Text>
                    <Text style={styles.totalAmount}>₱{order.totalPrice}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.reorderBtn}
                    onPress={() =>
                      router.push({ pathname: '/[id]', params: { id: order.restaurantId } })
                    }
                  >
                    <Ionicons name="refresh" size={16} color="#FFF" />
                    <Text style={styles.reorderBtnText}>
                      {order.status === 'Delivered' ? 'Reorder' : 'View Store'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: UP_MAROON },
  headerSubtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  segmentBtnActive: { backgroundColor: '#FFF', elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#666' },
  segmentTextActive: { color: UP_MAROON, fontWeight: 'bold' },
  container: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 70, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#777', textAlign: 'center', marginTop: 6, marginBottom: 20 },
  browseBtn: { backgroundColor: UP_MAROON, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  browseBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  restImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  restName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  orderIdText: { fontSize: 12, color: '#888', fontWeight: '600' },
  metaText: { fontSize: 12, color: '#666', marginTop: 3 },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FDF0ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  statusPillText: { fontSize: 11, fontWeight: 'bold', color: UP_MAROON },
  stepperContainer: { marginTop: 14, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 10 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: { fontSize: 10, color: '#888', textAlign: 'center' },
  riderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 10,
  },
  riderText: { fontSize: 12, color: '#444', fontWeight: '600', flex: 1, marginLeft: 6 },
  simulateBtn: {
    backgroundColor: '#2D6A4F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simulateBtnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  itemsDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemQty: { fontSize: 13, fontWeight: 'bold', color: UP_MAROON, width: 26 },
  itemName: { fontSize: 13, color: '#444', flex: 1 },
  itemPrice: { fontSize: 13, fontWeight: '600', color: '#333' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 11, color: '#888' },
  totalAmount: { fontSize: 17, fontWeight: 'bold', color: '#222', marginTop: 2 },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UP_MAROON,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  reorderBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 5 },
});