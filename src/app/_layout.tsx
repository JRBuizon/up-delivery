import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7B1113', // UP Maroon
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // Add "as string" here
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          // Add "as string" here
          tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="rider"
        options={{
          title: 'Rider',
          // Add "as string" here
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="moped" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          // Add "as string" here
          tabBarIcon: ({ color }) => <Ionicons name="star-outline" size={24} color={color as string} />,
        }}
      />
    </Tabs>
  );
}