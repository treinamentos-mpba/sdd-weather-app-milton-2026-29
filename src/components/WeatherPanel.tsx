import { getServiceErrorMessage } from '../lib/errors';
import type { WeatherState } from '../types/state';
import type { Unit } from '../types/weather';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';
import ErrorState from './states/ErrorState';
import LoadingState from './states/LoadingState';

interface WeatherPanelProps {
  state: WeatherState;
  unit: Unit;
  onRetry: () => void;
  canRetry: boolean;
  blocked: boolean;
}

export default function WeatherPanel({
  state,
  unit,
  onRetry,
  canRetry,
  blocked,
}: WeatherPanelProps) {
  const data = 'snapshot' in state ? state.snapshot : null;
  return (
    <div className="space-y-6">
      {state.status === 'loading' && <LoadingState message="Carregando o clima…" />}
      {state.status === 'error' && (
        <ErrorState
          message={`${data ? 'Não atualizados. ' : ''}${getServiceErrorMessage(state.error)}`}
          onRetry={onRetry}
          retryDisabled={!canRetry || blocked}
          retryHint={
            blocked
              ? 'Consulta do clima temporariamente bloqueada. Aguarde o prazo informado pelo serviço.'
              : !canRetry
                ? 'Selecione novamente uma cidade para consultar o clima.'
                : undefined
          }
        />
      )}
      {data && (
        <>
          {state.status === 'success' && <p role="status">Clima carregado.</p>}
          {data.partial && (
            <p className="rounded-xl border border-white/50 p-4">
              Dados parcialmente disponíveis. Alguns campos ou seções estão sem dados.
            </p>
          )}
          {!data.timeZone && <p>Fuso indisponível. Horários de conclusão apresentados em UTC.</p>}
          <p className="text-sm text-white/80">
            Consulta concluída em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
              timeZone: data.timeZone ?? 'UTC',
            }).format(data.completedAtMs)}{' '}
            ({data.timeZone ?? 'UTC'}).
          </p>
          {data.location.kind === 'city' && (
            <CurrentWeather city={data.location.city} current={data.current} unit={unit} />
          )}
          <ForecastList forecast={data.forecast} unit={unit} />
        </>
      )}
    </div>
  );
}
