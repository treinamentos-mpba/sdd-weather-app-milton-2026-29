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
| RF-05 | Apresentar carregamento, ausência de resultados, dados parciais e falhas com orientação para prosseguir. Limitar cada busca, consulta de previsão e obtenção de localização a 10 segundos, sem repetição automática; permitir nova tentativa manual, respeitando limites do provedor. Não persistir cache meteorológico; dados já visíveis podem permanecer na sessão com aviso de falha de atualização. |
| RF-06 | Oferecer consulta pela localização do dispositivo mediante ação explícita. Solicitar permissão somente após essa ação, explicar o envio da localização ao provedor e manter busca manual disponível em caso de recusa ou indisponibilidade. |
| RF-07 | Lembrar no navegador a identificação da última cidade selecionada e a unidade de temperatura, sem conta ou persistência no servidor. A identificação compreende nome e contexto regional; coordenadas precisas da geolocalização não são persistidas. |
| RF-08 | Obter dados ao selecionar cidade ou solicitar localização, permitir atualização manual e mostrar horários da consulta e da observação, quando disponíveis. Marcar observações com mais de 60 minutos como desatualizadas e atualidade desconhecida quando não houver horário confiável. Não atualizar automaticamente em segundo plano; respeitar a intenção mais recente da pessoa. |

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
  - **Then:** a identificação da cidade e a preferência Fahrenheit são recuperadas sem exigir conta; a pessoa confirma a cidade antes de iniciar uma nova consulta.
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
| RNF-02 — Acessibilidade | Atender WCAG 2.2 nível AA nos fluxos de busca e consulta, incluindo rótulos acessíveis, contraste, foco perceptível e operação por teclado. Anunciar carregamento, resultado vazio e erro a tecnologias assistivas sem depender apenas de cor nem deslocar o foco inesperadamente. Combinar verificação automatizada e manual; automação isolada não demonstra conformidade. |
| RNF-03 — Desempenho | Em 95% das consultas, apresentar resultado ou erro em até 3 segundos, do envio da busca até sua apresentação visível, mantendo a interface interativa. Perfil móvel aprovado: 10 Mbps e latência de 100 ms em navegador suportado. Medir desktop separadamente. Detalhes de amostragem e dispositivo constam em Open Questions. |
| RNF-04 — Resiliência | Falhas de rede ou do provedor não devem inutilizar a aplicação; informar a falha e oferecer nova tentativa. Não há SLA de produção nem modo offline no MVP. |
| RNF-05 — Idioma e localização | Interface em pt-BR e datas no fuso da cidade. Temperatura em Celsius inicialmente, respeitando preferência salva; alternância para Fahrenheit. Identificar km/h para vento e % para umidade e probabilidade de precipitação. |
| RNF-06 — Segurança e privacidade | Sem contas, persistência de servidor ou analytics. Geolocalização somente por ação explícita, com informação sobre envio ao provedor externo. Não persistir coordenadas precisas da geolocalização. |
| RNF-07 — Compatibilidade | Validar fluxos principais nas versões atuais de Chrome, Edge, Firefox e Safari; registrar as versões efetivamente verificadas no plano de testes. |

## Edge Cases

Os cenários EC abaixo complementam os Acceptance Criteria e também são critérios de aceite Given/When/Then. Cada linha deve ser validada com respostas, relógio, permissões e armazenamento controlados; alternativas explicitadas em uma precondição devem ser exercitadas separadamente.

### Regras de comportamento

