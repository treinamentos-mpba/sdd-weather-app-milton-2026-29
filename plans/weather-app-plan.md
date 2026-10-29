# Weather App — Plano Técnico

Fonte da verdade: [weather-app-spec.md](../specs/weather-app-spec.md). Este documento define decisões e contratos, não a implementação final. O escopo continua sendo o MVP não comercial, sem backend, autenticação, cache persistente ou SLA. A implementação depende da próxima etapa de Tasks.

## Architecture

Uma SPA de tela única com três responsabilidades: apresentação, coordenação de estado e acesso a recursos externos. Sem router, estado global de terceiros, backend intermediário ou camada de repositórios.

```text
Componentes React
        ↕ props e ações
Hook controlador + reducer local
        ↕ contratos de domínio
Serviços de geocoding / forecast / localização / preferências
        ↕
Open-Meteo HTTPS / APIs do navegador

Funções puras: validação, normalização, datas, unidades e códigos WMO
```

| Decisão | Responsabilidade e rastreabilidade |
|---|---|
| Uma tela sem navegação por coordenadas ou cidade | Busca, seleção, consulta e preferências no mesmo fluxo; evita expor localização na URL. RF-01 a RF-08, RNF-06. |
| Componentes recebem dados normalizados | Não conhecem JSON do provedor nem fazem fetch. RF-02/RF-03, EC-10 a EC-14. |
| Controlador local coordena efeitos e intenções | Busca independente da consulta meteorológica; respostas antigas não substituem intenção vigente. RF-05/RF-08, EC-15 a EC-17, EC-32/EC-33. |
| Adaptadores pequenos para navegador e provedor | Limites de validação e falha explícitos, substituíveis nos testes sem framework de injeção. RF-01/RF-05/RF-06/RF-07. |
| Estado meteorológico somente em memória | Atualização com erro pode preservar dados da mesma localização, sem persistir previsão. RF-05/RF-08, EC-25/EC-26. |

`App` compõe busca, resultados, controles de unidade/localização/atualização, preferências lembradas, condições atuais, cinco cartões diários e mensagens. Componentes de aviso/atribuição são compartilhados, sem modal desnecessário. HTML semântico, foco estável e estados anunciados são parte da arquitetura de apresentação, não acabamento posterior (RNF-01/RNF-02).

## Tech Stack

Usar versões já declaradas em `package.json` e o lockfile; não atualizar dependências nesta fase.

| Tecnologia | Justificativa | Requisitos |
|---|---|---|
| TypeScript strict | Tipos discriminados e validação de dados externos como `unknown`; sem `any`. | RF-02/RF-03/RF-05, RNF-06. |
| React + Vite | SPA pequena e build estático; sem SSR ou framework adicional. | RF-01 a RF-08, RNF-03. |
| Tailwind CSS | Tema dark glassmorphism conforme convenção do projeto, com contraste verificável e layout responsivo. | RNF-01/RNF-02. |
| Fetch, AbortController, URL/URLSearchParams | Integração direta, timeout e encoding sem SDK ou cliente HTTP adicional. | RF-01/RF-05, EC-03/EC-07. |
| Intl.DateTimeFormat / Intl.NumberFormat | pt-BR, fuso IANA e exibição localizada sem biblioteca de datas inicialmente. | RF-03/RF-04/RF-08, RNF-05. |
| Geolocation API e localStorage | Localização sob ação explícita e somente preferências mínimas persistidas. | RF-06/RF-07. |
| Vitest + Testing Library; Playwright | Funções, componentes e fluxos reais com respostas controladas. | Todos os CA/EC e RNFs. |
| pnpm + Biome | Fluxo existente de dependências, lint e formatação. | Manutenibilidade e checklist de entrega da spec. |

Não adicionar Redux, biblioteca de cache, service worker, geocodificação reversa, biblioteca de componentes ou validação de schema como dependência por padrão. Guards pequenos e funções puras cobrem o contrato atual; reavaliar somente com necessidade comprovada.

## Project Structure

Estrutura proposta; arquivos serão criados apenas nas fases Code/Test:

