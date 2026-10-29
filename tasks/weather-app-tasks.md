# Weather App — Backlog de Tarefas

**Entrada:** [plano técnico](../plans/weather-app-plan.md). **Fonte dos requisitos:** [especificação](../specs/weather-app-spec.md).

## Revisão de granularidade

O backlog anterior reunia responsabilidades distintas mesmo em tarefas de apenas dois arquivos. Foram divididos contratos, regras temporais, normalização, transporte, preferências, coordenação, apresentação, composição, jornadas E2E e evidências operacionais. A tabela final registra a correspondência dos **IDs antigos**, substituídos pelos IDs abaixo; não são tarefas adicionais.

**Todas as tarefas estão pendentes.** A ordem de leitura é a ordem recomendada de implementação: **tipos → funções puras → services → hook → componentes → integração → testes → hardening**. Todas as dependências aparecem antes dos consumidores. Os IDs foram preservados para não quebrar referências; por isso, após a reordenação, a numeração não é necessariamente crescente no documento.

| Etapa | Tarefas na ordem de execução |
|---|---|
| Tipos | T-01 a T-03 |
| Funções puras | T-04 a T-12 |
| Services e dados de teste necessários | T-13 a T-23 |
| Hook e reducer | T-24 a T-38 |
| Componentes e shell | T-39 a T-52 |
| Integração em App | T-53 a T-58 |
| Testes, infraestrutura de teste e evidências | T-100 a T-103; T-59 a T-75; T-79 a T-81; T-83 a T-92 |
| Hardening, CI e gates finais | T-76 a T-78; T-82; T-93 a T-99 |

As etapas orientam a sequência, mas não criam barreiras artificiais: **Dependências** lista os pré-requisitos reais de cada tarefa. “Nenhuma” significa que ela pode começar sem outra tarefa concluída. Testes focados acompanham cada implementação; fixtures T-16/T-17 precedem seus services consumidores e ferramentas T-61 a T-64/T-79 precedem as suítes que as utilizam. Tarefas independentes podem avançar em paralelo apenas se não houver disputa pelos mesmos arquivos. Validações finais de hardening não adiam as proteções já exigidas nos tipos, funções, services e hook.

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

### Protocolo de aceite aplicável às 103 tarefas

- **Aprovação binária:** todas as condições da tarefa devem ser demonstradas. Casos separados por barra ou enumerados como alternativas exigem verificações separadas, não a escolha de apenas um. Existência de arquivo, teste ou script não é aprovação.
- **Entrada → ação → saída:** cada teste/procedimento identifica a entrada controlada, executa a ação indicada e compara a saída com o resultado escrito no critério ou no CA/EC referenciado. “Cobrir” significa ter assertions do resultado, não apenas executar código. Não derivar o valor esperado chamando a própria função testada.
- **Contratos:** `pnpm build` deve encerrar com código 0 e a inspeção das declarações deve confirmar os campos/invariantes enumerados. Compilação isolada não comprova semântica meteorológica nem efeitos ausentes.
- **Automação:** registrar comando e casos executados com suas assertions aprovadas. Contadores comprovam “nenhuma chamada”/“sem retry”; comparar alvo, dados, mensagens, horários, preferências e loading antes/depois comprova descarte de resposta superada. Diagnósticos sanitizados contêm somente categoria, serviço e status permitido, nunca entrada ou objeto bruto.
- **Inspeção manual/documental:** registrar passos, resultado observado e evidência por item. Para WCAG, informar ID do critério, medição/observação e justificativa de não aplicabilidade quando houver; “parece acessível” não é resultado. Decisão operacional requer aprovação identificada do responsável, não somente um campo preenchido.
- **Rastreabilidade:** o campo de cada tarefa aponta os requisitos aplicáveis; escolhas técnicas adicionais são verificadas contra a seção correspondente do plano, sem criar requisito de produto novo. A matriz final indica o responsável integrado por CA/EC/RNF; T-98 registra as evidências concretas.

## Prioridade e tamanho relativo

Esta tabela classifica **cada uma das 103 tarefas uma única vez**. Intervalos são inclusivos; a classificação se aplica individualmente a cada ID da linha.

- **P0:** caminho da primeira consulta manual utilizável, recuperação essencial e testes que a comprovam.
- **P1:** completar funcionalidades e evidências obrigatórias do MVP após esse primeiro resultado.
- **P2:** condições operacionais e decisão de publicação, posteriores ao desenvolvimento. Não são opcionais se houver publicação para usuários reais.
- **P (pequena):** alteração localizada ou registro de uma evidência já produzida, com poucas ramificações.
- **M (média):** uma unidade delimitada, mas com validação, concorrência, integração ou matriz de casos. Não representa prazo em horas/dias.
- **G (grande):** múltiplas unidades ainda não divididas. **Nenhuma tarefa recebe G** neste backlog: se a execução revelar esse tamanho, dividir antes de começar, preservando critérios/dependências.

| Prioridade | Tamanho | Tarefas |
|---|---|---|
| P0 | P | T-01 a T-03; T-08; T-16, T-17; T-24 a T-26; T-39, T-40, T-42; T-49; T-61. |
| P0 | M | T-04 a T-07; T-09 a T-15; T-18, T-19; T-27 a T-32; T-41; T-43 a T-48; T-53 a T-55; T-59; T-62 a T-69; T-74, T-75, T-77; T-100 a T-103; T-33, T-34. |
| P1 | P | T-20 a T-22; T-50; T-79; T-86. |
| P1 | M | T-23; T-35 a T-38; T-51, T-52; T-56 a T-58; T-60; T-70 a T-73; T-76, T-78; T-80 a T-85; T-87 a T-93; T-98. |
| P2 | P | T-99. |
| P2 | M | T-94 a T-97. |

O tamanho inclui a verificação focada indicada na tarefa, mas não soma seus pré-requisitos. T-06/T-11 (tempo/normalização), T-28/T-31/T-38 (corridas), T-83 (medição) e T-97 (hospedagem) têm maior incerteza: continuam unidades delimitadas, não compromissos de prazo. Dependências prevalecem sobre prioridade; nunca iniciar um consumidor pulando um pré-requisito.

## Sequência sugerida em fatias verticais

As entregas por camada abaixo continuam sendo o catálogo técnico. Para executar, usar a sequência de fatias desta tabela: **dentro de cada fatia, seguir a ordem de dependências**, combinando tipos → funções → services → hook → componentes → integração → testes. Não é necessário terminar todas as tarefas de uma camada do produto antes de mostrar uma fatia.

Cada ID aparece em uma única fatia; tarefas de fatias anteriores são reutilizadas. A fatia 0 é apenas preparação visual, não uma jornada vertical completa. A primeira jornada ponta a ponta é a fatia 1. Demonstrações intermediárias não equivalem a aceite do MVP nem autorizam publicação.

| Fatia | Tarefas novas | Resultado visível e condição de demonstração |
|---|---|---|
| **0 — Tela visível primeiro** | T-39 a T-42. | Preview com shell pt-BR, tema dark, foco e fallback de render testado. Ainda sem consulta; não apresentar dados fictícios como clima real. Pode começar imediatamente, sem esperar services/hook. |
| **1 — Buscar cidade e ver o clima** | T-01 a T-19; T-24 a T-32; T-43 a T-49; T-53, T-54; T-59; T-61 a T-69; T-77; T-100 a T-103. | Buscar, selecionar e visualizar atuais/cinco dias com atribuição, loading/vazio/erro e recuperação manual, inclusive mobile 390 × 844. Unitários/services/componentes e E2E principal aprovados. Mocks são identificados como ambiente de teste; comprovação da API real ocorre em T-85/T-86. |
| **2 — Atualizar e entender a atualidade** | T-33, T-34, T-55; T-74, T-75; T-83 a T-86. | Atualização manual com horário, snapshot preservado em falha e avisos de idade/período sem polling. Demonstrar smoke live separado e registrar p95 dos dois perfis; falha externa ou de performance permanece pendência explícita. |
| **3 — Personalizar e usar localização com controle** | T-20 a T-23; T-35 a T-38; T-50 a T-52; T-56 a T-58; T-60; T-70 a T-73; T-76, T-78. | Alternar unidade sem rede, consultar localização somente após informação/clique e restaurar/apagar preferências sem recriação por resposta tardia. Jornadas correspondentes demonstradas; nenhum dado preciso persistido. |
| **4 — Fechar qualidade e aceite do MVP** | T-79 a T-82; T-87 a T-93; T-98. | Mesmas jornadas verificadas por scanner, larguras/toque, leitores de tela e navegadores reais; CI integral e matriz de aceite com evidências. Sem ambientes/evidências, manter aceite pendente. Auditoria registrada, sem confundir sua execução com correção dos achados. |
| **5 — Preparar publicação responsável** | T-94 a T-97; T-99. | Termos, responsáveis, logs e headers do destino confirmados; decisão explícita de pronto/não pronto. Não inclui deploy nem SLA. |

**Limite atual para uma fatia de busca menor:** T-53 depende de T-30, que exige forecast e suas regras de normalização. Assim, com o grafo aprovado, a busca integrada em App não é uma entrega independente do caminho meteorológico. A proposta mantém esse contrato, antecipa o shell e entrega a consulta completa na primeira fatia funcional, sem inventar seleção parcial ou remover proteções para encurtá-la.

## Entrega 1 — Tipos

### T-01 — Definir contratos meteorológicos

