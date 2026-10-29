import type { WeatherCode } from '../types/weather';

interface WeatherCondition {
  label: string;
  icon: string | null;
}

const conditions: Record<WeatherCode, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predominantemente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Encoberto', icon: '☁️' },
  45: { label: 'Nevoeiro', icon: '🌫️' },
  48: { label: 'Nevoeiro', icon: '🌫️' },
  51: { label: 'Garoa leve', icon: '🌦️' },
  53: { label: 'Garoa moderada', icon: '🌦️' },
  55: { label: 'Garoa intensa', icon: '🌦️' },
  56: { label: 'Garoa congelante leve', icon: '🌨️' },
  57: { label: 'Garoa congelante intensa', icon: '🌨️' },
  61: { label: 'Chuva leve', icon: '🌧️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva intensa', icon: '🌧️' },
  66: { label: 'Chuva congelante leve', icon: '🌨️' },
  67: { label: 'Chuva congelante intensa', icon: '🌨️' },
  71: { label: 'Neve leve', icon: '❄️' },
  73: { label: 'Neve moderada', icon: '❄️' },
  75: { label: 'Neve intensa', icon: '❄️' },
  77: { label: 'Grãos de neve', icon: '❄️' },
  80: { label: 'Pancadas de chuva leves', icon: '🌦️' },
  81: { label: 'Pancadas de chuva moderadas', icon: '🌦️' },
  82: { label: 'Pancadas de chuva violentas', icon: '🌧️' },
  85: { label: 'Pancadas de neve leves', icon: '🌨️' },
  86: { label: 'Pancadas de neve intensas', icon: '🌨️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { label: 'Trovoada com granizo intenso', icon: '⛈️' },
};

export function getWeatherCondition(code: number | null): WeatherCondition {
  if (code !== null && Object.hasOwn(conditions, code)) {
    return conditions[code as WeatherCode];
  }
  return { label: 'Condição não disponível', icon: null };
}
