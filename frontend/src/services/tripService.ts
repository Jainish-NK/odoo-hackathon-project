import {
  Trip,
  ItinerarySection,
  ItinerarySectionType,
  SuggestedPlace,
  SuggestedActivity,
  TripDestinationOption,
} from '../types/trip';

// ── Storage key ──────────────────────────────────────────────────────────
const STORAGE_KEY_TRIPS = 'globetrotter_trips';

// ── Pure helpers (no network) ──────────────────────────────────────────
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
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
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

// ── Initial Mock Trips ──────────────────────────────────────────────────
export const seedMockTrips: Trip[] = [
  {
    id: 'trip_ongoing',
    userId: 'usr_default_1',
    name: 'Amalfi Coastal Odyssey',
    startDate: '2026-08-20',
    endDate: '2026-08-26',
    notes: 'Mediterranean summer getaway exploring picturesque cliffside villages, lemon groves, and secluded grottos.',
    destinations: [
      {
        id: 'dest_amalfi',
        city: 'Amalfi Coast',
        country: 'Italy',
        region: 'Europe',
        flag: '🇮🇹',
        image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'dest_rome',
        city: 'Rome',
        country: 'Italy',
        region: 'Europe',
        flag: '🇮🇹',
        image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop',
      },
    ],
    sections: [
      {
        id: 'sec_101',
        order: 1,
        type: 'travel',
        title: 'Flight: Rome FCO to Naples + Private Transfer',
        description: 'Private transfer from Rome FCO to Amalfi Coast.',
        location: 'Naples Capodichino Airport',
        startDate: '2026-08-20',
        endDate: '2026-08-20',
        startTime: '09:00',
        endTime: '11:30',
        budget: 14500,
        notes: 'Driver waiting at Terminal 3 arrivals with name placard.',
      },
      {
        id: 'sec_102',
        order: 2,
        type: 'hotel',
        title: 'Hotel Santa Caterina (Sea View Suite)',
        description: 'Luxury cliffside suite with private balcony.',
        location: 'SS Amalfitana, 9, Amalfi',
        startDate: '2026-08-20',
        endDate: '2026-08-24',
        startTime: '14:00',
        budget: 38000,
        notes: 'Clifftop saltwater pool and private elevator down to beach club.',
      },
      {
        id: 'sec_103',
        order: 3,
        type: 'activity',
        title: 'Private Sunset Gozzo Boat Cruise around Capri',
        description: 'Private 4-hour sunset cruise along Faraglioni rocks.',
        location: 'Marina Grande, Capri',
        startDate: '2026-08-21',
        endDate: '2026-08-21',
        startTime: '16:30',
        endTime: '20:00',
        budget: 9500,
        notes: 'Includes prosecco, fresh fruit, and snorkeling in Green Grotto.',
      },
      {
        id: 'sec_104',
        order: 4,
        type: 'food',
        title: 'Dinner at Ristorante Marina Grande',
        description: 'Waterfront seafood tasting menu.',
        location: 'Viale della Regione 4, Amalfi',
        startDate: '2026-08-21',
        endDate: '2026-08-21',
        startTime: '20:30',
        budget: 4200,
        notes: 'Try the handmade scialatielli with seafood and local limoncello.',
      },
    ],
    totalBudget: 66200,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-20T08:00:00Z',
  },
  {
    id: 'trip_1',
    userId: 'usr_default_1',
    name: 'Europe Discovery Tour',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    notes: 'Classic European grand tour across four iconic capitals and cultural hubs.',
    destinations: [
      {
        id: 'dest_paris',
        city: 'Paris',
        country: 'France',
        region: 'Europe',
        flag: '🇫🇷',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'dest_amsterdam',
        city: 'Amsterdam',
        country: 'Netherlands',
        region: 'Europe',
        flag: '🇳🇱',
        image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'dest_berlin',
        city: 'Berlin',
        country: 'Germany',
        region: 'Europe',
        flag: '🇩🇪',
        image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=800&auto=format&fit=crop',
      },
    ],
    sections: [
      {
        id: 'sec_1',
        order: 1,
        type: 'hotel',
        title: 'Le Marais Boutique Hotel',
        description: 'Boutique stay in the historic Marais district.',
        location: 'Paris, France',
        startDate: '2026-09-10',
        endDate: '2026-09-13',
        budget: 18500,
      },
      {
        id: 'sec_2',
        order: 2,
        type: 'sightseeing',
        title: 'Louvre Masterpieces & Mona Lisa VIP Tour',
        description: 'Skip-the-line guided museum tour.',
        location: 'Paris, France',
        startDate: '2026-09-11',
        endDate: '2026-09-11',
        budget: 4500,
      },
      {
        id: 'sec_3',
        order: 3,
        type: 'travel',
        title: 'Eurostar Express: Paris Gare du Nord to Amsterdam Centraal',
        description: 'High-speed train between Paris and Amsterdam.',
        location: 'Paris to Amsterdam',
        startDate: '2026-09-14',
        endDate: '2026-09-14',
        budget: 6800,
      },
      {
        id: 'sec_4',
        order: 4,
        type: 'activity',
        title: 'Canal Cruise & Jordaan Culinary Walk',
        description: 'Guided canal boat tour and artisan food tasting.',
        location: 'Amsterdam, Netherlands',
        startDate: '2026-09-15',
        endDate: '2026-09-15',
        budget: 4200,
      },
    ],
    totalBudget: 34000,
    createdAt: '2026-07-15T12:00:00Z',
    updatedAt: '2026-08-10T14:00:00Z',
  },
  {
    id: 'trip_2',
    userId: 'usr_default_1',
    name: 'Japan Autumn Discovery',
    startDate: '2026-10-15',
    endDate: '2026-10-24',
    notes: 'Temples, neon alleys, and traditional onsen hot springs in Tokyo and Kyoto.',
    destinations: [
      {
        id: 'dest_tokyo',
        city: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        flag: '🇯🇵',
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
      },
      {
        id: 'dest_kyoto',
        city: 'Kyoto',
        country: 'Japan',
        region: 'Asia',
        flag: '🇯🇵',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
      },
    ],
    sections: [
      {
        id: 'sec_201',
        order: 1,
        type: 'hotel',
        title: 'Shinjuku Prince Hotel',
        description: 'Modern hotel in central Shinjuku.',
        location: 'Tokyo, Japan',
        startDate: '2026-10-15',
        endDate: '2026-10-19',
        budget: 22000,
      },
      {
        id: 'sec_202',
        order: 2,
        type: 'food',
        title: 'Tsukiji Market Street Food Tasting Tour',
        description: 'Early morning street food and sushi sampling.',
        location: 'Tsukiji, Tokyo',
        startDate: '2026-10-16',
        endDate: '2026-10-16',
        budget: 3500,
      },
      {
        id: 'sec_203',
        order: 3,
        type: 'travel',
        title: 'Shinkansen Bullet Train: Tokyo to Kyoto',
        description: 'Nozomi bullet train journey.',
        location: 'Tokyo Station',
        startDate: '2026-10-20',
        endDate: '2026-10-20',
        budget: 7200,
      },
    ],
    totalBudget: 32700,
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-08-15T11:00:00Z',
  },
];

