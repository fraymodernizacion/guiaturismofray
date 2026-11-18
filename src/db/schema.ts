import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { CategoryId, PlaceTag, TrekkingDetails } from '../types.ts';
import type { SiteConfig } from '../types/siteConfig.ts';

export const placesTable = pgTable('places', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').$type<CategoryId>().notNull(),
  secondaryCategories: jsonb('secondary_categories').$type<CategoryId[]>(),
  subCategory: text('sub_category'),
  shortDescription: text('short_description').notNull().default(''),
  description: text('description').notNull().default(''),
  address: text('address').notNull().default(''),
  locality: text('locality').notNull().default(''),
  localityId: text('locality_id'),
  lat: doublePrecision('lat').notNull().default(0),
  lng: doublePrecision('lng').notNull().default(0),
  image: text('image').notNull().default(''),
  gallery: jsonb('gallery').$type<string[]>().notNull().default([]),
  openingHours: text('opening_hours').notNull().default(''),
  phone: text('phone').notNull().default(''),
  whatsapp: text('whatsapp').notNull().default(''),
  instagram: text('instagram'),
  facebook: text('facebook'),
  tags: jsonb('tags').$type<PlaceTag[]>().notNull().default([]),
  services: jsonb('services').$type<string[]>().notNull().default([]),
  priceLevel: text('price_level').$type<'$' | '$$' | '$$$'>(),
  featured: boolean('featured').default(false),
  isImperdible: boolean('is_imperdible').default(false),
  audioguideId: text('audioguide_id'),
  validationStatus: text('validation_status').$type<
    'verificado' | 'pendiente_validacion' | 'dato_pendiente_actualizacion'
  >(),
  validationNote: text('validation_note'),
  sourceGuide: text('source_guide'),
  photoPendingNote: text('photo_pending_note'),
  photoCredit: text('photo_credit'),
  trekkingInfo: jsonb('trekking_info').$type<TrekkingDetails>(),
  isHeritageEsquiu: boolean('is_heritage_esquiu').default(false),
  googleMapsUrl: text('google_maps_url'),
  safetyWarning: text('safety_warning'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const eventsTable = pgTable('events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  dateBadge: text('date_badge').notNull(),
  time: text('time').notNull(),
  category: text('category').notNull(),
  locationName: text('location_name').notNull(),
  address: text('address').notNull(),
  lat: doublePrecision('lat').notNull().default(0),
  lng: doublePrecision('lng').notNull().default(0),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default(''),
  isFree: boolean('is_free').notNull().default(true),
  priceText: text('price_text'),
  organizer: text('organizer'),
  placeId: text('place_id'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const audioguidesTable = pgTable('audioguides', {
  id: text('id').primaryKey(),
  placeId: text('place_id').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull().default(''),
  duration: text('duration').notNull(),
  audioSeconds: integer('audio_seconds').notNull().default(0),
  coverImage: text('cover_image').notNull().default(''),
  shortSummary: text('short_summary').notNull().default(''),
  narrativeText: text('narrative_text').notNull().default(''),
  historicalFacts: jsonb('historical_facts').$type<string[]>().notNull().default([]),
  nextPlaceId: text('next_place_id').notNull().default(''),
  nextPlaceReason: text('next_place_reason').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const siteConfigTable = pgTable('site_config', {
  key: text('key').primaryKey(),
  config: jsonb('config').$type<SiteConfig>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaUploadsTable = pgTable('media_uploads', {
  filename: text('filename').primaryKey(),
  mimeType: text('mime_type').notNull().default('application/octet-stream'),
  dataBase64: text('data_base64').notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
