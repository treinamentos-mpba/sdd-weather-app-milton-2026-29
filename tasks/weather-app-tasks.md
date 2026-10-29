# Weather App — Backlog de Tarefas

**Entrada:** [plano técnico](../plans/weather-app-plan.md). **Fonte dos requisitos:** [especificação](../specs/weather-app-spec.md).

## Revisão de granularidade

O backlog anterior reunia responsabilidades distintas mesmo em tarefas de apenas dois arquivos. Foram divididos contratos, regras temporais, normalização, transporte, preferências, coordenação, apresentação, composição, jornadas E2E e evidências operacionais. A tabela final registra a correspondência dos **IDs antigos**, substituídos pelos IDs abaixo; não são tarefas adicionais.

**Todas as tarefas estão pendentes.** A ordem é topológica; dependências são explícitas. Tarefas independentes podem avançar em paralelo apenas se não houver disputa pelos mesmos arquivos.

### Regra de tamanho e verificação

- Cada tarefa tem uma única responsabilidade e **um ou dois arquivos relevantes**, especificados sem diretórios genéricos ou “outros arquivos necessários”. Um arquivo de implementação e seu teste focado contam como uma unidade, não como mistura de UI e dados.
- Dividir tarefas não significa dividir módulos: várias tarefas incrementam o mesmo hook, reducer, componente ou teste. Não criar abstrações, arquivos vazios ou novos componentes apenas para satisfazer a contagem.
- Critérios de uma tarefa são verificáveis com suas dependências concluídas, sem esperar tarefas posteriores: funções por Vitest, componentes por props/callbacks, orquestração com fronteiras externas controladas, infraestrutura por execução/check específico e documentos por evidência.
- Testes focados acompanham o comportamento. Tarefas Test acrescentam integração ou evidências distintas; não repetem todas as combinações unitárias. Fixtures existentes são consumidas sem alteração; novas necessidades de fixture exigem tarefa própria antes do consumidor.
- As dependências indicadas são pré-requisitos diretos; os transitivos continuam obrigatórios. Mudanças no mesmo arquivo devem preservar incrementos anteriores.
- Em `src/` ou `tests/`, executar `pnpm lint`, `pnpm build` e `pnpm test`. O gate de merge do plano acrescenta `pnpm check` e `pnpm test:e2e`; a divisão em subtarefas não dispensa esses gates. Testes focados permitem verificar cada incremento antes do merge, sem apresentar cobertura futura como concluída. Documentação isolada dispensa comandos da aplicação.
- Observar instruções de React/Tailwind/testes, TypeScript strict e fronteiras do plano. Documentação e UI em pt-BR; identificadores em en-US. Dados externos são `unknown`; sem HTML externo executável, logs sensíveis ou sucesso fictício.
- Não liberar incrementos intermediários sem as proteções dependentes. Sem retry automático, polling meteorológico, cache persistente, backend ou funcionalidades fora da spec.
- Evidências incluem tarefa, CA/EC/RNF, resultado, comando/procedimento, ambiente e limitações. Falha, skip ou ambiente indisponível deixa pendência. Correção descoberta em tarefa Test não autoriza editar UI/dados nessa mesma tarefa: abrir unidade corretiva com os mesmos limites e repetir a evidência afetada.

## Entrega 1 — Contratos e regras puras

### T-01 — Definir contratos meteorológicos

- **ID:** T-01
- **Tipo:** Data
- **Descrição:** Declarar os modelos meteorológicos do plano.
- **Critérios de aceite:** Build strict aceita `City`, `Unit`, `CurrentWeather`, `ForecastDay`, `WeatherData`, localização e preferências; temperaturas de origem em Celsius, ausências `null`, forecast readonly. Contratos não iniciam efeitos.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Rastreabilidade:** RF-01 a RF-04, RF-06 a RF-08.

### T-02 — Definir contratos de resultado e erro

- **ID:** T-02
- **Tipo:** Data
- **Descrição:** Declarar `Result`, `AppError`, serviços e contexto de requisição.
- **Critérios de aceite:** Build strict verifica união discriminada, categoria `unexpected`, serviço, status e prazo opcionais. Não há campos para query, URL, coordenadas ou corpo externo em erros; sem classe de infraestrutura.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/errors.ts`.
- **Rastreabilidade:** RF-05; RNF-06.

### T-03 — Definir contratos de estado

- **ID:** T-03
- **Tipo:** Data
- **Descrição:** Declarar estados representáveis de busca e consulta.
- **Critérios de aceite:** Build strict aceita os estados do plano; `empty` exclusivo da busca, loading meteorológico distingue localização/forecast, snapshot tem alvo e bloqueios são separados por serviço.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/types/state.ts`.
- **Rastreabilidade:** RF-05, RF-08; EC-25, EC-26, EC-32.

### T-04 — Converter e formatar temperaturas

- **ID:** T-04
- **Tipo:** Data
- **Descrição:** Derivar apresentação pt-BR a partir de Celsius sem estado adicional.
- **Critérios de aceite:** Vitest cobre 0 → 32, 100 → 212, −40 → −40, `null`, zero e dez alternâncias; 12,34 °C → 54,2 °F. Até uma decimal, empates afastados de zero e sem −0, incluindo −1,25/1,25/−0,04 °C.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/units.ts`, `tests/unit/units.test.ts`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-21, EC-34; RNF-05.

### T-05 — Operar datas de calendário local

- **ID:** T-05
- **Tipo:** Data
- **Descrição:** Validar datas/fusos e gerar cinco datas a partir de início confiável fornecido.
- **Critérios de aceite:** Vitest cobre datas reais, fuso inválido, cinco dias em New York atravessando DST e Auckland atravessando o ano; resultado independe do fuso do processo. Não somar períodos fixos de 24 h nem inventar início pelo relógio.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** CA-03.3; EC-20, EC-43; RNF-05.

### T-06 — Resolver referência temporal inequívoca

- **ID:** T-06
- **Tipo:** Data
- **Descrição:** Converter referência com offset ou correspondência única no fuso IANA.
- **Critérios de aceite:** Vitest interpreta offset explícito; em `America/New_York`, `2026-03-08T02:30` e `2026-11-01T01:30` retornam `null`. Sem fuso, local sem offset é desconhecido; não usar offset fixo da resposta. Se Intl exigir algoritmo extenso próprio, registrar revisão da decisão antes de adotar alternativa.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** EC-20, EC-28, EC-43; RNF-05.

### T-07 — Derivar atualidade e apresentação temporal

- **ID:** T-07
- **Tipo:** Data
- **Descrição:** Calcular idade/período anterior e formatar conclusão com relógio explícito.
- **Critérios de aceite:** Vitest diferencia 60/61 min, referência ausente/futura e mudança de dia; conclusão e referência são distintas. Fuso válido usa calendário da cidade; inválido usa UTC rotulada com aviso, nunca fuso do dispositivo/geocoding.
- **Dependências:** T-06.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** CA-08.2; EC-27, EC-28, EC-31, EC-43; RNF-05.

### T-08 — Mapear condições WMO

- **ID:** T-08
- **Tipo:** Data
- **Descrição:** Implementar a tabela textual pt-BR da spec.
- **Critérios de aceite:** Vitest cobre todos os códigos especificados; desconhecido retorna condição indisponível, sem ícone arbitrário. Texto é suficiente sem cor/ícone.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`, `tests/unit/weatherCodes.test.ts`.
- **Rastreabilidade:** CA-02.1; EC-14; RNF-02, RNF-05.

### T-09 — Validar domínios externos

- **ID:** T-09
- **Tipo:** Data
- **Descrição:** Criar guards puros para números, coordenadas e identidade.
- **Critérios de aceite:** Vitest cobre `unknown`, valores não finitos, limites WGS84, nome vazio, identificador inválido, porcentagens fora de 0–100 e vento negativo. Zero e temperaturas negativas permanecem válidos; guards não leem navegador/relógio.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/validation.ts`, `tests/unit/validation.test.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-06; EC-11; RNF-06.

### T-10 — Normalizar condições atuais

- **ID:** T-10
- **Tipo:** Data
- **Descrição:** Transformar seção atual e unidades externas em `CurrentWeather`.
- **Critérios de aceite:** Vitest invalida apenas campos com unidade/domínio incompatível; preserva zero e variáveis válidas. Seção sem campo meteorológico válido resulta em `null`, mesmo contendo horário. Referência usa T-06, não relógio implícito.
- **Dependências:** T-06, T-08, T-09.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`, `tests/unit/normalizeCurrent.test.ts`.
- **Rastreabilidade:** CA-02.1, CA-02.2; EC-10, EC-11, EC-13, EC-14, EC-36.

### T-11 — Normalizar séries diárias

- **ID:** T-11
- **Tipo:** Data
- **Descrição:** Associar valores às datas sem deslocar índices ou fabricar período.
- **Critérios de aceite:** Vitest cobre cinco datas/placeholders com âncora e fuso válidos; sem eles retorna período indisponível. Série desalinhada é invalidada isoladamente; duplicatas invalidam posições afetadas, datas inválidas/fora do período não deslocam valores. Unidades são verificadas; mínima/máxima incoerentes não são trocadas silenciosamente.
- **Dependências:** T-05, T-08, T-09.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`, `tests/unit/normalizeForecast.test.ts`.
- **Rastreabilidade:** CA-03.1 a CA-03.3; EC-10 a EC-12, EC-20, EC-40, EC-43.

