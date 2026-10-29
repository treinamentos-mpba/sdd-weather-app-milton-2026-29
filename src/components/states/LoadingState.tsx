interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando…' }: LoadingStateProps) {
  return (
    <p
      role="status"
      className="break-words rounded-2xl border border-white/10 bg-white/5 p-4 font-sans text-white backdrop-blur-md"
    >
      {message}
    </p>
  );
}