```text
src/
  App.tsx
  main.tsx
  index.css
  components/
    CitySearch.tsx
    CityResults.tsx
    LocationButton.tsx
    TemperatureToggle.tsx
    PreferencesPanel.tsx
    WeatherPanel.tsx
    CurrentWeatherCard.tsx
    ForecastDayCard.tsx
    QueryFeedback.tsx
    WeatherAttribution.tsx
  hooks/
    useWeatherApp.ts
    weatherReducer.ts
  services/
    http.ts
    geocoding.ts
    forecast.ts
    geolocation.ts
    preferences.ts
  types/
    weather.ts
    errors.ts
    state.ts
  utils/
    validation.ts
    normalizeWeather.ts
    dates.ts
    units.ts
    weatherCodes.ts
tests/
  unit/
  components/
  e2e/
  fixtures/
```

Um componente por arquivo; serviços não importam React. Tipos comuns ficam em `types/`; funções puras, incluindo reducer, não acessam rede, relógio ou armazenamento. Relógio e chamadas são fornecidos nos pontos de efeito para controle nos testes. Não criar classes ou interfaces de infraestrutura que não tenham consumidor concreto.

## Data Model

Contratos TypeScript propostos; declarações não representam código de produção. Campos numéricos de domínio são finitos e validados, mantidos na precisão de origem. `null` significa indisponível, nunca zero.

```ts
type Unit = 'celsius' | 'fahrenheit'; // Preferência de apresentação.
type LocalDate = string; // Data local válida no formato YYYY-MM-DD.
type EpochMs = number; // Instante em milissegundos desde Unix epoch.
type IanaTimeZone = string; // Nome de fuso validado, como America/Bahia.

interface Coordinates {
  latitude: number; // Latitude WGS84 em graus.
  longitude: number; // Longitude WGS84 em graus.
}

interface CityIdentity {
  name: string; // Nome retornado pelo geocoding.
  region: string | null; // Região/estado, proveniente de admin1.
  country: string | null; // País, quando disponível.
}

interface City extends CityIdentity {
  id: number; // Identificador da localidade no geocoding.
  coordinates: Coordinates; // Coordenadas para consultar a previsão.
  timeZone: IanaTimeZone | null; // timezone do geocoding, se válido.
}

type WeatherLocation =
  | { kind: 'city'; city: City }
  | { kind: 'device'; coordinates: Coordinates };

type WeatherCode =
  | 0 | 1 | 2 | 3 | 45 | 48 | 51 | 53 | 55 | 56 | 57
  | 61 | 63 | 65 | 66 | 67 | 71 | 73 | 75 | 77
  | 80 | 81 | 82 | 85 | 86 | 95 | 96 | 99;

interface CurrentWeather {
  temperatureC: number | null; // current.temperature_2m, em Celsius.
  apparentTemperatureC: number | null; // current.apparent_temperature, em Celsius.
  weatherCode: WeatherCode | null; // current.weather_code reconhecido (WMO).
  relativeHumidityPct: number | null; // current.relative_humidity_2m, em %.
  windSpeedKmh: number | null; // current.wind_speed_10m, em km/h.
  referenceTimeMs: EpochMs | null; // current.time normalizado; não é medição de estação.
}

interface ForecastDay {
  date: LocalDate; // daily.time: dia no calendário da localização.
  weatherCode: WeatherCode | null; // daily.weather_code: condição mais severa.
  minTemperatureC: number | null; // daily.temperature_2m_min, em Celsius.
  maxTemperatureC: number | null; // daily.temperature_2m_max, em Celsius.
  maxPrecipitationProbabilityPct: number | null; // daily.precipitation_probability_max, em %.
  meanRelativeHumidityPct: number | null; // daily.relative_humidity_2m_mean, em %.
  maxWindSpeedKmh: number | null; // daily.wind_speed_10m_max, em km/h; não é rajada.
}

interface WeatherData {
  location: WeatherLocation; // Alvo solicitado; não a coordenada da grade do modelo.
  timeZone: IanaTimeZone | null; // timezone validado da resposta de previsão.
  periodStart: LocalDate | null; // Primeiro dia do período recebido.
  current: CurrentWeather | null; // Condições atuais; null se seção indisponível.
  forecast: readonly ForecastDay[]; // Cinco dias ou [] sem período local válido.
  completedAtMs: EpochMs; // Conclusão da consulta utilizável, não horário do modelo.
  partial: boolean; // Indica campos ou seções indisponíveis.
}

interface Preferences {
  city?: CityIdentity; // Última cidade manual lembrada, sem ID ou coordenadas.
  unit?: Unit; // Unidade escolhida; ausente significa Celsius padrão.
}
```