### T-12 — Compor resultado meteorológico utilizável

- **ID:** T-12
- **Tipo:** Data
- **Descrição:** Compor atuais e previsão normalizados em sucesso completo/parcial ou erro.
- **Critérios de aceite:** Vitest verifica uma seção válida preservada, ambas inutilizáveis como erro e metadados isolados insuficientes. Sem âncora: `periodStart: null`, `forecast: []`. Sem fuso: atuais utilizáveis preservados. Local é o alvo recebido; resposta nova não incorpora campos de snapshot anterior.
- **Dependências:** T-02, T-10, T-11.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`, `tests/unit/normalizeWeather.test.ts`.
- **Rastreabilidade:** EC-13, EC-36, EC-43; RF-02, RF-03, RF-05.

## Entrega 2 — Dados externos e APIs do navegador

### T-13 — Implementar transporte e classificação HTTP

- **ID:** T-13
- **Tipo:** Data
- **Descrição:** Ler JSON como `unknown` com opções seguras de fetch.
- **Critérios de aceite:** Mock verifica HTTPS/hosts constantes, sem credenciais, `no-store`, `redirect: 'error'`, `no-referrer` e sinal externo. Rede/CORS, HTTP 400/500, JSON inválido/envelope de erro são falhas explícitas, nunca vazio. Diagnóstico não inclui URL/corpo/localização.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** CA-05.3, CA-05.4; EC-06; RNF-06.

### T-14 — Aplicar deadline completo de requisição

- **ID:** T-14
- **Tipo:** Data
- **Descrição:** Encerrar transporte pendente e impedir aceite após o prazo.
- **Critérios de aceite:** Fake timers verificam pendência aos 9.999 ms e timeout aos 10.000 ms, incluindo leitura do corpo. Contexto permite conferir deadline antes de aceitar normalização; resposta tardia/cancelamento não vira sucesso. Limpar timer/listeners sem retry.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** EC-07, EC-33; RF-05.

### T-15 — Interpretar Retry-After

- **ID:** T-15
- **Tipo:** Data
- **Descrição:** Retornar erro 429 com prazo válido opcional e serviço identificado.
- **Critérios de aceite:** Vitest cobre segundos inteiros não negativos, data HTTP futura/passada, cabeçalho inválido/ausente/inacessível. Somente prazo futuro válido gera espera; não presumir bloqueio compartilhado, recuperação ou retry automático.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** EC-08, EC-09, EC-39.

### T-16 — Preparar respostas sintéticas de geocoding

- **ID:** T-16
- **Tipo:** Test
- **Descrição:** Disponibilizar dados controlados reutilizáveis de localidades.
- **Critérios de aceite:** Fixtures tipadas incluem dez cidades completas, doze em ordem conhecida, homônimos distinguíveis/indistinguíveis, nomes longos/não latinos, vazio e itens inválidos. Inspeção confirma dados sintéticos e ausência de localização pessoal; checks de tipos passam.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tests/fixtures/geocoding.ts`.
- **Rastreabilidade:** EC-02, EC-04, EC-05, EC-35; RNF-06.

### T-17 — Preparar respostas sintéticas de forecast

- **ID:** T-17
- **Tipo:** Test
- **Descrição:** Disponibilizar resposta completa e variantes parciais reutilizáveis.
- **Critérios de aceite:** Fixtures incluem cinco dias com todas as unidades/campos, zero, lacuna, série curta, datas duplicadas/inválidas, fuso/âncora ausentes e seções inutilizáveis. Datas/valores esperados são explícitos e dados são sintéticos; checks de tipos passam.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tests/fixtures/forecast.ts`.
- **Rastreabilidade:** CA-02.1, CA-03.2; EC-10 a EC-14, EC-36, EC-43.

### T-18 — Implementar serviço de geocoding

- **ID:** T-18
- **Tipo:** Data
- **Descrição:** Consultar e validar cidades globais.
- **Critérios de aceite:** Mock confere encoding, `count=10`, `language=pt`, `format=json`, sem filtro de país/chave. Preservar ordem dos dez primeiros utilizáveis; opcionais ausentes são `null`, descartes sinalizam parcial. `results` ausente/vazio é vazio documentado; tipo inválido/todos inutilizáveis é erro.
- **Dependências:** T-05, T-09, T-15, T-16.
- **Arquivos prováveis:** `src/services/geocoding.ts`, `tests/unit/geocoding.test.ts`.
- **Rastreabilidade:** CA-01.1, CA-01.2; EC-02 a EC-06, EC-35.

### T-19 — Implementar serviço de forecast

- **ID:** T-19
- **Tipo:** Data
- **Descrição:** Obter atuais e cinco dias numa chamada e normalizar a resposta.
- **Critérios de aceite:** Mock confere campos `current`/`daily` do plano, cinco dias, fuso auto, Celsius, km/h e ISO. Testar completo/parcial/erro sem mockar normalizador; alvo solicitado não é substituído pela grade. Conferir sinal/deadline após normalização; só resultado vigente poderá receber conclusão no controlador.
- **Dependências:** T-12, T-15, T-17.
- **Arquivos prováveis:** `src/services/forecast.ts`, `tests/unit/forecast.test.ts`.
- **Rastreabilidade:** CA-01.3, CA-02.1, CA-03.2, CA-08.1; EC-07, EC-43.

### T-20 — Ler preferências com validação independente

- **ID:** T-20
- **Tipo:** Data
- **Descrição:** Recuperar somente cidade/unidade válidas da chave própria.
- **Critérios de aceite:** Vitest cobre ausência, leitura indisponível, JSON corrompido e cidade inválida com Fahrenheit válido. Preservar campos válidos, informar descarte/falha e mapear `C|F` para `Unit`; nenhuma rede.
- **Dependências:** T-02, T-09.
- **Arquivos prováveis:** `src/services/preferences.ts`, `tests/unit/preferences.test.ts`.
- **Rastreabilidade:** CA-07.1; EC-22, EC-30; RNF-06.

### T-21 — Escrever projeção mínima de preferências

- **ID:** T-21
- **Tipo:** Data
- **Descrição:** Persistir somente nome/contexto regional e unidade.
- **Critérios de aceite:** Vitest inspeciona conteúdo sem ID, coordenadas, fuso ou clima; escrever unidade isolada não inventa cidade. Falha de escrita retorna erro explícito, nunca sucesso. Operação não envia preferências para servidor.
- **Dependências:** T-20.
- **Arquivos prováveis:** `src/services/preferences.ts`, `tests/unit/preferences.test.ts`.
- **Rastreabilidade:** CA-07.2, CA-07.3; EC-22, EC-38.

### T-22 — Remover somente a chave de preferências

- **ID:** T-22
- **Tipo:** Data
- **Descrição:** Excluir dados próprios sem afetar outras aplicações.
- **Critérios de aceite:** Vitest demonstra remoção da chave própria e preservação de chave sentinela externa. Falha retorna `storage-remove`, sem confirmar exclusão.
- **Dependências:** T-20.
- **Arquivos prováveis:** `src/services/preferences.ts`, `tests/unit/preferences.test.ts`.
- **Rastreabilidade:** EC-24, EC-37; RNF-06.

### T-23 — Encapsular Geolocation API

- **ID:** T-23
- **Tipo:** Data
- **Descrição:** Obter coordenadas somente por chamada explícita.
- **Critérios de aceite:** Vitest demonstra nenhum acesso na inicialização; `maximumAge: 0`, sem exigir alta precisão, coordenadas validadas e prazo próprio de 10 s. Negação/ausência de suporte/indisponibilidade/timeout são explícitos; callback tardio não retorna sucesso. Não persistir ou registrar coordenadas.
- **Dependências:** T-02, T-09.
- **Arquivos prováveis:** `src/services/geolocation.ts`, `tests/unit/geolocation.test.ts`.
- **Rastreabilidade:** CA-06.1 a CA-06.3; EC-07, EC-18, EC-19.

## Entrega 3 — Transições e orquestração

### T-24 — Implementar transições de busca

- **ID:** T-24
- **Tipo:** Data
- **Descrição:** Iniciar reducer com ciclo de busca e termo enviado.
- **Critérios de aceite:** Vitest cobre idle/loading/success/empty/error; loading remove resultados selecionáveis anteriores, erro preserva termo para retry e busca não altera consulta meteorológica.
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/hooks/weatherReducer.ts`, `tests/unit/weatherReducer.test.ts`.
- **Rastreabilidade:** CA-05.1, CA-05.2; EC-04, EC-32.

### T-25 — Implementar transições meteorológicas

