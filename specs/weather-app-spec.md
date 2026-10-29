# Weather App — Especificação de Produto

## Overview

**Fonte:** [discovery.md](discovery.md). Esta especificação consolida as decisões confirmadas e os defaults recomendados no discovery, sem acrescentar arquitetura ou código. Pendências não resolvidas estão em **Open Questions**.

O Weather App é um MVP de treinamento que permite consultar o clima atual e a previsão de hoje e dos quatro dias seguintes para cidades no mundo todo. A experiência é web responsiva, em pt-BR, com dados do Open-Meteo, sem autenticação e sem persistência no servidor.

O produto deve ajudar a interpretar o clima para planejar a rotina e viagens, sem apresentar previsões como garantia das condições futuras.

| Persona | Objetivo e contexto | Sucesso do ponto de vista da pessoa |
|---|---|---|
| Pessoa que organiza a rotina diária | Consultar principalmente no celular o que vestir e como se deslocar; eventualmente planejar a semana no desktop. | Encontrar e entender as condições atuais em até 30 segundos, sem confundir cidade ou unidade. Meta inicial a validar com usuários. |
| Viajante que planeja os próximos dias | Pesquisar um destino no desktop e consultar novamente no celular durante a viagem. | Identificar o destino correto e interpretar os cinco dias para decidir o que levar, sem repetir a busca. Resultado qualitativo a validar com usuários. |
| Pessoa que consulta o clima em mobilidade | Consultar rapidamente no celular, inclusive com conexão lenta ou instável. | Concluir a consulta sem rolagem horizontal ou compreender a falha e o próximo passo. |

As três personas têm a mesma prioridade no MVP. As metas de usabilidade são hipóteses para validação, não resultados já demonstrados.

## Functional Requirements

| ID | Requisito |
|---|---|
| RF-01 | Permitir buscar cidades globalmente pelo nome e selecionar o local desejado. Diferenciar resultados por cidade, região/estado e país, quando disponíveis. |
| RF-02 | Exibir clima atual da cidade selecionada: temperatura, sensação térmica, condição meteorológica, umidade e velocidade do vento, com unidades identificadas. |
| RF-03 | Exibir previsão para hoje e os quatro dias seguintes no fuso da cidade: condição meteorológica, temperaturas mínima e máxima, probabilidade de precipitação, umidade média e velocidade máxima do vento por dia. |
| RF-04 | Iniciar temperaturas em Celsius quando não houver preferência salva, permitir alternância Celsius/Fahrenheit e atualizar todas as temperaturas exibidas. Vento usa km/h; umidade e probabilidade de precipitação usam porcentagem. |
| RF-05 | Apresentar estados de carregamento, ausência de resultados e falha, com orientação para prosseguir. Falhas devem permitir nova tentativa; o MVP não oferece dados meteorológicos em cache. |
| RF-06 | Oferecer consulta pela localização do dispositivo mediante ação explícita. Solicitar permissão somente após essa ação, explicar o envio da localização ao provedor e manter busca manual disponível em caso de recusa ou indisponibilidade. |
| RF-07 | Lembrar no navegador a identificação da última cidade selecionada e a unidade de temperatura, sem conta ou persistência no servidor. A identificação compreende nome e contexto regional; coordenadas precisas da geolocalização não são persistidas. |
| RF-08 | Obter dados ao selecionar cidade ou solicitar localização, permitir atualização manual e mostrar quando a consulta foi realizada. Não atualizar automaticamente em segundo plano. |

## User Stories

| ID | User story | Requisito |
|---|---|---|
| US-01 | Como viajante que planeja os próximos dias, quero buscar uma cidade e distinguir locais homônimos para consultar o clima do destino correto. | RF-01 |
| US-02 | Como pessoa que organiza a rotina diária, quero consultar as condições atuais da cidade para decidir o que vestir e como me deslocar. | RF-02 |
| US-03 | Como viajante que planeja os próximos dias, quero consultar a previsão de hoje e dos quatro dias seguintes para planejar atividades e bagagem. | RF-03 |
| US-04 | Como viajante que planeja os próximos dias, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que conheço. | RF-04 |
| US-05 | Como pessoa que consulta o clima em mobilidade, quero identificar se a consulta está carregando, não encontrou resultados ou falhou para saber se devo aguardar, buscar outra cidade ou tentar novamente. | RF-05 |
| US-06 | Como pessoa que consulta o clima em mobilidade, quero solicitar a consulta pela localização do dispositivo para evitar digitar uma cidade e manter o controle sobre quando minha localização é utilizada. | RF-06 |
| US-07 | Como pessoa que organiza a rotina diária, quero que o navegador lembre minha cidade e unidade de temperatura para reduzir a repetição de escolhas a cada visita. | RF-07 |
| US-08 | Como pessoa que consulta o clima em mobilidade, quero atualizar manualmente os dados e ver o horário da consulta para saber quando as informações foram consultadas. | RF-08 |

