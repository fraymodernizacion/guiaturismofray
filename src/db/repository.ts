import fs from 'fs';
import path from 'path';
import { asc, eq, notInArray } from 'drizzle-orm';
import { ensurePostgresSchema, getDb } from './index.ts';
import {
  audioguidesTable,
  eventsTable,
  mediaUploadsTable,
  placesTable,
  siteConfigTable,
} from './schema.ts';
import {
  INITIAL_AUDIOGUIDES,
  INITIAL_EVENTS,
  INITIAL_PLACES,
} from '../data/initialData.ts';
import { DEFAULT_SITE_CONFIG } from '../data/defaultSiteConfig.ts';
import type { Audioguide, Place, TouristEvent } from '../types.ts';
import type { SiteConfig } from '../types/siteConfig.ts';

function readJsonArrayIfExists<T>(filePath: string): T[] | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function readJsonObjectIfExists<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function toPlaceRow(place: Place, sortOrder: number) {
  return {
    id: place.id,
    name: place.name,
    category: place.category,
    secondaryCategories: place.secondaryCategories ?? null,
    subCategory: place.subCategory ?? null,
    shortDescription: place.shortDescription ?? '',
    description: place.description ?? '',
    address: place.address ?? '',
    locality: place.locality ?? '',
    localityId: place.localityId ?? null,
    lat: typeof place.lat === 'number' && !isNaN(place.lat) ? place.lat : 0,
    lng: typeof place.lng === 'number' && !isNaN(place.lng) ? place.lng : 0,
    image: place.image ?? '',
    gallery: Array.isArray(place.gallery) ? place.gallery : [],
    openingHours: place.openingHours ?? '',
    phone: place.phone ?? '',
    whatsapp: place.whatsapp ?? '',
    instagram: place.instagram ?? null,
    facebook: place.facebook ?? null,
    tags: Array.isArray(place.tags) ? place.tags : [],
    services: Array.isArray(place.services) ? place.services : [],
    priceLevel: place.priceLevel ?? null,
    featured: Boolean(place.featured),
    isImperdible: Boolean(place.isImperdible),
    audioguideId: place.audioguideId ?? null,
    validationStatus: place.validationStatus ?? null,
    validationNote: place.validationNote ?? null,
    sourceGuide: place.sourceGuide ?? null,
    photoPendingNote: place.photoPendingNote ?? null,
    photoCredit: place.photoCredit ?? null,
    trekkingInfo: place.trekkingInfo ?? null,
    isHeritageEsquiu: Boolean(place.isHeritageEsquiu),
    googleMapsUrl: place.googleMapsUrl ?? null,
    safetyWarning: place.safetyWarning ?? null,
    sortOrder,
    updatedAt: new Date(),
  };
}

function fromPlaceRow(row: typeof placesTable.$inferSelect): Place {
  const place: Place = {
    id: row.id,
    name: row.name,
    category: row.category,
    shortDescription: row.shortDescription,
    description: row.description,
    address: row.address,
    locality: row.locality,
    lat: row.lat,
    lng: row.lng,
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    openingHours: row.openingHours,
    phone: row.phone,
    whatsapp: row.whatsapp,
    tags: Array.isArray(row.tags) ? row.tags : [],
    services: Array.isArray(row.services) ? row.services : [],
  };

  if (row.secondaryCategories && row.secondaryCategories.length > 0) {
    place.secondaryCategories = row.secondaryCategories;
  }
  if (row.subCategory) place.subCategory = row.subCategory;
  if (row.localityId) {
    place.localityId = row.localityId as Place['localityId'];
  }
  if (row.instagram) place.instagram = row.instagram;
  if (row.facebook) place.facebook = row.facebook;
  if (row.priceLevel) place.priceLevel = row.priceLevel;
  if (row.featured) place.featured = row.featured;
  if (row.isImperdible) place.isImperdible = row.isImperdible;
  if (row.audioguideId) place.audioguideId = row.audioguideId;
  if (row.validationStatus) place.validationStatus = row.validationStatus;
  if (row.validationNote) place.validationNote = row.validationNote;
  if (row.sourceGuide) place.sourceGuide = row.sourceGuide;
  if (row.photoPendingNote) place.photoPendingNote = row.photoPendingNote;
  if (row.photoCredit) place.photoCredit = row.photoCredit;
  if (row.trekkingInfo) place.trekkingInfo = row.trekkingInfo;
  if (row.isHeritageEsquiu) place.isHeritageEsquiu = row.isHeritageEsquiu;
  if (row.googleMapsUrl) place.googleMapsUrl = row.googleMapsUrl;
  if (row.safetyWarning) place.safetyWarning = row.safetyWarning;

  return place;
}