- **ID:** T-01
- **Tipo:** Data
- **Descrição:** Declarar os modelos meteorológicos do plano.
- **Critérios de aceite:** `pnpm build` encerra com código 0; inspeção compara nomes/campos de `City`, `Unit`, `CurrentWeather`, `ForecastDay`, `WeatherData`, localização e preferências ao Data Model do plano, sem campo obrigatório ausente. `Unit` é `'celsius' | 'fahrenheit'`, temperaturas de origem têm sufixo `C`, ausências usam `null` e forecast é readonly. Arquivo exporta somente tipos, sem código de efeito.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Rastreabilidade:** RF-01 a RF-04, RF-06 a RF-08.

### T-02 — Definir contratos de resultado e erro

- **ID:** T-02
- **Tipo:** Data
- **Descrição:** Declarar `Result`, `AppError`, serviços e contexto de requisição.
- **Critérios de aceite:** `pnpm build` encerra com código 0. Inspeção confirma `Result<T>` com `ok/value` ou `ok/error`; `AppError` contém categoria (incluindo `unexpected`), serviço, `status: number | null` e `retryAtMs: EpochMs | null`, conforme Data Model do plano. Contexto contém signal/relógio; não há query, URL, coordenadas, corpo externo ou classe de infraestrutura.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/errors.ts`.
- **Rastreabilidade:** RF-05; RNF-06.

### T-03 — Definir contratos de estado

- **ID:** T-03
- **Tipo:** Data
- **Descrição:** Declarar estados representáveis de busca e consulta.
- **Critérios de aceite:** `pnpm build` encerra com código 0; inspeção compara as uniões ao State Management do plano: busca tem idle/loading/success/empty/error; clima não tem empty e loading distingue location/forecast. Variantes com snapshot têm alvo; `AppState` possui bloqueios distintos de geocoding/forecast. Nenhuma combinação usa flags para substituir os discriminantes definidos.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/types/state.ts`.
- **Rastreabilidade:** RF-05, RF-08; EC-25, EC-26, EC-32.

## Entrega 2 — Funções puras

### T-04 — Converter e formatar temperaturas

- **ID:** T-04
- **Tipo:** Data
- **Descrição:** Derivar apresentação pt-BR a partir de Celsius sem estado adicional.
- **Critérios de aceite:** Vitest compara 0 °C → 32 °F, 100 °C → 212 °F e −40 °C → −40 °F; `null` continua indisponível. De 12,34 °C, dez alternâncias terminando em Celsius mostram 12,3 °C e em Fahrenheit mostram 54,2 °F. Em Celsius, −1,25/1,25/−0,04 resultam em −1,3/1,3/0, respectivamente, com vírgula pt-BR, até uma decimal e sem −0.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `tests/unit/units.test.ts`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-21, EC-34; RNF-05.

### T-05 — Operar datas de calendário local

- **ID:** T-05
- **Tipo:** Data
- **Descrição:** Validar datas/fusos e gerar cinco datas a partir de início confiável fornecido.
- **Critérios de aceite:** Vitest rejeita `2026-02-30` e fuso não reconhecido. De `2026-10-30` em `America/New_York`, retorna 30/10, 31/10, 01/11, 02/11 e 03/11/2026; de `2026-12-30` em `Pacific/Auckland`, retorna 30/12, 31/12/2026, 01/01, 02/01 e 03/01/2027. Asserções mantêm essas datas com os fusos de processo/dispositivo de EC-20; sem início confiável, não gerar período pelo relógio.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** CA-03.3; EC-20, EC-43; RNF-05.

### T-06 — Resolver referência temporal inequívoca

- **ID:** T-06
- **Tipo:** Data
- **Descrição:** Converter referência com offset ou correspondência única no fuso IANA.
- **Critérios de aceite:** Vitest compara `2026-10-29T13:00:00-03:00` ao instante `2026-10-29T16:00:00Z`, inclusive sem fuso IANA. Em `America/New_York`, `2026-03-08T02:30` e `2026-11-01T01:30` retornam `null`; uma referência local única retorna o instante esperado, confirmado por volta aos mesmos componentes locais. Sem fuso/offset, retornar `null`, não aplicar offset fixo ou fuso do dispositivo. Se não for possível demonstrar esses resultados com helper pequeno, a tarefa fica bloqueada até revisão da decisão de datas do plano; não aprovar por registro da dificuldade.
- **Dependências:** T-05.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** EC-20, EC-28, EC-43; RNF-05.

### T-07 — Derivar atualidade e apresentação temporal

- **ID:** T-07
- **Tipo:** Data
- **Descrição:** Calcular idade/período anterior e formatar conclusão com relógio explícito.
- **Critérios de aceite:** Com referência às 13h, Vitest retorna ausência de marca por idade às 14h e “Desatualizado” às 14h01; referência ausente/inválida/futura retorna “Atualidade desconhecida”. Conclusão fornecida às 14h continua distinta da referência às 13h. À meia-noite local, período anterior é identificado sem mudar datas. Fuso inválido produz conclusão UTC explicitamente rotulada e aviso; nenhum resultado usa fuso do dispositivo/geocoding.
- **Dependências:** T-06.
- **Arquivos prováveis:** `src/lib/dates.ts`, `tests/unit/dates.test.ts`.
- **Rastreabilidade:** CA-08.2; EC-27, EC-28, EC-31, EC-43; RNF-05.

### T-08 — Mapear condições WMO

- **ID:** T-08
- **Tipo:** Data
- **Descrição:** Implementar a tabela textual pt-BR da spec.
- **Critérios de aceite:** Tabela de testes compara cada código WMO listado no contrato da spec ao texto pt-BR correspondente, incluindo intensidade. Código fora da lista retorna condição indisponível e nenhum ícone arbitrário; a saída contém texto mesmo sem ícone/cor.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`, `tests/unit/weatherCodes.test.ts`.
- **Rastreabilidade:** CA-02.1; EC-14; RNF-02, RNF-05.

### T-09 — Validar domínios externos

- **ID:** T-09
- **Tipo:** Data
- **Descrição:** Criar guards puros para números, coordenadas e identidade.
- **Critérios de aceite:** Vitest rejeita tipos incompatíveis, `NaN`, infinitos, latitude fora de −90 a 90, longitude fora de −180 a 180, nome vazio e ID não inteiro. Aceita limites de coordenadas, porcentagens 0/100 e vento 0; rejeita porcentagens −1/120 e vento negativo. Temperatura negativa/zero é válida. Inspeção confirma zero acesso a navegador/relógio.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/validation.ts`, `tests/unit/validation.test.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-06; EC-11; RNF-06.

### T-10 — Normalizar condições atuais

- **ID:** T-10
- **Tipo:** Data
- **Descrição:** Transformar seção atual e unidades externas em `CurrentWeather`.
- **Critérios de aceite:** Vitest invalida apenas campos com unidade/domínio incompatível; preserva zero e variáveis válidas. `current.precipitation` em mm vira `precipitationMm`, aceitando zero e rejeitando negativos; `current.pressure_msl` em hPa vira `pressureMslHpa`, aceitando apenas positivos finitos. Ausência ou unidade incompatível nesses campos gera `null` sem invalidar os demais. Seção sem campo meteorológico válido resulta em `null`, mesmo contendo horário. Referência usa T-06, não relógio implícito.
- **Dependências:** T-06, T-08, T-09.
- **Arquivos prováveis:** `src/lib/normalizeWeather.ts`, `tests/unit/normalizeCurrent.test.ts`.
- **Rastreabilidade:** CA-02.1, CA-02.2; EC-10, EC-11, EC-13, EC-14, EC-36.

### T-11 — Normalizar séries diárias

- **ID:** T-11
- **Tipo:** Data
- **Descrição:** Associar valores às datas sem deslocar índices ou fabricar período.
- **Critérios de aceite:** Com âncora/fuso válidos, Vitest compara exatamente cinco datas e campos às entradas; lacuna identificável recebe campos `null` sem mover valores dos dias seguintes. Sem âncora/fuso, previsão é `[]`. Série com tamanho diferente de `daily.time` tem seus campos invalidados, preservando outras séries; todas as posições de data duplicada são invalidadas, datas inválidas/fora do período não deslocam valores. Unidade incompatível invalida campos afetados; mínima maior que máxima não é corrigida trocando valores.
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

## Entrega 3 — Services e APIs do navegador

### T-13 — Implementar transporte e classificação HTTP

- **ID:** T-13
- **Tipo:** Data
- **Descrição:** Ler JSON como `unknown` com opções seguras de fetch.
- **Critérios de aceite:** Mock verifica HTTPS/hosts constantes, credenciais omitidas, `cache: 'no-store'`, `redirect: 'error'`, `referrerPolicy: 'no-referrer'` e sinal externo. Rejeição de fetch retorna `network`; HTTP 400/500 retorna `http` com status; JSON inválido ou `error: true` em HTTP 200 retorna `invalid-response`; todos com `ok: false`, nunca lista vazia. Captura dos diagnósticos não contém URL/corpo/localização nem objeto bruto.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** CA-05.3, CA-05.4; EC-06; RNF-06.

### T-14 — Aplicar deadline completo de requisição

- **ID:** T-14
- **Tipo:** Data
- **Descrição:** Encerrar transporte pendente e impedir aceite após o prazo.
- **Critérios de aceite:** Fake timers verificam promessa pendente aos 9.999 ms e `ok: false`/`timeout` aos 10.000 ms, tanto aguardando fetch quanto corpo retido. Conferência final rejeita aceite após deadline, mesmo com resposta utilizável; cancelamento externo invalida operação, sem sucesso tardio. Contador mantém uma chamada, e conclusão/cancelamento remove timers/listeners instalados pela operação.
- **Dependências:** T-13.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** EC-07, EC-33; RF-05.

### T-15 — Interpretar Retry-After

- **ID:** T-15
- **Tipo:** Data
- **Descrição:** Retornar erro 429 com prazo válido opcional e serviço identificado.
- **Critérios de aceite:** Com relógio fixo `now`, Vitest compara `Retry-After: 30` e data HTTP 30 s futura a `retryAtMs = now + 30.000`. Zero/data passada não criam espera futura; valor inválido, ausente ou inacessível retorna prazo `null`. Todos retornam `rate-limit` e serviço afetado; contador de fetch permanece uma chamada, sem retry ou bloqueio inferido do outro serviço.
- **Dependências:** T-14.
- **Arquivos prováveis:** `src/services/http.ts`, `tests/unit/http.test.ts`.
- **Rastreabilidade:** EC-08, EC-09, EC-39.

### T-16 — Preparar respostas sintéticas de geocoding

- **ID:** T-16
- **Tipo:** Test
- **Descrição:** Disponibilizar dados controlados reutilizáveis de localidades.
- **Critérios de aceite:** Inspeção das fixtures confirma listas com exatamente 10 e 12 itens em ordem explícita, pares homônimos com/sem contexto distintivo, nome longo/não latino, resposta vazia e item inválido. Cada variante declara o resultado esperado (IDs/ordem aceitos ou erro); dados são sintéticos, sem localização pessoal. `pnpm build` encerra com código 0; variantes inválidas permanecem entradas externas `unknown`, não casts para `City`.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tests/fixtures/geocoding.ts`.
- **Rastreabilidade:** EC-02, EC-04, EC-05, EC-35; RNF-06.