## Acceptance Criteria

Os critérios abaixo seguem Given/When/Then (precondição/ação/resultado), por story e requisito funcional. Usar respostas controladas do provedor, relógio e permissões simulados para tornar os cenários reproduzíveis. Regras ainda pendentes em Open Questions não são assumidas como aprovadas.

### US-01 — Buscar e selecionar cidade (RF-01)

- **CA-01.1 — Busca global**
  - **Given:** o provedor retorna Paris, França, para a busca “Paris”.
  - **When:** a pessoa realiza essa busca.
  - **Then:** Paris, França, aparece entre os resultados selecionáveis.
- **CA-01.2 — Cidades homônimas**
  - **Given:** o provedor retorna cidades homônimas com região/estado e país.
  - **When:** os resultados são apresentados.
  - **Then:** cada resultado mostra nome, região/estado e país correspondentes à resposta, antes da seleção.
- **CA-01.3 — Identidade da cidade**
  - **Given:** existem dois resultados homônimos em regiões diferentes.
  - **When:** a pessoa seleciona um deles e a consulta meteorológica termina com sucesso.
  - **Then:** a localização consultada e o local identificado na interface correspondem ao resultado selecionado, não ao outro homônimo.

### US-02 — Consultar clima atual (RF-02)

- **CA-02.1 — Condições atuais**
  - **Given:** uma cidade selecionada e uma resposta controlada com 20 °C, sensação de 18 °C, condição de céu limpo, umidade de 60% e vento de 10 km/h.
  - **When:** a consulta termina com sucesso com Celsius ativo.
  - **Then:** a interface identifica a cidade e apresenta os cinco valores e a condição correspondentes à resposta.
- **CA-02.2 — Unidades identificadas**
  - **Given:** condições atuais carregadas e uma unidade de temperatura ativa, Celsius ou Fahrenheit.
  - **When:** os dados são apresentados.
  - **Then:** temperatura e sensação térmica identificam °C ou °F conforme a unidade ativa, umidade identifica % e vento identifica km/h.

### US-03 — Consultar previsão (RF-03)

- **CA-03.1 — Período de cinco dias**
  - **Given:** o relógio indica 29/10/2026 na cidade consultada e o provedor retorna a previsão completa do período.
  - **When:** a previsão é apresentada.
  - **Then:** são exibidos exatamente cinco dias, identificados como 29/10, 30/10, 31/10, 01/11 e 02/11, em ordem cronológica.
- **CA-03.2 — Dados por dia**
  - **Given:** uma resposta controlada com condição, mínima, máxima, probabilidade de precipitação, umidade média e vento máximo para cada um dos cinco dias.
  - **When:** a previsão é apresentada.
  - **Then:** cada dia exibe esses seis dados correspondentes à resposta; temperaturas identificam a unidade ativa, probabilidade e umidade identificam % e vento identifica km/h.
- **CA-03.3 — Fuso da cidade**
  - **Given:** o mesmo instante corresponde a 30/10/2026 no dispositivo e a 29/10/2026 na cidade consultada.
  - **When:** a previsão é apresentada.
  - **Then:** o primeiro dia exibido é 29/10/2026 e os demais são os quatro dias seguintes no fuso da cidade.

### US-04 — Alternar unidade (RF-04)

- **CA-04.1 — Unidade inicial**
  - **Given:** não há preferência de temperatura salva no navegador.
  - **When:** uma consulta meteorológica termina com sucesso.
  - **Then:** temperatura atual, sensação térmica e mínimas/máximas são apresentadas em Celsius.
- **CA-04.2 — Alternância de todas as temperaturas**
  - **Given:** condições atuais e previsão carregadas em Celsius.
  - **When:** a pessoa seleciona Fahrenheit.
  - **Then:** temperatura atual, sensação térmica e mínimas/máximas dos cinco dias passam a exibir os valores equivalentes em °F, sem temperaturas remanescentes em °C.
