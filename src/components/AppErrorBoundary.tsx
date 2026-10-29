import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorState from './states/ErrorState';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <main className="mx-auto w-full max-w-6xl px-4 py-8">
          <h1 className="mb-6 text-3xl font-semibold">Previsão do tempo</h1>
          <ErrorState
            message="Não foi possível exibir a aplicação. Tente novamente."
            onRetry={resetErrorBoundary}
          />
        </main>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