function toEventRow(event: TouristEvent, sortOrder: number) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    dateBadge: event.dateBadge,
    time: event.time,
    category: event.category,
    locationName: event.locationName,
    address: event.address,
    lat: typeof event.lat === 'number' && !isNaN(event.lat) ? event.lat : 0,
    lng: typeof event.lng === 'number' && !isNaN(event.lng) ? event.lng : 0,
    description: event.description ?? '',
    image: event.image ?? '',
    isFree: Boolean(event.isFree),
    priceText: event.priceText ?? null,
    organizer: event.organizer ?? null,
    placeId: event.placeId ?? null,
    sortOrder,
    updatedAt: new Date(),
  };
}

function fromEventRow(row: typeof eventsTable.$inferSelect): TouristEvent {
  const event: TouristEvent = {
    id: row.id,
    title: row.title,
    date: row.date,
    dateBadge: row.dateBadge,
    time: row.time,
    category: row.category as TouristEvent['category'],
    locationName: row.locationName,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    image: row.image,
    isFree: row.isFree,
  };
  if (row.priceText) event.priceText = row.priceText;
  if (row.organizer) event.organizer = row.organizer;
  if (row.placeId) event.placeId = row.placeId;
  return event;
}

function toAudioguideRow(guide: Audioguide, sortOrder: number) {
  return {
    id: guide.id,
    placeId: guide.placeId,
    title: guide.title,
    subtitle: guide.subtitle ?? '',
    duration: guide.duration,
    audioSeconds: Number(guide.audioSeconds || 0),
    coverImage: guide.coverImage ?? '',
    shortSummary: guide.shortSummary ?? '',
    narrativeText: guide.narrativeText ?? '',
    historicalFacts: Array.isArray(guide.historicalFacts) ? guide.historicalFacts : [],
    nextPlaceId: guide.nextPlaceId ?? '',
    nextPlaceReason: guide.nextPlaceReason ?? '',
    sortOrder,
    updatedAt: new Date(),
  };
}

function fromAudioguideRow(row: typeof audioguidesTable.$inferSelect): Audioguide {
  return {
    id: row.id,
    placeId: row.placeId,
    title: row.title,
    subtitle: row.subtitle,
    duration: row.duration,
    audioSeconds: row.audioSeconds,
    coverImage: row.coverImage,
    shortSummary: row.shortSummary,
    narrativeText: row.narrativeText,
    historicalFacts: Array.isArray(row.historicalFacts) ? row.historicalFacts : [],
    nextPlaceId: row.nextPlaceId,
    nextPlaceReason: row.nextPlaceReason,
  };
}