- **CA-04.3 — Conversão de referência e retorno**
  - **Given:** um valor de referência de 0 °C apresentado na consulta.
  - **When:** a pessoa seleciona Fahrenheit e depois retorna a Celsius.
  - **Then:** o valor é apresentado como 32 °F após a primeira ação e 0 °C após a segunda.
- **CA-04.4 — Outras unidades preservadas**
  - **Given:** vento de 10 km/h, umidade de 60% e probabilidade de precipitação de 40% carregados.
  - **When:** a pessoa alterna a unidade de temperatura.
  - **Then:** esses valores e unidades permanecem 10 km/h, 60% e 40%.

### US-05 — Entender estados e recuperar falhas (RF-05)

- **CA-05.1 — Carregamento**
  - **Given:** uma consulta foi iniciada e sua resposta está retida pelo ambiente de teste.
  - **When:** a requisição permanece pendente e a pessoa edita o campo de busca.
  - **Then:** a indicação de carregamento permanece visível e o campo aceita a edição.
- **CA-05.2 — Busca sem correspondências**
  - **Given:** o provedor responde com sucesso e uma lista vazia para uma busca válida.
  - **When:** a resposta é apresentada.
  - **Then:** a interface informa ausência de resultados e orienta uma nova busca, sem indicar falha de rede.
- **CA-05.3 — Erro e nova tentativa**
  - **Given:** a primeira consulta falha por erro de rede ou do provedor e a próxima resposta controlada é válida.
  - **When:** o erro é recebido e a pessoa aciona a nova tentativa oferecida.
  - **Then:** a interface informa a falha antes da ação, realiza outra consulta após a ação e apresenta o resultado bem-sucedido.
- **CA-05.4 — Ausência de suporte offline**
  - **Given:** a aplicação está aberta sem dados meteorológicos carregados e a conexão está indisponível.
  - **When:** a pessoa solicita uma consulta e a requisição falha.
  - **Then:** a interface apresenta erro com nova tentativa, sem apresentar previsão armazenada como resultado atual ou indicar que a consulta offline foi bem-sucedida.

### US-06 — Usar localização opcional (RF-06)

- **CA-06.1 — Sem solicitação automática**
  - **Given:** o navegador tem permissão de localização concedida ou ainda não definida.
  - **When:** a pessoa abre a aplicação e não aciona a opção de localização.
  - **Then:** a aplicação não solicita acesso à geolocalização em nenhum dos dois estados de permissão.
- **CA-06.2 — Localização por ação explícita**
  - **Given:** a opção de localização está disponível e o navegador fornecerá uma coordenada controlada após a autorização necessária.
  - **When:** a pessoa aciona a opção e concede permissão, se solicitada.
  - **Then:** a interface informa o uso da localização para consulta ao provedor e a consulta meteorológica usa a coordenada fornecida.
- **CA-06.3 — Recusa ou indisponibilidade**
  - **Given:** o navegador nega a permissão ou informa que a geolocalização está indisponível.
  - **When:** a pessoa aciona a opção de localização.
  - **Then:** a interface explica a impossibilidade e permite realizar uma busca manual por cidade em ambos os casos.

### US-07 — Lembrar preferências (RF-07)

- **CA-07.1 — Preferências entre visitas**
  - **Given:** a pessoa selecionou uma cidade, escolheu Fahrenheit e o armazenamento local está disponível.
  - **When:** a aplicação é fechada e reaberta no mesmo navegador, sem remover os dados salvos.
  - **Then:** a identificação da cidade e a preferência Fahrenheit são recuperadas sem exigir conta; o disparo automático de nova consulta permanece sujeito a OQ-05.
- **CA-07.2 — Minimização de dados persistidos**
  - **Given:** uma cidade foi selecionada, a unidade foi alterada e uma consulta por geolocalização também foi realizada.
  - **When:** os dados persistidos pela aplicação no navegador são inspecionados.
  - **Then:** os únicos dados persistidos são nome/contexto regional da cidade e unidade; não há coordenadas precisas da geolocalização nem dados meteorológicos em cache.
- **CA-07.3 — Sem persistência no servidor**
  - **Given:** o tráfego de rede está sendo observado durante o salvamento de preferências.
  - **When:** a pessoa seleciona uma cidade e altera a unidade.
  - **Then:** não há envio dessas preferências para persistência em servidor da aplicação; consultas meteorológicas ao provedor não constituem persistência de preferências.

