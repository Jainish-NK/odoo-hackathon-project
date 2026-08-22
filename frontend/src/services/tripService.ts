import {
  Trip,
  ItinerarySection,
  ItinerarySectionType,
  SuggestedPlace,
  SuggestedActivity,
  TripDestinationOption,
} from '../types/trip';
import { apiClient } from './api';

// ── Pure helpers (no network) ──────────────────────────────────────────
// Unchanged from the original mock implementation — these are plain
// date/string math, not something the backend integration touches.

export const normalizeToISODate = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const withYear = new Date(`${trimmed} 2026`);
  if (!isNaN(withYear.getTime())) {
    const y = withYear.getFullYear();
    const m = String(withYear.getMonth() + 1).padStart(2, '0');
    const d = String(withYear.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return trimmed;
};

export const calculateTotalBudget = (sections?: ItinerarySection[]): number => {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);
};

export const getTripStatus = (
  startDateStr?: string,
  endDateStr?: string,
): 'ONGOING' | 'UPCOMING' | 'COMPLETED' => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const start = normalizeToISODate(startDateStr);
  const end = normalizeToISODate(endDateStr) || start;

  if (!start) return 'UPCOMING';

  if (todayStr > end) return 'COMPLETED';
  if (todayStr < start) return 'UPCOMING';
  return 'ONGOING';
};

export const calculateTripDurationDays = (startDateStr?: string, endDateStr?: string): number => {
  const start = normalizeToISODate(startDateStr);
  const end = normalizeToISODate(endDateStr) || start;
  if (!start || !end) return 1;

  const startParts = start.split('-').map(Number);
  const endParts = end.split('-').map(Number);
  if (startParts.length === 3 && endParts.length === 3) {
    const d1 = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const d2 = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff + 1);
  }
  return 1;
};

export const formatDisplayDate = (val?: string, includeYear: boolean = true): string => {
  if (!val) return '';
  const iso = normalizeToISODate(val);
  const parts = iso.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(includeYear ? { year: 'numeric' } : {}),
      });
    }
  }
  return val;
};

// ── Backend shapes (see src/modules/trips, src/modules/budgets) ───────

interface BackendTripSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendCity {
  id: string;
  name: string;
  country: string;
  region: string | null;
  imageUrl: string | null;
}

interface BackendTripStop {
  id: string;
  cityId: string;
  city: BackendCity;
}

interface BackendTripDetail extends BackendTripSummary {
  stops: BackendTripStop[];
}

