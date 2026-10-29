import { useId } from 'react';
import { formatDayLabel, formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const condition = getWeatherCondition(day.weatherCode);
  const metrics = [
    { label: 'Máxima', value: formatTemperature(day.maxTemperatureC, unit) },
    { label: 'Mínima', value: formatTemperature(day.minTemperatureC, unit) },
    {
      label: 'Probabilidade máxima de precipitação',
      value: formatMetric(day.maxPrecipitationProbabilityPct, '%'),
    },
    { label: 'Umidade média', value: formatMetric(day.meanRelativeHumidityPct, '%') },
    { label: 'Vento máximo', value: formatMetric(day.maxWindSpeedKmh, 'km/h') },
  ];

  return (
    <article
      aria-labelledby={headingId}
      className="h-full min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h3 id={headingId} className="break-words font-semibold">
        <time dateTime={day.date}>{formatDayLabel(day.date)}</time>
      </h3>
      {condition.icon && (
        <span aria-hidden="true" className="mt-4 block text-[32px] text-sun sm:text-4xl">
          {condition.icon}
        </span>
      )}
      <p className="mt-2 break-words text-sm text-white/80">{condition.label}</p>
      <dl className="mt-4 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="break-words text-sm text-white/80">{metric.label}</dt>
            <dd className="break-words font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
