import { CategoryId } from '../types';
import type { TourismOffice } from '../data/tourismOfficesData';

export interface QuickHeroBadge {
  id: string;
  label: string;
  sublabel: string;
  iconName: string;
  actionType: 'scroll' | 'category' | 'tab';
  target: string;
  colorBg: string;
}

export interface HeroConfig {
  locationBadge: string;
  seasonBadge: string;
  tagline: string;
  title: string;
  subtitle: string;
  bgImage: string;
  searchPlaceholder: string;
  quickBadges: QuickHeroBadge[];
  showSearch: boolean;
  showQuickBadges: boolean;
}

export interface CategoryItemConfig {
  id: CategoryId | string;
  label: string;
  shortLabel: string;
  emoji: string;
  iconName: string;
  color: string;
  bgLight: string;
  description: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface CategoriesSectionConfig {
  title?: string;
  subtitle?: string;
  items: CategoryItemConfig[];
}

export interface ImperdibleCustomItem {
  placeId: string;
  customTitle?: string;
  customTagline?: string;
  customImage?: string;
  customBadge?: string;
  customBadgeColor?: string;
  customHighlight?: string;
  customPhotoNote?: string;
  isVisible: boolean;
}

export interface ImperdiblesSectionConfig {
  badge: string;
  title: string;
  subtitle: string;
  items: ImperdibleCustomItem[];
}

export interface ConocePillarConfig {
  id: string;
  title: string;
  subtitle: string;
  phrase: string;
  iconName: string;
  gradient: string;
  accentBadge: string;
  targetCategory?: string;
}

export interface ConoceFraySectionConfig {
  badge: string;
  title: string;
  subtitle: string;
  leadParagraph: string;
  pillars: ConocePillarConfig[];
}

export interface QueHacerActivityPill {
  id: string;
  label: string;
  emoji: string;
  targetCategory?: string;
  targetTab?: string;
}

export interface QueHacerSectionConfig {
  badge: string;
  title: string;
  subtitle: string;
  featuredEventIds: string[];
  activityPills: QueHacerActivityPill[];
}

export interface RecorridoEsquiuStopConfig {
  placeId: string;
  order: number;
  tip?: string;
  customTitle?: string;
  distanceFromPrevious?: string;
}

export interface RecorridoEsquiuSectionConfig {
  badge: string;
  title: string;
  subtitle: string;
  introDescription: string;
  stops: RecorridoEsquiuStopConfig[];
  highlights: string[];
  audioGuidePlaceId: string;
}

export interface EmblemaFeConfig {
  badge: string;
  title: string;
  bodyText: string;
  isVisible: boolean;
}

export interface FooterConfig {
  appName: string;
  tagline: string;
  municipalTitle: string;
  secretaria: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  websiteUrl: string;
  copyrightText: string;
  localitiesText: string;
}

export interface TourismOfficesSectionConfig {
  title: string;
  sharedPhone: string;
  offices: TourismOffice[];
}

export interface SiteConfig {
  version: number;
  updatedAt: string;
  hero: HeroConfig;
  tourismOffices?: TourismOfficesSectionConfig;
  categories: CategoriesSectionConfig;
  imperdibles: ImperdiblesSectionConfig;
  conoceFray: ConoceFraySectionConfig;
  queHacer: QueHacerSectionConfig;
  recorridoEsquiu: RecorridoEsquiuSectionConfig;
  emblemaFe: EmblemaFeConfig;
  footer: FooterConfig;
  deletedPlaceIds?: string[];
}