`LocalDate` é validada como data real `YYYY-MM-DD`; `EpochMs` é um instante finito; `IanaTimeZone` deve ser aceito por `Intl`. Os aliases não substituem validação em runtime. Coordenadas devem estar em latitude −90 a 90 e longitude −180 a 180.

`Unit` representa a preferência da UI, não a unidade dos campos de origem: os campos com sufixo `C` permanecem em Celsius. Na fronteira de armazenamento, mapear `celsius`/`fahrenheit` para `C`/`F` e vice-versa, preservando o contrato de persistência da spec.

Invariantes (RF-02/RF-03/RF-07/RF-08):

- `City.id` e coordenadas existem apenas em memória. Persistir somente projeção explícita para `CityIdentity`, nunca serializar `City` ou `WeatherData`.
- Fuso válido e início de período conhecido produzem exatamente cinco `ForecastDay`, incluindo dias sem dados; fuso/período não determinável produz `forecast: []` e aviso de seção indisponível. Condições atuais válidas ainda podem ser exibidas.
- `current: null` significa seção sem campo meteorológico utilizável. Na previsão, placeholders não contam como campos utilizáveis. Sem campo utilizável em ambas as seções, retornar erro, não `WeatherData`.
- Temperaturas são Celsius de origem. Conversões e arredondamento ocorrem somente para apresentação. Código desconhecido vira condição indisponível e resposta parcial.
- Conferir unidades recebidas; valores em unidades ausentes ou incompatíveis não são presumidos como Celsius/km/h. Invalidar os campos afetados e sinalizar parcial.
- Arrays diários com tamanho diferente de `daily.time` invalidam somente a série afetada. Invalidar todas as posições de uma data duplicada; ignorar datas inválidas ou fora do período; não deslocar valores.
- Porcentagens fora de 0–100, vento negativo e valores não finitos viram `null`. Zero e temperaturas negativas permanecem válidos. Não corrigir inconsistência entre mínima/máxima trocando os valores silenciosamente.
- Horário de sucesso é de resposta utilizável aceita pela intenção vigente. Consulta parcial nova substitui o snapshot da resposta anterior; não completar buracos com valores antigos.

Contratos de falha e serviços:

```ts
type ServiceName = 'geocoding' | 'forecast' | 'geolocation' | 'preferences';
type ErrorKind =
  | 'network' | 'http' | 'timeout' | 'rate-limit' | 'invalid-response'
  | 'permission-denied' | 'unavailable'
  | 'storage-read' | 'storage-write' | 'storage-remove';

interface AppError {
  kind: ErrorKind;
  service: ServiceName;
  retryAtMs: EpochMs | null;
  status: number | null;
}

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: AppError };

interface RequestContext {
  signal: AbortSignal;
  now: () => EpochMs;
}

interface PreferenceRead {
  value: Preferences;
  discarded: readonly ('city' | 'unit')[];
}

interface CitySearchResult {
  cities: readonly City[];
  partial: boolean;
}

interface WeatherServices {
  searchCities(
    query: string, context: RequestContext
  ): Promise<Result<CitySearchResult>>;
  fetchWeather(
    location: WeatherLocation, context: RequestContext
  ): Promise<Result<WeatherData>>;
  locate(context: RequestContext): Promise<Result<Coordinates>>;
  readPreferences(): Result<PreferenceRead>;
  writePreferences(value: Preferences): Result<void>;
  clearPreferences(): Result<void>;
}
```

Assinaturas podem ser exportações de funções, sem implementar uma classe `WeatherServices`. Cancelamento por supersessão não é erro notificável: a camada coordenadora descarta o resultado por token/signal. Erros reais seguem `Result`; exceções inesperadas não viram listas vazias ou sucessos simulados. `AppError` não armazena query, URL, coordenadas, corpo da resposta nem mensagem bruta do provedor (RNF-06).

## Data Flow

