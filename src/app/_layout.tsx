// src/app/_layout.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';

const UP_MAROON = '#7B1113';
const INACTIVE_COLOR = '#8E8E93';

function NavigationShell() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const { orders } = useApp();

  const activeOrderCount = orders.filter((o) => o.status !== 'Delivered').length;
  const showTabBar = ['/', '/orders', '/rider', '/rewards'].includes(pathname);

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

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
            onPress={() => router.replace('/orders' as any)}
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
    elevation: 5
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