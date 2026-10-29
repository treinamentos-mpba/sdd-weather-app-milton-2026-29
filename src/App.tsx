export default function App() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-semibold sm:text-4xl">Previsão do tempo</h1>
      <p className="mt-4 text-white/80">
        Consulte o clima atual e a previsão para os próximos cinco dias.
      </p>
      <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        Nenhuma consulta realizada. A busca por cidades estará disponível em breve.
      </p>
    </main>
  );
}
