import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/mocks/weather';

describe('ForecastList', () => {
  it('renderiza os cinco cards do mock em ordem com datas absolutas', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);
    const region = screen.getByRole('region', { name: 'Previsão de 5 dias' });
    expect(within(region).getAllByRole('listitem')).toHaveLength(5);
    expect(
      within(region)
        .getAllByRole('article')
        .map((card) => card.querySelector('time')?.dateTime),
    ).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
    expect(screen.getByRole('article', { name: 'seg., 02/11/2026' })).toBeInTheDocument();
    expect(screen.getByText(/Estimativas meteorológicas/)).toBeInTheDocument();
  });

  it('sinaliza lista vazia sem fabricar cards', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByText('Previsão indisponível.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('propaga a unidade para todos os cards sem alterar os dados originais', () => {
    const { rerender } = render(
      <ForecastList forecast={mockWeatherData.forecast} unit="celsius" />,
    );
    expect(screen.getAllByText(/°C/)).toHaveLength(10);
    rerender(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);
    expect(screen.getAllByText(/°F/)).toHaveLength(10);
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
    expect(screen.getByText('85,6 °F')).toBeInTheDocument();
    expect(mockWeatherData.forecast[0]?.maxTemperatureC).toBe(29.8);
  });
});