const getStoredTrips = (): Trip[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(seedMockTrips));
      return seedMockTrips;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedMockTrips;
  } catch {
    return seedMockTrips;
  }
};

const saveStoredTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
  } catch (err) {
    console.error('Failed to save trips', err);
  }
};

function parseCostFromLabel(label: string): number {
  const match = label.match(/([0-9,]+)/);
  if (!match) return 2500;
  const num = parseInt(match[1].replace(/,/g, ''), 10);
  if (!num) return 2500;
  return label.includes('€') ? num * 90 : num;
}

export const tripService = {
  /** Get all trips for the user from local storage */
  async getUserTrips(_userId?: string): Promise<Trip[]> {
    return getStoredTrips();
  },

  async getTripById(tripId: string): Promise<Trip | null> {
    const trips = getStoredTrips();
    return trips.find((t) => t.id === tripId) || null;
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
    const trips = getStoredTrips();
    const startDate = normalizeToISODate(data.startDate);
    const endDate = normalizeToISODate(data.endDate);

    const sections: ItinerarySection[] = [];
    let order = 1;

    for (const place of data.selectedPlaces ?? []) {
      sections.push({
        id: `sec_place_${Date.now()}_${order}`,
        order: order++,
        type: 'sightseeing',
        title: place.name,
        description: `Visit and explore ${place.name}.`,
        location: place.city ? `${place.city}, ${place.country || ''}` : '',
        budget: 2500,
        startDate,
        endDate: startDate,
      });
    }

    for (const act of data.selectedActivities ?? []) {
      sections.push({
        id: `sec_act_${Date.now()}_${order}`,
        order: order++,
        type: 'activity',
        title: act.name,
        description: `Activity: ${act.name} (${act.duration || '2 hours'}).`,
        location: act.city ? `${act.city}, ${act.country || ''}` : '',
        budget: parseCostFromLabel(act.estimatedCost),
        startDate: endDate || startDate,
        endDate: endDate || startDate,
      });
    }

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      userId: data.userId || 'usr_default_1',
      name: data.name,
      startDate,
      endDate,
      destinations: data.destinations,
      sections,
      totalBudget: calculateTotalBudget(sections),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTrip, ...trips];
    saveStoredTrips(updated);
    return newTrip;
  },

  async updateTrip(tripId: string, updates: Partial<Trip>): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const base = trips[index];
    const updatedTrip: Trip = {
      ...base,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.sections) {
      updatedTrip.totalBudget = calculateTotalBudget(updates.sections);
    }

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  async addItinerarySection(
    tripId: string,
    sectionData: Omit<ItinerarySection, 'id' | 'order'>,
  ): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    const newSection: ItinerarySection = {
      ...sectionData,
      description: sectionData.description || sectionData.title,
      id: `sec_${Date.now()}`,
      order: (trip.sections?.length || 0) + 1,
    };

    const sections = [...(trip.sections || []), newSection];
    const updatedTrip: Trip = {
      ...trip,
      sections,
      totalBudget: calculateTotalBudget(sections),
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  async updateItinerarySection(
    tripId: string,
    sectionId: string,
    updates: Partial<ItinerarySection>,
  ): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    const sections = (trip.sections || []).map((s) => (s.id === sectionId ? { ...s, ...updates } : s));

    const updatedTrip: Trip = {
      ...trip,
      sections,
      totalBudget: calculateTotalBudget(sections),
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  async deleteItinerarySection(tripId: string, sectionId: string): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    const sections = (trip.sections || []).filter((s) => s.id !== sectionId);

    const updatedTrip: Trip = {
      ...trip,
      sections,
      totalBudget: calculateTotalBudget(sections),
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  async reorderItinerarySections(tripId: string, sectionIdsInOrder: string[]): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    const byId = new Map((trip.sections || []).map((s) => [s.id, s]));
    const reordered: ItinerarySection[] = [];

    sectionIdsInOrder.forEach((id, idx) => {
      const section = byId.get(id);
      if (section) {
        reordered.push({ ...section, order: idx + 1 });
      }
    });

    (trip.sections || []).forEach((s) => {
      if (!sectionIdsInOrder.includes(s.id)) {
        reordered.push({ ...s, order: reordered.length + 1 });
      }
    });

    const updatedTrip: Trip = {
      ...trip,
      sections: reordered,
      totalBudget: calculateTotalBudget(reordered),
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  async deleteTrip(tripId: string, _userId?: string): Promise<boolean> {
    const trips = getStoredTrips();
    const filtered = trips.filter((t) => t.id !== tripId);
    saveStoredTrips(filtered);
    return true;
  },

  async addDestinationToTrip(tripId: string, destination: TripDestinationOption): Promise<Trip | null> {
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (trip.destinations.some((d) => d.id === destination.id)) return trip;

    const updatedTrip: Trip = {
      ...trip,
      destinations: [...trip.destinations, destination],
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

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
    const trips = getStoredTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (trip.sections.some((s) => s.title.toLowerCase() === activity.name.toLowerCase())) return trip;

    const cat = (activity.category || activity.type || 'activity').toLowerCase();
    const type: ItinerarySectionType =
      cat.includes('food') || cat.includes('culinary')
        ? 'food'
        : cat.includes('sightseeing') || cat.includes('heritage') || cat.includes('art')
          ? 'sightseeing'
          : 'activity';
    const budget = activity.costNumeric ?? parseCostFromLabel(activity.estimatedCost ?? '');

    const newSection: ItinerarySection = {
      id: `sec_${Date.now()}`,
      order: (trip.sections?.length || 0) + 1,
      type,
      title: activity.name,
      description: activity.description || `Activity in ${activity.city}.`,
      location: `${activity.city}${activity.country ? ', ' + activity.country : ''}`,
      budget,
      startDate: trip.startDate,
      endDate: trip.startDate,
    };

    const sections = [...(trip.sections || []), newSection];
    const updatedTrip: Trip = {
      ...trip,
      sections,
      totalBudget: calculateTotalBudget(sections),
      updatedAt: new Date().toISOString(),
    };

    trips[index] = updatedTrip;
    saveStoredTrips(trips);
    return updatedTrip;
  },

  /** Copies a trip into the user's trips locally */
  async cloneTripForUser(sourceTrip: Trip, newUserId = 'usr_default_1'): Promise<Trip> {
    const trips = getStoredTrips();
    const cloned: Trip = {
      ...sourceTrip,
      id: `trip_copy_${Date.now()}`,
      userId: newUserId,
      name: `${sourceTrip.name} (My Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [cloned, ...trips];
    saveStoredTrips(updated);
    return cloned;
  },
};
