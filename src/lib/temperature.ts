import type { Unit } from '../types/weather';

const temperatureFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

export function convertTemperature(celsius: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  if (celsius === null) return 'Sem dados';

  const temperature = convertTemperature(celsius, unit);
  // Evita zero negativo quando o valor é arredondado para uma casa decimal.
  const value = Math.abs(temperature) < 0.05 ? 0 : temperature;
  return `${temperatureFormatter.format(value)} ${unitLabel(unit)}`;
}