1. **Abertura (RF-07):** ler preferências, validar cada campo independentemente, restaurar unidade ou Celsius e mostrar cidade lembrada para confirmação. Nenhuma chamada de rede/localização. Falha de leitura é anunciada sem bloquear a tela.
2. **Busca (RF-01):** envio explícito, trim externo, validar vazio; iniciar intenção de busca, limpar resultados antigos e chamar geocoding. Exibir até dez resultados, sem seleção automática. Resultado vazio não é erro de rede.
3. **Seleção manual (RF-02/RF-03/RF-07):** registrar local escolhido, persistir somente sua identidade por ação explícita e iniciar uma consulta meteorológica. Escrita falha não bloqueia a consulta. Nova busca textual não invalida este fluxo.
4. **Localização (RF-06):** texto prévio explica Open-Meteo, IP/coordenadas e termos. Clique inicia nova intenção meteorológica; obter coordenadas com limite de 10 s e depois previsão com outro limite de 10 s. Usar “Sua localização”, sem reverse geocoding nem persistência da coordenada; conservar a última cidade manual lembrada.
5. **Normalização (RF-02/RF-03/RF-05):** serviço recebe JSON como `unknown`, valida envelope, unidades, fuso e séries; produz campos válidos, ausência explícita ou erro total. Só o controlador confirma o resultado se o token continuar vigente.
6. **Atualização (RF-08):** consultar novamente o alvo vigente; manter dados visíveis da mesma localização enquanto carrega e, em falha, marcar “Não atualizados”. Ao selecionar outro alvo, remover snapshot antigo da área de dados para não confundir localidades.
7. **Unidade (RF-04):** alterar preferência e apresentação local; persistir somente a preferência explicitamente alterada. Nenhuma nova requisição.
8. **Restaurar cidade (RF-07):** confirmar dispara busca por nome salvo; região/país são contexto visual para decisão, não heurística de seleção automática. Exigir seleção explícita mesmo com um único resultado.
9. **Apagar (RF-07):** remover somente chave própria; após sucesso, limpar identidade lembrada e unidade persistida, usar Celsius e manter consulta visível se houver. Respostas pendentes e atualização não escrevem preferências; nova escolha salva somente o campo escolhido.
10. **Passagem do tempo (RF-03/RF-08):** relógio local de apresentação, sem fetch periódico, recalcula idade e mudança de dia. Reavaliar ao retornar à aba; timers suspensos pelo navegador não disparam atualização meteorológica.

## External APIs

### Geocoding — RF-01

`GET https://geocoding-api.open-meteo.com/v1/search`

| Parâmetro | Contrato |
|---|---|
| `name` | Termo com trim externo; URLSearchParams, sem concatenação manual. |
| `count` | `10`. |
| `language` | `pt`. |
| `format` | `json`. |
| País / chave | Não enviar `countryCode` ou API key. |

Resposta esperada: objeto JSON com `results` opcional. Ausência de `results` ou lista vazia em sucesso sem envelope de erro significa vazio documentado; tipo inválido ou `error: true` significa falha, nunca vazio.

Cada resultado precisa de nome, identificador e coordenadas válidos para consulta; campos opcionais ausentes viram `null`. Itens inválidos não ficam selecionáveis; informar resposta parcial de busca se houver itens descartados. Se havia resultados mas nenhum é utilizável, retornar `invalid-response`. Preservar ordem dos válidos, limitados a dez. Se rótulos nome/região/país forem indistinguíveis, sinalizar limitação nesses itens e pedir termo mais específico, sem autoescolha (EC-05).

### Forecast — RF-02/RF-03/RF-08

`GET https://api.open-meteo.com/v1/forecast`

| Parâmetro | Valor |
|---|---|
| `latitude`, `longitude` | Coordenadas do resultado selecionado ou do dispositivo, somente na requisição ao provedor. |
| `current` | `temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m`. |
| `daily` | `weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max`. |
| `forecast_days` | `5`. |
| `timezone` | `auto`. |
| `temperature_unit` | `celsius`. |
| `wind_speed_unit` | `kmh`. |
| `timeformat` | `iso8601`: datas diárias mantidas como rótulos locais. |

Origem: `current`, `current_units`, `daily`, `daily_units`, `timezone`. JSON externo é `unknown`; não expor DTO bruto nos componentes.

