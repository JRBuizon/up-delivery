// src/constants/restaurants.ts

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  rating: number;
  deliveryTime: string;
  image: string;
  isPopular: boolean;
  isStudentOwned?: boolean;
  latitude: number;
  longitude: number;
  menu: MenuItem[];
}

export const CATEGORIES = [
  'All',
  'Rice Meals',
  'Snacks',
  'Coffee',
  'Milk Tea',
  'Healthy',
];

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'kanto-cravings',
    name: 'Kanto Cravings',
    category: 'Rice Meals',
    priceRange: '₱',
    rating: 4.8,
    deliveryTime: '15-25 min',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
    isPopular: true,
    isStudentOwned: false,
    latitude: 14.657805, // Area 2 vicinity
    longitude: 121.071060,
    menu: [
      {
        id: 'kc-1',
        name: 'Crispy Sisig Rice Bowl',
        description: 'Classic pork sisig topped with a sunny-side-up egg over garlic rice.',
        price: 95,
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
      },
      {
        id: 'kc-2',
        name: 'Chicken Pastil',
        description: 'Shredded chicken adobo flakes wrapped in banana leaf with steamed rice.',
        price: 65,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
      },
    ],
  },
  {
    id: 'up-tea-hub',
    name: 'UP Tea Hub',
    category: 'Milk Tea',
    priceRange: '₱',
    rating: 4.7,
    deliveryTime: '10-20 min',
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&q=80',
    isPopular: true,
    isStudentOwned: false,
    latitude: 14.653450, // Gyud Food Hub vicinity
    longitude: 121.072210,
    menu: [
      {
        id: 'th-1',
        name: 'Okinawa Brown Sugar',
        description: 'Rich roasted brown sugar milk tea with chewy tapioca pearls.',
        price: 85,
        image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=500&q=80',
      },
    ],
  },
  {
    id: 'silog-stop',
    name: 'Silog Stop',
    category: 'Filipino',
    priceRange: '₱',
    rating: 4.6,
    deliveryTime: '10-20 min',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    isPopular: false,
    isStudentOwned: true,
    latitude: 14.656500, // A2 / KNL vicinity
    longitude: 121.070000,
    menu: [
      {
        id: 'ss-1',
        name: 'Classic Tapsilog',
        description: 'Marinated cured beef tapa served with sinangag and fried egg.',
        price: 110,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
      },
    ],
  },
  {
    id: 'knl-lomian',
    name: 'KNL Lomian',
    category: 'Snacks',
    priceRange: '₱',
    rating: 4.4,
    deliveryTime: '25-35 min',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&q=80',
    isPopular: false,
    isStudentOwned: false,
    latitude: 14.647500, // Krus na Ligas (Proper)
    longitude: 121.061000,
    menu: [
      {
        id: 'kl-1',
        name: 'Special Lomi',
        description: 'Thick egg noodles in hearty soup with pork liver, kikiam, and quail eggs.',
        price: 75,
        image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=500&q=80',
      }
    ]
  },
  {
    id: 'maginhawa-grills',
    name: 'Maginhawa Grills',
    category: 'Rice Meals',
    priceRange: '₱₱',
    rating: 4.9,
    deliveryTime: '30-45 min',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    isPopular: true,
    isStudentOwned: false,
    latitude: 14.643600, // Maginhawa Street
    longitude: 121.059200,
    menu: [
      {
        id: 'mg-1',
        name: 'Pork BBQ Meal',
        description: '2 pieces of sweet and savory pork BBQ skewers with java rice and spiced vinegar.',
        price: 150,
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
      },
      {
        id: 'mg-2',
        name: 'Inihaw na Pusit',
        description: 'Fresh grilled squid stuffed with tomatoes and onions.',
        price: 220,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
      }
    ]
  }
];