### T-17 — Preparar respostas sintéticas de forecast

- **ID:** T-17
- **Tipo:** Test
- **Descrição:** Disponibilizar resposta completa e variantes parciais reutilizáveis.
- **Critérios de aceite:** Fixture completa contém exatamente cinco datas e todas as unidades/variáveis atuais/diárias do plano. Variantes separadas representam zero, lacuna, série curta, datas duplicadas/inválidas, fuso/âncora ausentes e seções inutilizáveis; cada uma declara datas/campos preservados, campos `null` ou erro esperado. Inspeção confirma dados sintéticos e `pnpm build` encerra com código 0; JSON inválido é entrada `unknown`, não modelo interno forçado.
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
- **Critérios de aceite:** Mock compara endpoint e cada parâmetro `current`/`daily` ao External APIs do plano, incluindo `precipitation`/`pressure_msl` em `current`, com `forecast_days=5`, `timezone=auto`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `precipitation_unit=mm`, `timeformat=iso8601`. Sem mockar normalizador, fixture completa retorna campos esperados, parcial retorna `partial: true` e ambas as seções inutilizáveis retornam `invalid-response`. Local mantém alvo solicitado mesmo com grade diferente; sinal cancelado/deadline vencido impede retorno utilizável. Horário definitivo de conclusão só é confirmado pelo controlador vigente.
- **Dependências:** T-12, T-15, T-17.
- **Arquivos prováveis:** `src/services/forecast.ts`, `tests/unit/forecast.test.ts`.
- **Rastreabilidade:** CA-01.3, CA-02.1, CA-03.2, CA-08.1; EC-07, EC-43.

### T-20 — Ler preferências com validação independente

- **ID:** T-20
- **Tipo:** Data
- **Descrição:** Recuperar somente cidade/unidade válidas da chave própria.
- **Critérios de aceite:** Vitest compara chave ausente a preferências vazias sem descarte; `C|F` a `celsius|fahrenheit`. Cidade inválida com `F` preserva Fahrenheit e marca descarte da cidade; JSON corrompido informa descarte do conteúdo, sem preferências inventadas. Exceção de leitura retorna `storage-read`; contador de rede/geolocalização é zero em todos os casos.
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
- **Critérios de aceite:** Vitest conta zero acessos ao importar/inicializar; chamada explícita usa `maximumAge: 0` sem exigir alta precisão e devolve coordenadas válidas. Negação retorna `permission-denied`; ausência de suporte/posição indisponível retorna `unavailable`; aos 10.000 ms pendentes retorna `timeout`. Callback após prazo não muda resultado; captura de storage/diagnóstico não contém coordenadas.
- **Dependências:** T-02, T-09.
- **Arquivos prováveis:** `src/services/geolocation.ts`, `tests/unit/geolocation.test.ts`.
- **Rastreabilidade:** CA-06.1 a CA-06.3; EC-07, EC-18, EC-19.

## Entrega 4 — Hook e reducer

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
- **Critérios de aceite:** Vitest envia “ São Paulo ” como “São Paulo”; editar texto ou enviar só espaços faz zero chamadas. Lista válida gera success, vazio documentado gera empty e falha gera error, encerrando loading. Após enviar A e editar B sem envio, retry chama A. Rejeição inesperada gera `unexpected` e diagnóstico somente de categoria/serviço, sem input/objeto bruto.
- **Dependências:** T-18, T-26.
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
- **Critérios de aceite:** Após 429 com prazo de 30 s, fake timers/contadores comprovam zero novas chamadas de geocoding aos 29.999 ms para termo igual ou diferente. Aos 30.000 ms, contador permanece igual até ação manual, que inicia exatamente uma chamada. Prazo `null`/passado permite essa ação sem espera; estado mantém erro do serviço geocoding.
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
- **Critérios de aceite:** Vitest conta zero acessos iniciais; clique inicia uma localização. Localização pendente expira aos 10.000 ms; se coordenadas chegam aos 9.000 ms, forecast recebe prazo próprio até 19.000 ms. Seleção manual posterior impede forecast pelo callback tardio. Retry após erro de localização só ocorre por ação; após erro de forecast conhecido, repete forecast com zero novos acessos à localização. Alvo é device/“Sua localização”; zero chamadas de reverse geocoding.
- **Dependências:** T-23, T-32.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.location.test.ts`.
- **Rastreabilidade:** CA-06.1 a CA-06.3, CA-08.1; EC-07, EC-17 a EC-19.

### T-36 — Restaurar preferências sem iniciar consulta

- **ID:** T-36
- **Tipo:** Data
- **Descrição:** Ler preferências na abertura e resolver cidade somente após confirmação.
- **Critérios de aceite:** Vitest com cidade/Fahrenheit salvos conta zero chamadas de rede/localização na abertura; unidade fica Fahrenheit e não há alvo ativo. Confirmar chama geocoding uma vez; resultado único não dispara forecast até seleção. Falha de leitura mantém estado inicial com feedback; descarte só da cidade mantém Fahrenheit com feedback, e busca manual continua acionável.
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

## Entrega 5 — Componentes e shell

### T-39 — Definir estilos globais e foco

- **ID:** T-39
- **Tipo:** UI
- **Descrição:** Aplicar base dark glassmorphism conforme Tailwind existente.
- **Critérios de aceite:** `pnpm build` encerra com código 0; inspeção no preview registra estilos computados de fundo/tipografia do tema dark e zero requisições para fontes/estilos externos. Navegação por Tab nos controles existentes mantém indicador visível que não depende apenas de mudança de cor. Diff altera somente CSS, sem lógica/dependências/componentes; medidas completas de contraste pertencem a T-87.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/index.css`.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-40 — Preparar shell semântico

- **ID:** T-40
- **Tipo:** UI
- **Descrição:** Substituir tela demonstrativa por estrutura base, sem serviços.
- **Critérios de aceite:** Testing Library encontra exatamente um landmark `main` e um título principal em pt-BR. Na montagem, não há cartões com dados fictícios; contadores de fetch/geolocalização são zero. Diff limita-se ao shell e seu teste, sem criar wrapper adicional ou antecipar fluxos das tarefas de composição.
- **Dependências:** T-39.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** RNF-02, RNF-05; RF-05.

### T-41 — Criar fronteira de erro de renderização

