// src/app/_layout.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RatingModal from '../components/RatingModal';
import { AppProvider, useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';
const INACTIVE_COLOR = '#8E8E93';
const PROTECTED_ROUTES = ['/orders', '/rider', '/rewards'];

function GlobalRatingOverlay() {
  const { pendingRating, clearPendingRating, user } = useApp();

  if (!pendingRating) return null;

  return (
    <RatingModal
      reviewerName={user?.name || 'Juan'}
      visible={true}
      orderId={pendingRating.orderId}
      targetId={pendingRating.targetId}
      targetName={pendingRating.targetName}
      targetType={pendingRating.targetType}
      onClose={clearPendingRating}
      onSubmitted={() => {
        clearPendingRating();
      }}
    />
  );
}

function NavigationShell() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, user, orders } = useApp();

  const [showRiderAlert, setShowRiderAlert] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user && PROTECTED_ROUTES.includes(pathname)) {
      router.replace('/login' as any);
    }
  }, [isHydrated, user, pathname]);

  if (!isHydrated) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={UP_MAROON} />
      </View>
    );
  }

  const activeOrderCount = user
    ? orders.filter(
        (o) =>
          o.status !== 'Delivered' &&
          (!o.customerEmail || o.customerEmail === user.email)
      ).length
    : 0;

  const showTabBar = ['/', '/orders', '/rider', '/rewards'].includes(pathname);

  const handleProtectedTabPress = (targetPath: string) => {
    if (!user) {
      router.push('/login' as any);
      return;
    }

    // Intercept navigation to Rider Hub if user has active orders
    if (targetPath === '/rider' && activeOrderCount > 0) {
      setShowRiderAlert(true);
      return;
    }

    router.replace(targetPath as any);
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Global Rating Modal Popup Overlay */}
      <GlobalRatingOverlay />

      {/* Active Order Restriction Alert for Rider Tab */}
      <Modal visible={showRiderAlert} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="moped" size={32} color={UP_MAROON} />
            </View>
            <Text style={styles.modalTitle}>Rider Mode Unavailable</Text>
            <Text style={styles.modalBody}>
              You currently have <Text style={{ fontWeight: 'bold' }}>{activeOrderCount} active order{activeOrderCount > 1 ? 's' : ''}</Text> in progress. You cannot accept rider gigs while waiting for your food delivery.
            </Text>

            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                setShowRiderAlert(false);
                router.replace('/orders' as any);
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>View My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowRiderAlert(false)}
            >
              <Text style={styles.modalCloseBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showTabBar && (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/')}
          >
            <Ionicons
              name="home"
              size={24}
              color={pathname === '/' ? UP_MAROON : INACTIVE_COLOR}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: pathname === '/' ? UP_MAROON : INACTIVE_COLOR },
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleProtectedTabPress('/orders')}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons
                name="receipt-outline"
                size={24}
                color={pathname === '/orders' ? UP_MAROON : INACTIVE_COLOR}
              />
              {activeOrderCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{activeOrderCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: pathname === '/orders' ? UP_MAROON : INACTIVE_COLOR },
              ]}
            >
              Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleProtectedTabPress('/rider')}
          >
            <MaterialCommunityIcons
              name="moped"
              size={24}
              color={pathname === '/rider' ? UP_MAROON : INACTIVE_COLOR}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: pathname === '/rider' ? UP_MAROON : INACTIVE_COLOR },
              ]}
            >
              Rider
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleProtectedTabPress('/rewards')}
          >
            <Ionicons
              name="star-outline"
              size={24}
              color={pathname === '/rewards' ? UP_MAROON : INACTIVE_COLOR}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: pathname === '/rewards' ? UP_MAROON : INACTIVE_COLOR },
              ]}
            >
              Rewards
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <NavigationShell />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1 },
  tabBar: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 2 },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#F4A261',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  modalBody: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: UP_MAROON,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  modalCloseBtn: { paddingVertical: 6 },
  modalCloseBtnText: { color: '#888', fontWeight: '600', fontSize: 13 },
});