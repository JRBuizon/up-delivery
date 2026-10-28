// src/app/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RESTAURANTS, CATEGORIES } from '../constants/restaurants';

const UP_MAROON = '#7B1113';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter restaurants for "Popular Near You"
  const popularRestaurants = RESTAURANTS.filter((r) => r.isPopular);

  // Filter restaurants for "All Restaurants" based on category & search input
  const filteredRestaurants = RESTAURANTS.filter((restaurant) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      restaurant.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.menu.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesCategory && matchesSearch;
  });

  const handleRestaurantPress = (id: string) => {
    router.push({ pathname: '/[id]', params: { id } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={20} color={UP_MAROON} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.deliverTo}>Deliver to</Text>
              <View style={styles.locationRow}>
                <Text style={styles.locationText}>UP Diliman</Text>
                <Ionicons name="chevron-down" size={14} color="#333" style={{ marginLeft: 4 }} />
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="person-circle-outline" size={28} color={UP_MAROON} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>{"Good morning,\nIskolar!"}</Text>
          <Text style={styles.greetingSubtitle}>Great food, closer to you. ❤️</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            placeholder="Search for food, restaurants, or cuisines..."
            style={styles.searchInput}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={index}
                style={styles.categoryItem}
                onPress={() => setSelectedCategory(cat)}
              >
                {cat === 'All' ? (
                  <View
                    style={[
                      styles.categoryIconCircle,
                      { backgroundColor: isSelected ? UP_MAROON : '#EEE' },
                    ]}
                  >
                    <Ionicons name="grid" size={24} color={isSelected ? '#FFF' : '#555'} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png' }}
                    style={[
                      styles.categoryImage,
                      isSelected && { borderWidth: 2, borderColor: UP_MAROON },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && { color: UP_MAROON, fontWeight: 'bold' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>
              {"Your\nCampus Cravings,\n"}
              <Text style={{ color: '#F4A261' }}>Delivered.</Text>
            </Text>
            <Text style={styles.promoSubtitle}>
              {"Skip the long walk. Support local.\nDelivered by fellow Iskos."}
            </Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' }}
            style={styles.promoImage}
          />
        </View>

        {/* Popular Near You Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Popular Near You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all &gt;</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {popularRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.foodCard}
              activeOpacity={0.8}
              onPress={() => handleRestaurantPress(restaurant.id)}
            >
              <View>
                <Image source={{ uri: restaurant.image }} style={styles.cardImage} />
                <Ionicons name="heart-outline" size={22} color="#FFF" style={styles.heartIconAbsolute} />
              </View>
              <Text style={styles.cardTitle}>{restaurant.name}</Text>
              <Text style={styles.cardDesc}>
                {restaurant.category} • {restaurant.priceRange}
              </Text>
              <View style={styles.cardStats}>
                <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
                <Text style={styles.timeText}>🛵 {restaurant.deliveryTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Restaurants Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Filter</Text>
            <Ionicons name="options-outline" size={16} color={UP_MAROON} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {filteredRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.listItem}
            activeOpacity={0.8}
            onPress={() => handleRestaurantPress(restaurant.id)}
          >
            <Image source={{ uri: restaurant.image }} style={styles.listImage} />
            <View style={styles.listInfo}>
              <Text style={styles.cardTitle}>{restaurant.name}</Text>
              <Text style={styles.cardDesc}>
                {restaurant.category} • {restaurant.priceRange}
              </Text>
              <View style={styles.cardStats}>
                <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
                <Text style={styles.timeText}>🛵 {restaurant.deliveryTime}</Text>
              </View>
              {restaurant.isStudentOwned && (
                <View style={styles.badge}>
                  <Ionicons name="school" size={12} color="#2D6A4F" />
                  <Text style={styles.badgeText}>UP Student-Owned</Text>
                </View>
              )}
            </View>
            <Ionicons name="heart-outline" size={24} color="#888" style={styles.listHeart} />
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationTextContainer: { marginLeft: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  deliverTo: { fontSize: 12, color: '#888' },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { marginLeft: 12, position: 'relative' },
  notificationDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, backgroundColor: 'red', borderRadius: 4 },
  greetingContainer: { marginTop: 20, marginBottom: 15 },
  greetingTitle: { fontSize: 28, fontWeight: '900', color: UP_MAROON, lineHeight: 34 },
  greetingSubtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  categoriesContainer: { marginBottom: 20, flexDirection: 'row' },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryImage: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: '#EEE' },
  categoryText: { fontSize: 12, color: '#555' },
  promoBanner: { backgroundColor: UP_MAROON, borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', marginBottom: 25 },
  promoTextContainer: { flex: 1 },
  promoTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', lineHeight: 24, marginBottom: 10 },
  promoSubtitle: { color: '#EEE', fontSize: 12, lineHeight: 16 },
  promoImage: { width: 100, height: 100, borderRadius: 50, marginLeft: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  seeAllText: { fontSize: 14, color: UP_MAROON, fontWeight: '600' },
  filterBtn: { flexDirection: 'row', alignItems: 'center' },
  filterText: { fontSize: 14, color: UP_MAROON, fontWeight: '600' },
  horizontalList: { marginBottom: 25 },
  foodCard: { width: 160, marginRight: 15 },
  cardImage: { width: '100%', height: 120, borderRadius: 12, marginBottom: 8 },
  heartIconAbsolute: { position: 'absolute', top: 10, right: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardDesc: { fontSize: 13, color: '#888', marginVertical: 2 },
  cardStats: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 13, fontWeight: 'bold', color: '#E9C46A', marginRight: 6 },
  timeText: { fontSize: 13, color: '#888' },
  listItem: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 12, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  listImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  listInfo: { flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D8F3DC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 5 },
  badgeText: { fontSize: 10, color: '#2D6A4F', fontWeight: 'bold', marginLeft: 4 },
  listHeart: { marginLeft: 10 }
});