### US-08 — Atualizar consulta (RF-08)

- **CA-08.1 — Obtenção por seleção ou localização**
  - **Given:** a aplicação permite selecionar cidade ou consultar por localização.
  - **When:** a pessoa seleciona uma cidade ou solicita localização e o navegador a fornece.
  - **Then:** uma consulta meteorológica é iniciada para o local correspondente em cada uma das duas alternativas.
- **CA-08.2 — Atualização manual e horário**
  - **Given:** uma consulta anterior está carregada e o relógio controlado marca 14h no fuso da cidade.
  - **When:** a pessoa solicita atualização manual e a nova resposta válida é recebida às 14h.
  - **Then:** a interface apresenta os valores da nova resposta e identifica 14h como horário da consulta, não como horário de observação meteorológica.
- **CA-08.3 — Sem atualização periódica**
  - **Given:** a consulta terminou, não há requisições pendentes e o relógio do teste pode ser avançado.
  - **When:** o relógio avança 30 minutos com a aplicação aberta, sem ações da pessoa.
  - **Then:** nenhuma nova consulta meteorológica é iniciada automaticamente nesse intervalo.

## Non-Functional Requirements

| ID | Requisito e verificação |
|---|---|
| RNF-01 — Responsividade | Entre 320 px e 1920 px de largura, manter conteúdo e funcionalidades disponíveis sem rolagem horizontal da página. Verificar os fluxos de busca, consulta, troca de unidade, localização e erro em larguras representativas, incluindo os limites. |
| RNF-02 — Acessibilidade | Atender WCAG 2.2 nível AA nos fluxos de busca e consulta, incluindo rótulos acessíveis, contraste, foco perceptível e operação por teclado. Combinar verificação automatizada e manual; automação isolada não demonstra conformidade. |
| RNF-03 — Desempenho | Em 95% das consultas, apresentar resultado ou erro em até 3 segundos, do envio da busca até sua apresentação visível, mantendo a interface interativa. Perfil móvel aprovado: 10 Mbps e latência de 100 ms em navegador suportado. Medir desktop separadamente. Detalhes de amostragem e dispositivo constam em Open Questions. |
| RNF-04 — Resiliência | Falhas de rede ou do provedor não devem inutilizar a aplicação; informar a falha e oferecer nova tentativa. Não há SLA de produção nem modo offline no MVP. |
| RNF-05 — Idioma e localização | Interface em pt-BR e datas no fuso da cidade. Temperatura em Celsius inicialmente, respeitando preferência salva; alternância para Fahrenheit. Identificar km/h para vento e % para umidade e probabilidade de precipitação. |
| RNF-06 — Segurança e privacidade | Sem contas, persistência de servidor ou analytics. Geolocalização somente por ação explícita, com informação sobre envio ao provedor externo. Não persistir coordenadas precisas da geolocalização. |
| RNF-07 — Compatibilidade | Validar fluxos principais nas versões atuais de Chrome, Edge, Firefox e Safari; registrar as versões efetivamente verificadas no plano de testes. |

## Edge Cases

