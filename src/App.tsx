import { useRef, useState } from 'react';
import QueryFeedback from './components/QueryFeedback';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import UnitToggle from './components/UnitToggle';
import WeatherPanel from './components/WeatherPanel';
import useWeather from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();
  const contentRef = useRef<HTMLElement>(null);

  function handleRetry() {
    void weather.retry();
    contentRef.current?.focus();
  }

  return (
    <div className="min-h-dvh break-words bg-gradient-to-br from-night-900 via-night-800 to-night-900">
      <a
        href="#weather-content"
        className="sr-only rounded-xl bg-accent-400 p-3 text-night-900 focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
              <span aria-hidden="true" className="rounded-2xl bg-sun/10 p-3 text-3xl">
                ☀
              </span>
              <div className="min-w-0 max-w-full break-words">
                <p className="text-xl font-semibold tracking-tight">WeatherView</p>
                <p className="text-sm text-white/70">Seu dia, com mais clareza.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <SearchBar
              onSearch={(query) => void weather.search(query)}
              disabled={weather.searchBlocked}
              busy={weather.searchState.status === 'loading'}
            />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
            <p className="max-w-xl">
              Busque uma cidade e escolha o resultado para consultar o clima. A busca é enviada ao
              Open-Meteo.
            </p>
          </div>
        </header>
        <main ref={contentRef} id="weather-content" tabIndex={-1} className="mt-10 space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent-400">
              Tempo de planejar
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Previsão do tempo</h1>
            <p className="mt-2 text-white/70">Uma visão simples do clima e dos próximos dias.</p>
          </div>
          {weather.searchState.status === 'idle' && weather.weatherState.status === 'idle' && (
            <EmptyState
              title="Qual é o seu próximo destino?"
              hint="Busque uma cidade para consultar o clima e a previsão de cinco dias."
            />
          )}
          <QueryFeedback
            state={weather.searchState}
            onSelect={(city) => void weather.selectCity(city)}
            onRetry={handleRetry}
            canRetry={weather.retryOperation === 'search'}
            blocked={weather.searchBlocked}
            selectionBlocked={weather.weatherBlocked}
          />
          <WeatherPanel
            state={weather.weatherState}
            unit={unit}
            onRetry={handleRetry}
            canRetry={weather.retryOperation === 'weather'}
            blocked={weather.weatherBlocked}
          />
        </main>
        <footer className="mt-10 border-t border-white/10 pt-5 text-sm text-white/60">
          WeatherView · Dados meteorológicos:{' '}
          <a className="underline" href="https://open-meteo.com/">
            Open-Meteo
          </a>{' '}
          · Localidades:{' '}
          <a className="underline" href="https://www.geonames.org/">
            GeoNames
          </a>{' '}
          · Sem preferências salvas.
        </footer>
      </div>
    </div>
  );
}
