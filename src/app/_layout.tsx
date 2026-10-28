// src/app/_layout.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const UP_MAROON = '#7B1113';
const INACTIVE_COLOR = '#8E8E93';

export default function RootLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Only display the bottom tab bar on the 4 main tab routes
  const showTabBar = ['/', '/orders', '/rider', '/rewards'].includes(pathname);

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
            onPress={() => router.replace('/orders' as any)}
          >
            <Ionicons
              name="receipt-outline"
              size={24}
              color={pathname === '/orders' ? UP_MAROON : INACTIVE_COLOR}
            />
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
            onPress={() => router.replace('/rider' as any)}
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
            onPress={() => router.replace('/rewards' as any)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
  },
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
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});