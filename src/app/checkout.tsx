// src/app/checkout.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS } from '../constants/locations';
import { calculateDistanceKm, calculateDeliveryFee } from '../utils/distance';

const UP_MAROON = '#7B1113';

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { placeOrder } = useApp();
  
  // Update params to accept the restaurant's coordinates
  const params = useLocalSearchParams<{
    restaurantId: string;
    restaurantName: string;
    restaurantImage: string;
    restaurantLat?: string;
    restaurantLng?: string;
    subtotal: string;
    discount: string;
    items: string;
    initialDropoff: string;
  }>();

  const parsedItems = params.items ? JSON.parse(params.items) : [];
  
  const [selectedDropoff, setSelectedDropoff] = useState(
    CAMPUS_LOCATIONS.find((l) => l.name === params.initialDropoff) || CAMPUS_LOCATIONS[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'gcash' | 'maya'>('gcash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Parse coordinates (fallback to central UPD coords if missing)
  const restLat = parseFloat(params.restaurantLat || '14.6538');
  const restLng = parseFloat(params.restaurantLng || '121.0698');

  // 2. Dynamically calculate distance, fee, and total based on the currently selected drop-off
  const distanceKm = calculateDistanceKm(
    restLat,
    restLng,
    selectedDropoff.latitude,
    selectedDropoff.longitude
  );

  const subtotal = parseFloat(params.subtotal || '0');
  const deliveryFee = calculateDeliveryFee(distanceKm);
  const discount = parseFloat(params.discount || '0');
  const totalPrice = Math.max(0, subtotal + deliveryFee - discount);

  const handleFinalPlaceOrder = () => {
    setIsSubmitting(true);
    try {
      placeOrder({
        restaurantId: params.restaurantId,
        restaurantName: params.restaurantName,
        restaurantImage: params.restaurantImage,
        items: parsedItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: discount,
        totalPrice: totalPrice,
        dropoffLocation: selectedDropoff.name,
        latitude: selectedDropoff.latitude,
        longitude: selectedDropoff.longitude,
        distanceKm: distanceKm, // Passed so the Rider Hub shows the exact distance
      } as any);

      Alert.alert('Order Placed! 🎉', `Your delivery is on its way to ${selectedDropoff.name}.`, [
        { text: 'View Orders', onPress: () => router.replace('/orders' as any) },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Map Preview Section */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <View style={styles.webMapFallback}>
              <Text style={styles.webFallbackText}>📍 Drop-off Point: {selectedDropoff.name}</Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              region={{
                latitude: selectedDropoff.latitude,
                longitude: selectedDropoff.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: selectedDropoff.latitude, longitude: selectedDropoff.longitude }}
                title={selectedDropoff.name}
                description="Delivery Drop-off Point"
              />
            </MapView>
          )}
        </View>

        {/* Drop-off Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Select Campus Drop-off Point</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {CAMPUS_LOCATIONS.map((loc) => {
              const active = selectedDropoff.name === loc.name;
              return (
                <TouchableOpacity
                  key={loc.name}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedDropoff(loc)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{loc.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>

          <TouchableOpacity
            style={[styles.paymentCard, paymentMethod === 'gcash' && styles.paymentCardActive]}
            onPress={() => setPaymentMethod('gcash')}
          >
            <Ionicons name="phone-portrait-outline" size={22} color={paymentMethod === 'gcash' ? UP_MAROON : '#666'} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.paymentTitle}>GCash / Mobile Wallet</Text>
              <Text style={styles.paymentDesc}>Instant digital payment via QR</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'gcash' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'gcash' ? UP_MAROON : '#ccc'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Order Items Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Order Summary ({params.restaurantName})</Text>
          {parsedItems.map((item: any, index: number) => (
            <View key={index} style={styles.orderItemRow}>
              <Text style={styles.orderItemText}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.orderItemPrice}>₱{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Bill Breakdown */}
        <View style={styles.section}>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Subtotal</Text>
            <Text style={styles.billText}>₱{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Campus Delivery Fee ({distanceKm} km)</Text>
            <Text style={styles.billText}>₱{deliveryFee}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billText, { color: '#2D6A4F' }]}>Voucher Discount</Text>
              <Text style={[styles.billText, { color: '#2D6A4F' }]}>-₱{discount}</Text>
            </View>
          )}
          <View style={[styles.billRow, { marginTop: 8, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱{totalPrice}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Footer Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleFinalPlaceOrder}
          disabled={isSubmitting}
        >
          <Text style={styles.placeOrderText}>Confirm & Place Order • ₱{totalPrice}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  container: { flex: 1 },
  mapContainer: { width: '100%', height: 160, backgroundColor: '#E0E0E0' },
  map: { width: '100%', height: '100%' },
  webMapFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EFEFEF' },
  webFallbackText: { fontSize: 14, fontWeight: 'bold', color: '#555' },
  section: { padding: 16, backgroundColor: '#FFF' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F2', marginRight: 8 },
  chipActive: { backgroundColor: UP_MAROON },
  chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  divider: { height: 8, backgroundColor: '#F0F0F0' },
  paymentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', marginTop: 10, backgroundColor: '#FFF' },
  paymentCardActive: { borderColor: UP_MAROON, backgroundColor: '#FDF8F8' },
  paymentTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  paymentDesc: { fontSize: 12, color: '#777', marginTop: 2 },
  orderItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  orderItemText: { fontSize: 14, color: '#444' },
  orderItemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  billText: { fontSize: 14, color: '#666' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: UP_MAROON },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  placeOrderBtn: { backgroundColor: UP_MAROON, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});