import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: readonly ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="font-sans text-white">
      <h2 id={headingId} className="text-2xl font-semibold">
        Previsão de 5 dias
      </h2>
      {forecast.length === 0 ? (
        <p className="mt-4">Previsão indisponível.</p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {forecast.map((day) => (
              <li key={day.date} className="min-w-0">
                <ForecastCard day={day} unit={unit} />
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/80">
            Estimativas meteorológicas, não garantias das condições.
          </p>
        </>
      )}
    </section>
  );
}