- **ID:** T-41
- **Tipo:** UI
- **Descrição:** Exibir fallback recuperável para falha de render.
- **Critérios de aceite:** Testing Library monta filho que lança erro: conteúdo falho é substituído por mensagem pt-BR e controle acessível de recuperação. Após remover a causa no cenário controlado e acionar recuperação, conteúdo normal volta a ser apresentado. UI/diagnóstico próprio não contêm stack ou sentinela pessoal do erro; fallback não aparece como sucesso meteorológico. Rejeições assíncronas continuam sob responsabilidade do controlador.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/components/AppErrorBoundary.tsx`, `tests/components/AppErrorBoundary.test.tsx`.
- **Rastreabilidade:** RF-05; RNF-04, RNF-06.

### T-42 — Instalar fronteira na raiz

- **ID:** T-42
- **Tipo:** UI
- **Descrição:** Envolver App uma única vez na inicialização.
- **Critérios de aceite:** `pnpm build` encerra com código 0; inspeção do entrypoint confirma exatamente uma fronteira envolvendo App e import dos estilos. Preview apresenta o shell de T-40, e `document.documentElement.lang` é `pt-BR`; fallback já demonstrado em T-41. Diff não adiciona chamada/import de serviço ao entrypoint.
- **Dependências:** T-40, T-41.
- **Arquivos prováveis:** `src/main.tsx`, `index.html`.
- **Rastreabilidade:** RF-05; RNF-04, RNF-05.

### T-43 — Criar formulário de busca

- **ID:** T-43
- **Tipo:** UI
- **Descrição:** Expor envio por botão/Enter com texto local ainda não enviado.
- **Critérios de aceite:** Testing Library encontra textbox pelo label; botão e Enter acionam o callback de envio uma vez por ação, edição sozinha não o aciona. Validação de vazio fornecida ao componente é vinculada ao campo por descrição acessível. Em loading, campo aceita edição e mantém foco; termos de EC-02 preservam grafia. Componente não importa/chama serviços.
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
- **Critérios de aceite:** Testing Library fornece separadamente loading/vazio/parcial/erro e encontra mensagem correspondente com orientação; erro não usa texto de vazio. Retry habilitado é alcançado por Tab e acionado por Enter uma vez; bloqueado não chama callback e tem motivo textual acessível. Uma única região semântica contém cada mensagem anunciável, sem cópia duplicada; foco previamente colocado não muda. Não renderizar erro bruto/URL nem afirmar offline apenas por rejeição de fetch.
- **Dependências:** T-02, T-40.
- **Arquivos prováveis:** `src/components/QueryFeedback.tsx`, `tests/components/QueryFeedback.test.tsx`.
- **Rastreabilidade:** CA-05.1 a CA-05.4; EC-06 a EC-09, EC-29, EC-39.

Entrega incremental de T-45/T-103: criar `src/components/states/LoadingState.tsx` (`message` opcional, status), `ErrorState.tsx` (`message`, `onRetry`, alerta e botão “Tentar novamente”) e `EmptyState.tsx` (`title`, `hint`, status). `tests/unit/States.test.tsx` verifica mensagens únicas, foco preservado, título/dica e recuperação manual por clique ou Tab/Enter, sem submissão de formulário. Integração em `QueryFeedback`, resposta parcial e bloqueio por prazo permanecem pendentes.

### T-46 — Apresentar condições atuais

- **ID:** T-46
- **Tipo:** UI
- **Descrição:** Renderizar valores atuais normalizados, identidade e informação temporal.
- **Critérios de aceite:** Testing Library com valores de CA-02.1 encontra 20 °C, sensação 18 °C, céu limpo, 60%, 10 km/h, precipitação 0,4 mm e pressão ao nível do mar 1013 hPa, com cidade identificada. Hero usa `lib/weatherCodes` para ícone/condição e `lib/temperature` para temperatura/sensação; rerender de unit converte só temperaturas. Zero é exibido como zero e `null` como “Sem dados”. Casos separados encontram rótulos de conclusão/referência, “Desatualizado”, “Atualidade desconhecida” e “Não atualizados”; fuso inválido exibe UTC e aviso. Componentes recebem tempo/estado por props, sem leitura direta de relógio/rede.
- **Dependências:** T-04, T-07, T-08, T-40.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `tests/unit/CurrentWeather.test.tsx`.
- **Rastreabilidade:** CA-02.1, CA-02.2, CA-08.2; EC-10, EC-11, EC-14, EC-19, EC-25, EC-27, EC-28, EC-43.

### T-47 — Apresentar um dia de previsão

- **ID:** T-47
- **Tipo:** UI
- **Descrição:** Renderizar data recebida e seis campos de um `ForecastDay`.
- **Critérios de aceite:** Testing Library compara os seis campos às props: condição, mínima/máxima na unidade ativa, probabilidade máxima 70%, umidade média 65% e vento máximo 20 km/h no exemplo EC-40. `null` é “Sem dados”; textos não dizem rajada ou volume. Data local `2026-10-29` continua 29/10 mesmo com dispositivo no dia seguinte.
- **Dependências:** T-04, T-05, T-08, T-40.
- **Arquivos prováveis:** `src/components/ForecastCard.tsx`, `tests/unit/ForecastCard.test.tsx`.
- **Rastreabilidade:** CA-03.2; EC-10, EC-11, EC-14, EC-40.

### T-48 — Compor seções meteorológicas

- **ID:** T-48
- **Tipo:** UI
- **Descrição:** Compor atuais e cartões diários sem transformar dados externos.
- **Critérios de aceite:** Testing Library com período 29/10 a 02/11/2026 encontra exatamente cinco cartões em ordem; dia sem dados continua com data e campos “Sem dados”. Casos separados de current `null` ou forecast `[]` mostram seção indisponível e preservam a outra utilizável. Ao fornecer relógio de 30/10, datas permanecem, 29/10 não é rotulado “hoje” e aviso de período anterior é encontrado.
- **Dependências:** T-07, T-46, T-47.
- **Arquivos prováveis:** `src/components/WeatherPanel.tsx`, `tests/components/WeatherPanel.test.tsx`.
- **Rastreabilidade:** CA-03.1, CA-03.3; EC-12, EC-20, EC-31, EC-36, EC-43.

Implementação incremental de T-47/T-48: `lib/format.ts` formata datas locais absolutas; `ForecastList.tsx` compõe os cards recebidos no grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, preservando datas/ordem e sinalizando lista vazia. Testes focados em `tests/unit/format.test.ts` e `tests/unit/ForecastList.test.tsx` verificam rótulos, cinco cards, conversão e dados ausentes. Essa entrega não conclui a composição de atuais nem os avisos temporais de `WeatherPanel`.

### T-49 — Apresentar atribuição meteorológica

- **ID:** T-49
- **Tipo:** UI
- **Descrição:** Mostrar créditos e aviso de estimativas junto aos dados.
- **Critérios de aceite:** Testing Library encontra links acessíveis com destinos `https://open-meteo.com/` e `https://creativecommons.org/licenses/by/4.0/`. Em Celsius, texto informa arredondamento; em Fahrenheit, conversão e arredondamento. Aviso junto aos dados afirma que são estimativas, não garantias, sem atribuir endosso ao provedor; ambos os conjuntos de props passam.
- **Dependências:** T-40.
- **Arquivos prováveis:** `src/components/WeatherAttribution.tsx`, `tests/components/WeatherAttribution.test.tsx`.
- **Rastreabilidade:** CA-02.3; EC-41.

### T-50 — Criar seletor de unidade

- **ID:** T-50
- **Tipo:** UI
- **Descrição:** Expor unidade ativa e callback sem converter/copiar dados em estado.
- **Critérios de aceite:** Testing Library encontra Celsius/Fahrenheit por nome acessível e estado selecionado correspondente à prop. Clique ou teclado chama callback uma vez com a unidade escolhida; atualizar prop move o estado selecionado. Em loading, controle continua operável; contador de rede é zero e não há cópia das temperaturas em estado.
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
- **Critérios de aceite:** Testing Library encontra cidade/contexto das props; confirmar e apagar são alcançáveis por Tab e Enter chama o respectivo callback uma vez. Props de falha de leitura, descarte, escrita e remoção produzem mensagens correspondentes em casos separados. Falha de remoção informa exclusão não concluída e permite tentar de novo, sem mensagem de sucesso. Nenhum acesso a storage/rede.
- **Dependências:** T-01, T-40, T-45.
- **Arquivos prováveis:** `src/components/PreferencesPanel.tsx`, `tests/components/PreferencesPanel.test.tsx`.
- **Rastreabilidade:** CA-07.1; EC-22 a EC-24, EC-37, EC-38, EC-42.

## Entrega 6 — Integração em App

Cada tarefa desta entrega altera somente a ligação de props/callbacks indicada. Os serviços e componentes já foram implementados e testados nas dependências; não reimplementar regras em App.

### T-53 — Conectar busca e seleção em App

- **ID:** T-53
- **Tipo:** UI
- **Descrição:** Instanciar controlador uma vez e conectar formulário, lista e feedback de busca.
- **Critérios de aceite:** Testing Library com serviços controlados conta zero chamadas na abertura; envio chama geocoding uma vez, apresenta loading e depois a lista. Antes da escolha, forecast tem zero chamadas; clicar no resultado chama forecast uma vez com o alvo escolhido. Foco permanece no campo quando chegam resultados; inspeção confirma nenhum fetch/storage/geolocation direto em App.
- **Dependências:** T-30, T-42, T-43, T-44, T-45.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-01.1 a CA-01.3; CA-05.1, CA-05.2; EC-29.

### T-54 — Conectar apresentação meteorológica em App

- **ID:** T-54
- **Tipo:** UI
- **Descrição:** Ligar snapshot/estado meteorológico e atribuição já existentes.
- **Critérios de aceite:** Testing Library seleciona um de dois homônimos e libera fixture completa: identifica o homônimo escolhido, valores atuais da fixture, exatamente cinco datas em ordem e aviso/créditos junto aos dados. Falha de forecast apresenta erro meteorológico, não “nenhuma cidade encontrada”; lista de busca não é substituída pelo erro de previsão.
- **Dependências:** T-17, T-32, T-48, T-49, T-53.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-02.1 a CA-02.3, CA-03.1 a CA-03.3.

### T-55 — Conectar atualização manual em App

- **ID:** T-55
- **Tipo:** UI
- **Descrição:** Expor ação de refresh e relógio do controlador sem novos efeitos.
- **Critérios de aceite:** Testing Library com snapshot A aciona atualização: contador de forecast aumenta exatamente uma vez para A e os dados permanecem durante loading. Falha conserva valores/conclusão anteriores e mostra “Não atualizados”; nova tentativa com resposta válida altera valores/conclusão para os novos dados. Inspeção confirma zero timer/fetch próprio em App.
- **Dependências:** T-34, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-08.2, CA-08.3; EC-25.

