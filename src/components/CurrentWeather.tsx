import { useId } from 'react';
import { formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData | null;
  unit: Unit;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCondition(current?.weatherCode ?? null);
  const metrics = [
    { label: 'Umidade', value: formatMetric(current?.relativeHumidityPct ?? null, '%') },
    { label: 'Vento', value: formatMetric(current?.windSpeedKmh ?? null, 'km/h') },
    { label: 'Precipitação atual', value: formatMetric(current?.precipitationMm ?? null, 'mm') },
    {
      label: 'Pressão ao nível do mar',
      value: formatMetric(current?.pressureMslHpa ?? null, 'hPa'),
    },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="break-words rounded-3xl border border-white/10 bg-white/5 p-6 font-sans text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="break-words text-2xl font-semibold">
        Clima em {city.name}
      </h2>
      <p className="mt-1 break-words text-white/80">
        {[city.region, city.country].filter(Boolean).join(', ')}
      </p>
      {current ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-4">
            {condition.icon && (
              <span aria-hidden="true" className="text-6xl text-sun">
                {condition.icon}
              </span>
            )}
            <p className="min-w-0 max-w-full break-words text-5xl font-semibold tracking-tight sm:text-8xl">
              <span className="sr-only">Temperatura: </span>
              {formatTemperature(current.temperatureC, unit)}
            </p>
          </div>
          <p className="mt-3 text-xl">{condition.label}</p>
          <p className="mt-1 text-white/80">
            Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
          </p>
        </div>
      ) : (
        <p className="mt-6">Condições atuais indisponíveis.</p>
      )}
      <dl className="mt-6 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <dt className="text-sm text-white/80">{metric.label}</dt>
            <dd className="mt-1 break-words text-lg font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm text-white/80">
        Estimativas meteorológicas, não garantias das condições. Dados:{' '}
        <a
          href="https://open-meteo.com/"
          className="rounded underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          Open-Meteo
        </a>{' '}
        (
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          className="rounded underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        >
          CC BY 4.0
        </a>
        ).{' '}
        {unit === 'fahrenheit'
          ? 'Temperaturas convertidas e arredondadas.'
          : 'Valores arredondados.'}
      </p>
    </section>
  );
}