- Referência atual com offset é convertida em instante; sem offset, resolver no fuso IANA retornado somente quando há uma correspondência única. O helper deve verificar a volta para os mesmos componentes locais, considerando offsets antes/depois de transições; zero ou múltiplos instantes correspondentes produzem `null`. Nunca usar `new Date` sobre data local sem offset presumindo fuso do dispositivo. Não aplicar `utc_offset_seconds` fixo a todo o período.
- Datas diárias válidas e ordenadas definem a data inicial recebida. Se o início estiver ausente, converter o instante capturado no início da requisição para a data local do fuso válido retornado para construir placeholders, sem associar valores a datas inexistentes. Sem fuso válido, previsão indisponível, conforme EC-43.
- Mapeamento de campo e texto WMO segue integralmente a tabela/lista da spec. Nenhuma agregação horária, estimação local ou failover.

### Transporte e navegador — RF-05/RF-06, RNF-06

Fetch direto via HTTPS, sem credenciais, com `cache: 'no-store'`, sem redirecionar para origem arbitrária e `referrerPolicy: 'no-referrer'`. Não enviar query/localização a endpoints de diagnóstico. Endpoints são constantes, parâmetros nunca vêm de uma URL externa fornecida pela pessoa.

O limite de 10 s inclui fetch, leitura do corpo e normalização; conferir prazo/token também antes de aceitar o resultado. Geolocation API usa limite explícito coordenado de 10 s, `maximumAge: 0` e sem exigir alta precisão. Callback posterior a timeout ou seleção manual é ignorado, mesmo que o navegador mantenha o prompt de permissão.

HTTP 429 pode não expor `Retry-After` ao JavaScript por CORS: ausência/inacessibilidade segue EC-09, sem criar proxy apenas para esse cabeçalho. Quando legível, interpretar segundos inteiros não negativos ou data HTTP; bloquear somente o serviço afetado até o prazo, em memória. Sem indicação documentada de limite compartilhado, não bloquear o outro serviço. Expirar prazo não faz chamada automática.

Atribuir Open-Meteo/CC BY 4.0 e GeoNames e manter aviso de estimativas conforme CA-02.3/EC-41. Reconferir licença e uso não comercial antes de publicar; sem chave embutida no bundle.

## State Management

Estado em `useWeatherApp`, com `useReducer` e efeitos explícitos; componentes mantêm apenas detalhes visuais não compartilhados. Sem Context enquanto uma árvore com props for suficiente.

```ts
type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; cities: readonly City[]; partial: boolean }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: AppError };

interface WeatherState {
  status: 'idle' | 'locating' | 'loading' | 'ready' | 'error';
  target: WeatherLocation | null;
  snapshot: WeatherData | null;
  error: AppError | null;
  refreshFailed: boolean;
}

interface AppState {
  search: SearchState;
  weather: WeatherState;
  unit: Unit;
  preferences: Preferences;
  preferenceFeedback: string | null;
  geocodingBlockedUntilMs: EpochMs | null;
  forecastBlockedUntilMs: EpochMs | null;
  nowMs: EpochMs;
}
```

Invariantes do reducer:

- Estado inicial sem cidade ativa; preferências não são seleção confirmada. `ready` requer snapshot utilizável e nenhum erro ativo da consulta; resposta parcial é `ready` com `partial`.
- Em refresh do mesmo alvo, `loading` ou `error` podem manter snapshot; `refreshFailed` só marca falha de atualização, sem reescrever `completedAtMs`. Em mudança de alvo, limpar snapshot; `locating` não tem alvo conhecido nem snapshot anterior na área meteorológica.
- Referência futura/ausente gera atualidade desconhecida; idade acima de 60 min e período anterior são valores derivados de `nowMs`, não duplicados no snapshot. Um tick por minuto e evento de retorno à aba atualizam somente apresentação.
- Controlador mantém dois tokens incrementais e dois contextos de cancelamento: busca e intenção meteorológica. Geolocalização e forecast compartilham o token meteorológico, mas têm prazos próprios. Cancelar requisição antiga não substitui verificação de token antes de commit.
- Duplicatas só são ignoradas enquanto a mesma operação/parâmetros estiverem pendentes. Mudança de termo/alvo pode superseder; quando terminou, nova tentativa manual é permitida, salvo bloqueio por rate limit.
- Escritas de preferências partem exclusivamente de ações explícitas de cidade/unidade/exclusão, nunca de efeito genérico que observa snapshot ou unidade. Restaurar valores, refresh e respostas tardias não recriam valores apagados.

## Error Handling

