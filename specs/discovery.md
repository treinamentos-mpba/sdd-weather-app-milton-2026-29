# Discovery — Aplicação de Previsão do Tempo

## Contexto

A aplicação permite pesquisar cidades no mundo todo e consultar o clima atual e a previsão para planejar a rotina ou uma viagem. O MVP é uma aplicação web responsiva, em pt-BR, sem contas ou persistência em servidor; usa Open-Meteo e oferece localização por dispositivo apenas quando solicitada pela pessoa usuária.

## Personas

- **Pessoa que organiza a rotina diária**
  - **Objetivo principal:** decidir o que vestir e como se deslocar com base no clima da cidade onde está.
  - **Contexto de uso:** consulta rápida no celular, frequentemente antes de sair de casa; pode usar desktop para planejar a semana.
  - **Métrica de sucesso para a persona:** encontrar e entender as condições atuais da cidade em até 30 segundos, sem confundir local ou unidade (meta inicial a validar em testes com usuários).
- **Viajante que planeja os próximos dias**
  - **Objetivo principal:** avaliar o clima de um destino para planejar atividades e escolher o que levar.
  - **Contexto de uso:** pesquisa no desktop ao organizar a viagem e consulta novamente no celular durante o deslocamento.
  - **Métrica de sucesso para a persona:** localizar o destino correto e consultar a previsão identificada para os cinco dias, conseguindo decidir o que levar sem precisar repetir a busca (resultado qualitativo a validar em testes com usuários).
- **Pessoa que consulta o clima em mobilidade**
  - **Objetivo principal:** obter informação meteorológica legível e confiável enquanto está fora de casa, com pouco tempo ou atenção disponível.
  - **Contexto de uso:** principalmente celular, em telas menores e possivelmente com conexão lenta ou instável.
  - **Métrica de sucesso para a persona:** concluir a consulta no celular sem rolagem horizontal, compreender o estado da consulta e receber uma orientação clara caso os dados não carreguem (validado por testes de usabilidade e responsividade).

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir pesquisar cidades globalmente pelo nome e selecionar o local desejado. Diferenciar resultados por cidade, região/estado e país quando esses dados estiverem disponíveis.
- **RF-02 — Consultar clima atual:** exibir temperatura, sensação térmica, condição meteorológica, umidade e velocidade do vento para a cidade selecionada, com unidades identificadas.
- **RF-03 — Consultar previsão:** exibir hoje e os quatro dias seguintes no fuso horário da cidade selecionada, com condição meteorológica, temperaturas mínima e máxima, probabilidade de precipitação, umidade média e velocidade máxima do vento por dia.
- **RF-04 — Alternar unidade:** permitir alternar temperaturas entre Celsius e Fahrenheit e atualizar os valores exibidos. Usar km/h para vento e porcentagem para umidade e probabilidade de precipitação.
- **RF-05 — Informar estados da consulta:** apresentar carregamento, ausência de resultados e falha ao buscar dados, com orientação para tentar novamente. Não exibir dados em cache no MVP.
- **RF-06 — Consultar por localização:** oferecer uma ação explícita para usar a localização do dispositivo. Solicitar permissão somente após essa ação; se a permissão for negada ou indisponível, manter a busca manual disponível.
- **RF-07 — Lembrar preferências no navegador:** manter a identificação da última cidade selecionada (nome e contexto regional, sem coordenadas precisas) e a unidade de temperatura no armazenamento local do navegador, sem conta nem persistência no servidor da aplicação.
- **RF-08 — Atualizar consulta:** obter dados ao selecionar uma cidade ou solicitar localização e permitir atualização manual. Mostrar quando a consulta foi realizada; não atualizar automaticamente em segundo plano no MVP.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** entre larguras de 320 px e 1920 px, a interface deve manter conteúdo e funcionalidades disponíveis, sem rolagem horizontal da página.
- **RNF-02 — Acessibilidade:** os fluxos de busca e consulta devem atender ao WCAG 2.2 nível AA, incluindo operação por teclado, rótulos acessíveis e contraste adequado.
- **RNF-03 — Desempenho:** apresentar resultado ou erro em até 3 segundos para 95% das consultas, medido do envio da busca até o resultado/erro visível, mantendo a interface interativa. No perfil móvel, medir em navegador suportado sob rede de 10 Mbps e latência de 100 ms; medir desktop separadamente.
- **RNF-04 — Resiliência:** falhas de rede ou do provedor devem ser comunicadas sem inutilizar a aplicação e com opção de nova tentativa. O MVP não tem meta contratual de disponibilidade nem modo offline.
- **RNF-05 — Idioma e localização:** apresentar a interface em pt-BR, formatar datas no fuso horário da cidade consultada e identificar unidades. Temperatura inicia em Celsius; vento em km/h; umidade e probabilidade de precipitação em porcentagem.
- **RNF-06 — Segurança e privacidade:** não exigir conta, não persistir dados no servidor e não coletar analytics no MVP. Solicitar geolocalização somente mediante ação explícita; informar que a consulta de clima envia a localização necessária ao provedor externo.
- **RNF-07 — Compatibilidade:** validar os fluxos principais nas versões atuais dos navegadores evergreen Chrome, Edge, Firefox e Safari; confirmar a matriz de versões no plano de testes.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade, limite de requisições ou mudança no provedor de clima | Média | Alto: consultas podem falhar ou ficar sem dados | Tratar erros e limites, evitar requisições repetidas, informar a falha e permitir nova tentativa; validar termos e limites do provedor antes de publicar. |
| Dados desatualizados ou interpretados como atuais | Média | Alto: decisões podem ser tomadas com informações incorretas | Consultar dados ao selecionar/atualizar a cidade, mostrar o horário da consulta e não apresentar cache como dado atual. |
| Seleção de cidade homônima ou localização incorreta | Média | Alto: o usuário recebe a previsão de outro local | Mostrar região/estado e país nos resultados e exigir confirmação quando houver ambiguidade. |
| Prioridade entre personas e métricas de sucesso ainda não validadas | Média | Alto: retrabalho e dificuldade para avaliar se o app atende à necessidade | Usar as três personas como hipótese inicial e validar as tarefas e métricas com usuários antes de expandir o escopo. |
| Desempenho inadequado em redes lentas ou dispositivos móveis | Média | Alto: abandono ou dificuldade para consultar rapidamente | Medir a meta de latência em condições representativas, manter a interface interativa durante carregamentos e reduzir chamadas desnecessárias. |
| Layout ou controles inacessíveis em alguns dispositivos ou para pessoas com deficiência | Média | Alto: parte dos usuários não consegue concluir a consulta | Validar em larguras variadas e com teclado e tecnologias assistivas; adotar WCAG 2.2 AA como critério de aceite. |
| Falha de rede ou do serviço sem recuperação clara | Alta | Médio/alto: consulta interrompida e perda de confiança | Apresentar erro compreensível e permitir nova tentativa; o MVP não promete consulta offline nem dados em cache. |
| Geolocalização ou coleta de dados sem expectativa clara do usuário | Baixa/média | Alto: perda de confiança e possível exposição de dados pessoais | Solicitar permissão somente após ação explícita, oferecer busca manual, não persistir coordenadas precisas e não coletar analytics no MVP. |
| Datas, fusos ou unidades apresentados de forma inconsistente | Média | Médio/alto: previsão pode ser mal interpretada | Definir convenções de localização, associar a previsão ao fuso da cidade e identificar claramente as unidades exibidas. |
| Expectativa de disponibilidade de produção em um MVP sem operação definida | Média | Alto: usuários podem depender de um serviço sem suporte ou monitoramento | Tratar o MVP como projeto de treinamento sem SLA; definir monitoramento, responsáveis e meta operacional antes de lançamento de produção. |
| Previsão interpretada como garantia das condições futuras | Baixa | Alto: decisões do usuário podem ser afetadas | Identificar período e local da previsão e comunicar que se trata de uma estimativa fornecida pelo serviço. |

