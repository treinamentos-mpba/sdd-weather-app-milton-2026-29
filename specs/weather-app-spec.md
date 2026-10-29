# Weather App — Especificação de Produto

## Overview

**Fonte:** [discovery.md](discovery.md). Esta especificação consolida as decisões confirmadas e os defaults recomendados no discovery, sem acrescentar arquitetura ou código. Pendências não resolvidas estão em **Open Questions**.

**Status:** development-ready para o MVP definido. Os contratos e perfis abaixo são defaults autorizados para encerrar as decisões de desenvolvimento. Isso não significa produto implementado, validado ou autorizado para lançamento comercial. Em divergências com defaults anteriores do discovery, prevalece este detalhamento.

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
| RF-02 | Exibir clima atual da cidade selecionada: temperatura, sensação térmica, condição meteorológica, umidade e velocidade do vento, com unidades identificadas. Informar junto aos dados, de forma legível e acessível, que são estimativas e não garantias das condições meteorológicas. Ausências ocasionais seguem a política de dados parciais. |
| RF-03 | A cada consulta bem-sucedida, exibir previsão para hoje e os quatro dias seguintes no fuso da cidade: condição meteorológica, temperaturas mínima e máxima, probabilidade de precipitação, umidade média e velocidade máxima do vento por dia. Com resposta completa, todos esses campos são obrigatórios; ausências ocasionais seguem a política de dados parciais. Manter o aviso de estimativas junto à previsão. Se a data mudar com a tela aberta, manter o período carregado com datas absolutas e aviso de período anterior, sem atualização automática. |
| RF-04 | Iniciar temperaturas em Celsius quando não houver preferência salva, permitir alternância Celsius/Fahrenheit e atualizar todas as temperaturas exibidas. Vento usa km/h; umidade e probabilidade de precipitação usam porcentagem. |
| RF-05 | Apresentar carregamento, ausência de resultados, dados parciais e falhas com orientação para prosseguir. Limitar cada busca, consulta de previsão e obtenção de localização a 10 segundos, sem repetição automática; permitir nova tentativa manual, respeitando limites do provedor. Não persistir cache meteorológico; dados já visíveis podem permanecer na sessão com aviso de falha de atualização. |
| RF-06 | Oferecer consulta pela localização do dispositivo mediante ação explícita. Antes dessa ação, informar de forma visível e acessível que as coordenadas serão enviadas ao Open-Meteo para consultar o clima. Acessar a localização e solicitar permissão somente após a ação, inclusive quando a permissão já estiver concedida; manter busca manual disponível em caso de recusa ou indisponibilidade. |
| RF-07 | Lembrar no navegador a identificação da última cidade selecionada e a unidade de temperatura, sem conta ou persistência no servidor. A identificação compreende nome e contexto regional; coordenadas precisas da geolocalização não são persistidas. Permitir apagar as preferências conforme as regras de exclusão e recuperação de Edge Cases. |
| RF-08 | Obter dados ao selecionar cidade ou solicitar localização, permitir atualização manual e mostrar sempre data e hora de conclusão da consulta meteorológica bem-sucedida, no fuso da cidade. Excepcionalmente, sem fuso válido na resposta, mostrar a conclusão em UTC com rótulo explícito e aviso de fuso indisponível. Mostrar separadamente o horário de referência dos dados atuais quando confiável; acima de 60 minutos, marcar esses dados como desatualizados e, sem referência confiável, como de atualidade desconhecida. Não confundir referência do modelo com medição observada nem com horário da consulta. Não atualizar automaticamente em segundo plano; aplicar as regras de concorrência de Edge Cases. |

### Contrato de produto com o provedor

Verificado em 29/10/2026 na documentação oficial e em uma consulta pública de referência às coordenadas 0,0. A consulta retornou todos os campos abaixo; isso comprova suporte, não cobertura ou disponibilidade garantida em toda localidade.

| Informação | Campo Open-Meteo | Semântica de apresentação |
|---|---|---|
| Temperatura e sensação atuais | `current.temperature_2m`, `current.apparent_temperature` | Temperatura a 2 m e sensação térmica estimada, em °C de origem. |
| Umidade e vento atuais | `current.relative_humidity_2m`, `current.wind_speed_10m` | Umidade relativa em % e vento a 10 m em km/h. |
| Condição atual e referência temporal | `current.weather_code`, `current.time` | Código WMO e instante de referência do dado atual; não é horário de medição por estação. |
| Condição diária | `daily.weather_code` | Condição mais severa prevista no dia segundo o provedor, não uma condição constante durante todo o dia. |
| Extremos de temperatura | `daily.temperature_2m_min`, `daily.temperature_2m_max` | Mínima e máxima previstas no dia local. |
| Probabilidade diária | `daily.precipitation_probability_max` | Maior probabilidade de precipitação do dia; rotular “Probabilidade máxima de precipitação”, sem apresentar como volume ou probabilidade de chover durante todo o dia. |
| Umidade diária | `daily.relative_humidity_2m_mean` | Média diária fornecida pelo provedor, não calculada pela aplicação. |
| Vento diário | `daily.wind_speed_10m_max` | Máxima diária do vento a 10 m, não rajada. |