- **ID:** T-25
- **Tipo:** Data
- **Descrição:** Acrescentar alvo, etapa, snapshot e erro ao reducer.
- **Critérios de aceite:** Vitest cobre etapas location/forecast, sucesso utilizável e falha; não há empty meteorológico. Refresh preserva somente snapshot do mesmo alvo; trocar alvo limpa anterior; erro não altera horário de sucesso.
- **Dependências:** T-24.
- **Arquivos prováveis:** `src/hooks/weatherReducer.ts`, `tests/unit/weatherReducer.test.ts`.
- **Rastreabilidade:** EC-13, EC-25, EC-26; RF-08.

### T-26 — Implementar transições de preferências

- **ID:** T-26
- **Tipo:** Data
- **Descrição:** Acrescentar restauração, escolha e exclusão ao reducer.
- **Critérios de aceite:** Vitest verifica unidade sem modificar Celsius de origem, restauração sem seleção ativa e exclusão bem-sucedida voltando a Celsius, sem obrigar apagar consulta. Falha de exclusão não anuncia sucesso.
- **Dependências:** T-25.
- **Arquivos prováveis:** `src/hooks/weatherReducer.ts`, `tests/unit/weatherReducer.test.ts`.
- **Rastreabilidade:** RF-04, RF-07; EC-24, EC-30, EC-37.

### T-27 — Coordenar envio e recuperação de busca

- **ID:** T-27
- **Tipo:** Data
- **Descrição:** Iniciar hook com ação explícita de busca e retry pelo termo enviado.
- **Critérios de aceite:** Vitest verifica trim externo, nenhuma chamada vazia/por edição e resultado success/empty/error. Retry ignora texto ainda não enviado; rejeição inesperada encerra loading com `unexpected` e diagnóstico sanitizado.
- **Dependências:** T-18, T-24.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.search.test.ts`.
- **Rastreabilidade:** EC-01, EC-02, EC-04, EC-06; CA-05.3; RNF-06.

### T-28 — Impedir busca duplicada ou superada

- **ID:** T-28
- **Tipo:** Data
- **Descrição:** Aplicar token, cancelamento e deduplicação no fluxo de busca.
- **Critérios de aceite:** Promessas controladas demonstram A/B fora de ordem e A após timeout/retry, com sucesso ou rejeição. A/finally antigo não muda B; duplicata pendente não inicia chamada. Desmontagem limpa efeitos; rejeição superada não fica sem tratamento.
- **Dependências:** T-27.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.search.test.ts`.
- **Rastreabilidade:** EC-15, EC-16, EC-33.

### T-29 — Bloquear geocoding durante rate limit

- **ID:** T-29
- **Tipo:** Data
- **Descrição:** Aplicar prazo retornado pelo geocoding a qualquer termo.
- **Critérios de aceite:** Fake timers comprovam bloqueio de termos iguais/diferentes até prazo válido; expiração só libera ação manual. Sem prazo válido/passado permite tentativa manual, sem retry. Estado identifica serviço afetado.
- **Dependências:** T-28.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.search.test.ts`.
- **Rastreabilidade:** EC-08, EC-09, EC-39.

### T-30 — Coordenar consulta de alvo confirmado

- **ID:** T-30
- **Tipo:** Data
- **Descrição:** Adicionar seleção explícita e chamada de forecast ao controlador.
- **Critérios de aceite:** Vitest verifica alvo escolhido, success/parcial/error, descarte de snapshot ao trocar local e conclusão apenas de resposta utilizável aceita. Rejeição inesperada encerra loading sem detalhes sensíveis; busca não seleciona automaticamente.
- **Dependências:** T-19, T-25, T-29.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.weather.test.ts`.
- **Rastreabilidade:** CA-01.3, CA-08.1; EC-13, EC-26; RNF-06.

### T-31 — Proteger intenção meteorológica vigente

- **ID:** T-31
- **Tipo:** Data
- **Descrição:** Acrescentar token meteorológico independente, cancelamento e deduplicação.
- **Critérios de aceite:** Vitest verifica último alvo/refresh prevalecendo, resposta após timeout e finally/rejeição antigos sem alterar loading novo. Operação idêntica pendente não duplica; busca não cancela forecast; desmontagem impede commits posteriores.
- **Dependências:** T-30.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.weather.test.ts`.
- **Rastreabilidade:** EC-15, EC-16, EC-32, EC-33.

### T-32 — Bloquear somente forecast durante rate limit

- **ID:** T-32
- **Tipo:** Data
- **Descrição:** Aplicar prazo meteorológico sem bloquear buscas.
- **Critérios de aceite:** Vitest comprova bloqueio mesmo mudando alvo, expiração sem chamada automática e independência nos dois sentidos entre forecast/geocoding. Prazo inválido/passado não cria espera; cancelamento não altera bloqueio vigente.
- **Dependências:** T-31.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.weather.test.ts`.
- **Rastreabilidade:** EC-08, EC-09, EC-39.

### T-33 — Coordenar refresh do mesmo alvo

- **ID:** T-33
- **Tipo:** Data
- **Descrição:** Reconsultar manualmente mantendo apenas o snapshot permitido.
- **Critérios de aceite:** Vitest verifica snapshot durante loading, nova resposta substituindo-o sem mescla e erro mantendo dados/horários anteriores com “Não atualizados”. Retry usa alvo confirmado; sucesso muda conclusão, falha não.
- **Dependências:** T-32.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.refresh.test.ts`.
- **Rastreabilidade:** CA-08.2; EC-25, EC-26, EC-36.

### T-34 — Atualizar somente relógio de apresentação

- **ID:** T-34
- **Tipo:** Data
- **Descrição:** Coordenar tick por minuto e retorno à aba, sem polling.
- **Critérios de aceite:** Vitest avança 30 min e meia-noite, inclusive durante request; idade/período mudam, datas recebidas permanecem e nenhum fetch é iniciado. Timers/listeners são removidos ao desmontar.
- **Dependências:** T-07, T-33.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.clock.test.ts`.
- **Rastreabilidade:** CA-08.3; EC-27, EC-28, EC-31, EC-43.

### T-35 — Coordenar localização seguida de forecast

- **ID:** T-35
- **Tipo:** Data
- **Descrição:** Integrar localização ao token meteorológico com prazos separados.
- **Critérios de aceite:** Vitest demonstra zero acesso inicial, 10 s para localização e outros 10 s para forecast. Seleção manual supera callback tardio; retry de localização exige ação, falha de forecast conhecido repete só forecast. Usar “Sua localização”, sem reverse geocoding.
- **Dependências:** T-23, T-32.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.location.test.ts`.
- **Rastreabilidade:** CA-06.1 a CA-06.3, CA-08.1; EC-07, EC-17 a EC-19.

### T-36 — Restaurar preferências sem iniciar consulta

- **ID:** T-36
- **Tipo:** Data
- **Descrição:** Ler preferências na abertura e resolver cidade somente após confirmação.
- **Critérios de aceite:** Vitest verifica ausência de rede/localização inicial; confirmação chama geocoding, exigindo seleção mesmo com resultado único. Unidade válida é preservada; falha/descarte são anunciados sem bloquear uso.
- **Dependências:** T-20, T-26, T-29.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.preferences.test.ts`.
- **Rastreabilidade:** CA-07.1; EC-22, EC-23, EC-30, EC-42.

### T-37 — Salvar escolhas explícitas de cidade e unidade

- **ID:** T-37
- **Tipo:** Data
- **Descrição:** Persistir somente a projeção da preferência escolhida.
- **Critérios de aceite:** Vitest verifica cidade manual salva por seleção, unidade salva por ação e falha mantendo escolha na sessão. Unidade muda apresentação mesmo com forecast pendente, sem fetch/novo timeout. Refresh, respostas e localização não escrevem preferências nem substituem cidade manual.
- **Dependências:** T-21, T-30, T-35, T-36.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.preferences.test.ts`.
- **Rastreabilidade:** CA-07.2, CA-07.3; EC-19, EC-22, EC-30, EC-44.

### T-38 — Excluir preferências sem ressurreição

- **ID:** T-38
- **Tipo:** Data
- **Descrição:** Coordenar exclusão explícita e estado da sessão.
- **Critérios de aceite:** Vitest comprova reset para Celsius após remoção bem-sucedida, manutenção da consulta visível e resposta/refresh pendente sem recriar valores. Escolher só Fahrenheit depois salva só unidade; falha de remoção não confirma exclusão.
- **Dependências:** T-22, T-33, T-37.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.preferences.test.ts`.
- **Rastreabilidade:** EC-24, EC-37, EC-38.

## Entrega 4 — Componentes isolados

### T-39 — Definir estilos globais e foco