### T-56 — Conectar unidade em App

- **ID:** T-56
- **Tipo:** UI
- **Descrição:** Distribuir uma única preferência a seletor e cartões.
- **Critérios de aceite:** Testing Library alterna Celsius/Fahrenheit e compara temperatura, sensação e dez extremos diários ao helper já validado em T-04, com valores esperados explícitos no teste. Nenhuma temperatura fica na unidade anterior; vento/umidade/precipitação e contagem de forecast não mudam. Seletor reflete unidade do controlador; App não armazena valores Fahrenheit.
- **Dependências:** T-37, T-50, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-44.

### T-57 — Conectar localização em App

- **ID:** T-57
- **Tipo:** UI
- **Descrição:** Ligar botão informado à ação e etapas do controlador.
- **Critérios de aceite:** Testing Library conta zero acessos à localização na montagem e encontra informação prévia ao clique. Clicar chama localização uma vez; coordenadas controladas iniciam forecast correspondente e sucesso identifica “Sua localização”. Em caso separado de recusa, mensagem explica falha e formulário manual permite iniciar geocoding.
- **Dependências:** T-35, T-51, T-54.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-06.1 a CA-06.3; EC-19.

### T-58 — Conectar preferências em App

- **ID:** T-58
- **Tipo:** UI
- **Descrição:** Ligar painel às ações existentes de confirmação/exclusão.
- **Critérios de aceite:** Testing Library monta com cidade lembrada/Fahrenheit: painel mostra contexto, seletor mostra Fahrenheit e contadores de rede são zero. Confirmar busca a cidade e mostra lista sem forecast automático. Apagar com sucesso limpa identificação lembrada, seleciona Celsius e conserva consulta existente; falha informa exclusão não concluída. App não acessa storage diretamente.
- **Dependências:** T-38, T-52, T-53, T-56.
- **Arquivos prováveis:** `src/App.tsx`, `tests/components/App.test.tsx`.
- **Rastreabilidade:** CA-07.1; EC-24, EC-37, EC-42.

## Entrega 7 — Testes automatizados

Tarefas E2E consomem componentes e dados prontos; não incluem correções de implementação. Executar os fluxos principais de busca, unidade, recuperação e preferências também nos projetos móveis. Outras combinações extensas permanecem no nível unitário responsável.

As tarefas T-100 a T-103 são dedicadas exclusivamente a testes, sem mudanças em `src/`. Consolidam os testes focados das implementações: manter casos existentes que já comprovem os critérios e adicionar somente lacunas, sem duplicar cenários ou criar testes triviais. Seus IDs dão continuidade ao backlog, sem renumerar referências anteriores.

### T-100 — Testar conversão de unidade com Vitest

- **ID:** T-100
- **Tipo:** Test
- **Descrição:** Consolidar a suíte unitária da conversão e do arredondamento.
- **Critérios de aceite:** `pnpm exec vitest run tests/unit/units.test.ts` encerra com código 0, sem casos ignorados. Assertions com resultados literais verificam 0 → 32, 100 → 212, −40 → −40, `null` indisponível e zero válido; 12,34 °C permanece 12,3 °C após dez alternâncias e equivale a 54,2 °F. Em Celsius, −1,25/1,25/−0,04 resultam em −1,3/1,3/0, sem zero negativo. Testar a função real, sem mockar conversão, rede ou componentes.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/units.test.ts`.
- **Rastreabilidade:** CA-04.1 a CA-04.4; EC-21, EC-34; RNF-05.

### T-101 — Testar geocoding com mock de fetch

- **ID:** T-101
- **Tipo:** Test
- **Descrição:** Consolidar testes do serviço real substituindo somente fetch e relógio.
- **Critérios de aceite:** `pnpm exec vitest run tests/unit/geocoding.test.ts` encerra com código 0, sem casos ignorados e sem rede real. Mock verifica endpoint, parâmetros fixos, encoding de termo com `&`/`?`, sinal e `redirect: 'error'`. Casos separados comparam lista válida, ordem/limite de dez, vazio documentado, parcial por descarte, todos os itens inválidos, JSON inválido, HTTP 400/500/429 e rejeição de rede aos respectivos `Result`/erros do plano. Nenhuma falha vira lista vazia; restaurar mocks/timers após cada caso.
- **Dependências:** T-18.
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`.
- **Rastreabilidade:** CA-01.1, CA-01.2, CA-05.2, CA-05.3; EC-03, EC-04, EC-06, EC-08, EC-09, EC-35; RNF-06.

### T-102 — Testar forecast com mock de fetch

- **ID:** T-102
- **Tipo:** Test
- **Descrição:** Consolidar testes da fronteira forecast sem substituir o normalizador.
- **Critérios de aceite:** `pnpm exec vitest run tests/unit/forecast.test.ts` encerra com código 0, sem casos ignorados e sem rede real. Mock compara todos os parâmetros current/daily/unidades/fuso do plano; resposta completa retorna valores normalizados esperados, parcial preserva somente campos válidos e ausência total utilizável retorna erro. Exercitar HTTP 500/429, rejeição de rede, corpo inválido, timeout aos 10.000 ms e sinal cancelado; nenhum retorno tardio é utilizável. Identidade permanece a do alvo, não a grade. Usar fixtures de T-17 sem editar; restaurar mocks/timers por caso.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/forecast.test.ts`.
- **Rastreabilidade:** CA-02.1, CA-03.1, CA-03.2, CA-05.3; EC-06 a EC-13, EC-36, EC-43.

### T-103 — Testar componentes em loading, erro e vazio

- **ID:** T-103
- **Tipo:** Test
- **Descrição:** Consolidar testes de apresentação isolada com Testing Library e user-event.
- **Critérios de aceite:** `pnpm exec vitest run tests/components/CitySearch.test.tsx tests/components/QueryFeedback.test.tsx` encerra com código 0, sem casos ignorados. Com props controladas, loading tem status acessível e campo editável; empty informa ausência de resultados com orientação, sem mensagem de rede; error informa falha e recuperação por Tab/Enter chama callback uma vez. Retry bloqueado não chama callback e explica motivo. Transições por rerender preservam foco na busca e não duplicam mensagem em regiões anunciáveis. Não montar hook/App nem chamar rede/storage; anúncio percebido continua sob T-88/T-89.
- **Dependências:** T-43, T-45.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/QueryFeedback.test.tsx`.
- **Rastreabilidade:** CA-05.1 a CA-05.3; EC-04, EC-06, EC-29; RNF-02.

### T-59 — Verificar independência entre busca e clima

- **ID:** T-59
- **Tipo:** Test
- **Descrição:** Exercitar a corrida cruzada dos dois fluxos do controlador.
- **Critérios de aceite:** Vitest retém forecast A, conclui busca B e depois libera A: lista contém B e snapshot/alvo meteorológico contêm A. Inverter ordem produz o mesmo estado final; erro/resultado da busca não muda horários/loading do clima. Com um serviço bloqueado por 429, ação no outro incrementa seu contador de chamadas normalmente.
- **Dependências:** T-32.
- **Arquivos prováveis:** `tests/unit/useWeatherApp.integration.test.ts`.
- **Rastreabilidade:** EC-08, EC-32.

### T-60 — Verificar preferências durante resposta pendente

- **ID:** T-60
- **Tipo:** Test
- **Descrição:** Validar interação cruzada entre unidade/exclusão e forecast.
- **Critérios de aceite:** Vitest inicia forecast em Celsius, muda unidade para Fahrenheit e libera resposta: estado mantém Celsius de origem e preferência Fahrenheit, com uma única chamada meteorológica. Em cenário separado, exclusão seguida de resposta/refresh deixa preferências vazias/Celsius e contador de escrita sem incremento por resposta; escolha posterior só de Fahrenheit salva somente unidade. Se casos existentes já demonstrarem todas essas assertions, referenciá-los em vez de duplicar.
- **Dependências:** T-38.
- **Arquivos prováveis:** `tests/unit/useWeatherApp.integration.test.ts`.
- **Rastreabilidade:** EC-24, EC-38, EC-44.

### T-61 — Servir build de produção nos E2E

- **ID:** T-61
- **Tipo:** Infra
- **Descrição:** Trocar dev server por preview com endereço determinístico.
- **Critérios de aceite:** `pnpm build` e execução Playwright do smoke encerram com código 0. `webServer.command` é `pnpm exec vite preview --host 127.0.0.1 --port 5173 --strictPort`, baseURL/url usam `http://127.0.0.1:5173` e `reuseExistingServer` é falso. Smoke encontra landmark/título do shell e registra zero chamadas a APIs externas.
- **Dependências:** T-40.
- **Arquivos prováveis:** `playwright.config.ts`, `tests/e2e/smoke.spec.ts`.
- **Rastreabilidade:** RNF-03, RNF-07.

### T-62 — Declarar projetos desktop e mobile

