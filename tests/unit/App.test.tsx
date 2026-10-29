import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('exibe shell em pt-BR sem consultas ou dados fictícios', () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      render(<App />);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(
        screen.getByRole('heading', { level: 1, name: 'Previsão do tempo' }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Nenhuma consulta realizada/)).toBeInTheDocument();
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      fetchMock.mockRestore();
    }
  });
});
