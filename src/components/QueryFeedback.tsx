import { useId } from 'react';
import { getServiceErrorMessage } from '../lib/errors';
import type { SearchState } from '../types/state';
import type { City } from '../types/weather';
import EmptyState from './states/EmptyState';
import ErrorState from './states/ErrorState';
import LoadingState from './states/LoadingState';

interface QueryFeedbackProps {
  state: SearchState;
  onSelect: (city: City) => void;
  onRetry: () => void;
  canRetry: boolean;
  blocked: boolean;
  selectionBlocked: boolean;
}

function cityLabel(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(', ');
}

export default function QueryFeedback({
  state,
  onSelect,
  onRetry,
  canRetry,
  blocked,
  selectionBlocked,
}: QueryFeedbackProps) {
  const headingId = useId();
  if (state.status === 'idle') return null;
  if (state.status === 'loading') return <LoadingState message="Buscando cidades…" />;
  if (state.status === 'empty') {
    return (
      <EmptyState
        title="Nenhuma cidade encontrada"
        hint="Tente outra grafia ou uma cidade próxima."
      />
    );
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        message={getServiceErrorMessage(state.error)}
        onRetry={onRetry}
        retryDisabled={!canRetry || blocked}
        retryHint={
          blocked
            ? 'Busca temporariamente bloqueada. Aguarde o prazo informado pelo serviço.'
            : !canRetry
              ? 'Faça uma nova busca para consultar este serviço.'
              : undefined
        }
      />
    );
  }
  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <h2 id={headingId} className="text-xl font-semibold">
        Escolha uma cidade
      </h2>
      <p role="status">
        {state.cities.length} resultado(s) para “{state.query}”. Selecione uma cidade para ver o
        clima.
        {state.partial && ' Alguns resultados inválidos foram descartados.'}
      </p>
      {selectionBlocked && (
        <p>Seleção temporariamente bloqueada pelo limite de consultas do clima. Aguarde.</p>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {state.cities.map((city) => {
          const label = cityLabel(city);
          const ambiguous = state.cities.filter((item) => cityLabel(item) === label).length > 1;
          return (
            <li key={city.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(city)}
                disabled={ambiguous || selectionBlocked}
                className="min-h-11 w-full break-words rounded-xl border border-white/50 bg-white/5 px-4 py-3 text-left text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {label}
              </button>
              {ambiguous && (
                <p className="mt-1 text-sm text-white/80">
                  Resultados indistinguíveis. Busque um termo mais específico.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
