// src/app/rider.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';

const UP_MAROON = '#7B1113';
const FOREST_GREEN = '#2D6A4F';

export default function RiderScreen() {
  const {
    user,
    riderOnline,
    setRiderOnline,
    riderEarnings,
    completedDeliveries,
    gigs,
    acceptGig,
    advanceGigStatus,
  } = useApp();

  const [riderRating, setRiderRating] = useState({ average: '5.0', count: 0 });

  // Fetch live average rating for this rider from Supabase reviews table
  useEffect(() => {
    const fetchRiderRating = async () => {
      const riderEmail = user?.email || 'juan@up.edu.ph';
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('target_type', 'rider')
        .or(`target_id.eq.${riderEmail},target_id.eq.rider_juan`);
        
      if (!error && data && data.length > 0) {
        const total = data.reduce((sum, r) => sum + r.rating, 0);
        setRiderRating({
          average: (total / data.length).toFixed(1),
          count: data.length,
        });
      }
    };

    fetchRiderRating();
  }, [user, completedDeliveries]);

  const activeGigs = gigs.filter((g) => g.status === 'Accepted' || g.status === 'Picked Up');
  const availableGigs = gigs.filter((g) => g.status === 'Available');

  const navigateToDropoff = (lat?: number, lng?: number, title?: string) => {
    if (!lat || !lng) {
      alert('Coordinates not available for this delivery point.');
      return;
    }
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(title || 'Campus Drop-off');
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header & Online Toggle */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Isko Rider Hub 🛵</Text>
            <Text style={styles.headerSubtitle}>Earn between classes delivering around UPD</Text>
          </View>
          <View style={styles.toggleBox}>
            <Text style={[styles.statusText, { color: riderOnline ? FOREST_GREEN : '#888' }]}>
              {riderOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={riderOnline}
              onValueChange={setRiderOnline}
              trackColor={{ false: '#CCC', true: '#95D5B2' }}
              thumbColor={riderOnline ? FOREST_GREEN : '#888'}
            />
          </View>
        </View>

        {/* Earnings Summary Card */}
        <View style={styles.earningsCard}>
          <View>
            <Text style={styles.earningsLabel}>Today's Rider Earnings</Text>
            <Text style={styles.earningsAmount}>₱{riderEarnings}.00</Text>
            <Text style={styles.earningsBonus}>+10 Iskolar Points earned per trip</Text>
          </View>
          <View style={styles.statsColumn}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completedDeliveries}</Text>
              <Text style={styles.statCaption}>Trips</Text>
            </View>
            <View style={[styles.statBox, { marginTop: 8 }]}>
              <Text style={styles.statValue}>{riderRating.average} ⭐</Text>
              <Text style={styles.statCaption}>{riderRating.count} reviews</Text>
            </View>
          </View>
        </View>

        {/* Active Delivery Section */}
        {activeGigs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Active Campus Delivery ({activeGigs.length})</Text>
            {activeGigs.map((gig) => (
              <View key={gig.id} style={[styles.gigCard, styles.activeGigCard]}>
                <View style={styles.gigHeader}>
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>{gig.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.gigFee}>+₱{gig.fee} Fee</Text>
                </View>

                <View style={styles.routeContainer}>
                  <View style={styles.routeRow}>
                    <Ionicons name="storefront" size={16} color={UP_MAROON} />
                    <Text style={styles.routeText}>Pickup: <Text style={styles.bold}>{gig.pickup}</Text></Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routeRow}>
                    <Ionicons name="location" size={16} color={FOREST_GREEN} />
                    <Text style={styles.routeText}>Drop-off: <Text style={styles.bold}>{gig.dropoff}</Text></Text>
                  </View>
                </View>

                <Text style={styles.itemsSummary}>📦 {gig.itemsSummary} | Customer: {gig.customerName}</Text>

                {gig.latitude && gig.longitude && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateToDropoff(gig.latitude, gig.longitude, gig.dropoff)}
                  >
                    <Ionicons name="navigate" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.navButtonText}>Navigate to Drop-off 🧭</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => advanceGigStatus(gig.id)}
                >
                  <Text style={styles.primaryActionText}>
                    {gig.status === 'Accepted'
                      ? 'Confirm Order Picked Up'
                      : `Complete Delivery (+₱${gig.fee})`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Gigs Near You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Available Campus Requests</Text>
          {!riderOnline ? (
            <View style={styles.offlineCard}>
              <MaterialCommunityIcons name="sleep" size={40} color="#999" />
              <Text style={styles.offlineTitle}>You are currently offline</Text>
              <Text style={styles.offlineSub}>Switch online above to accept campus delivery requests.</Text>
            </View>
          ) : availableGigs.length === 0 ? (
            <View style={styles.offlineCard}>
              <Ionicons name="checkmark-circle-outline" size={40} color={FOREST_GREEN} />
              <Text style={styles.offlineTitle}>All caught up!</Text>
              <Text style={styles.offlineSub}>Place a new order on the Home tab to test delivering it here.</Text>
            </View>
          ) : (
            availableGigs.map((gig) => (
              <View key={gig.id} style={styles.gigCard}>
                <View style={styles.gigHeader}>
                  <View style={styles.distanceBadge}>
                    <Ionicons name="walk" size={14} color="#555" />
                    <Text style={styles.distanceText}>{gig.distance} Campus Route</Text>
                  </View>
                  <Text style={styles.gigFee}>₱{gig.fee}</Text>
                </View>

                <View style={styles.routeContainer}>
                  <View style={styles.routeRow}>
                    <Ionicons name="storefront-outline" size={16} color={UP_MAROON} />
                    <Text style={styles.routeText}>From: <Text style={styles.bold}>{gig.pickup}</Text></Text>
                  </View>
                  <View style={[styles.routeRow, { marginTop: 6 }]}>
                    <Ionicons name="flag-outline" size={16} color={FOREST_GREEN} />
                    <Text style={styles.routeText}>To: <Text style={styles.bold}>{gig.dropoff}</Text></Text>
                  </View>
                </View>

                <Text style={styles.itemsSummary}>🧾 {gig.itemsSummary}</Text>

                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => acceptGig(gig.id)}
                >
                  <Text style={styles.acceptBtnText}>Accept Campus Delivery</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  container: { flex: 1, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  headerTitle: { fontSize: 25, fontWeight: '900', color: UP_MAROON },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  toggleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, elevation: 1 },
  statusText: { fontSize: 12, fontWeight: 'bold', marginRight: 6 },
  earningsCard: {
    backgroundColor: UP_MAROON,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  earningsLabel: { color: '#FAD2D2', fontSize: 13 },
  earningsAmount: { color: '#FFF', fontSize: 32, fontWeight: '900', marginVertical: 4 },
  earningsBonus: { color: '#F4A261', fontSize: 12, fontWeight: '600' },
  statsColumn: { alignItems: 'flex-end' },
  statBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center', minWidth: 80 },
  statValue: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  statCaption: { color: '#EEE', fontSize: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  gigCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 15, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activeGigCard: { borderWidth: 1.5, borderColor: FOREST_GREEN },
  gigHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activeTag: { backgroundColor: '#D8F3DC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  activeTagText: { color: FOREST_GREEN, fontSize: 11, fontWeight: 'bold' },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  distanceText: { fontSize: 12, color: '#555', marginLeft: 4, fontWeight: '600' },
  gigFee: { fontSize: 18, fontWeight: '900', color: FOREST_GREEN },
  routeContainer: { backgroundColor: '#FAFAFA', padding: 10, borderRadius: 10, marginBottom: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  routeLine: { height: 10, width: 2, backgroundColor: '#DDD', marginLeft: 7, marginVertical: 2 },
  routeText: { fontSize: 13, color: '#444', marginLeft: 8 },
  bold: { fontWeight: 'bold', color: '#222' },
  itemsSummary: { fontSize: 12, color: '#666', marginBottom: 12 },
  acceptBtn: { backgroundColor: UP_MAROON, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  acceptBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  primaryActionBtn: { backgroundColor: FOREST_GREEN, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  primaryActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  offlineCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 28, alignItems: 'center' },
  offlineTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginTop: 10 },
  offlineSub: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 },
  navButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  navButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});