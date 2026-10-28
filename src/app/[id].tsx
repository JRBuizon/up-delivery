// src/app/restaurant/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RESTAURANTS, MenuItem } from '../constants/restaurants';
const UP_MAROON = '#7B1113';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Find the clicked restaurant from our data file
  const restaurant = RESTAURANTS.find((r) => r.id === id);

  // Track quantities of each food item in the cart: { [menuItemId]: quantity }
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Restaurant not found.</Text>
        <TouchableOpacity style={styles.backFallbackBtn} onPress={() => router.back()}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const removeFromCart = (item: MenuItem) => {
    setCart((prev) => {
      const currentQty = prev[item.id] || 0;
      if (currentQty <= 1) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }
      return {
        ...prev,
        [item.id]: currentQty - 1,
      };
    });
  };

  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = restaurant.menu.reduce(
    (sum, item) => sum + item.price * (cart[item.id] || 0),
    0
  );

  const handleCheckout = () => {
    const message = `Order placed at ${restaurant.name} for ₱${totalPrice}!`;
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Order Confirmed! 🎉', message);
    }
    setCart({});
    router.push('/orders' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerContainer}>
          <Image source={{ uri: restaurant.image }} style={styles.bannerImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            {restaurant.isStudentOwned && (
              <View style={styles.badge}>
                <Ionicons name="school" size={12} color="#2D6A4F" />
                <Text style={styles.badgeText}>UP Student-Owned</Text>
              </View>
            )}
          </View>
          <Text style={styles.categoryText}>
            {restaurant.category} • {restaurant.priceRange}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
            <Text style={styles.timeText}>🛵 {restaurant.deliveryTime}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.menuSection}>
          <Text style={styles.menuHeading}>Menu</Text>
          {restaurant.menu.map((item) => {
            const quantity = cart[item.id] || 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                activeOpacity={0.8}
                onPress={() => addToCart(item)}
              >
                <View style={styles.menuInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                  <Text style={styles.menuItemPrice}>₱{item.price}</Text>
                </View>

                <View style={styles.menuImageWrapper}>
                  <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                  {quantity === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          removeFromCart(item);
                        }}
                      >
                        <Ionicons name="remove" size={16} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                      >
                        <Ionicons name="add" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {totalItems > 0 && (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity style={styles.cartBar} onPress={handleCheckout}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <Text style={styles.cartBarText}>Place Order</Text>
            <Text style={styles.cartTotalText}>₱{totalPrice}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: '#333', marginBottom: 15 },
  backFallbackBtn: { backgroundColor: UP_MAROON, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  bannerContainer: { position: 'relative', width: '100%', height: 220 },
  bannerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: '#FFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, elevation: 3 },
  infoContainer: { padding: 16, backgroundColor: '#FFF' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
  restaurantName: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D8F3DC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, color: '#2D6A4F', fontWeight: 'bold', marginLeft: 4 },
  categoryText: { fontSize: 14, color: '#888', marginVertical: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#E9C46A', marginRight: 12 },
  timeText: { fontSize: 14, color: '#666' },
  divider: { height: 8, backgroundColor: '#F0F0F0' },
  menuSection: { padding: 16 },
  menuHeading: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  menuCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  menuInfo: { flex: 1, paddingRight: 12 },
  menuItemName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  menuItemDesc: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 8 },
  menuItemPrice: { fontSize: 15, fontWeight: 'bold', color: UP_MAROON },
  menuImageWrapper: { position: 'relative', width: 90, height: 90 },
  menuItemImage: { width: 90, height: 90, borderRadius: 10 },
  addButton: { position: 'absolute', bottom: -6, right: -6, backgroundColor: UP_MAROON, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  qtyContainer: { position: 'absolute', bottom: -8, left: 5, right: 5, backgroundColor: UP_MAROON, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 4 },
  qtyBtn: { padding: 2 },
  qtyText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  cartBarContainer: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  cartBar: { backgroundColor: UP_MAROON, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  cartBadge: { backgroundColor: '#F4A261', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  cartBarText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  cartTotalText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});