- **Busca (RF-01):** envio explícito por botão ou Enter, sem consultas por digitação. Remover somente espaços nas extremidades e aceitar termos não vazios, inclusive acentos, hífens, apóstrofos e escrita não latina. Preservar a grafia e enviar/exibir texto como dado, não como instrução ou marcação. Usar até dez resultados na ordem do provedor; não garantir equivalência entre grafias nem selecionar o primeiro automaticamente. Sem contexto suficiente para distinguir resultados, informar a limitação e pedir uma busca mais específica.
- **Dados parciais (RF-02/RF-03/RF-05):** exibir dados válidos com aviso de resposta parcial e “Sem dados” para campos ausentes, nulos, não finitos ou fora de domínio (porcentagens fora de 0–100 e vento negativo). Zero e temperaturas negativas são válidos. Não inventar valores, dias ou agregações. Quando não houver nenhum dado meteorológico utilizável, estrutura interpretável ou associação segura de local e período, informar erro.
- **Datas e unidades (RF-03/RF-04):** associar valores às datas da resposta, nunca deslocar índices para preencher lacunas. Mostrar as cinco datas esperadas, marcando ausência de previsão sem inventá-la. Usar o calendário/fuso da cidade, não uma sequência de períodos fixos de 24 horas. Converter temperaturas a partir dos valores de origem, nunca de valores já arredondados. Exibir números com até uma casa decimal, arredondando ao mais próximo; em empate, afastar de zero; não exibir zero negativo.
- **Espera e limites (RF-05/RF-06):** encerrar cada operação em até 10 segundos contados de seu início, inclusive enquanto se aguarda localização/permissão. Não repetir automaticamente. Após timeout, ignorar respostas tardias. Para HTTP 429, informar limite temporário; se houver `Retry-After` válido, impedir repetição da operação afetada até o prazo indicado. Sem prazo válido, oferecer nova tentativa manual sem prometer quando o serviço voltará.
- **Concorrência (RF-01/RF-06/RF-08):** a intenção mais recente prevalece, inclusive entre localização e seleção manual ou duas atualizações da mesma cidade. Não disparar consultas idênticas simultâneas por cliques repetidos. Uma nova busca não mantém resultados anteriores selecionáveis como se fossem atuais.
- **Preferências (RF-07):** restaurar unidade e identificação da cidade, mas solicitar confirmação e nova resolução da cidade antes de consultar; nunca escolher homônimo silenciosamente. Se o armazenamento falhar, continuar na sessão com aviso de que as preferências não foram salvas; descartar somente preferências inválidas da aplicação. Oferecer ação para apagar as preferências locais, sem apagar dados de outros sites ou aplicações.
- **Localização (RF-06/RF-07):** sem nome confiável, identificar como “Sua localização”, sem inferir uma cidade próxima. Não persistir essa coordenada ou um nome de cidade inferido; preservar a última cidade escolhida manualmente. Ao retornar, não solicitar localização automaticamente.
- **Atualidade (RF-08):** distinguir horário da consulta e da observação. Aos 60 minutos a observação ainda está dentro do limite; acima disso, marcar “Desatualizado”, inclusive quando o limite é ultrapassado com a tela aberta, sem disparar nova consulta. Horário ausente, inválido ou futuro implica “Atualidade desconhecida”. Falha de atualização da mesma localização mantém os dados em memória com aviso “Não atualizados” e seus horários anteriores. Ao trocar de local, não manter dados antigos identificados como se fossem do novo local.

### Cenários verificáveis

