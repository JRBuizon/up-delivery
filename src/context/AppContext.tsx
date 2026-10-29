// src/context/AppContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const SESSION_KEY = '@up_delivery_session_v1';
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
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
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
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'riderName'>) => Promise<void>;
  advanceOrderStatus: (orderId: string) => Promise<void>;
  redeemVoucher: (voucher: Voucher) => boolean;
  selectVoucherForCheckout: (voucher: Voucher | null) => void;
  setRiderOnline: (online: boolean) => void;
  acceptGig: (gigId: string) => Promise<void>;
  advanceGigStatus: (gigId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [gigs, setGigs] = useState<RiderGig[]>([]);

  const [points, setPoints] = useState<number>(140);
  const [claimedVouchers, setClaimedVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [riderOnline, setRiderOnline] = useState<boolean>(true);
  const [riderEarnings, setRiderEarnings] = useState<number>(185);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(7);

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

  useEffect(() => {
    const fetchSupabaseData = async () => {
      try {
        const [{ data: ordersData }, { data: gigsData }] = await Promise.all([
          supabase.from('orders').select('*').order('inserted_at', { ascending: false }),
          supabase.from('gigs').select('*').order('inserted_at', { ascending: false }),
        ]);

        if (ordersData) {
          setOrders(
            ordersData.map((o: any) => ({
              id: o.id,
              customerEmail: o.customer_email,
              customerName: o.customer_name,
              restaurantId: o.restaurant_id,
              restaurantName: o.restaurant_name,
              restaurantImage: o.restaurant_image,
              items: o.items,
              subtotal: Number(o.subtotal),
              deliveryFee: Number(o.delivery_fee),
              discount: Number(o.discount),
              totalPrice: Number(o.total_price),
              dropoffLocation: o.dropoff_location,
              latitude: o.latitude ? Number(o.latitude) : undefined,
              longitude: o.longitude ? Number(o.longitude) : undefined,
              status: o.status,
              createdAt: o.created_at,
              riderName: o.rider_name,
            }))
          );
        }

        if (gigsData) {
          setGigs(
            gigsData.map((g: any) => ({
              id: g.id,
              pickup: g.pickup,
              dropoff: g.dropoff,
              distance: g.distance,
              fee: Number(g.fee),
              itemsSummary: g.items_summary,
              customerName: g.customer_name,
              status: g.status,
              latitude: g.latitude ? Number(g.latitude) : undefined,
              longitude: g.longitude ? Number(g.longitude) : undefined,
              linkedOrderId: g.linked_order_id,
              acceptedByEmail: g.accepted_by_email,
            }))
          );
        }
      } catch (err) {
        console.warn('Error fetching Supabase data:', err);
      }
    };

    const hydrateSession = async () => {
      try {
        const rawSession = await AsyncStorage.getItem(SESSION_KEY);
        if (rawSession) {
          const savedUser: User = JSON.parse(rawSession);
          setUser(savedUser);
          await loadUserProfile(savedUser.email);
        }
      } catch (error) {
        console.warn('Failed to load session:', error);
      } finally {
        setIsHydrated(true);
      }
    };

    fetchSupabaseData();
    hydrateSession();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, () => {
        fetchSupabaseData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  }, [isHydrated, user, points, claimedVouchers, selectedVoucher, riderOnline, riderEarnings, completedDeliveries]);

  const login: AppContextType['login'] = async (email, password, customName) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@up.edu.ph') || cleanEmail.length <= '@up.edu.ph'.length) {
      return {
        success: false,
        error: 'Access restricted: Please sign in using a valid @up.edu.ph UP Mail address.',
      };
    }

    if (password.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const prefix = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
    const formattedPrefix = prefix.length > 0 ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Iskolar';

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

  const placeOrder: AppContextType['placeOrder'] = async (orderData) => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerLabel = user ? `${user.name} (${user.email})` : 'Fellow Iskolar';
    const createdAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrderPayload = {
      id: newOrderId,
      customer_email: user?.email,
      customer_name: user?.name,
      restaurant_id: orderData.restaurantId,
      restaurant_name: orderData.restaurantName,
      restaurant_image: orderData.restaurantImage,
      items: orderData.items,
      subtotal: orderData.subtotal,
      delivery_fee: orderData.deliveryFee,
      discount: orderData.discount,
      total_price: orderData.totalPrice,
      dropoff_location: orderData.dropoffLocation,
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      status: 'Confirmed',
      created_at: createdAt,
      rider_name: 'Waiting for a fellow Isko Rider...',
    };

    const newGigPayload = {
      id: `GIG-${Math.floor(400 + Math.random() * 500)}`,
      pickup: orderData.restaurantName,
      dropoff: orderData.dropoffLocation,
      distance: '0.9 km',
      fee: 25,
      items_summary: orderData.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      customer_name: customerLabel,
      status: 'Available',
      latitude: orderData.latitude,
      longitude: orderData.longitude,
      linked_order_id: newOrderId,
    };

    await Promise.all([
      supabase.from('orders').insert([newOrderPayload]),
      supabase.from('gigs').insert([newGigPayload]),
    ]);

    const earnedPoints = Math.max(5, Math.floor(orderData.totalPrice / 10));
    setPoints((prev) => prev + earnedPoints);

    if (selectedVoucher) {
      setClaimedVouchers((prev) => prev.filter((v) => v.id !== selectedVoucher.id));
      setSelectedVoucher(null);
    }
  };

  const advanceOrderStatus = async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const flow: OrderStatus[] = ['Confirmed', 'Preparing', 'On the Way', 'Delivered'];
    const currentIndex = flow.indexOf(targetOrder.status);
    const nextStatus = flow[Math.min(currentIndex + 1, flow.length - 1)];
    const newRiderName = nextStatus === 'Confirmed' ? 'Waiting for a fellow Isko Rider...' : `${user?.name || 'Isko'} (Student Rider)`;

    await supabase.from('orders').update({ status: nextStatus, rider_name: newRiderName }).eq('id', orderId);
  };

  const redeemVoucher = (voucher: Voucher): boolean => {
    if (points < voucher.pointsCost) return false;
    setPoints((prev) => prev - voucher.pointsCost);
    const uniqueVoucher: Voucher = { ...voucher, id: `${voucher.id}-${Date.now()}` };
    setClaimedVouchers((prev) => [uniqueVoucher, ...prev]);
    return true;
  };

  const selectVoucherForCheckout = (voucher: Voucher | null) => {
    setSelectedVoucher(voucher);
  };

  const acceptGig = async (gigId: string) => {
    const riderLabel = user ? `${user.name} (${user.email})` : 'Fellow Isko Rider';
    const targetGig = gigs.find((g) => g.id === gigId);
    if (!targetGig) return;

    await Promise.all([
      supabase.from('gigs').update({ status: 'Accepted', accepted_by_email: user?.email }).eq('id', gigId),
      targetGig.linkedOrderId
        ? supabase.from('orders').update({ status: 'Preparing', rider_name: riderLabel }).eq('id', targetGig.linkedOrderId)
        : Promise.resolve(),
    ]);
  };

  const advanceGigStatus = async (gigId: string) => {
    const targetGig = gigs.find((g) => g.id === gigId);
    if (!targetGig) return;

    if (targetGig.status === 'Accepted') {
      await Promise.all([
        supabase.from('gigs').update({ status: 'Picked Up' }).eq('id', gigId),
        targetGig.linkedOrderId ? supabase.from('orders').update({ status: 'On the Way' }).eq('id', targetGig.linkedOrderId) : Promise.resolve(),
      ]);
    } else if (targetGig.status === 'Picked Up') {
      await Promise.all([
        supabase.from('gigs').update({ status: 'Completed' }).eq('id', gigId),
        targetGig.linkedOrderId ? supabase.from('orders').update({ status: 'Delivered' }).eq('id', targetGig.linkedOrderId) : Promise.resolve(),
      ]);
      setRiderEarnings((prev) => prev + targetGig.fee);
      setCompletedDeliveries((prev) => prev + 1);
      setPoints((prev) => prev + 10);
    }
  };

  const resetDemoData = async () => {
    try {
      await Promise.all([
        supabase.from('orders').delete().neq('id', ''),
        supabase.from('gigs').delete().neq('id', ''),
      ]);
      if (user) {
        await AsyncStorage.removeItem(getUserProfileKey(user.email));
      }
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