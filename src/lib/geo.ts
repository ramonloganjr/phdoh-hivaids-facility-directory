/**
 * Geo utilities: Haversine distance, proximity bands, formatting.
 *
 * All distances in kilometres. Haversine assumes spherical Earth — accurate
 * to within ~0.5% for the < 500km distances surfaced in this app.
 */

export type LatLng = { lat: number; lon: number };

const EARTH_KM = 6371.0088;
const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance between two points, in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Approximate walking-equivalent travel time at 4.5 km/h (urban average). */
export function walkMinutes(km: number): number {
  return Math.round((km / 4.5) * 60);
}

/** Approximate driving time at 30 km/h (PH urban average, conservative). */
export function driveMinutes(km: number): number {
  return Math.round((km / 30) * 60);
}

/** Proximity bands used to cluster nearby facilities. */
export type ProximityBand = {
  id: "walk" | "near" | "city" | "region" | "far";
  label: string;
  hint: string;
  maxKm: number; // upper bound (inclusive)
};

export const PROXIMITY_BANDS: ProximityBand[] = [
  { id: "walk",   label: "Within walking distance", hint: "Under 2 km",   maxKm: 2 },
  { id: "near",   label: "Nearby",                  hint: "2 – 10 km",    maxKm: 10 },
  { id: "city",   label: "Within your city",        hint: "10 – 25 km",   maxKm: 25 },
  { id: "region", label: "Across the region",       hint: "25 – 75 km",   maxKm: 75 },
  { id: "far",    label: "Farther afield",          hint: "Over 75 km",   maxKm: Infinity },
];

export function bandFor(km: number): ProximityBand {
  for (const b of PROXIMITY_BANDS) if (km <= b.maxKm) return b;
  return PROXIMITY_BANDS[PROXIMITY_BANDS.length - 1];
}

/** Human-friendly distance ("450 m", "3.2 km", "47 km"). */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export const PROXIMITY_RANGES: { id: "5" | "10" | "25" | "75" | "all"; label: string; maxKm: number }[] = [
  { id: "5",   label: "Within 5 km",  maxKm: 5 },
  { id: "10",  label: "Within 10 km", maxKm: 10 },
  { id: "25",  label: "Within 25 km", maxKm: 25 },
  { id: "75",  label: "Within 75 km", maxKm: 75 },
  { id: "all", label: "Any distance", maxKm: Infinity },
];
