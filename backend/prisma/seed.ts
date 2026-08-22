import {
  PrismaClient,
  ActivityCategory,
  ExpenseCategory,
  Role,
  TripStatus,
  TripVisibility,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.dev' },
    update: {},
    create: {
      email: 'admin@globetrotter.dev',
      passwordHash,
      name: 'Ava Admin',
      role: Role.ADMIN,
      languagePreference: 'en',
    },
  });

  const traveler = await prisma.user.upsert({
    where: { email: 'traveler@globetrotter.dev' },
    update: {},
    create: {
      email: 'traveler@globetrotter.dev',
      passwordHash,
      name: 'Priya Traveler',
      phone: '+1 415-555-0182',
      role: Role.USER,
      languagePreference: 'en',
    },
  });

  const secondTraveler = await prisma.user.upsert({
    where: { email: 'sam@globetrotter.dev' },
    update: {},
    create: {
      email: 'sam@globetrotter.dev',
      passwordHash,
      name: 'Sam Explorer',
      phone: '+44 20 7946 0958',
      role: Role.USER,
      languagePreference: 'en',
    },
  });

  const cityData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      costIndex: 78,
      popularity: 98,
      latitude: 48.8566,
      longitude: 2.3522,
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      region: 'Asia',
      costIndex: 82,
      popularity: 95,
      latitude: 35.6762,
      longitude: 139.6503,
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      costIndex: 35,
      popularity: 90,
      latitude: -8.3405,
      longitude: 115.092,
    },
    {
      name: 'Rome',
      country: 'Italy',
      region: 'Europe',
      costIndex: 70,
      popularity: 93,
      latitude: 41.9028,
      longitude: 12.4964,
    },
    {
      name: 'New York City',
      country: 'United States',
      region: 'North America',
      costIndex: 90,
      popularity: 96,
      latitude: 40.7128,
      longitude: -74.006,
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      region: 'Africa',
      costIndex: 45,
      popularity: 80,
      latitude: -33.9249,
      longitude: 18.4241,
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      region: 'Europe',
      costIndex: 65,
      popularity: 88,
      latitude: 41.3874,
      longitude: 2.1686,
    },
    {
      name: 'Bangkok',
      country: 'Thailand',
      region: 'Asia',
      costIndex: 40,
      popularity: 85,
      latitude: 13.7563,
      longitude: 100.5018,
    },
  ];

  const cities = new Map<string, string>();
  for (const c of cityData) {
    const city = await prisma.city.upsert({
      where: { name_country: { name: c.name, country: c.country } },
      update: {},
      create: {
        ...c,
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(c.name)}`,
      },
    });
    cities.set(c.name, city.id);
  }

  const activityData: Array<{
    city: string;
    name: string;
    description: string;
    category: ActivityCategory;
    cost: number;
    durationMinutes: number;
  }> = [
    {
      city: 'Paris',
      name: 'Louvre Museum Tour',
      description: 'Guided tour of the world-famous art museum.',
      category: ActivityCategory.CULTURE,
      cost: 35,
      durationMinutes: 180,
    },
    {
      city: 'Paris',
      name: 'Eiffel Tower Summit Access',
      description: 'Skip-the-line access to the top of the Eiffel Tower.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 45,
      durationMinutes: 120,
    },
    {
      city: 'Paris',
      name: 'Seine River Dinner Cruise',
      description: 'Evening cruise along the Seine with a 3-course dinner.',
      category: ActivityCategory.FOOD_AND_DRINK,
      cost: 90,
      durationMinutes: 150,
    },
    {
      city: 'Tokyo',
      name: 'Tsukiji Outer Market Food Tour',
      description: 'Sample fresh sushi and street food.',
      category: ActivityCategory.FOOD_AND_DRINK,
      cost: 60,
      durationMinutes: 150,
    },
    {
      city: 'Tokyo',
      name: 'Senso-ji Temple Walking Tour',
      description: "Explore Tokyo's oldest temple and Asakusa district.",
      category: ActivityCategory.CULTURE,
      cost: 20,
      durationMinutes: 120,
    },
    {
      city: 'Tokyo',
      name: 'Shibuya Nightlife Crawl',
      description: 'Guided bar-hopping tour through Shibuya.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 55,
      durationMinutes: 180,
    },
    {
      city: 'Bali',
      name: 'Ubud Rice Terrace Trek',
      description: 'Guided trek through the Tegallalang rice terraces.',
      category: ActivityCategory.OUTDOOR,
      cost: 25,
      durationMinutes: 240,
    },
    {
      city: 'Bali',
      name: 'Uluwatu Sunset & Kecak Fire Dance',
      description: 'Clifftop temple visit with traditional fire dance performance.',
      category: ActivityCategory.CULTURE,
      cost: 30,
      durationMinutes: 150,
    },
    {
      city: 'Bali',
      name: 'Balinese Spa Retreat',
      description: 'Full-body massage and flower bath.',
      category: ActivityCategory.RELAXATION,
      cost: 40,
      durationMinutes: 120,
    },
    {
      city: 'Rome',
      name: 'Colosseum & Roman Forum Tour',
      description: 'Skip-the-line guided tour of ancient Rome.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 55,
      durationMinutes: 210,
    },
    {
      city: 'Rome',
      name: 'Trastevere Food & Wine Walk',
      description: 'Evening food crawl through Trastevere.',
      category: ActivityCategory.FOOD_AND_DRINK,
      cost: 70,
      durationMinutes: 180,
    },
    {
      city: 'New York City',
      name: 'Statue of Liberty & Ellis Island Ferry',
      description: 'Ferry access with audio guide.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 30,
      durationMinutes: 240,
    },
    {
      city: 'New York City',
      name: 'Broadway Show Ticket',
      description: 'Evening Broadway theatre performance.',
      category: ActivityCategory.NIGHTLIFE,
      cost: 150,
      durationMinutes: 150,
    },
    {
      city: 'Cape Town',
      name: 'Table Mountain Cable Car',
      description: 'Round-trip cable car with panoramic views.',
      category: ActivityCategory.OUTDOOR,
      cost: 35,
      durationMinutes: 150,
    },
    {
      city: 'Cape Town',
      name: 'Cape Peninsula Safari Tour',
      description: 'Full-day tour to Cape Point and penguin colony.',
      category: ActivityCategory.ADVENTURE,
      cost: 85,
      durationMinutes: 480,
    },
    {
      city: 'Barcelona',
      name: 'Sagrada Familia Guided Tour',
      description: "Skip-the-line tour of Gaudi's masterpiece.",
      category: ActivityCategory.CULTURE,
      cost: 40,
      durationMinutes: 120,
    },
    {
      city: 'Barcelona',
      name: 'Tapas & Flamenco Night',
      description: 'Traditional tapas dinner with live flamenco.',
      category: ActivityCategory.FOOD_AND_DRINK,
      cost: 65,
      durationMinutes: 180,
    },
    {
      city: 'Bangkok',
      name: 'Grand Palace & Wat Phra Kaew Tour',
      description: "Guided tour of Bangkok's royal complex.",
      category: ActivityCategory.CULTURE,
      cost: 25,
      durationMinutes: 180,
    },
    {
      city: 'Bangkok',
      name: 'Floating Market Day Trip',
      description: 'Boat tour through traditional floating markets.',
      category: ActivityCategory.SIGHTSEEING,
      cost: 35,
      durationMinutes: 300,
    },
    {
      city: 'Bangkok',
      name: 'Muay Thai Class',
      description: 'Beginner-friendly Muay Thai training session.',
      category: ActivityCategory.ADVENTURE,
      cost: 20,
      durationMinutes: 90,
    },
  ];

  const activities = new Map<string, string>();
  for (const a of activityData) {
    const cityId = cities.get(a.city);
    if (!cityId) continue;

    // Activity has no unique constraint on (cityId, name) to upsert against
    // (there's no product reason to force city+activity names unique app-wide),
    // so re-running the seed is made idempotent here instead: skip creating
    // an activity that already exists under this name/city.
    const existing = await prisma.activity.findFirst({ where: { cityId, name: a.name } });
    if (existing) {
      activities.set(a.name, existing.id);
      continue;
    }

    const created = await prisma.activity.create({
      data: {
        cityId,
        name: a.name,
        description: a.description,
        category: a.category,
        cost: a.cost,
        durationMinutes: a.durationMinutes,
        imageUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(a.name)}`,
      },
    });
    activities.set(a.name, created.id);
  }

  await prisma.savedDestination.upsert({
    where: { userId_cityId: { userId: traveler.id, cityId: cities.get('Bali')! } },
    update: {},
    create: { userId: traveler.id, cityId: cities.get('Bali')! },
  });

  await prisma.savedDestination.upsert({
    where: { userId_cityId: { userId: secondTraveler.id, cityId: cities.get('Tokyo')! } },
    update: {},
    create: { userId: secondTraveler.id, cityId: cities.get('Tokyo')! },
  });

  const existingTrip = await prisma.trip.findFirst({
    where: { userId: traveler.id, name: 'European Highlights' },
  });

  if (!existingTrip) {
    const trip = await prisma.trip.create({
      data: {
        userId: traveler.id,
        name: 'European Highlights',
        description: 'A two-city tour through Paris and Rome.',
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-17'),
        status: TripStatus.PLANNED,
        visibility: TripVisibility.PUBLIC,
        shareSlug: 'european-highlights-demo',
      },
    });

    const parisStop = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: cities.get('Paris')!,
        startDate: new Date('2026-09-10'),
        endDate: new Date('2026-09-13'),
        position: 0,
      },
    });

    const romeStop = await prisma.tripStop.create({
      data: {
        tripId: trip.id,
        cityId: cities.get('Rome')!,
        startDate: new Date('2026-09-13'),
        endDate: new Date('2026-09-17'),
        position: 1,
      },
    });

    await prisma.tripActivity.createMany({
      data: [
        {
          tripStopId: parisStop.id,
          activityId: activities.get('Eiffel Tower Summit Access')!,
          date: new Date('2026-09-10'),
          startTime: '10:00',
          endTime: '12:00',
          position: 0,
        },
        {
          tripStopId: parisStop.id,
          activityId: activities.get('Louvre Museum Tour')!,
          date: new Date('2026-09-11'),
          startTime: '09:00',
          endTime: '12:00',
          position: 0,
        },
        {
          tripStopId: parisStop.id,
          activityId: activities.get('Seine River Dinner Cruise')!,
          date: new Date('2026-09-11'),
          startTime: '19:00',
          endTime: '21:30',
          position: 1,
        },
        {
          tripStopId: romeStop.id,
          activityId: activities.get('Colosseum & Roman Forum Tour')!,
          date: new Date('2026-09-14'),
          startTime: '09:00',
          endTime: '12:30',
          position: 0,
        },
        {
          tripStopId: romeStop.id,
          activityId: activities.get('Trastevere Food & Wine Walk')!,
          date: new Date('2026-09-15'),
          startTime: '18:00',
          endTime: '21:00',
          position: 0,
        },
      ],
    });

    await prisma.expense.createMany({
      data: [
        {
          tripId: trip.id,
          category: ExpenseCategory.TRANSPORT,
          description: 'Round-trip flights',
          amount: 620,
          date: new Date('2026-09-10'),
        },
        {
          tripId: trip.id,
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Paris hotel (3 nights)',
          amount: 540,
          date: new Date('2026-09-10'),
        },
        {
          tripId: trip.id,
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Rome hotel (4 nights)',
          amount: 480,
          date: new Date('2026-09-13'),
        },
        {
          tripId: trip.id,
          category: ExpenseCategory.ACTIVITIES,
          description: 'Eiffel Tower + Louvre + Colosseum tickets',
          amount: 135,
          date: new Date('2026-09-10'),
        },
        {
          tripId: trip.id,
          category: ExpenseCategory.MEALS,
          description: 'Estimated meals budget',
          amount: 350,
          date: new Date('2026-09-10'),
        },
      ],
    });
  }

  // A second, single-city trip for the same traveler — still being planned
  // (DRAFT, PRIVATE) — so trip listing/filtering has more than one entry
  // and more than one status to demo.
  const existingSoloTrip = await prisma.trip.findFirst({
    where: { userId: traveler.id, name: 'Tokyo Solo Adventure' },
  });

  if (!existingSoloTrip) {
    const soloTrip = await prisma.trip.create({
      data: {
        userId: traveler.id,
        name: 'Tokyo Solo Adventure',
        description: 'A week exploring Tokyo neighborhoods and food.',
        startDate: new Date('2026-11-05'),
        endDate: new Date('2026-11-10'),
        status: TripStatus.DRAFT,
        visibility: TripVisibility.PRIVATE,
        budgetAmount: 1200,
      },
    });

    const tokyoStop = await prisma.tripStop.create({
      data: {
        tripId: soloTrip.id,
        cityId: cities.get('Tokyo')!,
        startDate: new Date('2026-11-05'),
        endDate: new Date('2026-11-10'),
        position: 0,
      },
    });

    await prisma.tripActivity.createMany({
      data: [
        {
          tripStopId: tokyoStop.id,
          activityId: activities.get('Senso-ji Temple Walking Tour')!,
          date: new Date('2026-11-06'),
          startTime: '09:00',
          endTime: '11:00',
          position: 0,
        },
        {
          tripStopId: tokyoStop.id,
          activityId: activities.get('Tsukiji Outer Market Food Tour')!,
          date: new Date('2026-11-06'),
          startTime: '12:00',
          endTime: '14:30',
          position: 1,
        },
        {
          tripStopId: tokyoStop.id,
          activityId: activities.get('Shibuya Nightlife Crawl')!,
          date: new Date('2026-11-08'),
          startTime: '20:00',
          endTime: '23:00',
          position: 0,
        },
      ],
    });

    await prisma.expense.createMany({
      data: [
        {
          tripId: soloTrip.id,
          tripStopId: tokyoStop.id,
          category: ExpenseCategory.TRANSPORT,
          description: 'Flights + JR Pass',
          amount: 780,
          date: new Date('2026-11-05'),
        },
        {
          tripId: soloTrip.id,
          tripStopId: tokyoStop.id,
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Shinjuku hotel (5 nights)',
          amount: 620,
          date: new Date('2026-11-05'),
        },
      ],
    });
  }

  // A second traveler with their own multi-city public trip, so the
  // community listing has more than one item and copy/popularity sorting
  // has something to differentiate.
  const existingSecondTravelerTrip = await prisma.trip.findFirst({
    where: { userId: secondTraveler.id, name: 'Southeast Asia Highlights' },
  });

  if (!existingSecondTravelerTrip) {
    const seaTrip = await prisma.trip.create({
      data: {
        userId: secondTraveler.id,
        name: 'Southeast Asia Highlights',
        description: 'Island relaxation in Bali followed by street food in Bangkok.',
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-09'),
        status: TripStatus.PLANNED,
        visibility: TripVisibility.PUBLIC,
        shareSlug: 'southeast-asia-highlights-demo',
      },
    });

    const baliStop = await prisma.tripStop.create({
      data: {
        tripId: seaTrip.id,
        cityId: cities.get('Bali')!,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
        position: 0,
      },
    });

    const bangkokStop = await prisma.tripStop.create({
      data: {
        tripId: seaTrip.id,
        cityId: cities.get('Bangkok')!,
        startDate: new Date('2026-10-05'),
        endDate: new Date('2026-10-09'),
        position: 1,
      },
    });

    await prisma.tripActivity.createMany({
      data: [
        {
          tripStopId: baliStop.id,
          activityId: activities.get('Ubud Rice Terrace Trek')!,
          date: new Date('2026-10-02'),
          startTime: '08:00',
          endTime: '12:00',
          position: 0,
        },
        {
          tripStopId: baliStop.id,
          activityId: activities.get('Uluwatu Sunset & Kecak Fire Dance')!,
          date: new Date('2026-10-03'),
          startTime: '17:00',
          endTime: '19:30',
          position: 0,
        },
        {
          tripStopId: bangkokStop.id,
          activityId: activities.get('Floating Market Day Trip')!,
          date: new Date('2026-10-06'),
          startTime: '07:00',
          endTime: '12:00',
          position: 0,
        },
        {
          tripStopId: bangkokStop.id,
          activityId: activities.get('Muay Thai Class')!,
          date: new Date('2026-10-07'),
          startTime: '16:00',
          endTime: '17:30',
          position: 0,
        },
      ],
    });

    await prisma.expense.createMany({
      data: [
        {
          tripId: seaTrip.id,
          category: ExpenseCategory.TRANSPORT,
          description: 'Round-trip flights + inter-island transfer',
          amount: 540,
          date: new Date('2026-10-01'),
        },
        {
          tripId: seaTrip.id,
          tripStopId: baliStop.id,
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Ubud villa (4 nights)',
          amount: 320,
          date: new Date('2026-10-01'),
        },
        {
          tripId: seaTrip.id,
          tripStopId: bangkokStop.id,
          category: ExpenseCategory.ACCOMMODATION,
          description: 'Bangkok hotel (4 nights)',
          amount: 260,
          date: new Date('2026-10-05'),
        },
        {
          tripId: seaTrip.id,
          category: ExpenseCategory.MEALS,
          description: 'Estimated meals budget',
          amount: 280,
          date: new Date('2026-10-01'),
        },
      ],
    });
  }

  console.log('Seed complete.');
  console.log(`Admin login:      ${admin.email} / Password123!`);
  console.log(`Traveler login:   ${traveler.email} / Password123!`);
  console.log(`2nd user login:   ${secondTraveler.email} / Password123!`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