| ID / requisitos | Given | When | Then |
|---|---|---|---|
| EC-01 — RF-01 | Campo vazio ou contendo somente espaços. | A pessoa envia a busca. | Nenhuma chamada de geocoding é feita; uma orientação associada ao campo solicita o nome da cidade. |
| EC-02 — RF-01 | Termos como “ São Paulo ”, “Tromsø”, “N'Djamena” ou “東京”, com resultados controlados do provedor. | A pessoa digita e depois envia cada termo. | Digitar não faz chamadas; enviar remove espaços externos, preserva a grafia e apresenta os resultados retornados. |
| EC-03 — RF-01 | Entrada ou nome retornado contém caracteres de marcação, como `<` e `>`. | O texto é enviado ou apresentado na interface. | É tratado como texto, sem executar marcação; a entrada não altera os parâmetros da consulta além do valor pesquisado. |
| EC-04 — RF-01/RF-05 | Um termo sem correspondência no catálogo e resultados de uma busca anterior. | O geocoding responde com lista vazia ou sem coleção de resultados, conforme seu contrato de resposta vazia. | Informar que nenhuma cidade foi encontrada e sugerir outra grafia; resultados antigos deixam de ser selecionáveis; não afirmar que a cidade não existe. |
| EC-05 — RF-01 | Resultados homônimos sem contexto suficiente para distingui-los. | A lista é apresentada. | Informar a limitação e solicitar uma busca mais específica, sem selecionar automaticamente um local. |
| EC-06 — RF-05 | Rede indisponível, HTTP 5xx ou resposta não interpretável. | A operação falha. | Encerrar carregamento, informar falha recuperável e oferecer nova tentativa manual, sem apresentar “cidade não encontrada” ou detalhes técnicos internos. |
| EC-07 — RF-05/RF-06 | Busca, previsão ou localização não conclui. | O relógio chega a 10 segundos desde o início da operação. | Encerrar a espera com aviso de tempo excedido e opção manual; não repetir automaticamente nem aceitar resposta tardia como sucesso dessa operação. |
| EC-08 — RF-05 | HTTP 429 com `Retry-After` válido de 30 segundos. | A resposta chega e a pessoa tenta repetir antes do prazo. | Informar limite temporário e não reenviar a operação afetada antes dos 30 segundos; depois, permitir tentativa manual, sem disparo automático. |
| EC-09 — RF-05 | HTTP 429 sem `Retry-After` válido. | A resposta é recebida. | Informar limite temporário sem inventar prazo; permitir tentativa manual, sem repetição automática. |
| EC-10 — RF-02/RF-03 | Local/período identificáveis e resposta com campos válidos, umidade nula e vento ausente. | Os dados são apresentados. | Mostrar os campos válidos, “Sem dados” nos ausentes e aviso de resposta parcial, sem substituir ausências por zero. |
| EC-11 — RF-02/RF-03 | Resposta contém temperatura de 0 °C, umidade de 0%, vento zero e outro campo não finito ou porcentagem de 120%. | Os dados são apresentados. | Mostrar os zeros válidos; marcar apenas os campos inválidos como “Sem dados”, sem `NaN` ou `undefined`. |
| EC-12 — RF-03 | Resposta com uma data ausente ou coleção de valores menor que a coleção de datas. | A previsão é apresentada. | Manter as cinco datas esperadas, marcar lacunas e resposta parcial; valores disponíveis permanecem ligados à sua data, sem deslocamento ou preenchimento inventado. |
| EC-13 — RF-02/RF-03/RF-05 | Não há dado utilizável ou não é possível associar com segurança os valores ao local/período consultado. | A resposta é processada. | Informar falha da consulta, em vez de apresentar previsão aparentemente válida ou totalmente preenchida com zeros. |
| EC-14 — RF-02/RF-03 | Há código meteorológico desconhecido e outras variáveis válidas. | A condição é apresentada. | Mostrar “Condição não disponível”, sem ícone arbitrário, mantendo os demais valores válidos e indicação de resposta parcial. |
| EC-15 — RF-01/RF-08 | Consulta A pendente e, depois, consulta B para outra cidade ou atualização mais recente da mesma cidade. | B termina e A responde por último, com sucesso ou erro. | Manter o resultado/estado de B; A não substitui valores, mensagens, horários ou local da intenção mais recente. |
| EC-16 — RF-01/RF-08 | Uma busca ou atualização está pendente. | A pessoa aciona repetidamente a mesma operação com os mesmos parâmetros. | Não iniciar consultas idênticas simultâneas; continuar permitindo editar e enviar uma busca diferente. |
| EC-17 — RF-06/RF-08 | Localização está pendente e a pessoa seleciona manualmente uma cidade em seguida. | A localização chega depois. | Manter a cidade escolhida e não iniciar consulta pela localização tardia. |
| EC-18 — RF-06 | Permissão negada, localização indisponível ou contexto do navegador sem suporte ao recurso. | A pessoa solicita localização. | Explicar a impossibilidade e manter busca manual, sem insistir automaticamente na permissão. |
| EC-19 — RF-06/RF-07 | Coordenada válida sem nome confiável e uma cidade escolhida manualmente anteriormente. | A consulta por localização termina e as preferências são inspecionadas. | Identificar “Sua localização”; não salvar coordenada nem cidade inferida; preservar a última cidade manual salva. |
| EC-20 — RF-03 | Respostas controladas atravessam virada de ano ou transição de horário de verão, com dispositivo em outro fuso. | Os cinco dias são apresentados. | Mostrar cinco datas consecutivas do calendário da cidade, sem duplicação, omissão ou deslocamento por offset fixo. |
| EC-21 — RF-04 | Temperatura de origem de 12,34 °C. | A pessoa alterna Celsius/Fahrenheit dez vezes e retorna a Celsius. | Mostrar 12,3 °C ao final e 54,2 °F em Fahrenheit, sem acumular erro de conversão nem alterar outras unidades. |
| EC-22 — RF-07 | Armazenamento bloqueado, cheio ou com preferências inválidas. | A aplicação tenta salvar ou recuperar preferências. | Informar a impossibilidade de lembrar preferências, usar somente valores válidos e manter busca/consulta na sessão sem conta ou persistência em servidor. |
| EC-23 — RF-07 | Cidade salva em contexto regional ambíguo e unidade Fahrenheit válida. | A pessoa retorna e confirma a consulta da cidade lembrada. | Preservar Fahrenheit e pedir seleção entre correspondências; não consultar automaticamente um homônimo. |
| EC-24 — RF-07 | Preferências da aplicação estão salvas. | A pessoa aciona apagar preferências. | Remover cidade/unidade persistidas pela aplicação e confirmar a ação; em uma nova abertura, não restaurá-las nem remover dados de outras aplicações. |
| EC-25 — RF-05/RF-08 | Dados da cidade A estão visíveis e sua atualização falha. | A falha é recebida. | Manter os dados de A em memória com “Não atualizados”, horários anteriores e nova tentativa; não atualizar o horário de sucesso nem persistir previsão. |
| EC-26 — RF-05/RF-08 | Dados da cidade A estão visíveis. | A pessoa seleciona B e a consulta de B falha. | Identificar a falha de B sem apresentar os dados de A como sendo de B. |
| EC-27 — RF-08 | Observação de 13h e relógio controlado às 14h no mesmo fuso. | A consulta é apresentada e o relógio avança um minuto. | Aos 60 minutos, não marcar por idade; aos 61, marcar “Desatualizado”, sem nova chamada automática e distinguindo observação de consulta. |
| EC-28 — RF-08 | Observação sem horário válido ou com horário no futuro. | Os dados são apresentados. | Mostrar “Atualidade desconhecida” em vez de afirmar que são atuais; preservar o horário da consulta bem-sucedida como informação distinta. |
| EC-29 — RF-05 | Pessoa usando teclado e leitor de tela. | A consulta passa por carregamento e termina sem resultados ou com erro. | Anunciar o estado relevante, manter foco previsível e acesso por teclado à recuperação; não comunicar apenas por cor. |
| EC-30 — RF-04/RF-07 | Unidade Fahrenheit válida salva e nenhuma nova escolha de unidade. | A pessoa confirma a cidade e a consulta termina. | Apresentar temperaturas em Fahrenheit, não sobrescrever a preferência com Celsius. |

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
| Dados desatualizados apresentados como atuais | Média | Alto: decisões baseadas em informações antigas. | Distinguir consulta de observação; aplicar aviso acima de 60 minutos ou de atualidade desconhecida e sinalizar falhas de atualização. |
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

