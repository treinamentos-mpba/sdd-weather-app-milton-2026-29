import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

describe('App', () => {
  it('exibe layout completo com cinco dias e identifica o mock sem chamadas de rede', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    try {
      render(<App />);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      expect(
        screen.getByRole('heading', { level: 1, name: 'Previsão do tempo' }),
      ).toBeInTheDocument();
      expect(screen.getByText('WeatherView')).toBeInTheDocument();
      expect(screen.getByText('Demonstração · dados fictícios')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Clima em Salvador' })).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(5);
      const content = within(screen.getByRole('main'));
      expect(content.getAllByText(/°C/)).toHaveLength(12);
      await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));
      expect(content.getAllByText(/°F/)).toHaveLength(12);
      expect(content.queryByText(/°C/)).not.toBeInTheDocument();
      expect(screen.getByText('83,1 °F', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('0,4 mm')).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      fetchMock.mockRestore();
    }
  });

  it('alterna estados sem mostrar sucesso junto de loading, vazio ou erro', async () => {
    const user = userEvent.setup();
    render(<App />);
    const selector = screen.getByRole('combobox', { name: 'Estado da demonstração' });
    await user.selectOptions(selector, 'idle');
    expect(screen.getByRole('status')).toHaveTextContent('Qual é o seu próximo destino?');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();

    await user.selectOptions(selector, 'loading');
    expect(screen.getByRole('status')).toHaveTextContent('Carregamento simulado');
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });
    await user.type(input, 'Salvador');
    expect(input).toHaveValue('Salvador');
    await user.click(screen.getByRole('radio', { name: 'Fahrenheit' }));

    await user.selectOptions(selector, 'empty');
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await user.selectOptions(selector, 'error');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Falha simulada');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(within(screen.getByRole('main')).getAllByText(/°F/)).toHaveLength(12);
  });

  it('busca somente a cidade do exemplo e mantém o foco no campo', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Nome da cidade' });
    await user.type(input, 'Recife{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('O exemplo contém somente Salvador');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    await user.clear(input);
    await user.type(input, ' salvador {Enter}');
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(input).toHaveFocus();
  });
});
