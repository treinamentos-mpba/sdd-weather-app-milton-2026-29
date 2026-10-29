interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryDisabled?: boolean;
  retryHint?: string;
}

export default function ErrorState({
  message,
  onRetry,
  retryDisabled = false,
  retryHint,
}: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white backdrop-blur-md">
      <p role="alert" className="break-words">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retryDisabled}
        className="mt-4 min-h-11 max-w-full break-words rounded-xl bg-accent-400 px-5 py-3 font-semibold text-night-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tentar novamente
      </button>
      {retryHint && <p className="mt-2 text-sm text-white/80">{retryHint}</p>}
    </div>
  );
}
