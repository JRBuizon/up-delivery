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
  { name: 'Quezon Hall (Oblation Plaza)', latitude: 14.654800, longitude: 121.064400 },
  { name: 'Vinzons Hall (Lobby)', latitude: 14.655300, longitude: 121.074100 },
  { name: 'Main Library (Gonzalez Hall)', latitude: 14.654800, longitude: 121.068300 },
  { name: 'NIP / Science Complex', latitude: 14.647900, longitude: 121.071800 },
  { name: 'Plaridel Hall (Maskom)', latitude: 14.653600, longitude: 121.063100 },
];