- **ID:** T-62
- **Tipo:** Infra
- **Descrição:** Configurar engines e perfis sem produto cartesiano.
- **Critérios de aceite:** Smoke de T-61 passa nos cinco projetos: desktop Chromium, Firefox e WebKit, Chromium touch 390 × 844 e WebKit móvel. Relatório lista uma execução por projeto e configuração confirma viewport/toque do móvel. Falta de engine/execução é pendência; seleção dos testes móveis deve incluir busca, unidade, recuperação e preferências quando disponíveis, sem chamar emulação de Safari real.
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
- **Critérios de aceite:** Playwright de suporte consome T-16/T-17 sem editar dados: completo/parcial entregam o JSON escolhido, erro entrega o status escolhido, pendência não entrega antes da liberação explícita. Avançar relógio altera tempo observado no browser sem espera real. Caso seguinte inicia sem storage, rotas, contadores ou listeners do anterior; ambos passam isoladamente e juntos, sem sleeps.
- **Dependências:** T-16, T-17, T-63.
- **Arquivos prováveis:** `tests/e2e/fixtures.ts`, `tests/e2e/fixtures.spec.ts`.
- **Rastreabilidade:** RF-05; EC-07, EC-33.

### T-65 — Testar fluxo principal E2E em desktop e mobile

- **ID:** T-65
- **Tipo:** Test
- **Descrição:** Cobrir busca → seleção explícita → condições atuais e previsão, incluindo viewport mobile.
- **Critérios de aceite:** Após `pnpm build`, Playwright executa `tests/e2e/search.spec.ts` contra preview nos projetos desktop e nos móveis de T-62, incluindo Chromium touch **390 × 844**. Jornada principal envia busca, seleciona um homônimo e verifica cidade correta, valores atuais da fixture e exatamente cinco datas diárias em ordem. Comparar CA-01.1 a CA-01.3 e EC-01/02/04/05/35; contadores registram zero chamadas por digitação/vazio e zero forecast antes de seleção, uma busca por envio válido e um forecast para o alvo clicado. De 12 resultados, somente os 10 primeiros ficam selecionáveis; vazio remove seleção antiga, homônimos indistinguíveis exibem orientação. Relatório identifica execução aprovada em desktop/mobile, sem skip; campos detalhados são cobertos em T-68, sem duplicar toda a matriz.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/search.spec.ts`.
- **Rastreabilidade:** CA-01.1 a CA-01.3, CA-02.1, CA-03.1, CA-05.2; EC-01, EC-02, EC-04, EC-05, EC-35; RNF-01, RNF-07.

### T-66 — Testar recuperação de falha E2E

- **ID:** T-66
- **Tipo:** Test
- **Descrição:** Cobrir uma tentativa falha seguida de recuperação manual.
- **Critérios de aceite:** Playwright desktop/mobile retém resposta e verifica campo editável/foco mantido; rejeição de rede, HTTP 500 e timeout aos 10 s encerram loading com erro/ação manual em casos separados. Antes do clique, contador não aumenta; retry envia termo anterior e apresenta resultado válido. Resposta da tentativa expirada não altera estado novo; sem dados iniciais e rede indisponível, há erro e nenhum cartão de sucesso/cache.
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
- **Critérios de aceite:** Playwright compara cada valor atual e os seis campos de cada um dos cinco dias à fixture, com unidades/textos e links de atribuição de CA-02/CA-03 e EC-40/41. Nos dois casos de EC-20, datas são exatamente 30/10 a 03/11/2026 e 30/12/2026 a 03/01/2027, apesar do fuso distinto do dispositivo. Zero datas duplicadas/deslocadas e aviso de estimativas presente.
- **Dependências:** T-54, T-64.
- **Arquivos prováveis:** `tests/e2e/weather.spec.ts`.
- **Rastreabilidade:** CA-02.1 a CA-02.3, CA-03.1 a CA-03.3; EC-20, EC-40, EC-41.

### T-69 — Testar degradação parcial E2E

- **ID:** T-69
- **Tipo:** Test
- **Descrição:** Demonstrar preservação do utilizável sem fabricação de dados.
- **Critérios de aceite:** Playwright executa variantes separadas de EC-10 a EC-14, EC-36 e EC-43 e compara textos/valores esperados: ausência é “Sem dados”, zero permanece zero, código desconhecido é “Condição não disponível”, série ambígua não desloca valores. Uma seção válida permanece com aviso; ambas inválidas geram erro sem novo horário de sucesso. Sem âncora/fuso não há cinco datas inventadas; atuais utilizáveis mostram UTC/aviso se fuso inválido. Evidência de ausência estrutural de campo obrigatório fica como bloqueio contratual, não aceite por placeholder.
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
- **Critérios de aceite:** Playwright desktop/mobile salva cidade/Fahrenheit, recarrega e encontra contexto/Fahrenheit com zero rede antes de confirmar. Confirmar gera uma busca, zero forecast até clicar, mesmo com um resultado; seleção gera um forecast. Inspeção de storage encontra somente nome/região/país e `F`; tráfego não contém envio a servidor de preferências.
- **Dependências:** T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/preferences.spec.ts`.
- **Rastreabilidade:** CA-07.1 a CA-07.3; EC-22, EC-23, EC-30, EC-42.

### T-73 — Testar exclusão entre visitas E2E

- **ID:** T-73
- **Tipo:** Test
- **Descrição:** Exercitar exclusão com refresh pendente e reabertura.
- **Critérios de aceite:** Playwright desktop/mobile apaga cidade/Fahrenheit durante refresh retido, libera resposta e recarrega: cidade lembrada ausente, Celsius ativo e chave própria ausente. Chave sentinela externa é idêntica antes/depois. Falha de remoção mostra exclusão não concluída, sem sucesso; em outro caso, escolher só Fahrenheit após excluir e recarregar restaura somente unidade, sem cidade/rede automática.
- **Dependências:** T-55, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/preferences.spec.ts`.
- **Rastreabilidade:** EC-24, EC-37, EC-38.

### T-74 — Testar refresh e alvo vigente E2E

- **ID:** T-74
- **Tipo:** Test
- **Descrição:** Verificar atualização manual e snapshot no navegador.
- **Critérios de aceite:** Playwright desktop/mobile carrega A, faz refresh com fixture diferente e compara novos dados/conclusão ao relógio controlado. Em refresh falho, valores/conclusão permanecem iguais aos anteriores e “Não atualizados”/retry estão presentes. Selecionar B remove cartões de A durante loading e após falha de B; resposta atrasada de A não muda B, sua mensagem ou loading.
- **Dependências:** T-55, T-64.
- **Arquivos prováveis:** `tests/e2e/refresh.spec.ts`.
- **Rastreabilidade:** CA-08.2; EC-15, EC-25, EC-26, EC-33.

### T-75 — Testar passagem do tempo sem polling E2E

- **ID:** T-75
- **Tipo:** Test
- **Descrição:** Comprovar indicadores temporais no navegador com relógio controlado.
- **Critérios de aceite:** Playwright com relógio controlado verifica referência 13h: às 14h sem marca por idade, às 14h01 “Desatualizado”; referência futura/ausente mostra “Atualidade desconhecida”. Em EC-31, de 23h59 a 00h01 e retorno à aba mantêm 29/10 a 02/11, sem “hoje” no dia anterior e com aviso; contador de forecast não aumenta. Só refresh apresenta 30/10 a 03/11. Rótulos/valores de referência e conclusão são conferidos separadamente.
- **Dependências:** T-55, T-64.
- **Arquivos prováveis:** `tests/e2e/time.spec.ts`.
- **Rastreabilidade:** CA-08.3; EC-27, EC-28, EC-31.

### T-79 — Instalar scanner de acessibilidade de desenvolvimento

- **ID:** T-79
- **Tipo:** Infra
- **Descrição:** Adicionar somente `@axe-core/playwright` como dev dependency via pnpm.
- **Critérios de aceite:** `@axe-core/playwright` aparece somente em `devDependencies`; diff do lockfile corresponde à instalação. `pnpm install --frozen-lockfile` e `pnpm build` encerram com código 0 e import do pacote resolve em execução Node. Nenhuma outra dependência direta de runtime é adicionada; sem suíte nova nesta tarefa.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.
- **Rastreabilidade:** RNF-02.

### T-80 — Automatizar acessibilidade dos estados

- **ID:** T-80
- **Tipo:** Test
- **Descrição:** Verificar semântica, teclado e scanner nos estados principais.
- **Critérios de aceite:** Playwright executa scanner separadamente em idle/loading/vazio/sucesso/parcial/erro com regras WCAG 2.2 A/AA e anteriores aplicáveis; array de violações é vazio em todos. Assertions verificam nomes acessíveis, foco permanecendo na busca e recuperação acionável por Tab/Enter, com callback/requisição esperada. Relatório lista estado e resultado; não declara conformidade integral nem anúncio percebido.
- **Dependências:** T-55, T-56, T-57, T-58, T-64, T-79.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.
- **Rastreabilidade:** EC-29; RNF-02.

### T-81 — Verificar larguras e toque

- **ID:** T-81
- **Tipo:** Test
- **Descrição:** Executar matriz parametrizada de responsividade.
- **Critérios de aceite:** Playwright verifica as 25 combinações de larguras 320/390/768/1366/1920 CSS px e estados sucesso/loading/vazio/parcial/erro: `document.documentElement.scrollWidth <= window.innerWidth`. Nomes longos ficam dentro da largura do container sem truncar a identificação; controles dos fluxos ficam visíveis após rolagem vertical e acionáveis. Em 390 × 844, busca/unidade/localização/recuperação são acionadas por toque sem hover e produzem o resultado esperado. Correção de produto exige tarefa separada.
- **Dependências:** T-55, T-56, T-57, T-58, T-64.
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`.
- **Rastreabilidade:** RNF-01, RNF-02.

## Entrega 8 — Testes e evidências de aceite