- **ID:** T-39
- **Tipo:** UI
- **Descrição:** Aplicar base dark glassmorphism conforme Tailwind existente.
- **Critérios de aceite:** Build gera estilos sem recurso externo; inspeção no preview confirma fundo/base tipográfica e foco perceptível nos controles existentes. Sem alteração em lógica, dependências ou componentes; contraste completo será medido em T-87.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/index.css`.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-40 — Preparar shell semântico

- **ID:** T-40
- **Tipo:** UI
- **Descrição:** Substituir tela demonstrativa por estrutura base, sem serviços.
- **Critérios de aceite:** Testing Library encontra título pt-BR e landmark principal, sem dados meteorológicos inventados ou efeitos. App inicialmente aceita composição posterior, sem criar wrapper adicional.
- **Dependências:** T-39.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** RNF-02, RNF-05; RF-05.

### T-41 — Criar fronteira de erro de renderização

- **ID:** T-41
- **Tipo:** UI
- **Descrição:** Exibir fallback recuperável para falha de render.
- **Critérios de aceite:** Teste com filho que lança erro verifica mensagem pt-BR e ação de recuperação, sem stack/dados pessoais ou sucesso fictício. Não tratar rejeições assíncronas como se fossem capturadas por essa fronteira.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/AppErrorBoundary.tsx`, `tests/components/AppErrorBoundary.test.tsx`.
- **Rastreabilidade:** RF-05; RNF-04, RNF-06.

### T-42 — Instalar fronteira na raiz

- **ID:** T-42
- **Tipo:** UI
- **Descrição:** Envolver App uma única vez na inicialização.
- **Critérios de aceite:** Build e inspeção da montagem no preview confirmam App dentro da fronteira única e estilos carregados; o fallback já está demonstrado pelo teste de T-41. Documento mantém idioma `pt-BR`; nenhuma chamada de domínio é adicionada ao entrypoint.
- **Dependências:** T-40, T-41.
- **Arquivos prováveis:** `src/main.tsx`, `index.html`.
- **Rastreabilidade:** RF-05; RNF-04, RNF-05.

### T-43 — Criar formulário de busca

- **ID:** T-43
- **Tipo:** UI
- **Descrição:** Expor envio por botão/Enter com texto local ainda não enviado.
- **Critérios de aceite:** Testing Library verifica label, orientação associada ao vazio, campo editável em loading e callback somente ao enviar. Acentos/escrita não latina são preservados; componente não chama serviços.
- **Dependências:** T-40.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`, `tests/components/CitySearch.test.tsx`.
- **Rastreabilidade:** CA-05.1; EC-01, EC-02, EC-29; RNF-02.

### T-44 — Criar lista de cidades

- **ID:** T-44
- **Tipo:** UI
- **Descrição:** Apresentar resultados normalizados e callback de seleção.
- **Critérios de aceite:** Testing Library verifica nome/região/país, ordem e até dez itens, sem seleção automática. Homônimos indistinguíveis recebem orientação de refinamento; nomes longos/marcação são texto e chegada de resultados não rouba foco. Incluir crédito GeoNames no catálogo.
- **Dependências:** T-01, T-16, T-40.
- **Arquivos prováveis:** `src/components/CityResults.tsx`, `tests/components/CityResults.test.tsx`.
- **Rastreabilidade:** CA-01.1, CA-01.2; EC-03, EC-05, EC-35; RNF-02.

### T-45 — Apresentar feedback de consulta

- **ID:** T-45
- **Tipo:** UI
- **Descrição:** Renderizar mensagens pt-BR para estado e recuperação, recebidos por props.
- **Critérios de aceite:** Testing Library diferencia loading/vazio/parcial/erro e motivo de retry bloqueado; recuperação funciona por teclado. Regiões semânticas não duplicam anúncio no DOM; não expor erro bruto nem inferir offline de fetch rejeitado. Sem serviços ou mudança automática de foco.
- **Dependências:** T-02, T-40.
- **Arquivos prováveis:** `src/components/QueryFeedback.tsx`, `tests/components/QueryFeedback.test.tsx`.
- **Rastreabilidade:** CA-05.1 a CA-05.4; EC-06 a EC-09, EC-29, EC-39.

### T-46 — Apresentar condições atuais

- **ID:** T-46
- **Tipo:** UI
- **Descrição:** Renderizar valores atuais normalizados, identidade e informação temporal.
- **Critérios de aceite:** Teste com props verifica cinco campos/unidades, condição textual e zero distinto de ausência. Conclusão, referência, “Desatualizado”, “Atualidade desconhecida” e “Não atualizados” são distinguíveis; fuso inválido mostra conclusão UTC rotulada. Não acessar relógio/rede diretamente.
- **Dependências:** T-04, T-07, T-08, T-40.
- **Arquivos prováveis:** `src/components/CurrentWeatherCard.tsx`, `tests/components/CurrentWeatherCard.test.tsx`.
- **Rastreabilidade:** CA-02.1, CA-02.2, CA-08.2; EC-10, EC-11, EC-14, EC-19, EC-25, EC-27, EC-28, EC-43.

### T-47 — Apresentar um dia de previsão

- **ID:** T-47
- **Tipo:** UI
- **Descrição:** Renderizar data recebida e seis campos de um `ForecastDay`.
- **Critérios de aceite:** Testing Library verifica condição, mínima/máxima, probabilidade máxima, umidade média e vento máximo com unidades corretas. Ausência é “Sem dados”; não rotular como rajada/volume nem converter data ao fuso do dispositivo.
- **Dependências:** T-04, T-05, T-08, T-40.
- **Arquivos prováveis:** `src/components/ForecastDayCard.tsx`, `tests/components/ForecastDayCard.test.tsx`.
- **Rastreabilidade:** CA-03.2; EC-10, EC-11, EC-14, EC-40.

### T-48 — Compor seções meteorológicas

- **ID:** T-48
- **Tipo:** UI
- **Descrição:** Compor atuais e cartões diários sem transformar dados externos.
- **Critérios de aceite:** Props controladas mostram cinco datas em ordem com placeholders; ausência de seção ou período é explícita, preservando a seção utilizável. Período anterior usa datas absolutas e aviso, sem “hoje” incorreto.
- **Dependências:** T-07, T-46, T-47.
- **Arquivos prováveis:** `src/components/WeatherPanel.tsx`, `tests/components/WeatherPanel.test.tsx`.
- **Rastreabilidade:** CA-03.1, CA-03.3; EC-12, EC-20, EC-31, EC-36, EC-43.

### T-49 — Apresentar atribuição meteorológica

- **ID:** T-49
- **Tipo:** UI
- **Descrição:** Mostrar créditos e aviso de estimativas junto aos dados.
- **Critérios de aceite:** Testing Library encontra links Open-Meteo/CC BY 4.0, aviso de estimativas e indicação de conversão/arredondamento conforme unidade. Texto não implica endosso/garantia; aviso pode atender ambas as seções.
- **Dependências:** T-40.
- **Arquivos prováveis:** `src/components/WeatherAttribution.tsx`, `tests/components/WeatherAttribution.test.tsx`.
- **Rastreabilidade:** CA-02.3; EC-41.

### T-50 — Criar seletor de unidade

- **ID:** T-50
- **Tipo:** UI
- **Descrição:** Expor unidade ativa e callback sem converter/copiar dados em estado.
- **Critérios de aceite:** Testing Library verifica rótulos, seleção anunciada e operação por teclado; controle permanece disponível em loading. Clique altera somente callback da preferência, sem rede.
- **Dependências:** T-01, T-40.
- **Arquivos prováveis:** `src/components/TemperatureToggle.tsx`, `tests/components/TemperatureToggle.test.tsx`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-44; RNF-02.

### T-51 — Criar ação informada de localização

- **ID:** T-51
- **Tipo:** UI
- **Descrição:** Exibir informação de privacidade antes do callback explícito.
- **Critérios de aceite:** Testing Library encontra aviso visível/acessível sobre coordenadas enviadas ao Open-Meteo, IP e possíveis logs externos, com termos. Render não acessa localização; clique dispara callback; falha orienta busca manual sem insistir no prompt.
- **Dependências:** T-40, T-45.
- **Arquivos prováveis:** `src/components/LocationButton.tsx`, `tests/components/LocationButton.test.tsx`.
- **Rastreabilidade:** CA-06.1 a CA-06.3; EC-18; RNF-06.

### T-52 — Apresentar preferências lembradas

- **ID:** T-52
- **Tipo:** UI
- **Descrição:** Expor cidade/contexto, confirmação, exclusão e avisos por props.
- **Critérios de aceite:** Testing Library verifica callbacks por teclado e mensagens distintas de leitura/descarte/escrita/remoção. Remoção falha não anuncia sucesso; painel não usa storage/rede.
- **Dependências:** T-01, T-40, T-45.
- **Arquivos prováveis:** `src/components/PreferencesPanel.tsx`, `tests/components/PreferencesPanel.test.tsx`.
- **Rastreabilidade:** CA-07.1; EC-22 a EC-24, EC-37, EC-38, EC-42.

## Entrega 5 — Composição incremental de App

Cada tarefa desta entrega altera somente a ligação de props/callbacks indicada. Os serviços e componentes já foram implementados e testados nas dependências; não reimplementar regras em App.

### T-53 — Conectar busca e seleção em App

- **ID:** T-53
- **Tipo:** UI
- **Descrição:** Instanciar controlador uma vez e conectar formulário, lista e feedback de busca.
- **Critérios de aceite:** Integração com serviços controlados verifica abertura sem rede, envio, estados e callback de seleção explícita. Campo mantém foco; App não chama APIs diretamente.
- **Dependências:** T-30, T-42, T-43, T-44, T-45.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-01.1 a CA-01.3; CA-05.1, CA-05.2; EC-29.

### T-54 — Conectar apresentação meteorológica em App

- **ID:** T-54
- **Tipo:** UI
- **Descrição:** Ligar snapshot/estado meteorológico e atribuição já existentes.
- **Critérios de aceite:** Integração com fixture completa verifica seleção identificada corretamente, atuais/cinco dias e aviso/créditos juntos aos dados. Erro meteorológico não aparece como lista vazia de cidades.
- **Dependências:** T-17, T-32, T-48, T-49, T-53.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-02.1 a CA-02.3, CA-03.1 a CA-03.3.

### T-55 — Conectar atualização manual em App

- **ID:** T-55
- **Tipo:** UI
- **Descrição:** Expor ação de refresh e relógio do controlador sem novos efeitos.
- **Critérios de aceite:** Integração comprova acionamento manual e indicação de snapshot em loading/erro; alvo e horários vêm do estado. Sem timer/fetch em App.
- **Dependências:** T-34, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-08.2, CA-08.3; EC-25.

### T-56 — Conectar unidade em App

- **ID:** T-56
- **Tipo:** UI
- **Descrição:** Distribuir uma única preferência a seletor e cartões.
- **Critérios de aceite:** Integração alterna todas as temperaturas pela unidade vigente; não cria estado Fahrenheit ou chamada meteorológica. Preferência é alterada pela ação existente.
- **Dependências:** T-37, T-50, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-44.

### T-57 — Conectar localização em App

- **ID:** T-57
- **Tipo:** UI
- **Descrição:** Ligar botão informado à ação e etapas do controlador.
- **Critérios de aceite:** Integração comprova ausência de acesso inicial, callback após clique e estado “Sua localização”; recusa mantém formulário manual disponível.
- **Dependências:** T-35, T-51, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-06.1 a CA-06.3; EC-19.

### T-58 — Conectar preferências em App

- **ID:** T-58
- **Tipo:** UI
- **Descrição:** Ligar painel às ações existentes de confirmação/exclusão.
- **Critérios de aceite:** Integração comprova cidade lembrada sem request inicial, confirmação levando à lista e feedback de exclusão. App não lê/escreve storage; exclusão atualiza seletor sem remover obrigatoriamente consulta.
- **Dependências:** T-38, T-52, T-53, T-56.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-07.1; EC-24, EC-37, EC-42.

## Entrega 6 — Integração automatizada

Tarefas E2E consomem componentes e dados prontos; não incluem correções de implementação. Executar os fluxos principais de busca, unidade, recuperação e preferências também nos projetos móveis. Outras combinações extensas permanecem no nível unitário responsável.

### T-59 — Verificar independência entre busca e clima

- **ID:** T-59
- **Tipo:** Test
- **Descrição:** Exercitar a corrida cruzada dos dois fluxos do controlador.
- **Critérios de aceite:** Promessas controladas demonstram forecast A pendente e busca B concluída, mantendo lista B e clima A corretamente identificados. Inverter ordem também preserva ambos; bloqueio de um serviço não paralisa o outro.
- **Dependências:** T-32.
- **Arquivos prováveis:** `tests/unit/useWeatherApp.integration.test.ts`.
- **Rastreabilidade:** EC-08, EC-32.

### T-60 — Verificar preferências durante resposta pendente

- **ID:** T-60
- **Tipo:** Test
- **Descrição:** Validar interação cruzada entre unidade/exclusão e forecast.
- **Critérios de aceite:** Teste integrado altera unidade durante request e recebe resultado na unidade atual; exclusão seguida de resposta/refresh não recria cidade/unidade. Reutilizar testes existentes se já provarem o cruzamento, sem duplicação.
- **Dependências:** T-38.
- **Arquivos prováveis:** `tests/unit/useWeatherApp.integration.test.ts`.
- **Rastreabilidade:** EC-24, EC-38, EC-44.

### T-61 — Servir build de produção nos E2E

- **ID:** T-61
- **Tipo:** Infra
- **Descrição:** Trocar dev server por preview com endereço determinístico.
- **Critérios de aceite:** Após `pnpm build`, smoke local usa `pnpm exec vite preview --host 127.0.0.1 --port 5173 --strictPort`; baseURL/url coincidem e não há reutilização de dev server. Smoke não chama API externa.
- **Dependências:** T-40.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/smoke.spec.ts`.
- **Rastreabilidade:** RNF-03, RNF-07.

