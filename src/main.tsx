import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Elemento raiz #root não encontrado.');
}

createRoot(container, {
  onCaughtError: () => {
    console.error('Falha inesperada de renderização.');
  },
}).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
