import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  busy?: boolean;
}

export default function SearchBar({ onSearch, disabled = false, busy = false }: SearchBarProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [city, setCity] = useState('');
  const [showError, setShowError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const query = city.trim();
    if (!query) {
      setShowError(true);
      return;
    }

    setShowError(false);
    onSearch(query);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      aria-busy={busy}
      onSubmit={handleSubmit}
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        Nome da cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={inputId}
          type="text"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setShowError(false);
          }}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          placeholder="Ex.: Salvador"
          className="min-w-0 w-full flex-1 rounded-xl border border-white/50 bg-night-900 px-4 py-3 text-white placeholder:text-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-accent-400 px-5 py-3 font-semibold text-night-900 enabled:hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {showError && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-white">
          Informe o nome de uma cidade.
        </p>
      )}
    </form>
  );
}