## Pendências Antes de Publicação

- **Termos do Open-Meteo:** confirmar atribuição, limites e permissão de uso no contexto do projeto. Isso não bloqueia a spec de treinamento, mas pode alterar a integração ou a publicação.
- **Operação de produção:** antes de publicar para usuários reais, decidir hospedagem, monitoramento, responsáveis e eventual meta de disponibilidade. O MVP de treinamento não anuncia SLA.

## Decisões

### Confirmadas pelo usuário

- **Fonte de dados:** Open-Meteo, sem API key. Confirmar termos, atribuição e limites antes de publicar.
- **Cobertura e idioma:** busca global e interface em pt-BR.
- **Período da previsão:** hoje e os quatro dias seguintes.
- **Temperatura:** Celsius como unidade padrão, com alternância para Fahrenheit.
- **Autenticação e persistência de servidor:** não haverá autenticação nem persistência no servidor.
- **Dados da previsão:** incluir vento e umidade além das informações básicas.
- **Geolocalização:** oferecer como opção; a busca manual permanece disponível.
- **Persistência local:** lembrar cidade e unidade no navegador, sem conta.
- **Operação do MVP:** escopo de treinamento, sem SLA de produção.
- **Prioridade:** atender às três personas igualmente no MVP, sem priorização até validação com usuários.
- **Desempenho:** aprovada a meta p95 de até 3 segundos e o perfil móvel de teste de 10 Mbps/100 ms; desktop será medido separadamente.
- **Espera máxima:** 10 segundos por busca, consulta de previsão e obtenção de localização, sem repetição automática. Esse limite não substitui a meta p95 de desempenho.
- **Atualidade:** marcar observações com mais de 60 minutos como desatualizadas; se uma atualização falhar, manter os dados da mesma localização já visíveis na sessão com aviso e horários anteriores, sem cache persistente.

### Defaults recomendados para o MVP

- **Dados exibidos:** clima atual com temperatura, sensação térmica, condição, umidade e vento; previsão diária com condição, mínima/máxima, probabilidade de precipitação, umidade média e vento máximo. Sem alertas ou previsão horária.
- **Unidades adicionais:** vento em km/h; umidade e probabilidade de precipitação em porcentagem.
- **Geolocalização:** pedir permissão somente após ação explícita e não persistir coordenadas precisas; enviar localização ao provedor apenas para a consulta solicitada.
- **Atualização e falhas:** consultar ao selecionar cidade ou localização, permitir atualização manual e apresentar horário da consulta; sem atualização automática ou cache/offline no MVP; permitir nova tentativa em caso de falha.
- **Armazenamento e privacidade:** manter apenas cidade selecionada e unidade no armazenamento local; sem analytics no MVP.
- **Compatibilidade:** validar fluxos principais nas versões atuais dos navegadores evergreen Chrome, Edge, Firefox e Safari; detalhar a matriz no plano de testes.

### Detalhamento dos edge cases

Os comportamentos de entrada inválida, resposta parcial, concorrência, limites do provedor, localização, preferências e atualidade estão detalhados nos cenários EC-01 a EC-30 de [weather-app-spec.md](weather-app-spec.md). Esses cenários complementam os requisitos do discovery sem acrescentar suporte offline, cache persistente ou geocodificação reversa obrigatória.