Não presumir aprovação pela existência dos scripts. Esta entrega registra execuções reais separadas da CI determinística.

### T-83 — Preparar medidor reproduzível de performance

- **ID:** T-83
- **Tipo:** Test
- **Descrição:** Instrumentar acionamento até commit visual utilizável no build de produção.
- **Critérios de aceite:** Execução de controle registra acionamento e commit visual utilizável, duração não negativa, operação/perfil/resultado e configuração aplicada. Respostas têm 10 cidades/5 dias e atraso de entrega de 500 ms; perfis aplicam 10 Mbps bidirecional/100 ms adicionais, mobile 390 × 844/CPU 4× e desktop 1366 × 768 sem desaceleração. Comparação instrumentada de transferência limitada/não limitada demonstra aplicação de rede; rota que ignore limitação reprova o medidor até usar transporte limitado. Saída separa sucessos, parciais, erros e timeouts com amostras brutas.
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
- **Critérios de aceite:** Execução exclusiva fora da suíte de PR faz uma busca por cidade pública fixa, exige seleção e lê forecast real por perfil desktop/mobile. Zero rotas interceptam os endpoints; JSON acessível via CORS contém campos/unidades/fuso necessários e UI apresenta dados utilizáveis correspondentes. Não exigir temperatura fixa, usar localização pessoal ou incluir resultado no p95 controlado; falha é registrada sem retry mascarado.
- **Dependências:** T-54, T-62.
- **Arquivos prováveis:** `tests/live/openMeteo.spec.ts`, `playwright.live.config.ts`.
- **Rastreabilidade:** RF-01 a RF-03; RNF-03, RNF-04.

### T-86 — Registrar integração real por perfil

- **ID:** T-86
- **Tipo:** Test
- **Descrição:** Executar smoke live e registrar resultado/latência.
- **Critérios de aceite:** Registro contém uma execução completa por perfil desktop/mobile com cidade pública fixa, data, versões, comando, resultado, latência e link para evidência de busca/seleção/forecast legíveis via CORS. Aprovação exige os campos/unidades/fuso e apresentação utilizável previstos em T-85; falha externa registra “integração não validada”, preservando histórico até nova execução bem-sucedida. Nenhuma amostra é somada ao p95 controlado.
- **Dependências:** T-85.
- **Arquivos prováveis:** `tests/acceptance/live-integration.md`.
- **Rastreabilidade:** RNF-03, RNF-04.

### T-87 — Inspecionar acessibilidade visual e teclado

- **ID:** T-87
- **Tipo:** Test
- **Descrição:** Executar inspeção manual sem leitor de tela.
- **Critérios de aceite:** Evidência lista IDs WCAG 2.2 A/AA aplicáveis, passos e resultado por critério nos fluxos completos, com justificativa para não aplicáveis. Contraste medido atende 4,5:1 para texto normal, 3:1 para texto grande e 3:1 para informação visual de controles/foco quando exigido. Tab/Shift+Tab/Enter/Espaço operam controles sem armadilha; foco é visível/não encoberto. Zoom 200% e largura 320 CSS px mantêm conteúdo/ações sem perda ou rolagem horizontal da página. Falha aplicável impede aceite.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** RNF-01, RNF-02.

### T-88 — Validar anúncios com NVDA

- **ID:** T-88
- **Tipo:** Test
- **Descrição:** Executar fluxos com NVDA/Chrome no Windows.
- **Critérios de aceite:** Com NVDA/Chrome no Windows e foco na busca, registrar transcrição/observação do anúncio uma vez ao iniciar loading e uma vez ao concluir vazio ou erro, em cenários separados de EC-29. Foco continua no campo; Tab alcança recuperação, Enter a aciona, respeitando bloqueio. Leitura identifica cidade, valores/unidades, datas e nomes/estados dos controles sem ícones. Registrar versões, IDs WCAG e resultado por passo; ambiente indisponível mantém pendência.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** EC-29; RNF-02.

### T-89 — Validar anúncios com VoiceOver

- **ID:** T-89
- **Tipo:** Test
- **Descrição:** Executar fluxos com VoiceOver/Safari no iOS.
- **Critérios de aceite:** Repetir no VoiceOver/Safari iOS real os resultados de EC-29: um anúncio no início e um na conclusão vazio/erro, foco mantido, recuperação alcançável/acionável e bloqueio respeitado. Registrar leitura percebida de cidade, valores/unidades, cinco datas e nomes/estados dos controles, versões e IDs WCAG por passo. DOM correto sem anúncio percebido não aprova; indisponibilidade/falha mantém pendência.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/accessibility.md`.
- **Rastreabilidade:** EC-29; RNF-02, RNF-07.

### T-90 — Validar compatibilidade no Windows

- **ID:** T-90
- **Tipo:** Test
- **Descrição:** Executar a mesma jornada parametrizada em Chrome/Edge/Firefox no Windows 11.
- **Critérios de aceite:** Em Chrome/Edge/Firefox estáveis no Windows 11, registrar versão/data e saída de cada passo: cidade selecionada corresponde à consultada; atuais/cinco dias correspondem à resposta; unidade muda sem request; localização só após clique (ou recusa mantém busca); reabertura restaura preferências sem rede até confirmação; erro permite retry manual bem-sucedido. Cada navegador tem evidência própria e nenhum passo com falha/sem execução é aprovado; engine da CI não substitui navegador real.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-07; RF-01 a RF-08.

### T-91 — Validar Safari no macOS

- **ID:** T-91
- **Tipo:** Test
- **Descrição:** Executar jornada de compatibilidade no Safari real desktop.
- **Critérios de aceite:** No Safari estável real do macOS, registrar versão/sistema/data e resultado observado versus esperado para cada passo enumerado nos critérios de T-90, sem exigir executar T-90 como pré-requisito. Em 1366 CSS px não há overflow horizontal; teclado alcança controles com foco visível. Todos os passos devem passar; WebKit emulado ou ambiente ausente não aprova.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-01, RNF-07.

### T-92 — Validar navegadores móveis reais

- **ID:** T-92
- **Tipo:** Test
- **Descrição:** Executar a jornada parametrizada em Safari/iOS e Chrome/Android.
- **Critérios de aceite:** Em Safari/iOS e Chrome/Android reais, registrar dispositivo/sistema/versão/data e resultado de cada passo enumerado nos critérios de T-90. Por perfil, toque aciona controles sem hover, teclado virtual permite digitar/enviar busca e, após fechá-lo, resultados/recuperação permanecem alcançáveis por rolagem vertical, sem overflow horizontal. Todos os passos passam em ambos; emulação não substitui execução.
- **Dependências:** T-55, T-56, T-57, T-58.
- **Arquivos prováveis:** `tests/acceptance/compatibility.md`.
- **Rastreabilidade:** RNF-01, RNF-07.

## Entrega 9 — Hardening, CI e fechamento

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

### T-82 — Alinhar execução integral da CI

- **ID:** T-82
- **Tipo:** Infra
- **Descrição:** Executar os gates existentes e projetos declarados num workflow.
- **Critérios de aceite:** Execução identificada da CI instala Chromium/Firefox/WebKit e dependências do sistema; cada comando `pnpm lint`, `pnpm check`, `pnpm build`, `pnpm test`, `pnpm test:e2e` encerra com código 0 e build precede E2E. Relatório contém os cinco projetos de T-62 e cenários previstos, sem skip tratado como cobertura; falha inicial/flaky permanece registrada, não vira aprovação por retry. Workflow declara retenção dos artefatos e somente dados sintéticos são capturados.
- **Dependências:** T-100, T-101, T-102, T-103, T-59, T-60, T-65, T-66, T-67, T-68, T-69, T-70, T-71, T-72, T-73, T-74, T-75, T-76, T-77, T-78, T-80, T-81.
- **Arquivos prováveis:** `.github/workflows/ci.yml`.
- **Rastreabilidade:** RNF-04, RNF-06, RNF-07; gate de merge do plano.

As decisões operacionais não bloqueiam desenvolver o MVP. Não escolher hospedagem, implementar backend, anunciar SLA ou executar deploy implicitamente. Arquivo de configuração da hospedagem em T-97 só é identificado após T-95.

### T-93 — Registrar auditoria de dependências

- **ID:** T-93
- **Tipo:** Infra
- **Descrição:** Executar `pnpm audit --prod` e triar resultado, sem corrigir código nesta unidade.
- **Critérios de aceite:** Registro contém data, versão do lockfile, comando `pnpm audit --prod`, código de saída e relatório obtido. Cada achado tem pacote, advisory, severidade, ação/responsável e estado; relatório sem achados é explicitamente identificado. Consulta inacessível é “não validada”, não zero vulnerabilidades. Alta/crítica não resolvida bloqueia publicação até decisão documentada; correções são tarefas próprias com nova auditoria/gates afetados.
- **Dependências:** T-79, T-82.
- **Arquivos prováveis:** `tests/acceptance/dependencies.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-94 — Revalidar termos e contrato do provedor

- **ID:** T-94
- **Tipo:** Infra
- **Descrição:** Registrar condições atuais de uso, atribuição e dados externos.
- **Critérios de aceite:** Registro cita URL oficial e data de consulta para uso não comercial, limites, licença/atribuição, destinatários e retenção de coordenadas. Cada variável obrigatória current/daily do contrato da spec é confrontada com documentação/resposta pública de referência, com resultado explícito de suporte/unidade. Remoção estrutural ou uso que exija chave/comercial fica como bloqueio para revisão de escopo; não inserir segredo no cliente.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** CA-02.3; RNF-06; Assumptions e checklist de publicação.

