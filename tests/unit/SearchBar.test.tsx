import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it.each(['button', 'enter'])('envia a cidade com trim por %s', async (method) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    expect(screen.getByRole('search', { name: 'Buscar cidade' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Nome da cidade' }), ' São Paulo ');
    expect(onSearch).not.toHaveBeenCalled();

    if (method === 'button') {
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
    } else {
      await user.keyboard('{Enter}');
    }

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it.each(['', '   '])('não envia entrada vazia após trim: %j', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });

    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Informe o nome de uma cidade.');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome de uma cidade.');

    await user.type(input, 'Salvador');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('bloqueia envio quando disabled, mantendo o campo editável', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} disabled />);
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });
    const button = screen.getByRole('button', { name: 'Buscar' });

    await user.type(input, '東京');
    expect(input).toHaveValue('東京');
    expect(button).toBeDisabled();
    await user.keyboard('{Enter}');
    await user.click(button);
    expect(onSearch).not.toHaveBeenCalled();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    await user.click(button);
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('東京');
  });
});