- Consultar cinco dias, fuso automático da localização, temperaturas de origem em Celsius e vento em km/h. Troca de unidade é apresentação local, sem nova chamada. Uma consulta de previsão deve trazer condições atuais e dados diários juntos.
- Fixar o início do período pela data local representada na resposta válida. Se a requisição atravessar meia-noite, manter as datas recebidas, sinalizar período anterior quando aplicável e oferecer atualização manual; não deslocar valores para adaptar a resposta ao relógio. Sem início de período confiável na resposta, informar previsão indisponível, sem criar datas pelo instante da requisição ou do dispositivo.
- Datas diárias são rótulos de calendário local (`YYYY-MM-DD`), não instantes a converter pelo fuso do dispositivo. Referência atual deve ser um instante inequívoco; se recebida sem offset, usar o fuso IANA retornado somente quando a interpretação for única. Referência ambígua ou inexistente segue “Atualidade desconhecida”. Fuso inválido impede apresentar a previsão como período local válido, mas não descarta condições atuais utilizáveis: nesse caso, apresentar conclusão em UTC explicitamente identificada e aviso de fuso indisponível. Não substituir silenciosamente pelo fuso do dispositivo ou do geocoding.
- Cada série diária deve ter o mesmo tamanho que sua coleção de datas e usar sua ordem; `null` representa ausência naquela posição. Tamanho divergente invalida a série. Datas inválidas ou duplicadas invalidam as posições afetadas; datas fora do período são ignoradas. As coordenadas de grade retornadas podem diferir da cidade: a identidade vem da seleção, não de igualdade exata com a grade.
- Mapear códigos WMO: 0 céu limpo; 1 predominantemente limpo; 2 parcialmente nublado; 3 encoberto; 45/48 nevoeiro; 51/53/55 garoa leve/moderada/intensa; 56/57 garoa congelante leve/intensa; 61/63/65 chuva leve/moderada/intensa; 66/67 chuva congelante leve/intensa; 71/73/75 neve leve/moderada/intensa; 77 grãos de neve; 80/81/82 pancadas de chuva leves/moderadas/violentas; 85/86 pancadas de neve leves/intensas; 95 trovoada; 96/99 trovoada com granizo leve/intenso. Código desconhecido segue EC-14; texto não pode depender do ícone.
- Geocoding usa `language=pt`, sem filtro de país, até dez resultados. O serviço documenta ausência de resultados para um caractere, correspondência exata para dois e busca normalizada por prefixo a partir de três. Não corrigir grafias automaticamente; resultados podem manter nomes nativos. Qualificadores após vírgula dependem da correspondência do provedor, sem promessa de busca livre por qualquer região.
- Persistir somente nome e contexto regional disponíveis da cidade manual e unidade `C` ou `F`, sem coordenadas nem identificador adicional. Na restauração, confirmar e pesquisar novamente: exigir seleção explícita do resultado, mesmo que único. Se nada corresponder, permitir nova busca. Sem preferências, iniciar com busca manual, Celsius e nenhuma consulta ou geolocalização automática.
- Enquanto não houver seção utilizável, não há horário de sucesso novo. Uma resposta parcial utilizável conta como consulta concluída e recebe horário próprio; a idade refere-se apenas às condições atuais. Erros HTTP 4xx, além de 429, não são resultados vazios: informar falha, sem repetir automaticamente.
- Exibir junto aos dados atribuição com link para [Open-Meteo](https://open-meteo.com/) e [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), informando conversão/arredondamento quando aplicados. Creditar GeoNames na apresentação de localidades, conforme atribuição do catálogo. O aviso de estimativas pode compartilhar esse espaço, sem modal obrigatório.

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

### Matriz de rastreabilidade

Os intervalos são inclusivos. Os cenários EC também são critérios de aceite; referências compartilhadas indicam integração entre stories, não testes duplicados. Esta matriz referencia as regras existentes, sem criar requisitos novos.

**RNFs transversais a todas as stories:** RNF-01 (responsividade), RNF-02 (acessibilidade), RNF-05 (idioma e localização), RNF-06 (segurança e privacidade) e RNF-07 (compatibilidade). A última coluna destaca os RNFs adicionais e o foco específico de validação.

| User Story | Requisito funcional | Acceptance Criteria | Cenários complementares | RNFs relevantes além dos transversais |
|---|---|---|---|---|
| US-01 — Buscar cidade | RF-01 | CA-01.1 a CA-01.3 | EC-01 a EC-05, EC-15, EC-16, EC-32, EC-35, EC-42 | RNF-03: latência da busca; RNF-04: recuperação de falhas de geocoding por US-05. |
| US-02 — Consultar clima atual | RF-02 | CA-02.1 a CA-02.3 | EC-10, EC-11, EC-13, EC-14, EC-36, EC-41 | RNF-03: latência da consulta meteorológica; RNF-04: dados parciais e falhas por US-05. |
| US-03 — Consultar previsão | RF-03 | CA-03.1 a CA-03.3; CA-02.3 (aviso compartilhado) | EC-10 a EC-14, EC-20, EC-31, EC-36, EC-40, EC-41, EC-43 | RNF-03: latência da consulta meteorológica; RNF-04: lacunas e séries inválidas. Foco transversal em RNF-05: datas e fuso. |
| US-04 — Alternar unidade | RF-04 | CA-04.1 a CA-04.4 | EC-21, EC-30, EC-34, EC-44 | Nenhum adicional. Foco transversal em RNF-05: unidades e arredondamento; troca local não integra a amostra de rede de RNF-03. |
| US-05 — Tratar estados e falhas | RF-05 | CA-05.1 a CA-05.4 | EC-04, EC-06 a EC-09, EC-13, EC-25, EC-26, EC-29, EC-33, EC-36, EC-39 | RNF-03: registrar latência de falhas separadamente; RNF-04: recuperação, timeout e limites. Foco transversal em RNF-02: anúncios e teclado. |
| US-06 — Usar localização | RF-06 | CA-06.1 a CA-06.3 | EC-07, EC-17 a EC-19 | RNF-03: consulta meteorológica após obter localização, sem incluir espera por permissão; RNF-04: recusa, indisponibilidade e timeout. Foco transversal em RNF-06: ação explícita e informação prévia. |
| US-07 — Lembrar preferências | RF-07 | CA-07.1 a CA-07.3 | EC-19, EC-22 a EC-24, EC-30, EC-37, EC-38, EC-42 | RNF-04: continuar na sessão quando armazenamento falhar. Foco transversal em RNF-06: minimização e exclusão. Busca e previsão após restauração seguem US-01/US-02/US-03. |
| US-08 — Atualizar consulta | RF-08 | CA-08.1 a CA-08.3 | EC-15 a EC-17, EC-25 a EC-28, EC-31 a EC-33, EC-43 | RNF-03: latência da atualização; RNF-04: respostas tardias e falha de atualização. Foco transversal em RNF-05: horários e atualidade. |

Para decompor tarefas e testes, usar os IDs CA/EC como evidência de comportamento e os protocolos dos RNFs como evidência de qualidade. Falhas comuns de busca e previsão são verificadas em US-05 e integradas aos fluxos consumidores.

## Acceptance Criteria

Os critérios abaixo seguem Given/When/Then (precondição/ação/resultado), por story e requisito funcional. Usar respostas controladas do provedor, relógio e permissões simulados para tornar os cenários reproduzíveis. O registro em Open Questions documenta o fechamento das decisões e separa os bloqueios de publicação.

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
  - **Then:** a interface identifica a cidade e apresenta temperatura de 20 °C, sensação de 18 °C, condição de céu limpo, umidade de 60% e vento de 10 km/h.
- **CA-02.2 — Unidades identificadas**
  - **Given:** condições atuais carregadas e uma unidade de temperatura ativa, Celsius ou Fahrenheit.
  - **When:** os dados são apresentados.
  - **Then:** temperatura e sensação térmica identificam °C ou °F conforme a unidade ativa, umidade identifica % e vento identifica km/h.
- **CA-02.3 — Informação sobre estimativas (RF-02/RF-03)**
  - **Given:** condições atuais ou previsão disponíveis.
  - **When:** os dados são apresentados.
  - **Then:** junto aos dados há aviso visível e acessível ao leitor de tela de que são estimativas, não garantias das condições meteorológicas; um aviso compartilhado pode atender às duas seções.

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
  - **Given:** antes de qualquer acionamento, a opção de localização exibe informação visível e acessível sobre envio das coordenadas ao Open-Meteo, sem acesso prévio à localização.
  - **When:** a pessoa aciona a opção e concede permissão, se solicitada.
  - **Then:** somente após essa ação a aplicação acessa a localização e consulta o clima usando a coordenada fornecida; permissão já concedida não dispensa a ação.
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
  - **Then:** a interface apresenta os valores da nova resposta e identifica a data e 14h no fuso da cidade como conclusão da consulta, não como horário de referência dos dados meteorológicos.
- **CA-08.3 — Sem atualização periódica**
  - **Given:** a consulta terminou, não há requisições pendentes e o relógio do teste pode ser avançado.
  - **When:** o relógio avança 30 minutos com a aplicação aberta, sem ações da pessoa.
  - **Then:** nenhuma nova consulta meteorológica é iniciada automaticamente nesse intervalo.

## Non-Functional Requirements

| ID | Requisito e verificação |
|---|---|
| RNF-01 — Responsividade | Entre 320 px e 1920 px de largura, manter conteúdo e funcionalidades disponíveis sem rolagem horizontal da página. Verificar os fluxos de busca, consulta, troca de unidade, localização e erro em larguras representativas, incluindo os limites. |
| RNF-02 — Acessibilidade | Atender WCAG 2.2 nível AA nos fluxos de busca e consulta, incluindo rótulos acessíveis, contraste, foco perceptível e operação por teclado. Anunciar carregamento, resultado vazio e erro a tecnologias assistivas sem depender apenas de cor nem deslocar o foco inesperadamente. Combinar verificação automatizada e manual; automação isolada não demonstra conformidade. |
| RNF-03 — Desempenho | p95 de até 3 segundos por busca de cidades e por consulta meteorológica, medidos separadamente do acionamento até apresentação completa ou parcial utilizável. Aplicar o protocolo abaixo; erros são medidos em grupo separado, não substituem sucessos. Não incluir espera humana pela escolha da cidade ou permissão de localização. |
| RNF-04 — Resiliência | Falhas de rede ou do provedor não devem inutilizar a aplicação; informar a falha e oferecer nova tentativa. Não há SLA de produção nem modo offline no MVP. |
| RNF-05 — Idioma e localização | Interface em pt-BR e datas no fuso da cidade, com exceção explícita de conclusão em UTC quando o fuso da resposta não for válido (RF-08/EC-43). Temperatura em Celsius inicialmente, respeitando preferência salva; alternância para Fahrenheit. Identificar km/h para vento e % para umidade e probabilidade de precipitação. |
| RNF-06 — Segurança e privacidade | Sem contas, persistência de servidor ou analytics. Antes da ação explícita de localização, informar o envio das coordenadas ao Open-Meteo; não acessar localização antes da ação. Não persistir coordenadas precisas da geolocalização. |
| RNF-07 — Compatibilidade | Validar versões estáveis mais recentes na data de aceite: Chrome, Edge e Firefox no Windows 11; Safari no macOS e iOS; Chrome no Android. Registrar versões exatas, sem exigir suporte retroativo a versões posteriores ao aceite. |

### Protocolo de validação e segurança

- **Performance reproduzível:** build de produção, cache meteorológico vazio, um fluxo por vez. Perfil móvel: Chrome com viewport de 390 × 844 CSS px, rede de 10 Mbps nos dois sentidos, latência adicional de 100 ms e CPU com desaceleração de 4×. Desktop: 1366 × 768, mesma rede e sem desaceleração. Registrar máquina, navegador, versão e ferramenta para permitir repetição.
- **Amostra e aprovação:** por perfil, 100 buscas e 100 consultas meteorológicas bem-sucedidas usando respostas controladas representativas de dez resultados/cinco dias, com entrega após 500 ms e mesma limitação de rede. Calcular p95 pelo 95º valor em ordem crescente; cada grupo deve ter p95 ≤ 3 s. Separadamente, exercitar falhas HTTP, timeout e respostas parciais pelos cenários EC, registrando latências e quantidade de falhas. Uma consulta real completa por perfil confirma a integração e tem latência registrada, sem atribuir um SLA ao provedor.
- **Acessibilidade:** fluxos completos por teclado, NVDA com Chrome no Windows e VoiceOver com Safari no iOS. Sem falhas conhecidas dos critérios WCAG 2.2 AA aplicáveis; incluir contraste, zoom de 200%, reflow a 320 CSS px, rótulos, foco e anúncios. Ferramenta automatizada sem violações detectadas complementa, mas não substitui, a inspeção manual. Documentar resultado por critério aplicável.
- **Responsividade:** verificar 320, 390, 768, 1366 e 1920 CSS px, em estados de sucesso, carregamento, vazio, parcial e erro. Conteúdo textual longo deve quebrar linha; funções não podem depender de hover.
- **Proteção de dados:** usar HTTPS e somente endpoints oficiais necessários de geocoding e previsão. Não colocar coordenadas do dispositivo em URL de navegação, armazenamento, mensagens de erro, logs da aplicação ou telemetria. O envio na requisição HTTPS ao provedor é necessário; informar também que ele recebe IP e pode registrar coordenadas conforme sua política, com link para os termos. Não prometer ausência de logs do provedor ou da hospedagem.
- **Conteúdo e dependências:** tratar entrada, preferências e resposta externa como dados não confiáveis; validar tipos e domínios antes da apresentação. Não executar HTML, scripts ou URLs recebidos nesses dados. Sem scripts de analytics, fontes ou recursos externos desnecessários; nenhum segredo deve ser necessário no cliente. Diagnósticos locais podem identificar categoria/status do erro, nunca localização ou termo pesquisado.
- **Entrega:** executar verificações existentes de lint, build e testes; revisar dependências de produção para vulnerabilidades conhecidas altas/críticas, resolvendo ou bloqueando a publicação até decisão documentada. Não introduzir ferramentas ou camadas só para cumprir o documento.

## Edge Cases

Os cenários EC abaixo complementam os Acceptance Criteria e também são critérios de aceite Given/When/Then. Cada linha deve ser validada com respostas, relógio, permissões e armazenamento controlados; alternativas explicitadas em uma precondição devem ser exercitadas separadamente.

### Regras de comportamento

- **Busca (RF-01):** envio explícito por botão ou Enter, sem consultas por digitação. Remover somente espaços nas extremidades e aceitar termos não vazios, inclusive acentos, hífens, apóstrofos e escrita não latina. Preservar a grafia e enviar/exibir texto como dado, não como instrução ou marcação. Usar até dez resultados na ordem do provedor; não garantir equivalência entre grafias nem selecionar o primeiro automaticamente. Sem contexto suficiente para distinguir resultados, informar a limitação e pedir uma busca mais específica.
- **Suporte aos campos (RF-02/RF-03):** os campos obrigatórios e suas semânticas estão definidos no contrato acima, com suporte verificado. A política de resposta parcial cobre ausências ocasionais, não remoção estrutural futura de um campo pelo provedor. Nesse caso, bloquear a entrega afetada até revisar requisito e critérios, sem considerar “Sem dados” cumprimento definitivo. Não criar agregações adicionais.
- **Dados parciais (RF-02/RF-03/RF-05):** exibir dados válidos com aviso de resposta parcial e “Sem dados” para campos ausentes, nulos, não finitos ou fora de domínio (porcentagens fora de 0–100 e vento negativo). Zero e temperaturas negativas são válidos. Não inventar valores, dias ou agregações. Uma seção (condições atuais ou previsão) é utilizável quando contém ao menos um campo meteorológico válido, inclusive condição reconhecida, seguramente associado ao local e ao período correspondente. Local e horários isoladamente não contam como dados meteorológicos. Se apenas uma seção tiver dados utilizáveis, preservá-la e sinalizar indisponibilidade da outra; na previsão, manter as cinco datas esperadas com ausências marcadas. Sem dados utilizáveis nas duas seções, informar falha da consulta.
- **Datas e unidades (RF-03/RF-04):** associar valores às datas somente quando o contrato verificado ou uma identificação explícita permitir associação inequívoca. Uma coleção de valores mais curta não revela, por si só, a posição da ausência; quando ambígua, invalidar somente a série afetada, sem deslocar índices nem descartar outras séries válidas. Com início de período confiável e fuso válido, mostrar as cinco datas esperadas, marcando ausência de previsão sem inventá-la; sem essa âncora, informar seção indisponível. Usar o calendário/fuso da cidade, não uma sequência de períodos fixos de 24 horas. Converter temperaturas a partir dos valores de origem, nunca de valores já arredondados. Exibir números com até uma casa decimal, arredondando ao mais próximo; em empate, afastar de zero; não exibir zero negativo.
- **Mudança de dia (RF-03/RF-08):** se a data mudar no fuso da cidade com a tela aberta, manter datas absolutas e dados do período carregado. Não identificar o dia anterior como “hoje”; informar que o período pertence à consulta anterior e oferecer atualização manual. Somente uma nova consulta redefine o período para o novo hoje e os quatro dias seguintes.
- **Espera e limites (RF-05/RF-06):** encerrar cada operação em até 10 segundos contados de seu início, inclusive enquanto se aguarda localização/permissão. Não repetir automaticamente. Após timeout, ignorar respostas tardias, inclusive após nova tentativa. Para HTTP 429, informar limite temporário. Interpretar `Retry-After` em segundos inteiros não negativos ou data HTTP; data passada não cria espera adicional. O bloqueio abrange novas consultas do serviço afetado (busca de cidades ou previsão), inclusive com parâmetros diferentes; não bloquear o outro serviço, salvo indicação documentada de limite compartilhado. O prazo é contado a partir da resposta para segundos, ou até a data indicada. Ao expirar, apenas liberar tentativa manual, sem chamar automaticamente. Sem prazo válido, oferecer tentativa manual sem prometer quando o serviço voltará.
- **Concorrência (RF-01/RF-06/RF-08):** na busca, somente o envio mais recente pode atualizar a lista e seu estado. Na consulta meteorológica, prevalece a seleção de local ou atualização mais recente; solicitar localização inicia uma intenção meteorológica que pode ser superada por seleção manual posterior. Digitar ou enviar outra busca não invalida a consulta meteorológica vigente. Respostas superadas não alteram dados, mensagens, horários, preferências ou carregamento da intenção vigente. Não disparar consultas idênticas simultâneas por cliques repetidos. Uma nova busca não mantém resultados anteriores selecionáveis como se fossem atuais.
- **Preferências (RF-07):** restaurar unidade e identificação da cidade, mas solicitar confirmação e nova resolução da cidade antes de consultar; nunca escolher homônimo silenciosamente. Preferências inválidas: ignorar somente valores inválidos, preservar os válidos e informar o descarte. Falha de leitura: continuar sem restauração e informar a limitação. Falha de escrita: manter a escolha válida na sessão e informar que não foi salva. Essas falhas não impedem busca ou consulta.
- **Exclusão de preferências (RF-07):** oferecer ação para apagar cidade e unidade persistidas pela aplicação, sem afetar dados de outras aplicações. Após sucesso, limpar a cidade lembrada na sessão e retornar a unidade a Celsius; a consulta já exibida pode permanecer. Atualizações, respostas pendentes e reabertura não recriam preferências apagadas. Uma escolha explícita posterior pode salvar novamente somente a preferência escolhida. Se a remoção falhar, informar que a exclusão não foi concluída, sem confirmar sucesso.
- **Localização (RF-06/RF-07):** sem nome confiável, identificar como “Sua localização”, sem inferir uma cidade próxima. Não persistir essa coordenada ou um nome de cidade inferido; preservar a última cidade escolhida manualmente. Ao retornar, não solicitar localização automaticamente.
- **Atualidade (RF-08):** sempre mostrar data e hora de conclusão da consulta meteorológica bem-sucedida no fuso da cidade; sem fuso válido na resposta, usar UTC com rótulo explícito e aviso de fuso indisponível (EC-43). Distinguir esse horário da referência temporal dos dados atuais fornecida pelo provedor, sem afirmar que seja medição observada ou horário de atualização do modelo. Aos 60 minutos de idade da referência confiável, os dados ainda estão dentro do limite; acima disso, marcar “Desatualizado”, inclusive com a tela aberta, sem disparar consulta. Referência ausente, inválida ou futura implica “Atualidade desconhecida”. O indicador expressa idade temporal, não precisão meteorológica ou validade dos cinco dias de previsão. Falha de atualização da mesma localização mantém os dados em memória com “Não atualizados” e seus horários anteriores; falhas e respostas descartadas não alteram o horário de sucesso. Ao trocar de local, não manter dados antigos identificados como se fossem do novo local.

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
| EC-08 — RF-05 | HTTP 429 com `Retry-After: 30` ou data HTTP equivalente a 30 segundos no futuro do relógio controlado. | A resposta chega e a pessoa tenta consultar o mesmo serviço com os mesmos parâmetros e depois com outros, antes do prazo. | Informar limite temporário e não iniciar consultas desse serviço antes dos 30 segundos; depois, permitir tentativa manual, sem disparo automático. Na ausência de limite compartilhado documentado, o outro serviço permanece disponível. |
| EC-09 — RF-05 | HTTP 429 sem `Retry-After` válido. | A resposta é recebida. | Informar limite temporário sem inventar prazo; permitir tentativa manual, sem repetição automática. |
| EC-10 — RF-02/RF-03 | Local/período identificáveis e resposta com campos válidos, umidade nula e vento ausente. | Os dados são apresentados. | Mostrar os campos válidos, “Sem dados” nos ausentes e aviso de resposta parcial, sem substituir ausências por zero. |
| EC-11 — RF-02/RF-03 | Resposta contém temperatura de 0 °C, umidade de 0%, vento zero e outro campo não finito ou porcentagem de 120%. | Os dados são apresentados. | Mostrar os zeros válidos; marcar apenas os campos inválidos como “Sem dados”, sem `NaN` ou `undefined`. |
| EC-12 — RF-03 | Uma resposta com lacuna de data identificável e outra com uma série menor que a coleção de datas, sem posição da ausência garantida pelo contrato; outras séries são válidas. | Cada resposta é apresentada separadamente. | Manter as cinco datas esperadas e aviso de resposta parcial. No primeiro caso, marcar a data ausente; no segundo, marcar “Sem dados” para toda a série ambígua, preservando as séries seguramente associadas. Não deslocar valores. |
| EC-13 — RF-02/RF-03/RF-05 | Nenhuma das duas seções possui campo meteorológico válido associável ao local/período, embora possa haver nome ou horários. | A resposta é processada. | Informar falha da consulta, em vez de apresentar previsão aparentemente válida ou preenchida com zeros. |
| EC-14 — RF-02/RF-03 | Há código meteorológico desconhecido e outras variáveis válidas. | A condição é apresentada. | Mostrar “Condição não disponível”, sem ícone arbitrário, mantendo os demais valores válidos e indicação de resposta parcial. |
| EC-15 — RF-01/RF-08 | Busca A seguida de busca B, ou consulta meteorológica A seguida de B para outro local ou atualização mais recente do mesmo local. | B termina e A responde por último, com sucesso ou erro, em cada fluxo separadamente. | Manter o resultado/estado de B dentro do fluxo; A não substitui dados, mensagens, horários, preferências ou carregamento vigentes. |
| EC-16 — RF-01/RF-08 | Uma busca ou atualização está pendente. | A pessoa aciona repetidamente a mesma operação com os mesmos parâmetros. | Não iniciar consultas idênticas simultâneas; continuar permitindo editar e enviar uma busca diferente. |
| EC-17 — RF-06/RF-08 | Localização está pendente e a pessoa seleciona manualmente uma cidade em seguida. | A localização chega depois. | Manter a cidade escolhida e não iniciar consulta pela localização tardia. |
| EC-18 — RF-06 | Permissão negada, localização indisponível ou contexto do navegador sem suporte ao recurso. | A pessoa solicita localização. | Explicar a impossibilidade e manter busca manual, sem insistir automaticamente na permissão. |
| EC-19 — RF-06/RF-07 | Coordenada válida sem nome confiável e uma cidade escolhida manualmente anteriormente. | A consulta por localização termina e as preferências são inspecionadas. | Identificar “Sua localização”; não salvar coordenada nem cidade inferida; preservar a última cidade manual salva. |
| EC-20 — RF-03 | Caso A: cidade em `America/New_York` em 30/10/2026 às 12h locais e dispositivo em UTC. Caso B: cidade em `Pacific/Auckland` em 30/12/2026 às 12h locais e dispositivo em `America/Los_Angeles`. Respostas completas para cada período. | Os cinco dias são apresentados em cada caso. | A: 30/10, 31/10, 01/11, 02/11 e 03/11/2026, atravessando o fim do horário de verão. B: 30/12 e 31/12/2026, 01/01, 02/01 e 03/01/2027. Sem duplicações ou deslocamentos. |
| EC-21 — RF-04 | Temperatura de origem de 12,34 °C. | A pessoa alterna Celsius/Fahrenheit dez vezes e retorna a Celsius. | Mostrar 12,3 °C ao final e 54,2 °F em Fahrenheit, sem acumular erro de conversão nem alterar outras unidades. |
| EC-22 — RF-07 | Falha de leitura, falha de escrita ou cidade inválida com unidade Fahrenheit válida salva. | A aplicação tenta recuperar ou salvar preferências, em cada caso separadamente. | Leitura: informar que não foi possível restaurar e continuar sem restauração. Escrita: manter escolha na sessão e informar que não foi salva. Valor inválido: ignorar somente a cidade inválida, preservar Fahrenheit e informar descarte. Busca e consulta continuam utilizáveis. |
| EC-23 — RF-07 | Cidade salva em contexto regional ambíguo e unidade Fahrenheit válida. | A pessoa retorna e confirma a consulta da cidade lembrada. | Preservar Fahrenheit e pedir seleção entre correspondências; não consultar automaticamente um homônimo. |
| EC-24 — RF-07 | Cidade e Fahrenheit salvos, consulta visível e uma atualização pendente; remoção do armazenamento disponível. | A pessoa apaga preferências, a resposta pendente chega e a aplicação é reaberta. | Confirmar exclusão, limpar cidade lembrada e retornar a Celsius sem exigir apagar a consulta visível; resposta pendente não recria preferências. Na reabertura não restaurar cidade/unidade; não afetar dados de outras aplicações. |
| EC-25 — RF-05/RF-08 | Dados da cidade A estão visíveis e sua atualização falha. | A falha é recebida. | Manter os dados de A em memória com “Não atualizados”, horários anteriores e nova tentativa; não atualizar o horário de sucesso nem persistir previsão. |
| EC-26 — RF-05/RF-08 | Dados da cidade A estão visíveis. | A pessoa seleciona B e a consulta de B falha. | Identificar a falha de B sem apresentar os dados de A como sendo de B. |
| EC-27 — RF-08 | Referência dos dados atuais de 13h e relógio controlado às 14h no mesmo fuso. | A consulta é apresentada e o relógio avança um minuto. | Aos 60 minutos, não marcar por idade; aos 61, marcar “Desatualizado”, sem nova chamada automática e distinguindo referência dos dados de conclusão da consulta. |
| EC-28 — RF-08 | Referência dos dados atuais sem horário válido ou com horário no futuro. | Os dados são apresentados. | Mostrar “Atualidade desconhecida” em vez de afirmar que são atuais; preservar data/hora de conclusão da consulta bem-sucedida como informação distinta. |
| EC-29 — RF-05 | Pessoa usando teclado e leitor de tela, com foco no campo de busca. | A busca passa por carregamento e termina sem resultados ou com erro. | Anunciar uma vez o início do carregamento e, ao concluir, ausência de resultados com orientação de nova busca ou falha com orientação de nova tentativa. Manter foco no campo; permitir alcançar e acionar a recuperação por teclado, respeitando eventual bloqueio temporário. Não depender apenas de cor. |
| EC-30 — RF-04/RF-07 | Unidade Fahrenheit válida salva e nenhuma nova escolha de unidade. | A pessoa confirma a cidade e a consulta termina. | Apresentar temperaturas em Fahrenheit, não sobrescrever a preferência com Celsius. |
| EC-31 — RF-03/RF-08 | Previsão carregada de 29/10 a 02/11/2026, com relógio às 23h59 de 29/10 no fuso da cidade. | O relógio avança para 00h01 de 30/10 sem ação da pessoa. | Manter as datas carregadas, não chamar 29/10 de “hoje”, informar período da consulta anterior e oferecer atualização manual, sem nova chamada automática. Após atualização bem-sucedida, apresentar 30/10 a 03/11. |
| EC-32 — RF-01/RF-08 | Previsão de A pendente e geocoding de uma nova busca B disponível. | A pessoa envia a busca B sem selecionar resultado e a previsão de A chega. | Atualizar a lista de busca de B e apresentar a previsão de A identificada como A; enviar busca não cancela nem substitui por si só o local meteorológico vigente. |
| EC-33 — RF-05/RF-08 | Consulta A excedeu 10 segundos e a pessoa iniciou B por nova tentativa. | A retorna sucesso ou erro durante B ou após B concluir, exercitando cada combinação. | A não altera dados, mensagens, horários, preferências ou carregamento de B; somente a tentativa vigente pode definir seu resultado. |
| EC-34 — RF-04 | Temperaturas de origem de −1,25 °C, 1,25 °C e −0,04 °C. | Os valores são apresentados em Celsius. | Mostrar −1,3 °C, 1,3 °C e 0 °C, respectivamente, sem zero negativo. |
| EC-35 — RF-01 | O provedor retorna doze resultados distinguíveis em ordem conhecida. | A lista é apresentada. | Disponibilizar somente os dez primeiros, na ordem recebida, sem selecionar automaticamente nenhum resultado. |
| EC-36 — RF-02/RF-03/RF-05 | Uma seção sem campos válidos e a outra com apenas uma temperatura válida, associável ao local e período. | A resposta é apresentada, alternando qual seção está indisponível. | Preservar o valor válido com aviso de resposta parcial e sinalizar a seção indisponível; não declarar falha total. Na previsão manter as cinco datas com ausências marcadas. |
| EC-37 — RF-07 | Preferências salvas e falha controlada ao removê-las. | A pessoa aciona apagar preferências. | Informar que a exclusão não foi concluída e permitir tentar novamente, sem afirmar sucesso ou prometer ausência de restauração na próxima abertura. |
| EC-38 — RF-07 | Preferências apagadas com sucesso e nenhuma escolha posterior de cidade. | A pessoa escolhe Fahrenheit e depois reabre a aplicação. | Salvar e restaurar somente a unidade escolhida; não recriar a cidade anteriormente apagada. |
| EC-39 — RF-05 | HTTP 429 com `Retry-After` contendo data HTTP anterior ao relógio controlado. | A resposta chega. | Informar limite temporário sem criar espera adicional; permitir nova tentativa manual, sem chamada automática. |
| EC-40 — RF-03 | Dia de referência com `precipitation_probability_max=70`, `relative_humidity_2m_mean=65` e `wind_speed_10m_max=20`. | A previsão é apresentada. | Identificar probabilidade máxima de precipitação de 70%, umidade média de 65% e vento máximo de 20 km/h, sem rotular vento como rajada ou probabilidade como volume. |
| EC-41 — RF-02/RF-03 | Dados meteorológicos exibidos em Celsius e depois Fahrenheit. | A pessoa consulta a atribuição junto aos dados. | Encontrar links acessíveis para Open-Meteo e CC BY 4.0, aviso de estimativas e indicação de conversão/arredondamento aplicados; nenhuma atribuição implica endosso do provedor. |
| EC-42 — RF-01/RF-07 | Nome/contexto de uma cidade e unidade salvos, sem confirmação nesta visita. | A aplicação abre e depois a pessoa confirma a cidade lembrada. | Antes de confirmar, nenhuma chamada é feita. Depois, iniciar geocoding e exigir seleção explícita do resultado, mesmo se único, antes da previsão. Sem resultados, permitir nova busca. |
| EC-43 — RF-03/RF-08 | Resposta com datas duplicadas, data inválida, início de período indeterminável ou fuso ausente/não reconhecido. | A resposta é processada em cada caso, inclusive atravessando meia-noite. | Invalidar posições com datas duplicadas/inválidas, preservando somente associações inequívocas. Sem fuso válido ou início confiável, informar indisponibilidade da previsão local, sem criar datas pelo relógio. Preservar condições atuais utilizáveis; com fuso inválido/ausente, apresentar conclusão em UTC rotulada e aviso de fuso indisponível, sem adotar fuso do dispositivo/geocoding. Referência atual só é confiável se representar instante inequívoco; sem seção utilizável, falha total e nenhum novo horário de sucesso. |
| EC-44 — RF-04 | Dados carregados e tráfego de rede observado. | A pessoa alterna Celsius/Fahrenheit. | Converter os valores de origem conforme a regra de arredondamento e atualizar rótulos sem nova requisição meteorológica. |

## Assumptions

- O escopo é um MVP de treinamento, não um serviço de produção com suporte ou disponibilidade contratada.
- Open-Meteo é a fonte definida, sem API key, para treinamento não comercial. Campos foram verificados; termos não garantem disponibilidade ou cobertura e devem ser reconferidos no lançamento.
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
| Mudança futura de campos ou semântica do provedor | Média | Alto: retrabalho nos requisitos e apresentação. | Usar o contrato verificado, testar respostas de referência e bloquear entrega afetada por remoção estrutural, sem inventar agregações ou aceitar ausência permanente como cumprimento. |
| Dados desatualizados apresentados como atuais | Média | Alto: decisões baseadas em informações antigas. | Distinguir conclusão da consulta de referência dos dados atuais; aplicar aviso acima de 60 minutos ou de atualidade desconhecida e sinalizar falhas de atualização. |
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

**Pergunta de prontidão: “esta spec é suficiente para desenvolver sem novas perguntas?”**

**Resposta: sim, development-ready para o MVP não comercial definido.** Requisitos, dados, comportamento de exceção e protocolos de aceite estão especificados; arquitetura e decomposição de trabalho seguem para Plan e Tasks antes do código. Não há pergunta de produto bloqueando o desenvolvimento desse escopo. A conformidade da implementação ainda deverá ser demonstrada.

### Registro de fechamento

| IDs originais | Resolução |
|---|---|
| OQ-01, OQ-03 a OQ-06 | Resolvidas pelas regras e cenários de Edge Cases e contrato de produto. Limites de 10 segundos e 60 minutos confirmados pelo usuário. |
| OQ-02 | Campos atuais e diários suportados na consulta de referência; probabilidade diária é máxima; referência atual é dado de modelo com resolução temporal de 15 minutos, não observação de estação nem instante de consulta. Sem agregações locais. |
| OQ-07 | Protocolo de validação definido em Non-Functional Requirements, com perfis, amostragem, métricas e separação entre sucesso e falha. |
| OQ-08 | Matriz de navegador/sistema e validação assistiva definidas nos RNFs; registrar versões executadas no aceite. |
| OQ-09 | API gratuita restrita a uso não comercial; dados sob CC BY 4.0 com atribuição. Termos consultados indicam menos de 10.000 chamadas/dia, 5.000/hora e 600/minuto, sujeitos a mudança. Sem promessa de quota individual garantida. |
| OQ-10 | Operação de produção fora do MVP, conforme decisão do usuário; transferência para o checklist de publicação, não requisito implícito para desenvolver. |

### Checklist separado de publicação

Não é uma declaração de prontidão operacional. Antes de disponibilizar para usuários reais:

- [ ] Revalidar uso não comercial, limites, atribuição e política de privacidade do provedor. Uso comercial ou necessidade de chave exige revisão do escopo e solução para segredos; nunca inserir chave no cliente.
- [ ] Definir responsável por publicação, suporte e incidentes, hospedagem HTTPS, rollback e monitoramento sintético sem localização pessoal. Não anunciar SLA sem aprovação explícita.
- [ ] Documentar retenção/acesso dos logs da hospedagem e informar os destinatários externos dos dados. Os termos consultados do Open-Meteo indicam logs que podem conter coordenadas por até 90 dias; a aplicação não pode prometer sua exclusão.
- [ ] Demonstrar aceite dos RFs, cenários EC, performance, acessibilidade e compatibilidade; registrar versões, evidências e limitações conhecidas.
- [ ] Configurar e verificar CSP restrita aos recursos/endpoints necessários, proibição de enquadramento por terceiros, política de referenciador sem envio da URL da aplicação e permissão de geolocalização restrita à própria origem. Sem conteúdo misto nem exposição de dados pessoais em diagnósticos.
- [ ] Concluir verificações de dependências e revisar mudanças que afetem o contrato do provedor; publicação bloqueada por falhas de segurança ou critérios de aceite não atendidos.

### Fontes oficiais verificadas em 29/10/2026

- [Forecast API](https://open-meteo.com/en/docs): variáveis atuais/diárias, condições baseadas em modelo e códigos WMO.
- [Geocoding API](https://open-meteo.com/en/docs/geocoding-api): correspondência, tradução e campos de localização.
- [Termos e privacidade](https://open-meteo.com/en/terms): uso gratuito não comercial, limites e logs do provedor.
- [Licença](https://open-meteo.com/en/licence): atribuição e CC BY 4.0.

### Referências de relatos da comunidade

Os relatos abaixo motivam cenários defensivos; não comprovam que esses problemas persistem na API pública atual ou que se aplicam diretamente à previsão de cinco dias.

- [Diacríticos na busca de localidades](https://github.com/open-meteo/geocoding-api/issues/34): reforça EC-02 e EC-04.
- [Limite de requisições em consultas em lote](https://github.com/open-meteo/open-meteo/issues/1086): reforça EC-08, EC-09 e EC-16.
- [Discussão de fusos e horário de verão](https://github.com/open-meteo/open-meteo/issues/488): reforça EC-20.
- [Valores nulos em instância própria da API histórica](https://github.com/open-meteo/open-meteo/issues/444): reforça EC-10 a EC-12, sem pressupor falha equivalente na API pública.