export async function seedDatabaseFromExistingFiles(): Promise<{
  placesCount: number;
  eventsCount: number;
  audioguidesCount: number;
}> {
  try {
    await ensurePostgresSchema();
    const dataDir = path.join(process.cwd(), 'data');

    const seedPlaces =
      readJsonArrayIfExists<Place>(path.join(dataDir, 'places.json')) || INITIAL_PLACES;
    const seedEvents =
      readJsonArrayIfExists<TouristEvent>(path.join(dataDir, 'events.json')) || INITIAL_EVENTS;
    const seedGuides =
      readJsonArrayIfExists<Audioguide>(path.join(dataDir, 'audioguides.json')) ||
      INITIAL_AUDIOGUIDES;
    const seedConfig =
      readJsonObjectIfExists<SiteConfig>(path.join(dataDir, 'site_config.json')) ||
      DEFAULT_SITE_CONFIG;

    await replaceAllPlaces(seedPlaces);
    await replaceAllEvents(seedEvents);
    await replaceAllAudioguides(seedGuides);
    await saveSiteConfig(seedConfig);

    return {
      placesCount: seedPlaces.length,
      eventsCount: seedEvents.length,
      audioguidesCount: seedGuides.length,
    };
  } catch (error) {
    console.error('[POSTGRES] Failed to seed database:', error);
    throw new Error('Failed to seed PostgreSQL database', { cause: error });
  }
}

export async function getAllPlaces(): Promise<Place[]> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    let rows = await db.select().from(placesTable).orderBy(asc(placesTable.sortOrder));

    if (rows.length === 0) {
      const dataDir = path.join(process.cwd(), 'data');
      const initialPlaces =
        readJsonArrayIfExists<Place>(path.join(dataDir, 'places.json')) || INITIAL_PLACES;
      await replaceAllPlaces(initialPlaces);
      rows = await db.select().from(placesTable).orderBy(asc(placesTable.sortOrder));
    }

    return rows.map(fromPlaceRow);
  } catch (error) {
    console.error('[POSTGRES] Error reading places:', error);
    throw new Error('Failed to read places from PostgreSQL', { cause: error });
  }
}

export async function replaceAllPlaces(places: Place[]): Promise<number> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    const ids = places.map((p) => p.id).filter(Boolean);

    await db.transaction(async (tx) => {
      if (ids.length === 0) {
        await tx.delete(placesTable);
        return;
      }

      await tx.delete(placesTable).where(notInArray(placesTable.id, ids));

      for (let i = 0; i < places.length; i++) {
        const row = toPlaceRow(places[i], i);
        await tx
          .insert(placesTable)
          .values(row)
          .onConflictDoUpdate({
            target: placesTable.id,
            set: row,
          });
      }
    });

    return places.length;
  } catch (error) {
    console.error('[POSTGRES] Error saving places:', error);
    throw new Error('Failed to save places to PostgreSQL', { cause: error });
  }
}

export async function getAllEvents(): Promise<TouristEvent[] | null> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    let rows = await db.select().from(eventsTable).orderBy(asc(eventsTable.sortOrder));

    if (rows.length === 0) {
      const dataDir = path.join(process.cwd(), 'data');
      const seedEvents =
        readJsonArrayIfExists<TouristEvent>(path.join(dataDir, 'events.json')) || INITIAL_EVENTS;
      await replaceAllEvents(seedEvents);
      rows = await db.select().from(eventsTable).orderBy(asc(eventsTable.sortOrder));
    }

    return rows.length > 0 ? rows.map(fromEventRow) : null;
  } catch (error) {
    console.error('[POSTGRES] Error reading events:', error);
    throw new Error('Failed to read events from PostgreSQL', { cause: error });
  }
}

export async function replaceAllEvents(events: TouristEvent[]): Promise<number> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    const ids = events.map((e) => e.id).filter(Boolean);

    await db.transaction(async (tx) => {
      if (ids.length === 0) {
        await tx.delete(eventsTable);
        return;
      }

      await tx.delete(eventsTable).where(notInArray(eventsTable.id, ids));

      for (let i = 0; i < events.length; i++) {
        const row = toEventRow(events[i], i);
        await tx
          .insert(eventsTable)
          .values(row)
          .onConflictDoUpdate({
            target: eventsTable.id,
            set: row,
          });
      }
    });

    return events.length;
  } catch (error) {
    console.error('[POSTGRES] Error saving events:', error);
    throw new Error('Failed to save events to PostgreSQL', { cause: error });
  }
}