### T-62 — Declarar projetos desktop e mobile

- **ID:** T-62
- **Tipo:** Infra
- **Descrição:** Configurar engines e perfis sem produto cartesiano.
- **Critérios de aceite:** Smoke executa desktop Chromium/Firefox/WebKit, Chromium touch 390 × 844 e WebKit móvel. Relatório identifica projetos reais; fluxos principais terão cobertura mobile, sem alegar Safari real por emulação.
- **Dependências:** T-61.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/smoke.spec.ts`.
- **Rastreabilidade:** RNF-01, RNF-07.

### T-63 — Reprovar tráfego E2E inesperado

- **ID:** T-63
- **Tipo:** Test
- **Descrição:** Preparar isolamento de rede com contextos limpos por teste.
- **Critérios de aceite:** Recursos locais e rotas explicitamente esperadas são permitidos; chamada externa inesperada é registrada e reprova o teste mesmo abortada. Teste negativo comprova o guard via resultado esperado de falha, sem deixar a suíte vermelha. Limpar registros/listeners por contexto.
- **Dependências:** T-62.
- **Arquivos prováveis:** `tests/e2e/fixtures.ts`, `tests/e2e/networkGuard.spec.ts`.
- **Rastreabilidade:** RNF-06, RNF-07.

### T-64 — Controlar respostas e tempo nos E2E

- **ID:** T-64
- **Tipo:** Test
- **Descrição:** Acrescentar respostas sintéticas e controle de entrega às fixtures E2E.
- **Critérios de aceite:** Consumir T-16/T-17 sem alterações; permitir resposta completa/parcial, erro e liberação manual de pendência. Teste de suporte comprova limpeza entre casos e relógio controlado, sem sleeps ou dependência de ordem.
- **Dependências:** T-16, T-17, T-63.
- **Arquivos prováveis:** `tests/e2e/fixtures.ts`, `tests/e2e/fixtures.spec.ts`.
- **Rastreabilidade:** RF-05; EC-07, EC-33.

### T-65 — Testar busca e seleção E2E

- **ID:** T-65
- **Tipo:** Test
- **Descrição:** Cobrir descoberta da cidade e identidade após seleção.
- **Critérios de aceite:** Desktop/mobile verificam envio por Enter/botão, trim/grafia, homônimos, limite/ordem, vazio removendo lista antiga e escolha explícita. Clima corresponde ao resultado selecionado; nenhuma chamada por digitação.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/search.spec.ts`.
- **Rastreabilidade:** CA-01.1 a CA-01.3, CA-05.2; EC-01, EC-02, EC-04, EC-05, EC-35.

### T-66 — Testar recuperação de falha E2E

- **ID:** T-66
- **Tipo:** Test
- **Descrição:** Cobrir uma tentativa falha seguida de recuperação manual.
- **Critérios de aceite:** Desktop/mobile exercitam rede/HTTP e timeout separadamente; loading mantém edição e foco. Retry usa termo enviado e permite sucesso; chamada atrasada não substitui tentativa nova. Sem conexão não há sucesso offline.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/recovery.spec.ts`.
- **Rastreabilidade:** CA-05.1, CA-05.3, CA-05.4; EC-06, EC-07, EC-16, EC-29, EC-33.

### T-67 — Testar bloqueio temporário E2E

- **ID:** T-67
- **Tipo:** Test
- **Descrição:** Demonstrar bloqueio e liberação manual por serviço.
- **Critérios de aceite:** Com relógio controlado, 429 bloqueia termos/alvos diferentes no mesmo serviço sem bloquear o outro; expiração não chama automaticamente. Ausência de prazo e data passada permitem retry manual sem promessa de recuperação.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/rateLimit.spec.ts`.
- **Rastreabilidade:** EC-08, EC-09, EC-39.

### T-68 — Testar apresentação completa E2E

- **ID:** T-68
- **Tipo:** Test
- **Descrição:** Validar dados completos e semânticas na UI do navegador.
- **Critérios de aceite:** Fixture completa apresenta atuais, cinco datas no fuso e seis campos por dia, unidades, condição textual, estimativas e atribuição. Usar casos DST/virada de ano representativos, sem repetir todas as tabelas unitárias.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Rastreabilidade:** CA-02.1 a CA-02.3, CA-03.1 a CA-03.3; EC-20, EC-40, EC-41.

### T-69 — Testar degradação parcial E2E

