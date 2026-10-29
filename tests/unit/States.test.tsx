import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('Estados de apresentação', () => {
  it('apresenta loading em uma única região de status e permite personalizar a mensagem', () => {
    const { rerender } = render(<LoadingState />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando…');

    rerender(<LoadingState message="Buscando cidades…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades…');
    expect(screen.queryByText('Carregando…')).not.toBeInTheDocument();
  });

  it('apresenta título e dica de vazio juntos, sem indicar falha', () => {
    render(
      <EmptyState
        title="Nenhuma cidade encontrada"
        hint="Confira a grafia ou tente outra cidade."
      />,
    );
    const status = screen.getByRole('status');
    expect(
      within(status).getByRole('heading', { level: 2, name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(within(status).getByText('Confira a grafia ou tente outra cidade.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it.each([
    'clique',
    'teclado',
  ])('anuncia erro e aciona retry somente por %s, sem submeter formulário', async (method) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ErrorState message="Não foi possível consultar o clima." onRetry={onRetry} />
      </form>,
    );
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível consultar o clima.');
    const button = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(within(screen.getByRole('alert')).queryByRole('button')).not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();

    if (method === 'clique') {
      await user.click(button);
    } else {
      await user.tab();
      expect(button).toHaveFocus();
      await user.keyboard('{Enter}');
    }

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('preserva foco e substitui a região anunciável ao mudar o estado', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <>
        <label>
          Cidade
          <input />
        </label>
        <LoadingState />
      </>,
    );
    const input = screen.getByRole('textbox', { name: 'Cidade' });
    await user.click(input);
    rerender(
      <>
        <label>
          Cidade
          <input />
        </label>
        <ErrorState message="Consulta indisponível." onRetry={vi.fn()} />
      </>,
    );
    expect(input).toHaveFocus();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });
});