export async function getAllAudioguides(): Promise<Audioguide[] | null> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    let rows = await db
      .select()
      .from(audioguidesTable)
      .orderBy(asc(audioguidesTable.sortOrder));

    if (rows.length === 0) {
      const dataDir = path.join(process.cwd(), 'data');
      const seedGuides =
        readJsonArrayIfExists<Audioguide>(path.join(dataDir, 'audioguides.json')) ||
        INITIAL_AUDIOGUIDES;
      await replaceAllAudioguides(seedGuides);
      rows = await db
        .select()
        .from(audioguidesTable)
        .orderBy(asc(audioguidesTable.sortOrder));
    }

    return rows.length > 0 ? rows.map(fromAudioguideRow) : null;
  } catch (error) {
    console.error('[POSTGRES] Error reading audioguides:', error);
    throw new Error('Failed to read audioguides from PostgreSQL', { cause: error });
  }
}

export async function replaceAllAudioguides(audioguides: Audioguide[]): Promise<number> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    const ids = audioguides.map((g) => g.id).filter(Boolean);

    await db.transaction(async (tx) => {
      if (ids.length === 0) {
        await tx.delete(audioguidesTable);
        return;
      }

      await tx.delete(audioguidesTable).where(notInArray(audioguidesTable.id, ids));

      for (let i = 0; i < audioguides.length; i++) {
        const row = toAudioguideRow(audioguides[i], i);
        await tx
          .insert(audioguidesTable)
          .values(row)
          .onConflictDoUpdate({
            target: audioguidesTable.id,
            set: row,
          });
      }
    });

    return audioguides.length;
  } catch (error) {
    console.error('[POSTGRES] Error saving audioguides:', error);
    throw new Error('Failed to save audioguides to PostgreSQL', { cause: error });
  }
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    const rows = await db
      .select()
      .from(siteConfigTable)
      .where(eq(siteConfigTable.key, 'default'));

    if (rows.length === 0) {
      const dataDir = path.join(process.cwd(), 'data');
      const seedConfig = readJsonObjectIfExists<SiteConfig>(
        path.join(dataDir, 'site_config.json')
      );
      if (seedConfig) {
        await saveSiteConfig(seedConfig);
        return seedConfig;
      }
      return null;
    }

    return rows[0].config;
  } catch (error) {
    console.error('[POSTGRES] Error reading site config:', error);
    throw new Error('Failed to read site config from PostgreSQL', { cause: error });
  }
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    await db
      .insert(siteConfigTable)
      .values({
        key: 'default',
        config,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteConfigTable.key,
        set: {
          config,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('[POSTGRES] Error saving site config:', error);
    throw new Error('Failed to save site config to PostgreSQL', { cause: error });
  }
}

export async function saveMediaUpload(
  filename: string,
  mimeType: string,
  dataBase64: string,
  sizeBytes: number
): Promise<void> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    await db
      .insert(mediaUploadsTable)
      .values({
        filename,
        mimeType,
        dataBase64,
        sizeBytes,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: mediaUploadsTable.filename,
        set: {
          mimeType,
          dataBase64,
          sizeBytes,
        },
      });
  } catch (error) {
    console.error('[POSTGRES] Error saving media upload:', error);
    throw new Error('Failed to save uploaded media to PostgreSQL', { cause: error });
  }
}

export async function getMediaUpload(
  filename: string
): Promise<{ mimeType: string; dataBase64: string } | null> {
  try {
    await ensurePostgresSchema();
    const db = getDb();
    const rows = await db
      .select()
      .from(mediaUploadsTable)
      .where(eq(mediaUploadsTable.filename, filename));

    if (rows.length === 0) return null;
    return {
      mimeType: rows[0].mimeType,
      dataBase64: rows[0].dataBase64,
    };
  } catch (error) {
    console.error('[POSTGRES] Error reading media upload:', error);
    throw new Error('Failed to read uploaded media from PostgreSQL', { cause: error });
  }
}