As questões abaixo não impedem usar este documento como base de discussão, mas impedem considerar fechados os comportamentos ou critérios afetados. Os IDs são preservados para rastreabilidade; OQ-01 e OQ-03 a OQ-06 foram resolvidas pelas regras e cenários de Edge Cases. Os limites de 10 segundos e 60 minutos foram confirmados pelo usuário; os demais comportamentos incorporam as recomendações autorizadas para o MVP.

| ID | Pergunta e alternativas a decidir | Impacto e momento de resolução |
|---|---|---|
| OQ-02 | O provedor oferece todos os campos diários com a semântica exigida? Qual agregação representa a probabilidade diária? | Confirmar antes de fechar o contrato de dados. Se um campo não estiver disponível, aplicar a política de resposta parcial; não calcular agregações novas sem rever a especificação. Arredondamento e tratamento de ausências estão definidos em Edge Cases. |
| OQ-07 | Qual dispositivo, perfil de processamento, amostra e conjunto de consultas serão usados para medir desempenho? A métrica engloba busca de cidade, previsão ou o fluxo completo? Como registrar resultados no desktop? | O perfil de rede foi aprovado, mas esses detalhes faltam para uma medição reproduzível. Fechar no plano de validação antes de avaliar RNF-03. |
| OQ-08 | Quais versões e sistemas operacionais compõem a matriz de navegadores e quais tecnologias assistivas serão usadas na validação manual? | Necessário para verificar RNF-02/RNF-07. Registrar no plano de testes. |
| OQ-09 | Quais são os termos atuais do Open-Meteo, atribuição exigida, limites e permissão para o contexto de publicação? | Pode alterar integração ou viabilidade da publicação. Confirmar antes de publicar; não presumir uso comercial gratuito. |
| OQ-10 | Antes de produção, quem responde por hospedagem, monitoramento, suporte, logs operacionais e eventual disponibilidade contratada? | O MVP não tem SLA; definir responsabilidades e tratamento de dados operacionais antes de lançamento para usuários reais. |

### Referências de relatos da comunidade

Os relatos abaixo motivam cenários defensivos; não comprovam que esses problemas persistem na API pública atual ou que se aplicam diretamente à previsão de cinco dias.

- [Diacríticos na busca de localidades](https://github.com/open-meteo/geocoding-api/issues/34): reforça EC-02 e EC-04.
- [Limite de requisições em consultas em lote](https://github.com/open-meteo/open-meteo/issues/1086): reforça EC-08, EC-09 e EC-16.
- [Discussão de fusos e horário de verão](https://github.com/open-meteo/open-meteo/issues/488): reforça EC-20.
- [Valores nulos em instância própria da API histórica](https://github.com/open-meteo/open-meteo/issues/444): reforça EC-10 a EC-12, sem pressupor falha equivalente na API pública.
