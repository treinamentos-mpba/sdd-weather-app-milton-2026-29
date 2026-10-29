import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it.each([
    [0, 'Céu limpo'],
    [2, 'Parcialmente nublado'],
    [61, 'Chuva leve'],
    [99, 'Trovoada com granizo intenso'],
  ])('apresenta condição %s como texto com ícone', (code, label) => {
    expect(getWeatherCondition(code).label).toBe(label);
    expect(getWeatherCondition(code).icon).toBeTruthy();
  });

  it.each([null, -1, 100, Number.NaN])('não inventa ícone para código %s', (code) => {
    expect(getWeatherCondition(code)).toEqual({
      label: 'Condição não disponível',
      icon: null,
    });
  });
});
