import {
  Trip,
  ItinerarySection,
  ItinerarySectionType,
  SuggestedPlace,
  SuggestedActivity,
  TripDestinationOption,
} from '../types/trip';

const STORAGE_KEY_TRIPS = 'globetrotter_user_trips_v2';

// Helper to normalize any date string to standard YYYY-MM-DD
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

// Helper to calculate total budget
export const calculateTotalBudget = (sections?: ItinerarySection[]): number => {
  if (!Array.isArray(sections)) return 0;
  return sections.reduce((sum, s) => sum + (Number(s.budget) || 0), 0);
};

// Helper to calculate trip status dynamically based on current date
export const getTripStatus = (startDateStr?: string, endDateStr?: string): 'ONGOING' | 'UPCOMING' | 'COMPLETED' => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  const start = normalizeToISODate(startDateStr);
  const end = normalizeToISODate(endDateStr) || start;

  if (!start) return 'UPCOMING';

  if (todayStr > end) {
    return 'COMPLETED';
  } else if (todayStr < start) {
    return 'UPCOMING';
  } else {
    return 'ONGOING';
  }
};

// Helper to calculate duration in days
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

// Helper to format ISO date to readable display without timezone shifts
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

// Default seed trips for demo
const getInitialTrips = (): Trip[] => {
  const existing = localStorage.getItem(STORAGE_KEY_TRIPS);
  if (existing) {
    try {
      const parsed = JSON.parse(existing) as Trip[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize dates and ensure sections are arrays
        return parsed.map((t) => ({
          ...t,
          startDate: normalizeToISODate(t.startDate),
          endDate: normalizeToISODate(t.endDate),
          sections: Array.isArray(t.sections)
            ? t.sections.map((s, idx) => ({
                ...s,
                order: idx + 1,
                startDate: normalizeToISODate(s.startDate) || normalizeToISODate(t.startDate),
                endDate: normalizeToISODate(s.endDate) || normalizeToISODate(t.startDate),
                budget: Number(s.budget) || 0,
              }))
            : [],
          totalBudget: calculateTotalBudget(t.sections),
        }));
      }
    } catch {
      // fallback
    }
  }

  const defaultTrips: Trip[] = [
    {
      id: 'trip_ongoing',
      userId: 'usr_default_1',
      name: 'Amalfi Coastal Odyssey',
      startDate: '2026-08-18',
      endDate: '2026-08-25',
      destinations: [
        {
          id: 'dest_amalfi',
          city: 'Amalfi Coast',
          country: 'Italy',
          region: 'Europe',
          flag: '🇮🇹',
          image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
        },
      ],
      sections: [
        {
          id: 'sec_amalfi_1',
          order: 1,
          type: 'travel',
          title: 'Arrival in Naples & Coastal Shuttle',
          description: 'Transfer from Naples International Airport along the scenic panoramic cliffside road to Positano.',
          startDate: '2026-08-18',
          endDate: '2026-08-18',
          startTime: '10:00',
          endTime: '12:30',
          location: 'Positano, Amalfi Coast',
          budget: 12000,
          notes: 'Private scenic transfer with coastal photo stops.',
        },
        {
          id: 'sec_amalfi_2',
          order: 2,
          type: 'hotel',
          title: 'Villa Franca Clifftop Resort',
          description: 'Luxury panoramic cliffside villa overlooking Positano bay.',
          startDate: '2026-08-18',
          endDate: '2026-08-25',
          startTime: '14:00',
          endTime: '11:00',
          location: 'Viale Pasitea, Positano',
          budget: 45000,
          notes: 'Breakfast with sea view included.',
        },
        {
          id: 'sec_amalfi_3',
          order: 3,
          type: 'activity',
          title: 'Capri Island Private Speedboat & Blue Grotto',
          description: 'Full-day private boat cruise around the Faraglioni rocks and secluded swim spots.',
          startDate: '2026-08-21',
          endDate: '2026-08-21',
          startTime: '09:00',
          endTime: '17:00',
          location: 'Capri Marina Grande',
          budget: 18500,
          notes: 'Includes snorkel gear, Prosecco & limoncello.',
        },
      ],
      totalBudget: 75500,
      createdAt: '2026-08-01T10:00:00Z',
      updatedAt: '2026-08-22T08:00:00Z',
    },
    {
      id: 'trip_1',
      userId: 'usr_default_1',
      name: 'Europe Explorer',
      startDate: '2026-09-10',
      endDate: '2026-09-20',
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
          id: 'sec_1_1',
          order: 1,
          type: 'travel',
          title: 'Arrival in Paris (CDG Airport)',
          description: 'Flight from home airport arriving at Paris Charles de Gaulle. Transfer via RER B to central hotel.',
          startDate: '2026-09-10',
          endDate: '2026-09-10',
          startTime: '08:30',
          endTime: '11:00',
          location: 'Charles de Gaulle Airport, Paris',
          budget: 35000,
          notes: 'Keep passport & hotel voucher handy.',
        },
        {
          id: 'sec_1_2',
          order: 2,
          type: 'hotel',
          title: 'Hôtel Le Marais Boutique Stay',
          description: '3 nights boutique stay in the historic Le Marais district near cafés and boutiques.',
          startDate: '2026-09-10',
          endDate: '2026-09-13',
          startTime: '14:00',
          endTime: '11:00',
          location: 'Le Marais, 4th Arrondissement, Paris',
          budget: 28000,
          notes: 'Includes breakfast buffet & rooftop terrace access.',
        },
        {
          id: 'sec_1_3',
          order: 3,
          type: 'sightseeing',
          title: 'Eiffel Tower Summit & Trocadéro Sunset',
          description: 'Ascend to the top summit of the Eiffel Tower, followed by golden hour photo shoot at Place du Trocadéro.',
          startDate: '2026-09-11',
          endDate: '2026-09-11',
          startTime: '16:00',
          endTime: '19:30',
          location: 'Champ de Mars, 5 Av. Anatole France, Paris',
          budget: 4500,
          notes: 'Pre-booked timed priority elevator ticket.',
        },
        {
          id: 'sec_1_4',
          order: 4,
          type: 'travel',
          title: 'Eurostar Express: Paris to Amsterdam',
          description: 'High-speed rail journey from Gare du Nord directly to Amsterdam Centraal.',
          startDate: '2026-09-13',
          endDate: '2026-09-13',
          startTime: '09:15',
          endTime: '12:45',
          location: 'Gare du Nord / Amsterdam Centraal',
          budget: 8500,
          notes: 'Standard Premier seat with scenic countryside view.',
        },
        {
          id: 'sec_1_5',
          order: 5,
          type: 'activity',
          title: 'Historic Jordaan Canal Cruise',
          description: 'Evening open-boat cruise through UNESCO World Heritage canal rings with Dutch cheeses & drinks.',
          startDate: '2026-09-14',
          endDate: '2026-09-14',
          startTime: '18:00',
          endTime: '20:00',
          location: 'Prinsengracht, Amsterdam',
          budget: 3500,
          notes: 'Meeting point near Anne Frank House.',
        },
      ],
      totalBudget: 79500,
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-22T08:00:00Z',
    },
    {
      id: 'trip_2',
      userId: 'usr_default_1',
      name: 'Japan Journey',
      startDate: '2026-11-12',
      endDate: '2026-11-19',
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
          id: 'sec_2_1',
          order: 1,
          type: 'travel',
          title: 'Direct Flight to Tokyo Haneda',
          description: 'Arrival at Tokyo Haneda International Airport and Narita Express transit.',
          startDate: '2026-11-12',
          endDate: '2026-11-12',
          startTime: '07:00',
          endTime: '10:30',
          location: 'Haneda Airport, Tokyo',
          budget: 42000,
        },
        {
          id: 'sec_2_2',
          order: 2,
          type: 'sightseeing',
          title: 'Senso-ji Temple & Asakusa Old Town',
          description: 'Historic cultural tour of Tokyo oldest temple complex and Nakamise street street food.',
          startDate: '2026-11-13',
          endDate: '2026-11-13',
          startTime: '09:00',
          endTime: '13:00',
          location: 'Asakusa, Tokyo',
          budget: 3000,
        },
        {
          id: 'sec_2_3',
          order: 3,
          type: 'travel',
          title: 'Shinkansen Bullet Train to Kyoto',
          description: 'Tokaido Shinkansen bullet train reaching Kyoto Station with Mount Fuji views.',
          startDate: '2026-11-15',
          endDate: '2026-11-15',
          startTime: '10:00',
          endTime: '12:15',
          location: 'Tokyo Station / Kyoto Station',
          budget: 8200,
        },
      ],
      totalBudget: 53200,
      createdAt: '2026-08-21T10:00:00Z',
      updatedAt: '2026-08-22T08:00:00Z',
    },
    {
      id: 'trip_completed',
      userId: 'usr_default_1',
      name: 'Rajasthan Royal Heritage',
      startDate: '2026-02-04',
      endDate: '2026-02-09',
      destinations: [
        {
          id: 'dest_jaipur',
          city: 'Jaipur',
          country: 'India',
          region: 'Asia',
          flag: '🇮🇳',
          image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
        },
      ],
      sections: [
        {
          id: 'sec_3_1',
          order: 1,
          type: 'sightseeing',
          title: 'Amber Fort Elephant Ramparts & Sheesh Mahal',
          description: 'Explore the grand hilltop fort and intricate mirror palace in Jaipur.',
          startDate: '2026-02-04',
          endDate: '2026-02-04',
          startTime: '09:30',
          endTime: '13:30',
          location: 'Amer, Jaipur, Rajasthan',
          budget: 2500,
        },
        {
          id: 'sec_3_2',
          order: 2,
          type: 'hotel',
          title: 'Heritage Haveli Resort Stay',
          description: 'Traditional royal palace stay with folk dances & rooftop dinner.',
          startDate: '2026-02-04',
          endDate: '2026-02-07',
          startTime: '14:00',
          endTime: '11:00',
          location: 'Old City, Jaipur',
          budget: 18000,
        },
      ],
      totalBudget: 20500,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-02-10T08:00:00Z',
    },
  ];

  localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(defaultTrips));
  return defaultTrips;
};

