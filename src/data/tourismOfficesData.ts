export interface OfficeTimeRange {
  desde: string;
  hasta: string;
}

export interface OfficeScheduleEntry {
  dias: string;
  desde?: string;
  hasta?: string;
  tramos?: OfficeTimeRange[];
}

export interface TourismOffice {
  id: string;
  nombre_boton: string;
  nombre: string;
  referencia_corta: string;
  ubicacion: string;
  horarios: OfficeScheduleEntry[];
  telefono: string;
  whatsapp_url: string;
  google_maps_url: string | null;
}

export interface WelcomeCarouselPlaceConfig {
  nombre: string;
  placeId?: string;
  matchTerms: string[];
  imagen: string | null;
}

export interface WelcomeCarouselConfig {
  titulo: string;
  reproduccion_automatica: boolean;
  intervalo_ms: number;
  bucle: boolean;
  permitir_deslizar_en_celular: boolean;
  mostrar_nombre_del_lugar: boolean;
  lugares: WelcomeCarouselPlaceConfig[];
}

export const TOURISM_OFFICES_META = {
  categoria: 'Oficinas de Turismo',
  telefono_compartido: '3834 69-3224',
  whatsapp_url_compartido: 'https://wa.me/5493834693224',
} as const;

export const TOURISM_OFFICES: TourismOffice[] = [
  {
    id: 'turismo-san-jose',
    nombre_boton: 'Turismo San José',
    nombre: 'Oficina de Turismo de San José (Casa Natal)',
    referencia_corta: 'Casa Natal · Piedra Blanca',
    ubicacion:
      'Casa Natal del Beato Mamerto Esquiú, San José de Piedra Blanca, Fray Mamerto Esquiú, Catamarca, Argentina',
    horarios: [
      {
        dias: 'Todos los días',
        desde: '08:00',
        hasta: '20:00',
      },
    ],
    telefono: '3834 69-3224',
    whatsapp_url: 'https://wa.me/5493834693224',
    google_maps_url: 'https://maps.app.goo.gl/uPSTtDTTPk1Ci1un7',
  },
  {
    id: 'turismo-trapiche',
    nombre_boton: 'Turismo Trapiche',
    nombre: 'Oficina de Turismo del Trapiche Azucarero',
    referencia_corta: 'Camino Real · Piedra Blanca',
    ubicacion:
      'Trapiche Azucarero, antiguo Camino Real, Piedra Blanca, Fray Mamerto Esquiú, Catamarca, Argentina',
    horarios: [
      {
        dias: 'Lunes a viernes',
        tramos: [
          { desde: '08:00', hasta: '14:00' },
          { desde: '15:00', hasta: '19:00' },
        ],
      },
      {
        dias: 'Sábados, domingos y feriados',
        desde: '08:00',
        hasta: '20:00',
      },
    ],
    telefono: '3834 69-3224',
    whatsapp_url: 'https://wa.me/5493834693224',
    google_maps_url: null,
  },
  {
    id: 'turismo-las-moras',
    nombre_boton: 'Turismo Las Moras',
    nombre: 'Oficina de Turismo Las Moras',
    referencia_corta: 'Paseo Las Moras · Las Pirquitas',
    ubicacion:
      'Paseo Las Moras, Villa Las Pirquitas, Fray Mamerto Esquiú, Catamarca, Argentina',
    horarios: [
      {
        dias: 'Lunes a viernes',
        tramos: [
          { desde: '08:00', hasta: '13:00' },
          { desde: '14:00', hasta: '18:00' },
        ],
      },
      {
        dias: 'Sábados, domingos y feriados',
        desde: '08:00',
        hasta: '20:00',
      },
    ],
    telefono: '3834 69-3224',
    whatsapp_url: 'https://wa.me/5493834693224',
    google_maps_url: 'https://maps.app.goo.gl/MW1HUEGpGNuoLMWc7',
  },
];

export const WELCOME_CAROUSEL_CONFIG: WelcomeCarouselConfig = {
  titulo: 'Lugares recomendados de Fray',
  reproduccion_automatica: true,
  intervalo_ms: 5000,
  bucle: true,
  permitir_deslizar_en_celular: true,
  mostrar_nombre_del_lugar: true,
  lugares: [
    {
      nombre: 'Dique Las Pirquitas',
      placeId: 'dique-las-pirquitas',
      matchTerms: ['dique las pirquitas', 'dique y embalse las pirquitas'],
      imagen: null,
    },
    {
      nombre: 'Parque Botánico de San Antonio',
      matchTerms: ['parque botanico de san antonio', 'parque botánico'],
      imagen: null,
    },
    {
      nombre: 'Paseo Las Moras',
      placeId: 'paseo-las-moras',
      matchTerms: ['paseo las moras', 'complejo municipal las moras'],
      imagen: null,
    },
    {
      nombre: 'Casa Natal del Beato Mamerto Esquiú',
      placeId: 'casa-natal-esquiu',
      matchTerms: ['casa natal de fray mamerto esquiu', 'casa natal del beato'],
      imagen: null,
    },
    {
      nombre: 'Trapiche Azucarero',
      placeId: 'trapiche-azucarero',
      matchTerms: ['trapiche azucarero', 'ruinas del primer trapiche'],
      imagen: null,
    },
  ],
};