- **ID:** T-69
- **Tipo:** Test
- **Descrição:** Demonstrar preservação do utilizável sem fabricação de dados.
- **Critérios de aceite:** Exercitar campo/dia ausente, série desalinhada, código desconhecido, seção isolada válida e ambas inutilizáveis. Fuso/âncora inválidos não fabricam datas; atuais preservados usam UTC rotulada quando necessário. Ausência estrutural de campo obrigatório bloqueia aceite do contrato, não vira aprovação por placeholder.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/partialWeather.spec.ts`.
- **Rastreabilidade:** EC-10 a EC-14, EC-36, EC-43.

### T-70 — Testar conversão sem rede E2E

- **ID:** T-70
- **Tipo:** Test
- **Descrição:** Validar uma única jornada de alternância completa.
- **Critérios de aceite:** Desktop/mobile verificam Celsius inicial, referência 0 → 32 e retorno, sensação/mínimas/máximas e rótulos; vento/umidade/precipitação não mudam. Dez alternâncias e troca em loading não aumentam chamadas nem alteram horários/status.
- **Dependências:** T-56, T-64.
- **Arquivos prováveis:** `tests/e2e/units.spec.ts`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-21, EC-30, EC-44.

### T-71 — Testar ação opcional de localização E2E

- **ID:** T-71
- **Tipo:** Test
- **Descrição:** Validar consentimento por ação e fallback manual.
- **Critérios de aceite:** Permissão concedida/indefinida sem clique implica zero acessos. Após informação prévia e clique, coordenada sintética gera “Sua localização”. Recusa/indisponibilidade/timeout mantêm busca; callback superado não consulta; cidade manual não é substituída no armazenamento.
- **Dependências:** T-57, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/location.spec.ts`.
- **Rastreabilidade:** CA-06.1 a CA-06.3, CA-08.1; EC-07, EC-17 a EC-19.

### T-72 — Testar restauração entre visitas E2E

- **ID:** T-72
- **Tipo:** Test
- **Descrição:** Exercitar salvar, reabrir, confirmar e selecionar novamente.
- **Critérios de aceite:** Desktop/mobile restauram unidade/contexto sem rede inicial; confirmação faz geocoding e exige seleção mesmo com resultado único. Inspecionar somente dados permitidos e ausência de envio a servidor de preferências.
- **Dependências:** T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/preferences.spec.ts`.
- **Rastreabilidade:** CA-07.1 a CA-07.3; EC-22, EC-23, EC-30, EC-42.

### T-73 — Testar exclusão entre visitas E2E

- **ID:** T-73
- **Tipo:** Test
- **Descrição:** Exercitar exclusão com refresh pendente e reabertura.
- **Critérios de aceite:** Desktop/mobile demonstram resposta pendente sem recriação, Celsius após sucesso e nenhuma restauração posterior. Falha de remoção informa pendência; escolher só Fahrenheit após excluir salva somente unidade. Chave de outra aplicação permanece.
- **Dependências:** T-55, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/preferences.spec.ts`.
- **Rastreabilidade:** EC-24, EC-37, EC-38.

### T-74 — Testar refresh e alvo vigente E2E

- **ID:** T-74
- **Tipo:** Test
- **Descrição:** Verificar atualização manual e snapshot no navegador.
- **Critérios de aceite:** Refresh bem-sucedido muda dados/conclusão; falha mantém dados/horários com “Não atualizados”. Trocar alvo remove snapshot anterior; resposta superada não vence a atual. Recuperação também funciona no perfil mobile.
- **Dependências:** T-55, T-64.
- **Arquivos prováveis:** `tests/e2e/refresh.spec.ts`.
- **Rastreabilidade:** CA-08.2; EC-15, EC-25, EC-26, EC-33.

### T-75 — Testar passagem do tempo sem polling E2E

- **ID:** T-75
- **Tipo:** Test
- **Descrição:** Comprovar indicadores temporais no navegador com relógio controlado.
- **Critérios de aceite:** 60/61 min, referência futura/ausente, meia-noite e retorno à aba alteram avisos sem fetch. Datas recebidas permanecem; atualização manual redefine período. Referência e conclusão continuam informações distintas.
- **Dependências:** T-55, T-64.
- **Arquivos prováveis:** `tests/e2e/time.spec.ts`.
- **Rastreabilidade:** CA-08.3; EC-27, EC-28, EC-31.

### T-76 — Testar conteúdo não confiável no navegador

- **ID:** T-76
- **Tipo:** Test
- **Descrição:** Verificar texto externo e encoding com sentinelas sintéticas.
- **Critérios de aceite:** Input, resposta API e preferência com marcação não executam sentinela; texto permanece texto. `&`/`?` não alteram host/parâmetros fixos. Não modificar implementação nesta tarefa.
- **Dependências:** T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/untrustedContent.spec.ts`.
- **Rastreabilidade:** EC-03; RNF-06.

### T-77 — Testar rejeição de redirecionamento no browser

- **ID:** T-77
- **Tipo:** Test
- **Descrição:** Complementar mock de fetch com comportamento real do navegador.
- **Critérios de aceite:** Rota controlada responde 302 para destino local sintético; UI mostra falha recuperável e contador do destino permanece zero. Nenhuma coordenada é enviada a terceiros; não afirmar que browser distingue CORS/rede/redirect.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/redirect.spec.ts`.
- **Rastreabilidade:** RF-05; RNF-06.

### T-78 — Inspecionar minimização de dados no browser