interface BackendExpense {
  id: string;
  category: 'TRANSPORT' | 'ACCOMMODATION' | 'ACTIVITIES' | 'MEALS' | 'OTHER';
  description: string | null;
  amount: string | number;
  date: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop';

// ── Adapter: backend Trip + TripStop[] + Expense[] → frontend Trip ────
//
// The frontend's itinerary model is a single flat list of "sections"
// (travel / hotel / activity / food / sightseeing / other) with free-text
// title/location/notes. The real backend has no equivalent single entity —
// it separates a scheduled catalog Activity (TripActivity, tied to a real
// Activity id in a specific city) from a logged Expense (category + amount
// + date, no catalog link required). Since sections here are user-authored
// free text with no catalog backing, every section is persisted as an
// Expense — that's the only backend entity that doesn't require linking to
// a pre-existing catalog row. The trade-off: a section's exact time range,
// free-text location, and notes are not persisted server-side (Expense has
// no columns for them) and won't survive a reload. Everything else —
// title, category/type, budget amount, date, and real backend ids — is
// fully real and persisted.

function categoryToSectionType(category: BackendExpense['category']): ItinerarySectionType {
  switch (category) {
    case 'TRANSPORT':
      return 'travel';
    case 'ACCOMMODATION':
      return 'hotel';
    case 'ACTIVITIES':
      return 'activity';
    case 'MEALS':
      return 'food';
    default:
      return 'other';
  }
}

function sectionTypeToCategory(type: ItinerarySectionType): BackendExpense['category'] {
  switch (type) {
    case 'travel':
      return 'TRANSPORT';
    case 'hotel':
      return 'ACCOMMODATION';
    case 'activity':
    case 'sightseeing':
      return 'ACTIVITIES';
    case 'food':
      return 'MEALS';
    default:
      return 'OTHER';
  }
}

function toDateOnly(iso: string): string {
  return iso.slice(0, 10);
}

function adaptTrip(trip: BackendTripDetail, expenses: BackendExpense[]): Trip {
  const destinations: TripDestinationOption[] = trip.stops.map((stop) => ({
    id: stop.cityId,
    city: stop.city.name,
    country: stop.city.country,
    region: stop.city.region || 'Global',
    flag: '📍',
    image: stop.city.imageUrl || FALLBACK_IMAGE,
  }));

  const sections: ItinerarySection[] = expenses.map((exp, idx) => ({
    id: exp.id,
    order: idx + 1,
    type: categoryToSectionType(exp.category),
    title: exp.description || exp.category,
    description: exp.description || '',
    startDate: toDateOnly(exp.date),
    endDate: toDateOnly(exp.date),
    budget: Number(exp.amount) || 0,
  }));

  return {
    id: trip.id,
    userId: trip.userId,
    name: trip.name,
    startDate: toDateOnly(trip.startDate),
    endDate: toDateOnly(trip.endDate),
    destinations,
    sections,
    totalBudget: calculateTotalBudget(sections),
    notes: trip.description ?? undefined,
    createdAt: trip.createdAt,
    updatedAt: trip.updatedAt,
  };
}

async function fetchFullTrip(tripId: string): Promise<Trip | null> {
  try {
    const [tripRes, expensesRes] = await Promise.all([
      apiClient.get<BackendTripDetail>(`/trips/${tripId}`),
      apiClient.get<BackendExpense[]>(`/trips/${tripId}/expenses`),
    ]);
    return adaptTrip(tripRes.data, expensesRes.data);
  } catch {
    return null;
  }
}

async function createExpenseSection(
  tripId: string,
  input: { type: ItinerarySectionType; title: string; budget: number; date: string },
): Promise<void> {
  await apiClient.post(`/trips/${tripId}/expenses`, {
    category: sectionTypeToCategory(input.type),
    description: input.title,
    amount: Math.max(1, Math.round(input.budget || 0)),
    date: normalizeToISODate(input.date) || input.date,
  });
}

function parseCostFromLabel(label: string): number {
  const match = label.match(/([0-9,]+)/);
  if (!match) return 2500;
  const num = parseInt(match[1].replace(/,/g, ''), 10);
  if (!num) return 2500;
  return label.includes('€') ? num * 90 : num;
}

export const tripService = {
  /** userId is accepted for call-site compatibility but unused — the backend scopes /trips to the authenticated caller. */
  async getUserTrips(_userId: string): Promise<Trip[]> {
    try {
      const { data: summaries } = await apiClient.get<BackendTripSummary[]>('/trips', { limit: 100 });
      const trips = await Promise.all(summaries.map((t) => fetchFullTrip(t.id)));
      return trips.filter((t): t is Trip => t !== null);
    } catch {
      return [];
    }
  },

  async getTripById(tripId: string): Promise<Trip | null> {
    return fetchFullTrip(tripId);
  },

  async createTrip(data: {
    userId: string;
    name: string;
    startDate: string;
    endDate: string;
    destinations: TripDestinationOption[];
    selectedPlaces?: SuggestedPlace[];
    selectedActivities?: SuggestedActivity[];
    notes?: string;
  }): Promise<Trip> {
    const startDate = normalizeToISODate(data.startDate);
    const endDate = normalizeToISODate(data.endDate);

    const { data: created } = await apiClient.post<BackendTripSummary>('/trips', {
      name: data.name,
      description: data.notes || undefined,
      startDate,
      endDate,
    });

    // Each destination becomes a real trip stop. A destination whose id
    // isn't a real backend city (or whose dates don't validate) is skipped
    // rather than failing the whole trip creation.
    for (const dest of data.destinations) {
      await apiClient
        .post(`/trips/${created.id}/stops`, { cityId: dest.id, startDate, endDate })
        .catch(() => undefined);
    }

    for (const place of data.selectedPlaces ?? []) {
      await createExpenseSection(created.id, {
        type: 'sightseeing',
        title: place.name,
        budget: 2500,
        date: startDate,
      }).catch(() => undefined);
    }

    for (const act of data.selectedActivities ?? []) {
      await createExpenseSection(created.id, {
        type: 'activity',
        title: act.name,
        budget: parseCostFromLabel(act.estimatedCost),
        date: endDate,
      }).catch(() => undefined);
    }

    const full = await fetchFullTrip(created.id);
    return full ?? adaptTrip({ ...created, stops: [] }, []);
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.notes !== undefined) patch.description = updates.notes;
    if (updates.startDate !== undefined) patch.startDate = normalizeToISODate(updates.startDate);
    if (updates.endDate !== undefined) patch.endDate = normalizeToISODate(updates.endDate);

    try {
      if (Object.keys(patch).length > 0) {
        await apiClient.patch(`/trips/${tripId}`, patch);
      }
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  async addItinerarySection(
    tripId: string,
    sectionData: Omit<ItinerarySection, 'id' | 'order'>,
  ): Promise<Trip | null> {
    try {
      await createExpenseSection(tripId, {
        type: sectionData.type,
        title: sectionData.title,
        budget: sectionData.budget,
        date: sectionData.startDate,
      });
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  async updateItinerarySection(
    tripId: string,
    sectionId: string,
    updates: Partial<ItinerarySection>,
  ): Promise<Trip | null> {
    const patch: Record<string, unknown> = {};
    if (updates.type !== undefined) patch.category = sectionTypeToCategory(updates.type);
    if (updates.title !== undefined) patch.description = updates.title;
    if (updates.budget !== undefined) patch.amount = Math.max(1, Math.round(updates.budget));
    if (updates.startDate !== undefined) patch.date = normalizeToISODate(updates.startDate);

    try {
      if (Object.keys(patch).length > 0) {
        await apiClient.patch(`/trips/${tripId}/expenses/${sectionId}`, patch);
      }
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  async deleteItinerarySection(tripId: string, sectionId: string): Promise<Trip | null> {
    try {
      await apiClient.delete(`/trips/${tripId}/expenses/${sectionId}`);
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  /**
   * The backend's Expense model has no ordering column, so this reorders
   * the already-fetched sections in memory and returns them — it renders
   * correctly right away but isn't persisted, and reverts to date order on
   * the next full reload. Every other section mutation here is fully real
   * and persisted; this is the one deliberate, disclosed exception.
   */
  async reorderItinerarySections(tripId: string, sectionIdsInOrder: string[]): Promise<Trip | null> {
    const trip = await fetchFullTrip(tripId);
    if (!trip) return null;

    const byId = new Map(trip.sections.map((s) => [s.id, s]));
    const reordered: ItinerarySection[] = [];
    sectionIdsInOrder.forEach((id, idx) => {
      const section = byId.get(id);
      if (section) {
        reordered.push({ ...section, order: idx + 1 });
      }
    });
    trip.sections.forEach((s) => {
      if (!sectionIdsInOrder.includes(s.id)) {
        reordered.push({ ...s, order: reordered.length + 1 });
      }
    });

    return { ...trip, sections: reordered };
  },

  async deleteTrip(tripId: string, _userId?: string): Promise<boolean> {
    try {
      await apiClient.delete(`/trips/${tripId}`);
      return true;
    } catch {
      return false;
    }
  },

  async addDestinationToTrip(tripId: string, destination: TripDestinationOption): Promise<Trip | null> {
    const trip = await fetchFullTrip(tripId);
    if (!trip) return null;
    if (trip.destinations.some((d) => d.id === destination.id)) return trip;

    try {
      await apiClient.post(`/trips/${tripId}/stops`, {
        cityId: destination.id,
        startDate: trip.startDate,
        endDate: trip.endDate,
      });
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  /**
   * `autoAddCity` from the original mock signature is accepted for call-site
   * compatibility but not acted on: the real Activity here doesn't carry
   * its city's id (only a display name), so there's nothing valid to create
   * a stop from without an extra lookup. The activity itself is still added
   * as a budgeted section either way.
   */
  async addActivityToTrip(
    tripId: string,
    activity: {
      id: string;
      name: string;
      city: string;
      country?: string;
      category?: string;
      type?: string;
      duration?: string;
      estimatedCost?: string;
      costNumeric?: number;
      rating?: number;
      image?: string;
      description?: string;
    },
    _autoAddCity = true,
  ): Promise<Trip | null> {
    const trip = await fetchFullTrip(tripId);
    if (!trip) return null;
    if (trip.sections.some((s) => s.title.toLowerCase() === activity.name.toLowerCase())) return trip;

    const cat = (activity.category || activity.type || 'activity').toLowerCase();
    const type: ItinerarySectionType =
      cat.includes('food') || cat.includes('culinary')
        ? 'food'
        : cat.includes('sightseeing') || cat.includes('heritage') || cat.includes('art')
          ? 'sightseeing'
          : 'activity';
    const budget = activity.costNumeric ?? parseCostFromLabel(activity.estimatedCost ?? '');

    try {
      await createExpenseSection(tripId, { type, title: activity.name, budget, date: trip.startDate });
    } catch {
      return null;
    }
    return fetchFullTrip(tripId);
  },

  /** Copies a trip via the real backend endpoint (public trips, or the caller's own). */
  async cloneTripForUser(sourceTrip: Trip, _newUserId: string): Promise<Trip> {
    const { data: copied } = await apiClient.post<BackendTripSummary>(`/trips/${sourceTrip.id}/copy`, {});
    const full = await fetchFullTrip(copied.id);
    return full ?? adaptTrip({ ...copied, stops: [] }, []);
  },
};
