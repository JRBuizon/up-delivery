// src/context/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';

export type OrderStatus = 'Confirmed' | 'Preparing' | 'On the Way' | 'Delivered';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
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
}

interface AppContextType {
  orders: Order[];
  points: number;
  claimedVouchers: Voucher[];
  selectedVoucher: Voucher | null;
  riderOnline: boolean;
  riderEarnings: number;
  completedDeliveries: number;
  gigs: RiderGig[];
  placeOrder: (orderData: Omit<Order, 'id' | 'status' | 'createdAt' | 'riderName'>) => void;
  advanceOrderStatus: (orderId: string) => void;
  redeemVoucher: (voucher: Voucher) => boolean;
  selectVoucherForCheckout: (voucher: Voucher | null) => void;
  setRiderOnline: (online: boolean) => void;
  acceptGig: (gigId: string) => void;
  advanceGigStatus: (gigId: string) => void;
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
    riderName: 'Miguel S. (BS ME)',
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
    customerName: 'Bea R.',
    status: 'Available',
  },
  {
    id: 'GIG-302',
    pickup: 'UP Tea Hub',
    dropoff: 'CS Library (Velasquez St.)',
    distance: '1.2 km',
    fee: 30,
    itemsSummary: '3x Classic Pearl Milk Tea',
    customerName: 'Carlo D.',
    status: 'Available',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [points, setPoints] = useState<number>(140);
  const [claimedVouchers, setClaimedVouchers] = useState<Voucher[]>([
    {
      id: 'v-init',
      title: 'Free Campus Delivery',
      description: 'Waives ₱15 delivery fee anywhere in UPD',
      pointsCost: 50,
      discountAmount: 15,
      code: 'ISKOFREE',
    },
  ]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [riderOnline, setRiderOnline] = useState<boolean>(true);
  const [riderEarnings, setRiderEarnings] = useState<number>(185);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(7);
  const [gigs, setGigs] = useState<RiderGig[]>(INITIAL_GIGS);

  const placeOrder: AppContextType['placeOrder'] = (orderData) => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      status: 'Confirmed',
      createdAt: 'Just now',
      riderName: 'Assigning Isko Rider...',
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Award 1 Iskolar Point per ₱10 spent
    const earnedPoints = Math.max(5, Math.floor(orderData.totalPrice / 10));
    setPoints((prev) => prev + earnedPoints);

    // Consume selected voucher if used
    if (selectedVoucher) {
      setClaimedVouchers((prev) => prev.filter((v) => v.id !== selectedVoucher.id));
      setSelectedVoucher(null);
    }

    // Also add this order to the Rider Gigs board so you can deliver it in Rider tab!
    const newGig: RiderGig = {
      id: `GIG-${Math.floor(400 + Math.random() * 500)}`,
      pickup: orderData.restaurantName,
      dropoff: orderData.dropoffLocation,
      distance: '0.9 km',
      fee: 25,
      itemsSummary: orderData.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      customerName: 'You (Iskolar)',
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
              ? 'Assigning Isko Rider...'
              : 'Anton M. (Fellow Isko Rider)',
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
    setGigs((prev) =>
      prev.map((g) => (g.id === gigId ? { ...g, status: 'Accepted' } : g))
    );
    const targetGig = gigs.find((g) => g.id === gigId);
    if (targetGig?.linkedOrderId) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === targetGig.linkedOrderId
            ? { ...o, status: 'Preparing', riderName: 'You (Isko Rider)' }
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
      setPoints((prev) => prev + 10); // Bonus points for completing a campus delivery
      if (targetGig.linkedOrderId) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === targetGig.linkedOrderId ? { ...o, status: 'Delivered' } : o
          )
        );
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        points,
        claimedVouchers,
        selectedVoucher,
        riderOnline,
        riderEarnings,
        completedDeliveries,
        gigs,
        placeOrder,
        advanceOrderStatus,
        redeemVoucher,
        selectVoucherForCheckout,
        setRiderOnline,
        acceptGig,
        advanceGigStatus,
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