| Cenário | Comportamento exigido ou pendência |
|---|---|
| Entrada vazia ou somente espaços | Regra de validação e orientação específica ainda não definida: OQ-01. Não confundir validação local com falha do provedor. |
| Nome com acentos, escrita estrangeira ou entrada parcial | Cobertura e regras de correspondência dependem de confirmação: OQ-01. |
| Nenhum resultado | Informar ausência de resultados e permitir nova busca (CA-05.2). |
| Cidades homônimas | Mostrar contexto regional disponível e permitir seleção explícita (CA-01.2 e CA-01.3). |
| Região/estado ou país ausente | Usar o contexto disponível; critério para resultados ainda indistinguíveis pendente em OQ-01. |
| Rede ausente, erro do serviço ou limite de requisições | Informar falha, permitir nova tentativa e não oferecer dados em cache como atuais (CA-05.3 e CA-05.4). |
| Requisição que não termina | Exige timeout e saída do carregamento; limite e regra de repetição pendentes em OQ-03. A meta p95 não define sozinha um timeout. |
| Resposta inválida, campo ausente ou menos de cinco dias | Não inventar valores meteorológicos; apresentação parcial versus erro total pendente em OQ-02. |
| Permissão de localização negada, indisponível ou expirada | Informar a impossibilidade e manter busca manual; limite de espera pendente em OQ-03. |
| Localização disponível sem nome de cidade | Consulta meteorológica por localização está em escopo; forma de identificar o local e persistir a cidade pendente em OQ-04. |
| Armazenamento local bloqueado, cheio ou com dados inválidos | Política de continuidade, aviso e recuperação pendente em OQ-05. |
| Cidade lembrada não pode ser resolvida de forma unívoca | Não escolher homônimo silenciosamente; fluxo de restauração pendente em OQ-05. |
| Cidade e dispositivo em datas diferentes ou mudança de horário sazonal | Usar o fuso da cidade para os cinco dias (CA-03.3). |
| Troca de cidade durante uma consulta ou respostas fora de ordem | Não apresentar a previsão de outro local como sendo da cidade selecionada (CA-01.3). |
| Falha de atualização após consulta bem-sucedida | Ação de nova tentativa é obrigatória; retenção ou remoção dos dados já visíveis depende de OQ-06. |
| Horário de consulta recente com observação meteorológica antiga | Não confundir horário da consulta com horário da observação; política de atualidade pendente em OQ-06. |
| Preferência salva em Fahrenheit | Respeitar a preferência lembrada; Celsius é o padrão quando não houver preferência (CA-04.1 e CA-07.1). |

## Assumptions

- O escopo é um MVP de treinamento, não um serviço de produção com suporte ou disponibilidade contratada.
- Open-Meteo é a fonte definida, sem API key. Disponibilidade dos campos e adequação dos termos ao uso devem ser verificadas; não se presume uso ilimitado ou permissão comercial.
- Cobertura global significa permitir busca nas localidades cobertas pelo provedor, não garantir dados para toda localidade existente.
- Os defaults do discovery são a base do MVP: atualização manual, ausência de cache offline e analytics, unidades métricas adicionais e navegadores evergreen.
- Dados atuais e previsão são estimativas do provedor, não garantias meteorológicas nem orientação para decisões de segurança.
- A aplicação depende de conexão para obter dados; salvar cidade e unidade não salva previsão.
- As métricas das personas ainda exigem validação com usuários.
- Não há escolha de framework, arquitetura, contratos de integração ou estratégia de testes de implementação nesta especificação; essas decisões pertencem às fases seguintes.

## Risks

As probabilidades são avaliações qualitativas do discovery, não estimativas estatísticas.

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade, limite ou mudança do provedor | Média | Alto: ausência de dados e necessidade de rever integração. | Informar falhas, permitir nova tentativa, evitar requisições desnecessárias e verificar termos e limites antes da publicação. |
| Campos diários exigidos não disponíveis ou com semântica diferente | Média | Alto: retrabalho nos requisitos e apresentação. | Verificar umidade média, vento máximo e probabilidade de precipitação antes de fechar contratos; resolver OQ-02 sem inventar agregações. |
| Dados desatualizados apresentados como atuais | Média | Alto: decisões baseadas em informações antigas. | Distinguir horário de consulta e observação e resolver política de atualidade em OQ-06. |
| Cidade homônima ou localização incorreta | Média | Alto: previsão do local errado. | Mostrar contexto regional, exigir seleção e validar identidade da cidade consultada. |
| Personas e métricas ainda não validadas | Média | Alto: retrabalho e valor do produto incerto. | Validar tarefas das três personas com usuários antes de ampliar o escopo. |
| Desempenho ruim em mobile ou rede lenta | Média | Alto: abandono ou consulta frustrada. | Medir p95 no perfil aprovado e manter a interface interativa. |
| Barreiras de acessibilidade ou layout | Média | Alto: exclusão de usuários. | Validar larguras suportadas, teclado e tecnologias assistivas, além de verificações automatizadas. |
| Falha de rede sem recuperação clara | Alta | Médio/alto: consulta interrompida e perda de confiança. | Mostrar erro e nova tentativa, sem prometer operação offline. |
| Uso da localização sem expectativa clara | Baixa/média | Alto: exposição de localização e perda de confiança. | Ação explícita, informação sobre envio ao provedor, busca manual e ausência de persistência de coordenadas precisas. |
| Datas, fusos ou unidades inconsistentes | Média | Médio/alto: interpretação incorreta. | Usar fuso da cidade e unidades identificadas; verificar conversões e diferenças de data. |
| Expectativa de operação de produção no MVP | Média | Alto: dependência de serviço sem suporte definido. | Não anunciar SLA; decidir hospedagem, monitoramento e responsáveis antes de produção. |
| Previsão tratada como certeza | Baixa | Alto: decisões inadequadas. | Identificar período e local e comunicar que os dados são estimativas. |

