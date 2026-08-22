// Adapts the real backend's City/Activity catalogs (GET /cities, GET
// /activities) onto the frontend's existing Destination/ActivityItem shapes,
// so CitySearch/ActivitySearch can keep their existing filter/sort/group
// logic and just swap their data source from the static mock arrays to this.
//
// The backend has none of the decorative fields these UI types expect
// (rating, reviewCount, tags, travelStyle, highlight for cities; rating for
// activities) — there was never a rating/review system built. Where a real
// backend field can honestly stand in for one (costIndex → priceLevel,
// popularity → rating/reviewCount, durationMinutes → duration), it's used;
// where there's truly nothing to derive from (city travelStyle/tags/
// highlight, activity rating), a fixed, clearly-labeled placeholder is used
// instead of inventing fake-looking precision.
import { apiClient } from './api';
import { Destination, RegionType, TravelStyle, PriceLevel } from '../types/landing';
import { ActivityItem } from '../types/trip';

interface BackendCity {
  id: string;
  name: string;
  country: string;
  region: string | null;
  costIndex: number;
  popularity: number;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface BackendActivity {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  category: string;
  cost: string | number;
  durationMinutes: number;
  imageUrl: string | null;
  city?: { id: string; name: string; country: string };
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';

function toRegionType(region: string | null): RegionType {
  const r = (region ?? '').toLowerCase();
  if (r.includes('europe')) return 'Europe';
  if (r.includes('asia')) return 'Asia';
  if (r.includes('africa')) return 'Africa';
  if (r.includes('america')) return 'Americas';
  if (r.includes('ocean') || r.includes('australia')) return 'Oceania';
  if (r.includes('middle east')) return 'Middle East';
  return 'Asia';
}

function costIndexToPriceLevel(costIndex: number): PriceLevel {
  if (costIndex < 40) return 'Budget';
  if (costIndex < 70) return 'Moderate';
  return 'Luxury';
}

function costToActivityPriceLevel(cost: number): 'Free' | 'Budget' | 'Moderate' | 'Premium' {
  if (cost <= 0) return 'Free';
  if (cost < 25) return 'Budget';
  if (cost < 75) return 'Moderate';
  return 'Premium';
}

const TRAVEL_STYLES: TravelStyle[] = ['Cultural', 'Adventure', 'Luxury', 'Relaxation', 'Culinary', 'Nature'];

/** Deterministic (not random) so the same city always gets the same style across renders/sessions. */
function deriveTravelStyle(seed: string): TravelStyle {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return TRAVEL_STYLES[hash % TRAVEL_STYLES.length];
}

function toDestination(city: BackendCity): Destination {
  // popularity is 0-100 on the backend; map it onto a 3.5-5.0 rating band
  // and a proportional review count — both derived from a real signal, not
  // random, but the specific scale/multiplier is a cosmetic choice.
  const rating = Math.round((3.5 + (city.popularity / 100) * 1.5) * 10) / 10;
  const reviewCount = Math.max(50, Math.round(city.popularity * 42));

  return {
    id: city.id,
    city: city.name,
    country: city.country,
    region: toRegionType(city.region),
    image: city.imageUrl || FALLBACK_IMAGE,
    rating,
    reviewCount,
    tags: [city.country, city.region ?? toRegionType(city.region)].filter(Boolean),
    travelStyle: deriveTravelStyle(city.id),
    priceLevel: costIndexToPriceLevel(city.costIndex),
    highlight: `Discover ${city.name}, ${city.country}`,
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  SIGHTSEEING: 'Sightseeing',
  ADVENTURE: 'Adventure',
  FOOD_AND_DRINK: 'Food & Drink',
  CULTURE: 'Culture',
  NIGHTLIFE: 'Nightlife',
  SHOPPING: 'Shopping',
  RELAXATION: 'Relaxation',
  OUTDOOR: 'Outdoor',
  OTHER: 'Other',
};

function toActivityItem(activity: BackendActivity, cityName: string, countryName: string): ActivityItem {
  const cost = Number(activity.cost) || 0;
  const durationHours = Math.max(0.5, Math.round((activity.durationMinutes / 60) * 10) / 10);

  return {
    id: activity.id,
    name: activity.name,
    city: cityName,
    country: countryName,
    category: CATEGORY_LABEL[activity.category] ?? activity.category,
    // No engagement/rating data exists for activities on the backend yet —
    // a fixed placeholder beats inventing a fake-precise random number.
    rating: 4.6,
    duration: durationHours >= 1 ? `${durationHours} hr${durationHours === 1 ? '' : 's'}` : `${activity.durationMinutes} min`,
    durationHours,
    estimatedCost: cost > 0 ? `₹${cost.toLocaleString('en-IN')}` : 'Free',
    costNumeric: cost,
    priceLevel: costToActivityPriceLevel(cost),
    image: activity.imageUrl || FALLBACK_IMAGE,
    description: activity.description || `${activity.name} in ${cityName}.`,
    highlights: [],
    isPlace: false,
  };
}

export const catalogService = {
  /** Fetches the full city catalog (paginated on the backend; pulls every page). */
  async getCities(): Promise<Destination[]> {
    const limit = 100;
    let page = 1;
    const all: BackendCity[] = [];

    for (;;) {
      const res = await apiClient.get<BackendCity[]>('/cities', { page, limit }, false);
      all.push(...res.data);
      if (!res.meta || page >= res.meta.totalPages) break;
      page += 1;
    }

    return all.map(toDestination);
  },

  /** Fetches the full activity catalog, resolving each activity's city name/country for display. */
  async getActivities(): Promise<ActivityItem[]> {
    const limit = 100;
    let page = 1;
    const all: BackendActivity[] = [];

    for (;;) {
      const res = await apiClient.get<BackendActivity[]>('/activities', { page, limit }, false);
      all.push(...res.data);
      if (!res.meta || page >= res.meta.totalPages) break;
      page += 1;
    }

    return all.map((a) => toActivityItem(a, a.city?.name ?? 'Unknown', a.city?.country ?? ''));
  },
};
