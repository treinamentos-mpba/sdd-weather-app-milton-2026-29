import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from '../../src/components/AppErrorBoundary';

describe('AppErrorBoundary', () => {
  it('substitui erro por fallback sanitizado e permite recuperação manual', async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let shouldFail = true;
    function Content() {
      if (shouldFail) throw new Error('sentinela-privada');
      return <p>Conteúdo recuperado</p>;
    }

    try {
      render(
        <AppErrorBoundary>
          <Content />
        </AppErrorBoundary>,
      );
      expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível exibir a aplicação.');
      expect(screen.queryByText(/sentinela-privada/)).not.toBeInTheDocument();
      shouldFail = false;
      await user.tab();
      expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(screen.getByText('Conteúdo recuperado')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});
