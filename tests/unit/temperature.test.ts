import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C em %s °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
  });

  it.each([0, 100, -40, 12.34])('preserva %s °C na unidade Celsius', (celsius) => {
    expect(convertTemperature(celsius, 'celsius')).toBe(celsius);
  });

  it.each([
    [-1.25, '-1,3 °C'],
    [1.25, '1,3 °C'],
    [-0.04, '0 °C'],
    [0, '0 °C'],
    [null, 'Sem dados'],
  ])('formata %s sem perder zero ou exibir zero negativo', (value, expected) => {
    expect(formatTemperature(value, 'celsius')).toBe(expected);
  });

  it.each([
    [0, '32 °F'],
    [100, '212 °F'],
    [-40, '-40 °F'],
    [12.34, '54,2 °F'],
    [null, 'Sem dados'],
  ])('formata %s °C em Fahrenheit com arredondamento e símbolo', (value, expected) => {
    expect(formatTemperature(value, 'fahrenheit')).toBe(expected);
  });

  it('identifica os símbolos de ambas as unidades', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('não apresenta temperatura não finita %s em nenhuma unidade', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Sem dados');
    expect(formatTemperature(value, 'fahrenheit')).toBe('Sem dados');
  });

  it('não apresenta infinito quando a conversão para Fahrenheit excede o limite numérico', () => {
    expect(formatTemperature(Number.MAX_VALUE, 'fahrenheit')).toBe('Sem dados');
  });

  it('deriva alternâncias da origem sem acumular arredondamento', () => {
    for (let index = 0; index < 10; index++) {
      expect(formatTemperature(12.34, 'fahrenheit')).toBe('54,2 °F');
      expect(formatTemperature(12.34, 'celsius')).toBe('12,3 °C');
    }
  });
});
