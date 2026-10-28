// src/context/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@up_delivery_session_v1';
const SHARED_POOL_KEY = '@up_delivery_shared_pool_v1';
const getUserProfileKey = (email: string) => `@up_delivery_profile_${email.toLowerCase()}`;

export interface User {
  email: string;
  name: string;
}

export type OrderStatus = 'Confirmed' | 'Preparing' | 'On the Way' | 'Delivered';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerEmail?: string;
  customerName?: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  dropoffLocation: string;
  status: OrderStatus;
  createdAt: string;
  riderName: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  code: string;
}

export interface RiderGig {
  id: string;
  pickup: string;
  dropoff: string;
  distance: string;
  fee: number;
  itemsSummary: string;
  customerName: string;
  status: 'Available' | 'Accepted' | 'Picked Up' | 'Completed';
  linkedOrderId?: string;
  acceptedByEmail?: string;
}

interface AppContextType {
  isHydrated: boolean;
  user: User | null;
  orders: Order[];
  points: number;
  claimedVouchers: Voucher[];
  selectedVoucher: Voucher | null;
  riderOnline: boolean;
  riderEarnings: number;
  completedDeliveries: number;
  gigs: RiderGig[];
  login: (email: string, password: string, customName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'riderName'>) => void;
  advanceOrderStatus: (orderId: string) => void;
  redeemVoucher: (voucher: Voucher) => boolean;
  selectVoucherForCheckout: (voucher: Voucher | null) => void;
  setRiderOnline: (online: boolean) => void;
  acceptGig: (gigId: string) => void;
  advanceGigStatus: (gigId: string) => void;
  resetDemoData: () => Promise<void>;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-1042',
    restaurantId: 'kanto-cravings',
    restaurantName: 'Kanto Cravings',
    restaurantImage: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
    items: [{ id: '1', name: 'Crispy Sisig Rice Bowl', price: 95, quantity: 1 }],
    subtotal: 95,
    deliveryFee: 15,
    discount: 0,
    totalPrice: 110,
    dropoffLocation: 'Melchor Hall (Lobby)',
    status: 'Delivered',
    createdAt: 'Yesterday, 12:30 PM',
    riderName: 'Miguel S. (Fellow Isko)',
  },
];

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v-init',
    title: 'Free Campus Delivery',
    description: 'Waives ₱15 delivery fee anywhere in UPD',
    pointsCost: 50,
    discountAmount: 15,
    code: 'ISKOFREE',
  },
];

