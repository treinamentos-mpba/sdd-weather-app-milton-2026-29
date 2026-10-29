import { useId, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weather';
import type { Unit } from './types/weather';

const demoStates = [
  { value: 'idle', label: 'Inicial' },
  { value: 'loading', label: 'Carregando' },
  { value: 'empty', label: 'Sem resultados' },
  { value: 'error', label: 'Erro' },
  { value: 'success', label: 'Clima carregado' },
] as const;

type DemoState = (typeof demoStates)[number]['value'];

const location = mockWeatherData.location;
if (location.kind !== 'city') {
  throw new Error('A demonstração requer um mock de cidade.');
}
const city = location.city;

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [status, setStatus] = useState<DemoState>('success');
  const stateId = useId();
  const contentRef = useRef<HTMLElement>(null);

  function handleRetry() {
    setStatus('success');
    contentRef.current?.focus();
  }

  function handleSearch(query: string) {
    setStatus(
      query.trim().toLocaleLowerCase('pt-BR') === city.name.toLocaleLowerCase('pt-BR')
        ? 'success'
        : 'empty',
    );
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
            <span className="rounded-full border border-accent-400/30 bg-accent-400/10 px-3 py-1 text-sm text-white">
              Demonstração · dados fictícios
            </span>
          </div>
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <SearchBar onSearch={handleSearch} disabled={status === 'loading'} />
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
            <p className="max-w-xl">
              Explore o exemplo de Salvador. Busca local, sem API; estes dados fixos não são uma
              previsão real.
            </p>
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
              <label htmlFor={stateId}>Estado da demonstração</label>
              <select
                id={stateId}
                value={status}
                onChange={(event) => {
                  const state = demoStates.find((item) => item.value === event.target.value);
                  if (state) setStatus(state.value);
                }}
                className="min-h-11 max-w-full rounded-xl border border-white/50 bg-night-900 px-3 py-2 text-white"
              >
                {demoStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
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
          {status === 'idle' && (
            <EmptyState
              title="Qual é o seu próximo destino?"
              hint="Busque Salvador para explorar o exemplo de clima e previsão."
            />
          )}
          {status === 'loading' && (
            <LoadingState message="Carregamento simulado. Escolha outro estado para continuar." />
          )}
          {status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada nesta demonstração"
              hint="O exemplo contém somente Salvador. Busque esse nome para visualizar os dados."
            />
          )}
          {status === 'error' && (
            <ErrorState
              message="Falha simulada ao consultar o clima. Tente novamente para voltar ao exemplo."
              onRetry={handleRetry}
            />
          )}
          {status === 'success' && (
            <>
              <CurrentWeather city={city} current={mockWeatherData.current} unit={unit} />
              <ForecastList forecast={mockWeatherData.forecast} unit={unit} />
            </>
          )}
        </main>
        <footer className="mt-10 border-t border-white/10 pt-5 text-sm text-white/60">
          WeatherView · Protótipo de interface · Sem consultas ou preferências salvas.
        </footer>
      </div>
    </div>
  );
}
