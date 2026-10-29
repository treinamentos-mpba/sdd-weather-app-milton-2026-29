import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('expõe unidade controlada e permite alternar pelo teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    const celsius = screen.getByRole('radio', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('radio', { name: 'Fahrenheit' });
    expect(celsius).toBeChecked();
    await user.tab();
    expect(celsius).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(fahrenheit).toBeChecked();
    expect(celsius).not.toBeChecked();
  });
});