| Condição | Estado e ação | Rastreabilidade |
|---|---|---|
| Vazio após trim | Erro de validação associado ao campo, nenhuma chamada. | EC-01. |
| Geocoding vazio válido | `empty`, orientação para nova busca; sem erro de rede. | CA-05.2, EC-04. |
| Falha de rede, HTTP 4xx/5xx, JSON inválido | `error` com mensagem pt-BR por categoria e nova tentativa manual. Não expor corpo/URL original. | CA-05.3, EC-06, RNF-06. |
| Timeout | Erro aos 10 s, liberar interação; descartar resultado posterior e nunca retry automático. | EC-07/EC-33. |
| Rate limit | Mensagem e bloqueio do serviço até `retryAtMs`, quando válido. Prazo passado não cria espera. | EC-08/EC-09/EC-39. |
| Campo/série inválida | `null`, “Sem dados” e aviso parcial; preservar outros campos associáveis. | EC-10 a EC-14, EC-36/EC-43. |
| Nenhuma seção utilizável | Falha total; não criar horário de sucesso. | EC-13. |
| Negação/ausência de localização | Mensagem, busca manual disponível; sem novo prompt automático. | CA-06.3, EC-18. |
| Armazenamento inválido/falha | Preservar campos válidos e escolhas na sessão; informar leitura, escrita ou exclusão que falhou. | EC-22/EC-37/EC-38. |
| Erro de refresh do mesmo local | Preservar snapshot da sessão com “Não atualizados”, horários anteriores e ação manual. | EC-25. |
| Resultado superado | Não alterar UI, preferências, horários nem loading vigente; sem notificação de cancelamento deliberado. | EC-15/EC-17/EC-33. |

Usar mensagens de domínio centralizadas em pt-BR, com região de status anunciada e área de erro acessível. Não mover foco por chegada de resposta; busca permanece focada no cenário EC-29. Botões de repetição bloqueados por prazo expõem o motivo em texto acessível. Se o elemento focado deixar de existir após ação explícita, encaminhar para controle equivalente do fluxo.

Falhas inesperadas de renderização devem apresentar tela recuperável sem stack trace ou dados pessoais na UI; usar uma fronteira de erro React única na raiz, sem tratar exceção como consulta bem-sucedida. Não adicionar infraestrutura de telemetria.

## Testing Strategy

A matriz da spec é o índice de cobertura: identificar testes por CA/EC. Um cenário compartilhado é testado uma vez no nível mais apropriado e integrado aos fluxos consumidores, sem exigir duplicação por story.

| Nível | Casos e técnica | Referências |
|---|---|---|
| Unitário — domínio | Guards de `unknown`, zero/null, domínios, séries curtas/duplicadas, cinco datas, WMO, arredondamento negativo/empates e conversão sem acumular erro. Fixtures com saída esperada. | RF-02/RF-03/RF-04; EC-10 a EC-14, EC-20/EC-21/EC-34/EC-36/EC-40/EC-43. |
| Unitário — serviços | Fetch substituído, erros HTTP, resposta vazia documentada, deadlines, cabeçalho ausente/segundos/data, coordenadas e persistência mínima. | RF-01/RF-05/RF-06/RF-07; EC-03/EC-06 a EC-09/EC-19/EC-22/EC-37/EC-39. |
| Unitário — coordenação | Reducer e hook com promessas controladas e fake timers: respostas fora de ordem, token expirado, cancelamento e não recriação de preferência apagada. | EC-15 a EC-17/EC-24/EC-25/EC-32/EC-33/EC-38. |
| Componentes | Testing Library por roles/labels: lista, cinco cartões, campos ausentes, avisos, atribuição, controles e estados; interação por teclado. | Todos os CA; EC-01/EC-02/EC-04/EC-05/EC-23/EC-29/EC-30/EC-35/EC-41/EC-42. |
| E2E | Playwright com rotas controladas de geocoding/forecast, permissões e geolocation simuladas; reload e inspeção de armazenamento/tráfego. Sem depender do clima real no CI. | US-01 a US-08, EC-07/EC-18/EC-24/EC-26/EC-31/EC-44. |
| Visual/assistivo manual | Layout nas cinco larguras da spec, zoom 200%, contraste, NVDA/Chrome e VoiceOver/Safari, foco e anúncios. Emulação WebKit não comprova Safari real. | RNF-01/RNF-02/RNF-07. |
| Performance | Build de produção; 100 buscas e 100 forecasts por perfil com fixtures dez cidades/cinco dias e entrega após 500 ms. p95 pelo 95º valor ordenado ≤ 3 s por grupo. | RNF-03 e protocolo da spec. |

