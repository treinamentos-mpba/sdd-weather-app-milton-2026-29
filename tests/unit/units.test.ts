import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C em %s °F', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
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

  it('deriva alternâncias da origem sem acumular arredondamento', () => {
    for (let index = 0; index < 10; index++) {
      expect(formatTemperature(12.34, 'fahrenheit')).toBe('54,2 °F');
      expect(formatTemperature(12.34, 'celsius')).toBe('12,3 °C');
    }
  });
});