## Out of Scope

- Autenticação, contas, perfis em servidor e sincronização entre dispositivos.
- Persistência de dados no servidor da aplicação.
- Histórico de consultas, lista de favoritos e múltiplas cidades salvas; somente a última cidade está em escopo.
- Cache meteorológico persistente, operação offline e atualização automática em segundo plano.
- Alertas meteorológicos, notificações, previsão horária e garantias sobre condições futuras.
- Aplicativo nativo e tradução da interface para outros idiomas.
- Analytics e rastreamento de comportamento no MVP.
- Provedor alternativo como mecanismo de failover no MVP.
- SLA de produção, atendimento operacional e infraestrutura de produção definida.

## Open Questions

As questões abaixo não impedem usar este documento como base de discussão, mas impedem considerar fechados os comportamentos ou critérios afetados. Não há decisão implícita entre as alternativas.

| ID | Pergunta e alternativas a decidir | Impacto e momento de resolução |
|---|---|---|
| OQ-01 | Como funciona a busca: envio explícito ou sugestões durante digitação, tamanho mínimo, espaços, acentos, idiomas, ordenação e limite de resultados? Como distinguir locais quando o provedor não oferece contexto suficiente? | Afeta UX, número de chamadas e testes de RF-01. Resolver antes de detalhar o fluxo de busca. |
| OQ-02 | O provedor oferece todos os campos diários com a semântica exigida? Qual agregação representa a probabilidade diária? Se faltarem campos, mostrar dados parciais, calcular a partir de dados disponíveis ou rever o requisito? Como arredondar temperaturas e demais valores? | Afeta RF-02/RF-03 e o contrato de dados. Confirmar antes de fechar o plano e os critérios para respostas incompletas. |
| OQ-03 | Qual o timeout da busca, previsão e localização? Haverá apenas tentativa manual ou alguma repetição automática limitada? | Evita carregamento indefinido e excesso de requisições. Resolver antes de implementar estados de erro; p95 de 3 segundos não equivale a timeout obrigatório de 3 segundos. |
| OQ-04 | Como identificar a cidade de uma coordenada do dispositivo sem pressupor geocodificação reversa disponível? Qual local será lembrado quando a consulta usar localização? | Afeta RF-06/RF-07, identificação do local e dependência de dados adicionais. Resolver no planejamento da integração. |
| OQ-05 | Restaurar a cidade deve disparar nova consulta ou pedir confirmação? Como preservar sua identidade sem coordenadas precisas? Como informar falha ou indisponibilidade do armazenamento e permitir apagar preferências? | Afeta persistência, privacidade e comportamento ao retornar. Resolver antes de implementar RF-07. |
| OQ-06 | Qual idade máxima é aceitável para dados atuais? Mostrar também o horário da observação? Manter informações anteriores claramente marcadas ou removê-las quando uma atualização falhar? | Evita confundir horário de consulta com atualidade meteorológica. Resolver antes de fechar a apresentação de dados e erros. |
| OQ-07 | Qual dispositivo, perfil de processamento, amostra e conjunto de consultas serão usados para medir desempenho? A métrica engloba busca de cidade, previsão ou o fluxo completo? Como registrar resultados no desktop? | O perfil de rede foi aprovado, mas esses detalhes faltam para uma medição reproduzível. Fechar no plano de validação antes de avaliar RNF-03. |
| OQ-08 | Quais versões e sistemas operacionais compõem a matriz de navegadores e quais tecnologias assistivas serão usadas na validação manual? | Necessário para verificar RNF-02/RNF-07. Registrar no plano de testes. |
| OQ-09 | Quais são os termos atuais do Open-Meteo, atribuição exigida, limites e permissão para o contexto de publicação? | Pode alterar integração ou viabilidade da publicação. Confirmar antes de publicar; não presumir uso comercial gratuito. |
| OQ-10 | Antes de produção, quem responde por hospedagem, monitoramento, suporte, logs operacionais e eventual disponibilidade contratada? | O MVP não tem SLA; definir responsabilidades e tratamento de dados operacionais antes de lançamento para usuários reais. |
