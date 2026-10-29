import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../src/types/weather';

const location = mockWeatherData.location;
if (location.kind !== 'city' || mockWeatherData.current === null) {
  throw new Error('O mock deve conter uma cidade e condições atuais.');
}
const city: City = location.city;
const current: CurrentWeatherData = mockWeatherData.current;

function expectMetric(label: string, value: string) {
  const term = screen.getByText(label, { selector: 'dt' });
  const group = term.parentElement;
  if (!group) throw new Error('Métrica sem grupo semântico.');
  expect(within(group).getByRole('definition')).toHaveTextContent(value);
}

describe('CurrentWeather', () => {
  it('apresenta mock e converte somente temperaturas ao trocar unit', () => {
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('region', { name: 'Clima em Salvador' })).toBeInTheDocument();
    expect(screen.getByText('Bahia, Brasil')).toBeInTheDocument();
    expect(screen.getByText('28,4 °C', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 30,2 °C')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('⛅')).toHaveAttribute('aria-hidden', 'true');
    expectMetric('Umidade', '72 %');
    expectMetric('Vento', '18,5 km/h');
    expectMetric('Precipitação atual', '0,4 mm');
    expectMetric('Pressão ao nível do mar', '1.013 hPa');
    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toBeInTheDocument();
    expect(screen.getByText(/Estimativas meteorológicas, não garantias/)).toBeInTheDocument();

    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
    expect(screen.getByText('83,1 °F', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: 86,4 °F')).toBeInTheDocument();
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
    expectMetric('Umidade', '72 %');
    expectMetric('Vento', '18,5 km/h');
    expectMetric('Precipitação atual', '0,4 mm');
    expectMetric('Pressão ao nível do mar', '1.013 hPa');
  });

  it('preserva zeros e marca campos ausentes sem ícone arbitrário', () => {
    render(
      <CurrentWeather
        city={city}
        unit="celsius"
        current={{
          ...current,
          temperatureC: 0,
          apparentTemperatureC: null,
          weatherCode: null,
          relativeHumidityPct: 0,
          windSpeedKmh: 0,
          precipitationMm: 0,
          pressureMslHpa: null,
        }}
      />,
    );
    expect(screen.getByText('0 °C', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Sensação térmica: Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Condição não disponível')).toBeInTheDocument();
    expect(screen.queryByText('⛅')).not.toBeInTheDocument();
    expectMetric('Umidade', '0 %');
    expectMetric('Vento', '0 km/h');
    expectMetric('Precipitação atual', '0 mm');
    expectMetric('Pressão ao nível do mar', 'Sem dados');
  });

  it('sinaliza seção atual indisponível', () => {
    render(<CurrentWeather city={city} current={null} unit="fahrenheit" />);
    expect(screen.getByText('Condições atuais indisponíveis.')).toBeInTheDocument();
    expect(screen.getAllByText('Sem dados')).toHaveLength(4);
    expect(screen.queryByText(/°F/)).not.toBeInTheDocument();
  });
});
