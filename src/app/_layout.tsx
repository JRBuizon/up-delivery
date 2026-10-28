// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppProvider, useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';
const INACTIVE_COLOR = '#8E8E93';
const PROTECTED_ROUTES = ['/orders', '/rider', '/rewards'];

function NavigationShell() {
  const pathname = usePathname();
  const router = useRouter();
  const { isHydrated, user, orders } = useApp();

  useEffect(() => {
    if (!isHydrated) return;

    // Only redirect unauthenticated users if they try to access a protected route
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

  // Show the bottom tab bar on the main tabs even for guests
  const showTabBar = ['/', '/orders', '/rider', '/rewards'].includes(pathname);

  const handleProtectedTabPress = (targetPath: string) => {
    if (!user) {
      router.push('/login' as any);
    } else {
      router.replace(targetPath as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {showTabBar && (
        <View style={styles.tabBar}>
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
    </View>
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
    flexDirection: 'row',
    height: 60,
    paddingBottom: 5,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    justifyContent: 'space-around',
    alignItems: 'center',
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
});