### T-95 — Definir condições operacionais da hospedagem

- **ID:** T-95
- **Tipo:** Infra
- **Descrição:** Obter decisões dos responsáveis, sem implementar infraestrutura de produção.
- **Critérios de aceite:** Responsáveis aprovam registro com destino de hospedagem/URL HTTPS, papéis de publicação/suporte/incidentes, passos de rollback para versão anterior e procedimento de monitoramento sintético usando cidade pública fixa, sem coordenada pessoal. Caminho concreto de configuração de headers é identificado para T-97. Cada item tem decisão/data e responsável; item sem decisão mantém tarefa aberta, sem SLA implícito.
- **Dependências:** nenhuma; obter decisões dos responsáveis.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-04; Out of Scope e checklist de publicação.

### T-96 — Documentar logs e destinatários da hospedagem

- **ID:** T-96
- **Tipo:** Infra
- **Descrição:** Confirmar retenção/acesso dos logs e informações de privacidade operacionais.
- **Critérios de aceite:** Tabela por hospedagem/provedor informa categorias de dados nos logs, retenção, quem acessa, destinatários e fonte/data da confirmação. Política de retenção/acesso da hospedagem tem aprovação do responsável; referência do provedor não promete exclusão que ele não garanta. Campo desconhecido é pendência explícita e impede concluir esta tarefa.
- **Dependências:** T-94, T-95.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-97 — Aplicar e verificar headers do destino escolhido

- **ID:** T-97
- **Tipo:** Infra
- **Descrição:** Configurar uma política de segurança coesa na hospedagem definida.
- **Critérios de aceite:** Captura de resposta do destino HTTPS real contém CSP aplicada (não apenas Report-Only), `connect-src` limitado à própria origem e `https://geocoding-api.open-meteo.com`/`https://api.open-meteo.com`, `frame-ancestors 'none'`, `Referrer-Policy: no-referrer` e `Permissions-Policy: geolocation=(self)`. Recursos são próprios conforme plano, sem conteúdo misto; teste em iframe de outra origem é bloqueado. Busca/forecast/localização completam sem violação da política; registrar URL/data, headers e resultados. Preview local não aprova.
- **Dependências:** T-55, T-57, T-95.
- **Arquivos prováveis:** um arquivo de configuração de headers identificado em T-95; `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-06; checklist de publicação.

### T-98 — Consolidar aceite do MVP

- **ID:** T-98
- **Tipo:** Test
- **Descrição:** Referenciar evidências existentes sem adicionar testes ou corrigir produto.
- **Critérios de aceite:** Matriz contém uma linha por cada um dos 26 CA, 44 EC e 7 RNFs da spec, com teste/procedimento responsável, cenário/alternativas exercitados, link de evidência e resultado. Links resolvem para execuções/registros identificados: CI, quatro grupos p95, dois perfis live, critérios assistivos e matriz real de navegadores. Somente aprovação de todas as linhas permite marcar aceite completo; falha/skip/ambiente ausente é pendência. Ausência estrutural de campo é bloqueio contratual, não aprovação parcial permanente.
- **Dependências:** T-82, T-84, T-86, T-87, T-88, T-89, T-90, T-91, T-92.
- **Arquivos prováveis:** `tests/acceptance/coverage.md`.
- **Rastreabilidade:** RF-01 a RF-08; RNF-01 a RNF-07; todos os CA/EC.

### T-99 — Registrar decisão de prontidão de publicação

- **ID:** T-99
- **Tipo:** Infra
- **Descrição:** Confrontar aceite, auditoria e checklist operacional com os responsáveis.
- **Critérios de aceite:** Checklist contém links/resultados de T-93/T-94/T-95/T-96/T-97/T-98 e decisão datada dos responsáveis. Resultado “pronto” só é permitido com aceite integral, termos/operação/logs/headers confirmados e nenhum bloqueio de segurança ou critério obrigatório pendente. Se houver pendência, resultado é “não pronto”, com item, responsável e ação; isso não conclui o gate de publicação como aprovado. Registro não executa deploy nem declara SLA.
- **Dependências:** T-93, T-96, T-97, T-98.
- **Arquivos prováveis:** `docs/publication-checklist.md`.
- **Rastreabilidade:** RNF-04, RNF-06; checklist de publicação.

## Rastreabilidade para execução

Referências abaixo são os **IDs atuais**. Intervalos são inclusivos. Preencher nomes concretos de testes, procedimentos e resultados em T-98; não criar cobertura duplicada para cada referência.

### Requisito funcional → tarefas

As colunas separam implementação de evidência: uma tarefa de teste não substitui uma tarefa que implementa o requisito. Contratos T-01 a T-03 e validações compartilhadas T-09 dão suporte às tarefas indicadas, sem repetição em todas as linhas.

| Requisito da spec | Tarefas que implementam o comportamento | Tarefas de verificação | Lacuna de planejamento |
|---|---|---|---|
| **RF-01 — Busca global e seleção de cidade** | T-18 (geocoding); T-24, T-27 a T-29 (estado, envio, concorrência e limites); T-30 (alvo selecionado); T-43, T-44 (formulário e resultados com contexto); T-53 (integração). | T-101 (mock de fetch); T-65 (fluxo desktop/mobile); T-59 (independência de fluxos). | Nenhuma. |
| **RF-02 — Condições atuais, unidades e aviso de estimativas** | T-08, T-10, T-12 (WMO, normalização e parcial); T-19 (forecast); T-30 (consulta); T-46 (atuais); T-49 (aviso e atribuição); T-54 (integração). | T-102 (service); T-65, T-68 (dados completos); T-69 (parciais e falha total). | Nenhuma. |
| **RF-03 — Cinco dias no fuso local e período anterior** | T-05, T-11, T-12 (calendário, séries e período confiável); T-19 (dados diários); T-34 (mudança de dia sem polling); T-47, T-48 (cartões e seções); T-49 (estimativas); T-54, T-55 (integração e atualização do período). | T-102 (service); T-68 (cinco dias, DST e virada de ano); T-69 (lacunas/fuso/âncora); T-75 (meia-noite sem fetch). | Nenhuma. |
| **RF-04 — Celsius inicial e alternância de todas as temperaturas** | T-04 (conversão e arredondamento); T-26, T-36, T-37 (unidade inicial/restaurada e escolha vigente); T-38 (Celsius após exclusão); T-46, T-47 (temperaturas e demais unidades); T-50, T-56 (seletor e integração). | T-100 (unitários); T-60 (unidade durante request); T-70 (conversão sem rede); T-72 (preferência restaurada). | Nenhuma. |
| **RF-05 — Loading, vazio, parcial, falhas, timeout e recuperação** | T-12 a T-15 (utilidade, erros, deadline e Retry-After); T-18, T-19, T-23 (fronteiras de dados/localização); T-24, T-25, T-27 a T-33, T-35 (estados, retry manual, concorrência, bloqueios e snapshot); T-41, T-42 (falha de render); T-43, T-45, T-48 (feedback); T-53 a T-55, T-57 (integração). | T-101 a T-103 (services e componentes); T-66, T-67 (recuperação e limites); T-69 (parcial); T-71 (timeout de localização); T-74 (snapshot); T-78 (ausência de cache persistente); T-80, T-88, T-89 (acessibilidade dos estados). | Nenhuma. |
| **RF-06 — Localização opcional com informação e ação explícita** | T-23 (API do navegador); T-35 (ação, intenção e prazos); T-51 (informação prévia e fallback manual); T-57 (integração). | T-71 (permissão concedida/indefinida, sucesso e falhas); T-78 (minimização de coordenadas). | Nenhuma. |
| **RF-07 — Preferências locais mínimas, restauração e exclusão** | T-20 a T-22 (leitura, projeção e remoção próprias); T-26 (estado); T-36 a T-38 (confirmação, escolhas e exclusão sem recriação); T-52 (painel); T-58 (integração). | T-60 (request pendente); T-72, T-73 (visitas e exclusão); T-78 (sem coordenadas/cache/persistência em servidor). | Nenhuma. |
| **RF-08 — Consulta, refresh, horários, atualidade e concorrência** | T-05 a T-07, T-10 a T-12 (datas, referência inequívoca e fuso inválido); T-19 (consulta); T-25, T-30 a T-35 (alvo vigente, refresh, relógio sem polling e localização); T-46, T-48 (conclusão/referência, UTC e avisos); T-53 a T-55, T-57 (ações integradas). | T-59 (busca independente); T-65 (seleção); T-69 (UTC/fuso inválido); T-71 (localização); T-74 (refresh, horário e respostas superadas); T-75 (60/61 min, referência desconhecida e ausência de polling). | Nenhuma. |

**Resultado da conferência:** os oito requisitos funcionais da spec (RF-01 a RF-08) têm tarefas de implementação e de verificação correspondentes. Não foi identificado requisito funcional sem tarefa. Esta é cobertura do planejamento, não evidência de implementação ou aceite; todas as tarefas continuam pendentes.

| Cobertura dedicada solicitada | Tarefa responsável |
|---|---|
| Unitários de conversão, arredondamento e alternâncias | T-100 |
| Service de geocoding com mock de fetch | T-101 |
| Service de forecast com mock de fetch | T-102 |
| Componentes em loading, erro e vazio | T-103 |
| E2E busca → seleção → atuais e cinco dias, desktop/mobile 390 × 844 | T-65 |

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