- **ID:** T-78
- **Tipo:** Test
- **Descrição:** Auditar saídas observáveis durante consulta/localização/preferências.
- **Critérios de aceite:** Coordenadas sintéticas aparecem somente na requisição autorizada ao provedor, não na navegação, storage, mensagens ou diagnósticos. Preferências não contêm ID/fuso/cache; não há persistência em servidor/analytics.
- **Dependências:** T-57, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/privacy.spec.ts`.
- **Rastreabilidade:** CA-07.2, CA-07.3; EC-19; RNF-06.

### T-79 — Instalar scanner de acessibilidade de desenvolvimento

- **ID:** T-79
- **Tipo:** Infra
- **Descrição:** Adicionar somente `@axe-core/playwright` como dev dependency via pnpm.
- **Critérios de aceite:** Manifest/lockfile consistentes, import resolvido e build preservado; nenhuma dependência adicionada ao runtime. Sem escrever suíte nesta tarefa.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Rastreabilidade:** RNF-02.

### T-80 — Automatizar acessibilidade dos estados

- **ID:** T-80
- **Tipo:** Test
- **Descrição:** Verificar semântica, teclado e scanner nos estados principais.
- **Critérios de aceite:** Idle/loading/vazio/sucesso/parcial/erro passam regras WCAG 2.2 A/AA e anteriores aplicáveis sem violações detectadas. Verificar labels, foco, regiões de status e recuperação por teclado; automação não comprova anúncio percebido nem conformidade integral.
- **Dependências:** T-55, T-57, T-58, T-64, T-79.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Rastreabilidade:** EC-29; RNF-02.

### T-81 — Verificar larguras e toque

- **ID:** T-81
- **Tipo:** Test
- **Descrição:** Executar matriz parametrizada de responsividade.
- **Critérios de aceite:** Em 320/390/768/1366/1920 CSS px, sucesso/loading/vazio/parcial/erro não causam overflow e controles/nomes longos permanecem acessíveis. Busca, unidade, localização e recuperação funcionam sem hover; 390 × 844 exercita toque. Corrigir produto exige unidade separada.
- **Dependências:** T-55, T-56, T-57, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-82 — Alinhar execução integral da CI

- **ID:** T-82
- **Tipo:** Infra
- **Descrição:** Executar os gates existentes e projetos declarados num workflow.
- **Critérios de aceite:** CI instala três engines/dependências e executa `pnpm lint`, `pnpm check`, `pnpm build`, `pnpm test`, `pnpm test:e2e`, nessa ordem compatível com preview. Relatório identifica desktop/mobile e falhas originais sem mascará-las por retry/skip; artefatos sintéticos têm retenção definida.
- **Dependências:** T-59, T-60, T-65, T-66, T-67, T-68, T-69, T-70, T-71, T-72, T-73, T-74, T-75, T-76, T-77, T-78, T-80, T-81.
- **Arquivos prováveis:** `.github/workflows/ci.yml`.
- **Rastreabilidade:** RNF-04, RNF-06, RNF-07; gate de merge do plano.

## Entrega 7 — Evidências de aceite

Não presumir aprovação pela existência dos scripts. Esta entrega registra execuções reais separadas da CI determinística.

### T-83 — Preparar medidor reproduzível de performance

- **ID:** T-83
- **Tipo:** Test
- **Descrição:** Instrumentar acionamento até commit visual utilizável no build de produção.
- **Critérios de aceite:** Medidor consome fixtures dez cidades/cinco dias e entrega após 500 ms; controla 10 Mbps bidirecional/100 ms adicionais, mobile 390 × 844/CPU 4× e desktop 1366 × 768 sem desaceleração. Comprovar throttling efetivo; se route o contornar, usar transporte de fixture limitado no segundo arquivo. Saída inclui amostras brutas e grupos de falha separados, não apenas médias.
- **Dependências:** T-55, T-64.
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `tests/fixtures/performanceTransport.ts`.
- **Rastreabilidade:** RNF-03.

### T-84 — Executar e registrar os quatro grupos p95

- **ID:** T-84
- **Tipo:** Test
- **Descrição:** Medir busca e forecast separadamente nos dois perfis aprovados.
- **Critérios de aceite:** Por perfil, 100 buscas e 100 forecasts bem-sucedidos, um fluxo por vez, sem cache meteorológico. Cada grupo tem 95º valor ordenado ≤ 3 s. Evidência referencia amostras/artefatos, máquina, versões e limitações; erros/timeouts ficam separados e falha não vira aprovação.
- **Dependências:** T-83.
- **Arquivos prováveis:** `tests/acceptance/performance.md`.
- **Rastreabilidade:** RNF-03.

### T-85 — Preparar smoke live separado

- **ID:** T-85
- **Tipo:** Test
- **Descrição:** Criar jornada real com cidade pública fixa, fora da suíte de PR.
- **Critérios de aceite:** Configuração exclusiva sem interceptação de geocoding/forecast executa busca, seleção e previsão nos perfis desktop/mobile. Verificar CORS, campos/unidades/fuso, não valores fixos; sem localização pessoal, p95 controlado ou retry que esconda falha.
- **Dependências:** T-54, T-62.
- **Arquivos prováveis:** `tests/live/openMeteo.spec.ts`, `playwright.live.config.ts`.
- **Rastreabilidade:** RF-01 a RF-03; RNF-03, RNF-04.

### T-86 — Registrar integração real por perfil

- **ID:** T-86
- **Tipo:** Test
- **Descrição:** Executar smoke live e registrar resultado/latência.
- **Critérios de aceite:** Desktop/mobile possuem data, versões, resultado e evidência da jornada completa. Falha externa registra “integração não validada” até nova execução bem-sucedida, preservando histórico; execução real não integra amostra p95.
- **Dependências:** T-85.
- **Arquivos prováveis:** `tests/acceptance/live-integration.md`.
- **Rastreabilidade:** RNF-03, RNF-04.

### T-87 — Inspecionar acessibilidade visual e teclado

- **ID:** T-87
- **Tipo:** Test
- **Descrição:** Executar inspeção manual sem leitor de tela.
- **Critérios de aceite:** Registrar critérios WCAG aplicáveis, contraste, foco, labels, operação por teclado, zoom 200% e reflow 320 CSS px nos fluxos completos. Resultado por critério inclui passos/evidência; falha aplicável impede aceite.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-88 — Validar anúncios com NVDA

- **ID:** T-88
- **Tipo:** Test
- **Descrição:** Executar fluxos com NVDA/Chrome no Windows.
- **Critérios de aceite:** Registrar versões e critérios assistivos aplicáveis; loading/vazio/erro são percebidos uma vez, foco da busca permanece e recuperação é alcançável por teclado. Consultar clima/previsão/controles sem depender de ícones. Ambiente indisponível mantém pendência.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** EC-29; RNF-02.

### T-89 — Validar anúncios com VoiceOver

- **ID:** T-89
- **Tipo:** Test
- **Descrição:** Executar fluxos com VoiceOver/Safari no iOS.
- **Critérios de aceite:** Registrar versões e critérios assistivos aplicáveis; anúncios/foco/recuperação e leitura de dados/controles funcionam no dispositivo real. Evidência distingue resultado percebido de DOM correto; indisponibilidade/falha não conta como aprovação.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** EC-29; RNF-02, RNF-07.

### T-90 — Validar compatibilidade no Windows

- **ID:** T-90
- **Tipo:** Test
- **Descrição:** Executar a mesma jornada parametrizada em Chrome/Edge/Firefox no Windows 11.
- **Critérios de aceite:** Registrar versões estáveis na data e resultado por navegador: busca/seleção, clima, unidade, localização, preferências e recuperação. Falha identifica navegador/passos; não substituir execução real por engine da CI.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-07; RF-01 a RF-08.

### T-91 — Validar Safari no macOS

- **ID:** T-91
- **Tipo:** Test
- **Descrição:** Executar jornada de compatibilidade no Safari real desktop.
- **Critérios de aceite:** Registrar versão estável, sistema e resultados dos mesmos fluxos de T-90, incluindo layout/foco. WebKit emulado não serve como evidência; ausência do ambiente deixa pendência.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-01, RNF-07.

### T-92 — Validar navegadores móveis reais

- **ID:** T-92
- **Tipo:** Test
- **Descrição:** Executar a jornada parametrizada em Safari/iOS e Chrome/Android.
- **Critérios de aceite:** Registrar dispositivo/sistema/versão estável e resultado por perfil dos fluxos de T-90. Toque, teclado virtual, layout e recuperação funcionam sem hover; emulação não substitui evidência real.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-01, RNF-07.

## Entrega 8 — Pré-publicação e fechamento

As decisões operacionais não bloqueiam desenvolver o MVP. Não escolher hospedagem, implementar backend, anunciar SLA ou executar deploy implicitamente. Arquivo de configuração da hospedagem em T-97 só é identificado após T-95.

### T-93 — Registrar auditoria de dependências

- **ID:** T-93
- **Tipo:** Infra
- **Descrição:** Executar `pnpm audit --prod` e triar resultado, sem corrigir código nesta unidade.
- **Critérios de aceite:** Registrar data, comando, resultado e ação para cada achado; base inacessível deixa pendência. Alta/crítica não resolvida bloqueia publicação até decisão documentada. Correções necessárias viram tarefas próprias por dependência, com nova auditoria e gates afetados.
- **Dependências:** T-79, T-82.
- **Arquivos prováveis:** `tests/acceptance/dependencies.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-94 — Revalidar termos e contrato do provedor

- **ID:** T-94
- **Tipo:** Infra
- **Descrição:** Registrar condições atuais de uso, atribuição e dados externos.
- **Critérios de aceite:** Evidenciar uso não comercial, limites, licença, destinatários e possível retenção de coordenadas pelo provedor. Reconfirmar campos obrigatórios; remoção estrutural bloqueia entrega até revisão. Chave/uso comercial exige revisão de escopo, nunca segredo no bundle.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** CA-02.3; RNF-06; Assumptions e checklist de publicação.

### T-95 — Definir condições operacionais da hospedagem

- **ID:** T-95
- **Tipo:** Infra
- **Descrição:** Obter decisões dos responsáveis, sem implementar infraestrutura de produção.
- **Critérios de aceite:** Registrar hospedagem HTTPS, responsáveis por publicação/suporte/incidentes, rollback e monitoramento sintético sem localização pessoal. Identificar caminho concreto da configuração de headers para T-97. Ausência de decisão mantém tarefa aberta; sem SLA implícito.
- **Dependências:** nenhuma; obter decisões dos responsáveis.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-04; Out of Scope e checklist de publicação.

### T-96 — Documentar logs e destinatários da hospedagem

- **ID:** T-96
- **Tipo:** Infra
- **Descrição:** Confirmar retenção/acesso dos logs e informações de privacidade operacionais.
- **Critérios de aceite:** Evidência identifica quais logs a hospedagem mantém, prazo, acesso e destinatários externos junto aos do provedor. Não prometer exclusão/ausência de logs de terceiros; lacunas ficam explícitas e bloqueiam conclusão.
- **Dependências:** T-94, T-95.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-97 — Aplicar e verificar headers do destino escolhido

