// src/app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, RESTAURANTS } from '../constants/restaurants';
import { useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  // Filter & Sort Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [studentOwnedOnly, setStudentOwnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'time'>('default');

  const popularRestaurants = RESTAURANTS.filter((r) => r.isPopular);

  // Filter and Sort Restaurants for "All Restaurants"
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

    const matchesStudentFilter = !studentOwnedOnly || restaurant.isStudentOwned;

    return matchesCategory && matchesSearch && matchesStudentFilter;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'time') {
      // Extract numeric minutes from deliveryTime string (e.g., "15-20 min" -> 15)
      const timeA = parseInt(a.deliveryTime) || 0;
      const timeB = parseInt(b.deliveryTime) || 0;
      return timeA - timeB;
    }
    return 0;
  });

  const handleRestaurantPress = (id: string) => {
    router.push({ pathname: '/[id]', params: { id } });
  };

  const activeFilterCount = (studentOwnedOnly ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Global pressable overlay to close dropdown if tapped outside */}
        {menuVisible && (
          <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
            <Pressable style={styles.menuBackdrop} onPress={() => setMenuVisible(false)}>
              <View style={[styles.dropdownMenuAbsolute, { top: 65, right: 16 }]}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownNameText}>{user?.name}</Text>
                  <Text style={styles.dropdownEmailText}>{user?.email}</Text>
                </View>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setMenuVisible(false);
                    logout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={18} color="#D90429" />
                  <Text style={styles.dropdownSignOutText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}
        
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
          <View style={styles.headerRightWrapper}>
            {user ? (
              <TouchableOpacity
                style={styles.profileTrigger}
                onPress={() => setMenuVisible(!menuVisible)}
                activeOpacity={0.8}
              >
                <View style={styles.userPill}>
                  <Ionicons name="school-outline" size={13} color={UP_MAROON} />
                  <Text style={styles.userEmailText} numberOfLines={1}>{user.email}</Text>
                  <Ionicons name="chevron-down" size={12} color={UP_MAROON} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signInButton}
                onPress={() => router.push('/login' as any)}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFF" />
                <Text style={styles.signInText}>UP Mail Sign In</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {`Good morning,\n${user ? user.name : 'Iskolar'}!`}
          </Text>
          <Text style={styles.greetingSubtitle}>
            {user
              ? 'Great food, closer to you. ❤️'
              : 'Browsing as Guest • Sign in with UP Mail to order or deliver'}
          </Text>
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

        {/* All Restaurants Section with Filter Trigger */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Restaurants ({filteredRestaurants.length})</Text>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.filterText}>Filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</Text>
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

      {/* Filter & Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort Restaurants</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Filter Section: Student-Owned */}
            <Text style={styles.modalSectionLabel}>Filter By</Text>
            <TouchableOpacity
              style={styles.filterCheckboxRow}
              onPress={() => setStudentOwnedOnly(!studentOwnedOnly)}
            >
              <Ionicons
                name={studentOwnedOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={UP_MAROON}
              />
              <Text style={styles.filterCheckboxLabel}>UP Student-Owned Stalls Only</Text>
            </TouchableOpacity>

            {/* Sort Section */}
            <Text style={[styles.modalSectionLabel, { marginTop: 20 }]}>Sort By</Text>
            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => setSortBy('default')}
            >
              <Ionicons
                name={sortBy === 'default' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={sortBy === 'default' ? UP_MAROON : '#888'}
              />
              <Text style={styles.sortOptionText}>Recommended (Default)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => setSortBy('rating')}
            >
              <Ionicons
                name={sortBy === 'rating' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={sortBy === 'rating' ? UP_MAROON : '#888'}
              />
              <Text style={styles.sortOptionText}>Highest Rating ⭐</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOptionRow}
              onPress={() => setSortBy('time')}
            >
              <Ionicons
                name={sortBy === 'time' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={sortBy === 'time' ? UP_MAROON : '#888'}
              />
              <Text style={styles.sortOptionText}>Fastest Delivery 🛵</Text>
            </TouchableOpacity>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setStudentOwnedOnly(false);
                  setSortBy('default');
                }}
              >
                <Text style={styles.resetFilterText}>Reset All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.applyFilterText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  logoutText: { fontSize: 12, fontWeight: 'bold', color: UP_MAROON, marginLeft: 4 },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UP_MAROON,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  signInText: { fontSize: 12, fontWeight: 'bold', color: '#FFF', marginLeft: 5 },
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
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF0ED', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  filterText: { fontSize: 13, color: UP_MAROON, fontWeight: 'bold' },
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
  listHeart: { marginLeft: 10 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  modalSectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#666', marginBottom: 10 },
  filterCheckboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  filterCheckboxLabel: { fontSize: 15, color: '#333', marginLeft: 10, fontWeight: '600' },
  sortOptionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  sortOptionText: { fontSize: 15, color: '#333', marginLeft: 10, fontWeight: '600' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  resetFilterBtn: { flex: 1, backgroundColor: '#F0F0F0', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetFilterText: { color: '#555', fontWeight: 'bold', fontSize: 14 },
  applyFilterBtn: { flex: 2, backgroundColor: UP_MAROON, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyFilterText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  headerRightWrapper: { position: 'relative' },
  profileTrigger: {},
  userEmailText: { fontSize: 12, color: UP_MAROON, fontWeight: '600', marginLeft: 4, maxWidth: 120 },
  menuBackdrop: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenuAbsolute: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 6,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  dropdownHeader: { paddingHorizontal: 14, paddingVertical: 10 },
  dropdownNameText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  dropdownEmailText: { fontSize: 11, color: '#777', marginTop: 2 },
  dropdownDivider: { height: 1, backgroundColor: '#EEE' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  dropdownSignOutText: { fontSize: 14, fontWeight: '600', color: '#D90429', marginLeft: 8 },
});