const saveTrips = (trips: Trip[]) => {
  localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
  // Sync with simplified landing page trips format
  const simplified = trips.map((t) => {
    const startStr = normalizeToISODate(t.startDate);
    const endStr = normalizeToISODate(t.endDate);
    const startFormatted = startStr
      ? new Date(startStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'Start';
    const endFormatted = endStr
      ? new Date(endStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'End';
    const diff =
      startStr && endStr
        ? Math.max(1, Math.round((new Date(endStr).getTime() - new Date(startStr).getTime()) / (1000 * 60 * 60 * 24)))
        : 1;

    return {
      id: t.id,
      title: t.name,
      destinationSummary: t.destinations.map((d) => d.city).join(', '),
      startDate: startFormatted,
      endDate: endFormatted,
      destinationsCount: t.destinations.length,
      durationDays: diff,
      image: t.destinations[0]?.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
      status: 'Upcoming' as const,
      budget: `₹${(t.totalBudget || calculateTotalBudget(t.sections)).toLocaleString('en-IN')}`,
    };
  });
  localStorage.setItem('globetrotter_user_trips', JSON.stringify(simplified));
};

export const tripService = {
  /**
   * Get all trips for a user
   */
  getUserTrips(userId: string): Trip[] {
    const trips = getInitialTrips();
    return trips.filter((t) => {
      if (t.userId === userId) return true;
      if (userId === 'usr_default_1' && (!t.userId || t.userId === 'usr_default_1')) return true;
      return false;
    });
  },

  /**
   * Get specific trip by ID
   */
  getTripById(tripId: string): Trip | null {
    const trips = getInitialTrips();
    return trips.find((t) => t.id === tripId) || null;
  },

  /**
   * Create a new trip and generate smart initial sections
   */
  createTrip(
    data: {
      userId: string;
      name: string;
      startDate: string;
      endDate: string;
      destinations: TripDestinationOption[];
      selectedPlaces?: SuggestedPlace[];
      selectedActivities?: SuggestedActivity[];
      notes?: string;
    }
  ): Trip {
    const trips = getInitialTrips();
    const uniqueId = `trip-${Date.now()}`;
    const isoStart = normalizeToISODate(data.startDate);
    const isoEnd = normalizeToISODate(data.endDate);

    // Generate intelligent initial sections from user selections
    const initialSections: ItinerarySection[] = [];
    let orderCounter = 1;

    // 1. Initial Travel / Arrival Section
    if (data.destinations.length > 0) {
      const firstCity = data.destinations[0];
      initialSections.push({
        id: `sec_${Date.now()}_${orderCounter}`,
        order: orderCounter++,
        type: 'travel',
        title: `Arrival in ${firstCity.city}`,
        description: `Travel & transfer to accommodation in ${firstCity.city}, ${firstCity.country}.`,
        startDate: isoStart,
        endDate: isoStart,
        startTime: '09:00',
        endTime: '12:00',
        location: `${firstCity.city}, ${firstCity.country}`,
        budget: 18000,
        notes: 'Check-in and collect local transit pass.',
      });
    }

    // 2. Add Selected Places as Sightseeing Sections
    if (data.selectedPlaces && data.selectedPlaces.length > 0) {
      data.selectedPlaces.forEach((place) => {
        initialSections.push({
          id: `sec_${Date.now()}_${orderCounter}`,
          order: orderCounter++,
          type: 'sightseeing',
          title: place.name,
          description: `Explore ${place.name} (${place.category}) in ${place.city}. Recommended time: ${place.estimatedTime}.`,
          startDate: isoStart,
          endDate: isoStart,
          startTime: '14:00',
          endTime: '17:00',
          location: `${place.name}, ${place.city}, ${place.country}`,
          budget: 3500,
          notes: 'Pre-book fast-track admission ticket.',
        });
      });
    }

    // 3. Add Selected Activities as Activity Sections
    if (data.selectedActivities && data.selectedActivities.length > 0) {
      data.selectedActivities.forEach((act) => {
        let parsedBudget = 5000;
        const match = act.estimatedCost.match(/([0-9,]+)/);
        if (match) {
          const num = parseInt(match[1].replace(/,/g, ''), 10);
          parsedBudget = num > 0 ? (act.estimatedCost.includes('€') ? num * 90 : num) : 5000;
        }

        initialSections.push({
          id: `sec_${Date.now()}_${orderCounter}`,
          order: orderCounter++,
          type: act.type === 'Cruise' || act.type === 'Tour' || act.type === 'Adventure' ? 'activity' : act.type === 'Culinary' ? 'food' : 'activity',
          title: act.name,
          description: `Experience: ${act.name} in ${act.city}. Duration: ${act.duration}.`,
          startDate: isoEnd,
          endDate: isoEnd,
          startTime: '10:00',
          endTime: '14:00',
          location: `${act.name}, ${act.city}, ${act.country}`,
          budget: parsedBudget,
          notes: `Includes guided tour & gear. Rating: ⭐ ${act.rating}`,
        });
      });
    }

    // 4. Hotel Stay Section
    if (data.destinations.length > 0) {
      const mainCity = data.destinations[0];
      initialSections.push({
        id: `sec_${Date.now()}_${orderCounter}`,
        order: orderCounter++,
        type: 'hotel',
        title: `${mainCity.city} Central Hotel Stay`,
        description: `Comfortable accommodation in the heart of ${mainCity.city}.`,
        startDate: isoStart,
        endDate: isoEnd,
        startTime: '15:00',
        endTime: '11:00',
        location: `${mainCity.city} City Center`,
        budget: 22000,
        notes: 'Complimentary breakfast and Wi-Fi.',
      });
    }

    // Re-index order
    initialSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    const newTrip: Trip = {
      id: uniqueId,
      userId: data.userId,
      name: data.name,
      startDate: isoStart,
      endDate: isoEnd,
      destinations: data.destinations,
      selectedPlaces: data.selectedPlaces,
      selectedActivities: data.selectedActivities,
      sections: initialSections,
      totalBudget: calculateTotalBudget(initialSections),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    trips.unshift(newTrip);
    saveTrips(trips);
    return newTrip;
  },

  /**
   * Update general trip details
   */
  updateTrip(tripId: string, updates: Partial<Trip>): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const updated: Trip = {
      ...trips[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updated.sections) {
      updated.totalBudget = calculateTotalBudget(updated.sections);
    }

    trips[index] = updated;
    saveTrips(trips);
    return updated;
  },

  /**
   * Add a new section to an existing trip
   */
  addItinerarySection(tripId: string, sectionData: Omit<ItinerarySection, 'id' | 'order'>): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.sections)) {
      trip.sections = [];
    }

    const newSection: ItinerarySection = {
      ...sectionData,
      id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      order: trip.sections.length + 1,
      startDate: normalizeToISODate(sectionData.startDate) || trip.startDate,
      endDate: normalizeToISODate(sectionData.endDate) || trip.startDate,
      budget: Number(sectionData.budget) || 0,
    };

    trip.sections.push(newSection);
    // Re-index order
    trip.sections.forEach((s, i) => {
      s.order = i + 1;
    });
    trip.totalBudget = calculateTotalBudget(trip.sections);
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Update an itinerary section
   */
  updateItinerarySection(tripId: string, sectionId: string, updates: Partial<ItinerarySection>): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.sections)) {
      trip.sections = [];
    }

    const secIndex = trip.sections.findIndex((s) => s.id === sectionId);
    if (secIndex === -1) return null;

    trip.sections[secIndex] = {
      ...trip.sections[secIndex],
      ...updates,
      startDate: updates.startDate ? normalizeToISODate(updates.startDate) : trip.sections[secIndex].startDate,
      endDate: updates.endDate ? normalizeToISODate(updates.endDate) : trip.sections[secIndex].endDate,
      budget: updates.budget !== undefined ? (Number(updates.budget) || 0) : trip.sections[secIndex].budget,
    };

    trip.totalBudget = calculateTotalBudget(trip.sections);
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Delete an itinerary section
   */
  deleteItinerarySection(tripId: string, sectionId: string): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.sections)) {
      trip.sections = [];
    }

    trip.sections = trip.sections.filter((s) => s.id !== sectionId);
    // Re-index order
    trip.sections.forEach((s, i) => {
      s.order = i + 1;
    });

    trip.totalBudget = calculateTotalBudget(trip.sections);
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Reorder itinerary sections
   */
  reorderItinerarySections(tripId: string, sectionIdsInOrder: string[]): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.sections)) {
      trip.sections = [];
    }

    const map = new Map(trip.sections.map((s) => [s.id, s]));

    const reordered: ItinerarySection[] = [];
    sectionIdsInOrder.forEach((id, idx) => {
      const sec = map.get(id);
      if (sec) {
        sec.order = idx + 1;
        reordered.push(sec);
      }
    });

    // Add any missing
    trip.sections.forEach((s) => {
      if (!sectionIdsInOrder.includes(s.id)) {
        s.order = reordered.length + 1;
        reordered.push(s);
      }
    });

    trip.sections = reordered;
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Delete entire trip
   */
  deleteTrip(tripId: string, userId?: string): boolean {
    const trips = getInitialTrips();
    const tripToDelete = trips.find((t) => t.id === tripId);
    if (!tripToDelete) return false;

    if (userId && tripToDelete.userId && tripToDelete.userId !== userId && tripToDelete.userId !== 'usr_default_1') {
      return false; // Not authorized to delete another user's trip
    }

    const filtered = trips.filter((t) => t.id !== tripId);
    if (filtered.length === trips.length) return false;
    saveTrips(filtered);
    return true;
  },

  /**
   * Add destination to existing trip
   */
  addDestinationToTrip(tripId: string, destination: TripDestinationOption): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.destinations)) {
      trip.destinations = [];
    }

    // Check if already in trip (by ID or city name)
    const alreadyExists = trip.destinations.some(
      (d) => d.id === destination.id || d.city.toLowerCase() === destination.city.toLowerCase()
    );
    if (alreadyExists) return trip;

    trip.destinations.push(destination);
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Add activity or place to existing trip
   */
  addActivityToTrip(
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
    autoAddCity = true
  ): Trip | null {
    const trips = getInitialTrips();
    const index = trips.findIndex((t) => t.id === tripId);
    if (index === -1) return null;

    const trip = trips[index];
    if (!Array.isArray(trip.sections)) {
      trip.sections = [];
    }
    if (!Array.isArray(trip.destinations)) {
      trip.destinations = [];
    }

    // 1. Auto add city to trip destinations if not already present
    if (autoAddCity && activity.city) {
      const hasCity = trip.destinations.some(
        (d) => d.city.toLowerCase() === activity.city.toLowerCase()
      );
      if (!hasCity) {
        trip.destinations.push({
          id: `dest_${activity.city.toLowerCase().replace(/\s+/g, '_')}`,
          city: activity.city,
          country: activity.country || '',
          region: 'Global',
          flag: '📍',
          image: activity.image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
        });
      }
    }

    // 2. Prevent duplicate itinerary section
    const alreadyExists = trip.sections.some(
      (s) => s.title.toLowerCase() === activity.name.toLowerCase()
    );
    if (alreadyExists) return trip;

    // 3. Create Itinerary Section
    const nextOrder = trip.sections.length + 1;
    const cat = (activity.category || activity.type || 'activity').toLowerCase();
    const sectionType: ItinerarySectionType =
      cat.includes('food') || cat.includes('culinary')
        ? 'food'
        : cat.includes('sightseeing') || cat.includes('heritage') || cat.includes('art')
        ? 'sightseeing'
        : 'activity';

    const costNum =
      activity.costNumeric !== undefined
        ? activity.costNumeric
        : activity.estimatedCost
        ? parseInt(activity.estimatedCost.replace(/[^0-9]/g, ''), 10) || 2500
        : 2500;

    const newSection: ItinerarySection = {
      id: `sec_${Date.now()}_${nextOrder}`,
      order: nextOrder,
      title: activity.name,
      type: sectionType,
      description: activity.description || `${activity.name} in ${activity.city}. Duration: ${activity.duration || '2-3 hrs'}.`,
      startDate: trip.startDate,
      endDate: trip.endDate,
      startTime: '10:00',
      endTime: '13:00',
      location: `${activity.name}, ${activity.city}${activity.country ? ', ' + activity.country : ''}`,
      budget: costNum,
      notes: `Category: ${activity.category || activity.type || 'Experience'} • Rating: ⭐ ${activity.rating || 4.8}`,
    };

    trip.sections.push(newSection);
    trip.totalBudget = calculateTotalBudget(trip.sections);
    trip.updatedAt = new Date().toISOString();

    trips[index] = trip;
    saveTrips(trips);
    return trip;
  },

  /**
   * Clones a public trip for a user with clean independent IDs
   */
  cloneTripForUser(sourceTrip: Trip, newUserId: string): Trip {
    const trips = getInitialTrips();
    const clonedTrip: Trip = {
      ...sourceTrip,
      id: `trip_clone_${Date.now()}`,
      userId: newUserId,
      name: `${sourceTrip.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: sourceTrip.sections.map((sec, idx) => ({
        ...sec,
        id: `sec_clone_${Date.now()}_${idx}`,
      })),
      destinations: sourceTrip.destinations ? [...sourceTrip.destinations] : [],
      selectedPlaces: sourceTrip.selectedPlaces ? [...sourceTrip.selectedPlaces] : [],
      selectedActivities: sourceTrip.selectedActivities ? [...sourceTrip.selectedActivities] : [],
    };

    trips.unshift(clonedTrip);
    saveTrips(trips);
    return clonedTrip;
  },
};



