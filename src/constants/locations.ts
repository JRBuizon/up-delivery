// src/constants/locations.ts
export interface CampusLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { name: 'Melchor Hall (Lobby)', latitude: 14.656168, longitude: 121.069692 },
  { name: 'Palma Hall (AS Steps)', latitude: 14.653846, longitude: 121.069882 },
  { name: 'CS Library (Velasquez)', latitude: 14.649410, longitude: 121.069247 },
  { name: 'Sunken Garden Grandstand', latitude: 14.655119, longitude: 121.072859 },
  { name: 'Kalayaan Residence Hall', latitude: 14.658820, longitude: 121.068782 },
];