const INITIAL_GIGS: RiderGig[] = [
  {
    id: 'GIG-301',
    pickup: 'Area 2 Food Stalls',
    dropoff: 'Palma Hall (AS Steps)',
    distance: '0.8 km',
    fee: 25,
    itemsSummary: '2x Chicken Pastil, 1x Gulaman',
    customerName: 'Bea R. (bea@up.edu.ph)',
    status: 'Available',
  },
  {
    id: 'GIG-302',
    pickup: 'UP Tea Hub',
    dropoff: 'CS Library (Velasquez St.)',
    distance: '1.2 km',
    fee: 30,
    itemsSummary: '3x Classic Pearl Milk Tea',
    customerName: 'Carlo D. (carlo@up.edu.ph)',
    status: 'Available',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Shared campus state (orders & delivery gigs)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [gigs, setGigs] = useState<RiderGig[]>(INITIAL_GIGS);

  // Per-user state
  const [points, setPoints] = useState<number>(140);
  const [claimedVouchers, setClaimedVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [riderOnline, setRiderOnline] = useState<boolean>(true);
  const [riderEarnings, setRiderEarnings] = useState<number>(185);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(7);

  // Helper to load a specific student's profile data
  const loadUserProfile = async (email: string) => {
    try {
      const rawProfile = await AsyncStorage.getItem(getUserProfileKey(email));
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile);
        setPoints(typeof parsed.points === 'number' ? parsed.points : 140);
        setClaimedVouchers(Array.isArray(parsed.claimedVouchers) ? parsed.claimedVouchers : INITIAL_VOUCHERS);
        setSelectedVoucher(parsed.selectedVoucher ?? null);
        setRiderOnline(typeof parsed.riderOnline === 'boolean' ? parsed.riderOnline : true);
        setRiderEarnings(typeof parsed.riderEarnings === 'number' ? parsed.riderEarnings : 185);
        setCompletedDeliveries(typeof parsed.completedDeliveries === 'number' ? parsed.completedDeliveries : 7);
      } else {
        // Fresh UP student profile defaults
        setPoints(140);
        setClaimedVouchers(INITIAL_VOUCHERS);
        setSelectedVoucher(null);
        setRiderOnline(true);
        setRiderEarnings(0);
        setCompletedDeliveries(0);
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }
  };

  // 1. Initial hydration on mount
  useEffect(() => {
    const hydrateAll = async () => {
      try {
        const [rawSession, rawPool] = await Promise.all([
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(SHARED_POOL_KEY),
        ]);

        if (rawPool) {
          const parsedPool = JSON.parse(rawPool);
          if (Array.isArray(parsedPool.orders)) setOrders(parsedPool.orders);
          if (Array.isArray(parsedPool.gigs)) setGigs(parsedPool.gigs);
        }

        if (rawSession) {
          const savedUser: User = JSON.parse(rawSession);
          setUser(savedUser);
          await loadUserProfile(savedUser.email);
        }
      } catch (error) {
        console.warn('Failed to hydrate app state:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrateAll();
  }, []);

  // 2. Persist shared campus pool (orders & gigs)
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(SHARED_POOL_KEY, JSON.stringify({ orders, gigs })).catch((err) =>
      console.warn('Failed to save shared pool:', err)
    );
  }, [isHydrated, orders, gigs]);

  // 3. Persist individual student profile
  useEffect(() => {
    if (!isHydrated || !user) return;
    const profileData = {
      points,
      claimedVouchers,
      selectedVoucher,
      riderOnline,
      riderEarnings,
      completedDeliveries,
    };
    AsyncStorage.setItem(getUserProfileKey(user.email), JSON.stringify(profileData)).catch((err) =>
      console.warn('Failed to save user profile:', err)
    );
  }, [
    isHydrated,
    user,
    points,
    claimedVouchers,
    selectedVoucher,
    riderOnline,
    riderEarnings,
    completedDeliveries,
  ]);

  const login: AppContextType['login'] = async (email, password, customName) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@up.edu.ph') || cleanEmail.length <= '@up.edu.ph'.length) {
      return {
        success: false,
        error: 'Access restricted: Please sign in using a valid @up.edu.ph UP Mail address.',
      };
    }

    if (password.trim().length < 4) {
      return {
        success: false,
        error: 'Password must be at least 4 characters.',
      };
    }

    const prefix = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    const formattedPrefix =
      prefix.length > 0
        ? prefix.charAt(0).toUpperCase() + prefix.slice(1)
        : 'Iskolar';

    const loggedInUser: User = {
      email: cleanEmail,
      name: customName?.trim() ? customName.trim() : formattedPrefix,
    };

    await loadUserProfile(cleanEmail);
    setUser(loggedInUser);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(loggedInUser));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  };

  const placeOrder: AppContextType['placeOrder'] = (orderData) => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerLabel = user ? `${user.name} (${user.email})` : 'Fellow Iskolar';

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      customerEmail: user?.email,
      customerName: user?.name,
      status: 'Confirmed',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      riderName: 'Waiting for a fellow Isko Rider...',
    };

    setOrders((prev) => [newOrder, ...prev]);

    const earnedPoints = Math.max(5, Math.floor(orderData.totalPrice / 10));
    setPoints((prev) => prev + earnedPoints);

    if (selectedVoucher) {
      setClaimedVouchers((prev) => prev.filter((v) => v.id !== selectedVoucher.id));
      setSelectedVoucher(null);
    }

    // Add to shared campus Rider Gigs so any online UP student can deliver it
    const newGig: RiderGig = {
      id: `GIG-${Math.floor(400 + Math.random() * 500)}`,
      pickup: orderData.restaurantName,
      dropoff: orderData.dropoffLocation,
      distance: '0.9 km',
      fee: 25,
      itemsSummary: orderData.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      customerName: customerLabel,
      status: 'Available',
      linkedOrderId: newOrderId,
    };
    setGigs((prev) => [newGig, ...prev]);
  };

  const advanceOrderStatus = (orderId: string) => {
    const flow: OrderStatus[] = ['Confirmed', 'Preparing', 'On the Way', 'Delivered'];
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const currentIndex = flow.indexOf(order.status);
        const nextStatus = flow[Math.min(currentIndex + 1, flow.length - 1)];
        return {
          ...order,
          status: nextStatus,
          riderName:
            nextStatus === 'Confirmed'
              ? 'Waiting for a fellow Isko Rider...'
              : `${user?.name || 'Isko'} (Student Rider)`,
        };
      })
    );
  };

  const redeemVoucher = (voucher: Voucher): boolean => {
    if (points < voucher.pointsCost) return false;
    setPoints((prev) => prev - voucher.pointsCost);
    const uniqueVoucher: Voucher = {
      ...voucher,
      id: `${voucher.id}-${Date.now()}`,
    };
    setClaimedVouchers((prev) => [uniqueVoucher, ...prev]);
    return true;
  };

  const selectVoucherForCheckout = (voucher: Voucher | null) => {
    setSelectedVoucher(voucher);
  };

  const acceptGig = (gigId: string) => {
    const riderLabel = user ? `${user.name} (${user.email})` : 'Fellow Isko Rider';
    setGigs((prev) =>
      prev.map((g) =>
        g.id === gigId ? { ...g, status: 'Accepted', acceptedByEmail: user?.email } : g
      )
    );
    const targetGig = gigs.find((g) => g.id === gigId);
    if (targetGig?.linkedOrderId) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === targetGig.linkedOrderId
            ? { ...o, status: 'Preparing', riderName: riderLabel }
            : o
        )
      );
    }
  };

  const advanceGigStatus = (gigId: string) => {
    const targetGig = gigs.find((g) => g.id === gigId);
    if (!targetGig) return;

    if (targetGig.status === 'Accepted') {
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, status: 'Picked Up' } : g))
      );
      if (targetGig.linkedOrderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === targetGig.linkedOrderId ? { ...o, status: 'On the Way' } : o
          )
        );
      }
    } else if (targetGig.status === 'Picked Up') {
      setGigs((prev) =>
        prev.map((g) => (g.id === gigId ? { ...g, status: 'Completed' } : g))
      );
      setRiderEarnings((prev) => prev + targetGig.fee);
      setCompletedDeliveries((prev) => prev + 1);
      setPoints((prev) => prev + 10);
      if (targetGig.linkedOrderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === targetGig.linkedOrderId ? { ...o, status: 'Delivered' } : o
          )
        );
      }
    }
  };

  const resetDemoData = async () => {
    try {
      await AsyncStorage.removeItem(SHARED_POOL_KEY);
      if (user) {
        await AsyncStorage.removeItem(getUserProfileKey(user.email));
      }
      setOrders(INITIAL_ORDERS);
      setGigs(INITIAL_GIGS);
      setPoints(140);
      setClaimedVouchers(INITIAL_VOUCHERS);
      setSelectedVoucher(null);
      setRiderOnline(true);
      setRiderEarnings(185);
      setCompletedDeliveries(7);
    } catch (error) {
      console.warn('Failed to reset demo data:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isHydrated,
        user,
        orders,
        points,
        claimedVouchers,
        selectedVoucher,
        riderOnline,
        riderEarnings,
        completedDeliveries,
        gigs,
        login,
        logout,
        placeOrder,
        advanceOrderStatus,
        redeemVoucher,
        selectVoucherForCheckout,
        setRiderOnline,
        acceptGig,
        advanceGigStatus,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}