Playwright cobre Chromium, Firefox e WebKit automaticamente; complementar com Edge/Chrome no Windows 11, Safari macOS/iOS e Chrome Android nas versões estáveis exigidas no aceite. Registrar versão, máquina e evidência, sem substituir matriz real por emulação.

Para performance, usar controle de rede/CPU do Chromium: 10 Mbps em ambos os sentidos, 100 ms adicionais, 390 × 844/CPU 4× no móvel e 1366 × 768/sem desaceleração no desktop. Verificar que a limitação realmente afeta as respostas controladas; se interceptação de teste contornar o throttling, servir fixtures via transporte de teste limitado, não aceitar medição sem limitação. Cronometrar acionamento até commit visual completo/parcial utilizável. Erros e timeouts são grupos separados; consulta live por perfil registra integração/latência, sem integrar p95 controlado.

Testes de data usam instantes, fuso IANA e valores explícitos da spec; incluir referência ambígua em transição de horário, virada de dia com requisição em andamento e retorno à aba. Avançar relógio não pode causar fetch periódico.

Comandos de entrega existentes: `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`. `pnpm check` complementa formatação; usar os comandos selecionados conforme os arquivos alterados. Auditoria de dependências de produção com `pnpm audit --prod` e triagem documentada antes de publicar. Esta fase documental não executa build ou testes de implementação.

Sem nova ferramenta de acessibilidade por padrão: começar pelas verificações manuais e ferramentas existentes; escolher scanner automatizado no trabalho de testes conforme exigência da spec, sem tratá-lo como certificação isolada.

## Risks & Trade-offs

| Decisão/risco | Trade-off e mitigação | Spec |
|---|---|---|
| API direta, sem backend | Menos operação e nenhum segredo, mas CORS, quota e latência externos não são controlados. Tratar limites e indisponibilidade, sem SLA/failover. | RF-05, RNF-03/RNF-04/RNF-06. |
| JSON validado manualmente | Evita dependência para poucos contratos, mas guards podem omitir casos. Testes com fixtures malformadas e normalizador único. | EC-10 a EC-14/EC-43. |
| Intl sem biblioteca de datas | Menor bundle; referência local ambígua exige helper cuidadoso. Aceitar “Atualidade desconhecida”, nunca adivinhar um instante. | RF-03/RF-08, EC-20/EC-28. |
| Nome/região sem ID persistido | Privacidade e aderência à spec, mas retorno exige geocoding e confirmação, podendo não resolver o mesmo local. Não restaurar automaticamente homônimo. | RF-07, EC-23/EC-42. |
| Sem cache e sem retry automático | Mais simples e evita dados antigos/tentativas em cascata; exige conexão e ação manual. Preservar apenas snapshot visível da mesma sessão em falha. | RF-05/RF-08, EC-25/EC-26. |
| Dados parciais | Mantém utilidade sem mascarar falha estrutural. Avisos e domínio validado; remoção permanente de campo exige revisão, não placeholder eterno. | RF-02/RF-03, EC-36. |
| Políticas de privacidade externas | Cliente não controla logs do provedor/hospedagem. Informação explícita, HTTPS, sem logs próprios com localização, publicação condicionada ao checklist. | RNF-06. |
| Testes controlados de desempenho | Reproduzíveis, não garantem velocidade real do provedor. Registrar smoke live e separar de aprovação controlada. | RNF-03. |
| Estado local e reducer | Exige disciplina de tokens e invariantes, mas elimina store/cache global desnecessário. Testar concorrência e exclusão com efeitos pendentes. | RF-07/RF-08. |

Publicação continua separada do desenvolvimento: checklist operacional, headers de proteção, atribuição, termos, retenção de logs e responsáveis permanecem os da spec. Servidor estático deve restringir CSP às próprias fontes e aos dois hosts oficiais de conexão, impedir enquadramento, usar `Referrer-Policy: no-referrer` e `Permissions-Policy` de geolocalização para a própria origem. Não definir um provedor de hospedagem nem anunciar SLA neste plano.
