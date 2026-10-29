// src/utils/distance.ts

/**
 * Calculates the great-circle distance between two points in kilometers
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Tiered delivery fee:
 * - 0 to 1 km: ₱15 (base rate)
 * - > 1 km: +₱7 per succeeding km (or fraction thereof)
 */
export function calculateDeliveryFee(distanceKm: number): number {
  const BASE_RATE = 15;
  const PER_KM_RATE = 7;

  if (distanceKm <= 1.0) {
    return BASE_RATE;
  }

  // Tiers by full or partial succeeding kilometer (e.g., 1.2 km -> 1 extra km = ₱22)
  const succeedingKm = Math.ceil(distanceKm - 1.0);
  return BASE_RATE + succeedingKm * PER_KM_RATE;

  // Alternative (continuous linear pricing):
  // return Math.round(BASE_RATE + (distanceKm - 1.0) * PER_KM_RATE);
}