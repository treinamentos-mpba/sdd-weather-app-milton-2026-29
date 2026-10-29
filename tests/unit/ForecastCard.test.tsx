import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import type { ForecastDay } from '../../src/types/weather';

const day: ForecastDay = {
  date: '2026-10-29',
  weatherCode: 61,
  minTemperatureC: 0,
  maxTemperatureC: 20,
  maxPrecipitationProbabilityPct: 70,
  meanRelativeHumidityPct: 65,
  maxWindSpeedKmh: 20,
};

function expectMetric(label: string, value: string) {
  const group = screen.getByText(label, { selector: 'dt' }).parentElement;
  if (!group) throw new Error('Métrica sem grupo semântico.');
  expect(within(group).getByRole('definition')).toHaveTextContent(value);
}

describe('ForecastCard', () => {
  it('exibe condição, unidades e converte apenas temperaturas', () => {
    const { rerender } = render(<ForecastCard day={day} unit="celsius" />);
    expect(screen.getByRole('article', { name: 'qui., 29/10/2026' })).toBeInTheDocument();
    expect(screen.getByText('Chuva leve')).toBeInTheDocument();
    expect(screen.getByText('🌧️')).toHaveAttribute('aria-hidden', 'true');
    expectMetric('Máxima', '20 °C');
    expectMetric('Mínima', '0 °C');
    expectMetric('Probabilidade máxima de precipitação', '70 %');
    expectMetric('Umidade média', '65 %');
    expectMetric('Vento máximo', '20 km/h');

    rerender(<ForecastCard day={day} unit="fahrenheit" />);
    expectMetric('Máxima', '68 °F');
    expectMetric('Mínima', '32 °F');
    expectMetric('Probabilidade máxima de precipitação', '70 %');
    expectMetric('Umidade média', '65 %');
    expectMetric('Vento máximo', '20 km/h');
  });

  it('distingue zeros de campos ausentes e não inventa condição', () => {
    render(
      <ForecastCard
        day={{
          ...day,
          weatherCode: null,
          minTemperatureC: null,
          maxTemperatureC: null,
          maxPrecipitationProbabilityPct: 0,
          meanRelativeHumidityPct: null,
          maxWindSpeedKmh: 0,
        }}
        unit="celsius"
      />,
    );
    expectMetric('Máxima', 'Sem dados');
    expectMetric('Mínima', 'Sem dados');
    expectMetric('Probabilidade máxima de precipitação', '0 %');
    expectMetric('Umidade média', 'Sem dados');
    expectMetric('Vento máximo', '0 km/h');
    expect(screen.getByText('Condição não disponível')).toBeInTheDocument();
    expect(screen.queryByText('🌧️')).not.toBeInTheDocument();
  });
});
