import { useId } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const name = useId();

  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 max-w-full text-sm text-white/80">Unidade de temperatura</legend>
      <div className="inline-flex gap-1 rounded-xl border border-white/50 bg-night-900 p-1">
        {[
          { value: 'celsius', label: 'Celsius', symbol: '°C' },
          { value: 'fahrenheit', label: 'Fahrenheit', symbol: '°F' },
        ].map((option) => (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={unit === option.value}
              onChange={() => onChange(option.value === 'celsius' ? 'celsius' : 'fahrenheit')}
              className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span className="pointer-events-none flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 py-2 text-white/80 peer-checked:bg-accent-400 peer-checked:font-semibold peer-checked:text-night-900 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-400">
              <span className="sr-only">{option.label}</span>
              <span aria-hidden="true">{option.symbol}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