- **ID:** T-97
- **Tipo:** Infra
- **Descrição:** Configurar uma política de segurança coesa na hospedagem definida.
- **Critérios de aceite:** Destino HTTPS real demonstra CSP limitada a recursos próprios/dois hosts oficiais necessários, proibição de enquadramento, `Referrer-Policy: no-referrer` e geolocalização restrita à própria origem. Busca/forecast/localização funcionam, sem conteúdo misto; registrar respostas e resultado, não apenas preview local.
- **Dependências:** T-55, T-57, T-95.
- **Arquivos prováveis:** um arquivo de configuração de headers identificado em T-95; `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-98 — Consolidar aceite do MVP

- **ID:** T-98
- **Tipo:** Test
- **Descrição:** Referenciar evidências existentes sem adicionar testes ou corrigir produto.
- **Critérios de aceite:** Cada CA/EC possui teste/procedimento e resultado; cada RNF aponta evidência pertinente. CI, quatro grupos p95, smoke live, acessibilidade e compatibilidade reais foram demonstrados. Falha/skip/ambiente ausente impede aceite completo; ausência estrutural de campo exige revisão, não placeholder permanente.
- **Dependências:** T-82, T-84, T-86, T-87, T-88, T-89, T-90, T-91, T-92.
- **Arquivos prováveis:** `tests/acceptance/coverage.md`.
- **Rastreabilidade:** RF-01 a RF-08; RNF-01 a RNF-07; todos os CA/EC.

### T-99 — Registrar decisão de prontidão de publicação

- **ID:** T-99
- **Tipo:** Infra
- **Descrição:** Confrontar aceite, auditoria e checklist operacional com os responsáveis.
- **Critérios de aceite:** Referenciar evidências de aceite, auditoria, termos/logs/headers; nenhum critério obrigatório ou falha de segurança pendente é aprovado implicitamente. Registrar decisão e bloqueios dos responsáveis; conclusão não equivale a deploy, SLA ou ampliação de escopo.
- **Dependências:** T-93, T-96, T-97, T-98.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-04, RNF-06; checklist de publicação.

## Rastreabilidade para execução

Referências abaixo são os **IDs atuais**. Intervalos são inclusivos. Preencher nomes concretos de testes, procedimentos e resultados em T-98; não criar cobertura duplicada para cada referência.

| Story / critérios principais | Comportamento e evidência integrada |
|---|---|
| US-01 — CA-01.1 a CA-01.3 | T-18, T-27, T-30, T-43, T-44, T-53, T-65. |
| US-02 — CA-02.1 a CA-02.3 | T-08, T-10, T-19, T-46, T-49, T-54, T-68. |
| US-03 — CA-03.1 a CA-03.3 | T-05, T-11, T-19, T-47, T-48, T-54, T-68. |
| US-04 — CA-04.1 a CA-04.4 | T-04, T-37, T-50, T-56, T-70. |
| US-05 — CA-05.1 a CA-05.4 | T-13, T-14, T-24, T-27, T-45, T-65, T-66. |
| US-06 — CA-06.1 a CA-06.3 | T-23, T-35, T-51, T-57, T-71. |
| US-07 — CA-07.1 a CA-07.3 | T-20, T-21, T-36, T-37, T-52, T-58, T-72. |
| US-08 — CA-08.1 a CA-08.3 | T-30, T-33, T-34, T-35, T-55, T-71, T-74, T-75. |

| Cenários complementares | Evidência responsável |
|---|---|
| EC-01, EC-02, EC-04, EC-05, EC-35 | T-18/T-27/T-43/T-44; jornada T-65. |
| EC-03 | T-18/T-44; browser T-76. |
| EC-06 | T-13/T-27; jornada T-66. |
| EC-07 | T-14/T-23/T-35; jornadas T-66/T-71. |
| EC-08, EC-09, EC-39 | T-15/T-29/T-32; browser T-67. |
| EC-10 a EC-14, EC-36 | T-08/T-10/T-11/T-12; componentes T-46/T-47/T-48; browser T-69. |
| EC-15, EC-16, EC-33 | T-28/T-31; jornadas T-66/T-74. |
| EC-17, EC-18, EC-19 | T-23/T-35/T-37/T-51; browser T-71/T-78. |
| EC-20 | T-05/T-06/T-11; browser T-68. |
| EC-21, EC-34 | T-04; jornada T-70. |
| EC-22, EC-23, EC-30, EC-42 | T-20/T-21/T-36/T-37; visitas T-72. |
| EC-24, EC-37, EC-38 | T-22/T-26/T-38/T-60; visitas T-73. |
| EC-25, EC-26 | T-25/T-30/T-33; browser T-74. |
| EC-27, EC-28, EC-31 | T-06/T-07/T-34; componentes T-46/T-48; browser T-75. |
| EC-29 | T-43/T-45; automação T-66/T-80; percepção real T-88/T-89. |
| EC-32 | T-24/T-31/T-59. |
| EC-40, EC-41 | T-47/T-49; browser T-68. |
| EC-43 | T-05/T-06/T-07/T-11/T-12; apresentação T-46/T-48; browser T-69. |
| EC-44 | T-37/T-56/T-60; contagem de chamadas T-70. |

| Qualidade | Evidência responsável |
|---|---|
| RNF-01 | T-81, T-87, T-91, T-92. |
| RNF-02 | T-80 (automação), T-87/T-88/T-89 (inspeção manual/assistiva). |
| RNF-03 | T-83/T-84 (quatro grupos p95), T-85/T-86 (integração real separada). |
| RNF-04 | T-13/T-14/T-15/T-23/T-27 a T-38 (regras e coordenação), T-66/T-67/T-71/T-74 (recuperação); T-95 (operação). |
| RNF-05 | T-04 a T-08 (regras), T-46 a T-50 (apresentação), T-68/T-70/T-75 (integração), T-42 (idioma do documento). |
| RNF-06 | T-13/T-20 a T-23/T-37/T-38 (fronteiras), T-51 (informação), T-76/T-77/T-78 (browser), T-93/T-94/T-96/T-97 (publicação). |
| RNF-07 | T-62/T-82 (engines), T-90/T-91/T-92 (navegadores reais). |

## Correspondência da revisão

Coluna esquerda: **ID antigo**, válido apenas para histórico desta revisão. Coluna direita: tarefas atuais que substituem seu escopo; não são novas dependências. Tarefas antes pequenas foram preservadas em escopo e renumeradas para manter ordem topológica.

| ID antigo | IDs atuais | Motivo da divisão ou preservação |
|---|---|---|
| T-01 | T-01, T-02, T-03 | Três contratos/arquivos distintos. |
| T-02 | T-04 | Conversão e teste focado já formavam uma unidade. |
| T-03 | T-05, T-06, T-07 | Calendário, resolução DST e atualidade são regras diferentes. |
| T-04 | T-08, T-09, T-10 | WMO, guards e normalização atual tinham cinco arquivos. |
| T-05 | T-11, T-12, T-17 | Séries, composição e fixtures separadas. |
| T-06 | T-13, T-14 | Transporte e controle de deadline separados. |
| T-07 | T-15 | Parsing de Retry-After preservado. |
| T-08 | T-16, T-18 | Fixture separada do serviço/teste. |
| T-09 | T-19 | Serviço e teste focado preservados. |
| T-10 | T-20, T-21, T-22 | Leitura, escrita e remoção são operações verificáveis distintas. |
| T-11 | T-23 | Fronteira de uma API preservada. |
| T-12 | T-24 | Transição de busca preservada. |
| T-13 | T-25, T-26 | Estado meteorológico separado de preferências. |
| T-14 | T-27, T-28, T-29 | Envio/retry, concorrência e rate limit separados. |
| T-15 | T-30, T-31, T-32 | Consulta, intenção vigente e rate limit separados. |
| T-16 | T-33, T-34 | Refresh separado do relógio de apresentação. |
| T-17 | T-35 | Uma cadeia localização → forecast, sem UI/persistência. |
| T-18 | T-36, T-37, T-38 | Restauração, escolhas e exclusão separadas. |
| T-19 | T-39, T-40, T-41, T-42 | Estilo, shell, boundary e instalação na raiz separados. |
| T-20 | T-43, T-44 | Formulário e lista tinham quatro arquivos. |
| T-21 | T-45 | Feedback por props preservado. |
| T-22 | T-46 | Cartão usa helpers prontos, sem implementar regra temporal. |
| T-23 | T-47, T-48 | Cartão diário separado da composição das seções. |
| T-24 | T-49 | Atribuição meteorológica preservada; GeoNames fica no catálogo T-44. |
| T-25 | T-50 | Controle por props preservado. |
| T-26 | T-51 | Informação e callback explícito preservados. |
| T-27 | T-52 | Apresentação de preferências preservada. |
| T-28 | T-53, T-54, T-55, T-56, T-57, T-58 | Uma ligação de fluxo por incremento; sem estilos/regras de dados. |
| T-29 | T-59, T-60 | Corridas cruzadas separadas; concorrência de cada fluxo fica em T-28/T-31. |
| T-30 | T-61, T-62 | Servidor de produção separado de engines/perfis. |
| T-31 | T-16, T-17, T-63, T-64 | Dados, guard de rede e controle de respostas separados. |
| T-32 | T-65, T-66, T-67 | Seleção, recuperação e rate limit são jornadas distintas. |
| T-33 | T-68, T-69 | Resposta completa separada de degradação parcial. |
| T-34 | T-70 | Uma jornada de unidade preservada. |
| T-35 | T-71 | Jornada opcional preservada com recursos já preparados. |
| T-36 | T-72, T-73 | Restauração separada de exclusão entre visitas. |
| T-37 | T-74, T-75 | Refresh separado da passagem do tempo. |
| T-38 | T-76, T-77, T-78 | Conteúdo, redirect e minimização separados. |
| T-39 | T-79, T-80 | Instalação manifest/lock separada da suíte. |
| T-40 | T-81 | Matriz parametrizada preservada, sem correções de UI embutidas. |
| T-41 | T-82 | Um workflow consumidor de projetos/suítes já prontos. |
| T-42 | T-83, T-84 | Instrumentação separada da execução/evidência. |
| T-43 | T-85, T-86 | Smoke/config separados do registro da execução. |
| T-44 | T-87, T-88, T-89 | Inspeção visual/teclado e dois leitores separados. |
| T-45 | T-90, T-91, T-92 | Matriz agrupada por plataforma/ambiente de execução. |
| T-46 | T-93 | Somente auditoria/triagem, sem correção de dependências embutida. |
| T-47 | T-94, T-95, T-96 | Termos, decisões operacionais e logs separados. |
| T-48 | T-97 | Uma configuração coesa com verificação; plataforma decidida antes. |
| T-49 | T-98 | Consolidação de evidências, sem testes/implementação novos. |
| T-50 | T-99 | Decisão documental de publicação preservada. |

**Gates distintos:** T-82 demonstra automação; T-98 demonstra aceite do MVP; T-99 registra condições de publicação. A criação ou revisão deste backlog não comprova nenhum desses resultados.
