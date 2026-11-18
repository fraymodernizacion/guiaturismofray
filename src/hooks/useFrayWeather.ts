/**
 * Hook y servicio para obtener el clima en tiempo real desde Open-Meteo
 * para Fray Mamerto Esquiú, Catamarca, Argentina.
 * Coordenadas oficiales de referencia: Lat -28.3850, Lng -65.7330 (San José de Piedra Blanca)
 */

import { useState, useEffect, useCallback } from 'react';

// Coordenadas fijas de Fray Mamerto Esquiú, Catamarca (San José de Piedra Blanca)
const FRAY_LAT = -28.3850;
const FRAY_LNG = -65.7330;
const CACHE_KEY = 'fray_turismo_weather_cache_v2';
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutos

export interface WeatherData {
  temperature: number; // Math.round(data.current.temperature_2m)
  apparentTemperature?: number;
  weatherCode: number;
  isDay: boolean;
  description: string;
  timestamp: number;
}

/**
 * Traduce el código de clima WMO de Open-Meteo a una descripción breve y concisa en español
 */
export function getWeatherDescription(code: number, isDay: boolean): string {
  switch (code) {
    case 0:
      return isDay ? 'Despejado' : 'Despejado';
    case 1:
      return isDay ? 'Mayormente despejado' : 'Despejado';
    case 2:
      return 'Parcialmente nublado';
    case 3:
      return 'Nublado';
    case 45:
    case 48:
      return 'Niebla';
    case 51:
    case 53:
    case 55:
      return 'Llovizna';
    case 61:
      return 'Lluvia leve';
    case 63:
      return 'Lluvia';
    case 65:
      return 'Lluvia intensa';
    case 71:
    case 73:
    case 75:
      return 'Nevada';
    case 80:
    case 81:
    case 82:
      return 'Chubascos';
    case 95:
      return 'Tormenta';
    case 96:
    case 99:
      return 'Tormenta eléctrica';
    default:
      return isDay ? 'Soleado' : 'Despejado';
  }
}

/**
 * Carga el clima almacenado en localStorage si aún es válido o como último dato conocido
 */
function getStoredWeather(): { data: WeatherData | null; isFresh: boolean } {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { data: null, isFresh: false };
    const parsed = JSON.parse(raw) as WeatherData;
    if (typeof parsed.temperature !== 'number' || isNaN(parsed.temperature)) {
      return { data: null, isFresh: false };
    }
    const age = Date.now() - (parsed.timestamp || 0);
    return {
      data: parsed,
      isFresh: age < CACHE_TTL_MS,
    };
  } catch {
    return { data: null, isFresh: false };
  }
}

export function useFrayWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const cached = getStoredWeather();
    return cached.data;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWeather = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${FRAY_LAT}&longitude=${FRAY_LNG}&current=temperature_2m,apparent_temperature,weather_code,is_day&timezone=America%2FArgentina%2FCordoba`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo response status: ${res.status}`);
      }

      const json = await res.json();
      console.log('[OPEN-METEO JSON RESPONSE]:', json);
      
      const current = json.current;
      if (!current || typeof current.temperature_2m !== 'number') {
        throw new Error('Formato de datos inválido de Open-Meteo');
      }

      const isDay = current.is_day === 1;
      const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;
      const roundedTemp = Math.round(current.temperature_2m);
      const desc = getWeatherDescription(weatherCode, isDay);

      const newWeatherData: WeatherData = {
        temperature: roundedTemp,
        apparentTemperature: typeof current.apparent_temperature === 'number' ? Math.round(current.apparent_temperature) : undefined,
        weatherCode,
        isDay,
        description: desc,
        timestamp: Date.now(),
      };

      setWeather(newWeatherData);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newWeatherData));
      } catch (err) {
        console.warn('[WEATHER CACHE WARNING]:', err);
      }
    } catch (err) {
      console.warn('[WEATHER FETCH ERROR]:', err);
      // En caso de fallo de red, NO mostrar datos inventados; mantener caché previo si existe
      setWeather((prev) => {
        if (prev) return prev;
        const cached = getStoredWeather();
        return cached.data;
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getStoredWeather();
    if (!cached.isFresh || !cached.data) {
      fetchWeather();
    }

    // Actualización periódica cada 20 minutos (1.200.000 ms)
    const intervalId = setInterval(() => {
      fetchWeather();
    }, CACHE_TTL_MS);

    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  return {
    weather,
    isLoading,
    refreshWeather: fetchWeather,
  };
}
