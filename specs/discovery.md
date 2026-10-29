# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação para que usuários consultem o clima de cidades e planejem atividades com base nas condições atuais e na previsão dos próximos dias. A experiência deve funcionar também em dispositivos móveis. O briefing ainda não define fonte de dados, nível de detalhe da previsão, tratamento de localização nem requisitos de disponibilidade.

## Personas

- **Pessoa que organiza a rotina diária**
  - **Objetivo principal:** decidir o que vestir e como se deslocar com base no clima da cidade onde está.
  - **Contexto de uso:** consulta rápida no celular, frequentemente antes de sair de casa; pode usar desktop para planejar a semana.
  - **Métrica de sucesso para a persona:** encontrar e entender as condições atuais da cidade em até 30 segundos, sem confundir local ou unidade.
- **Viajante que planeja os próximos dias**
  - **Objetivo principal:** avaliar o clima de um destino para planejar atividades e escolher o que levar.
  - **Contexto de uso:** pesquisa no desktop ao organizar a viagem e consulta novamente no celular durante o deslocamento.
  - **Métrica de sucesso para a persona:** localizar o destino correto e consultar a previsão identificada para os cinco dias, conseguindo decidir o que levar sem precisar repetir a busca.
- **Pessoa que consulta o clima em mobilidade**
  - **Objetivo principal:** obter informação meteorológica legível e confiável enquanto está fora de casa, com pouco tempo ou atenção disponível.
  - **Contexto de uso:** principalmente celular, em telas menores e possivelmente com conexão lenta ou instável.
  - **Métrica de sucesso para a persona:** concluir a consulta no celular sem rolagem horizontal, compreender o estado da consulta e receber uma orientação clara caso os dados não carreguem.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome e selecione o local correspondente quando houver resultados ambíguos.
- **RF-02 — Consultar clima atual:** exibir as condições atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias, com o período e os dados apresentados claramente identificados.
- **RF-04 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar as temperaturas exibidas.
- **RF-05 — Informar estados da consulta:** apresentar estados de carregamento, ausência de resultados e falha ao buscar dados, com orientação para o próximo passo.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** entre larguras de 320 px e 1920 px, a interface deve manter conteúdo e funcionalidades disponíveis, sem rolagem horizontal da página.
- **RNF-02 — Acessibilidade:** os fluxos de busca e consulta devem atender ao WCAG 2.2 nível AA, incluindo operação por teclado, rótulos acessíveis e contraste adequado.
- **RNF-03 — Desempenho:** em condições normais de rede, 95% das buscas devem apresentar resultados ou erro em até 3 segundos; a interface deve permanecer interativa durante a espera.
- **RNF-04 — Disponibilidade e resiliência:** a aplicação deve estar acessível ao menos 99,5% do tempo em cada mês. Falhas de rede ou do provedor de clima devem ser comunicadas e permitir nova tentativa; a disponibilidade do provedor externo não compõe a meta da aplicação.
- **RNF-05 — Idioma e localização:** interface, datas e unidades devem seguir as decisões de idioma e localização adotadas para o produto.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Indisponibilidade, limite de requisições ou mudança no provedor de clima | Média | Alto: consultas podem falhar ou ficar sem dados | Tratar erros e limites, evitar requisições repetidas, monitorar falhas e definir se haverá cache ou provedor alternativo. |
| Dados desatualizados ou interpretados como atuais | Média | Alto: decisões podem ser tomadas com informações incorretas | Exibir horário da última atualização, definir frequência e idade máxima dos dados e indicar quando forem estimativas ou estiverem desatualizados. |
| Seleção de cidade homônima ou localização incorreta | Média | Alto: o usuário recebe a previsão de outro local | Mostrar região/estado e país nos resultados e exigir confirmação quando houver ambiguidade. |
| Escopo do produto indefinido (detalhes da previsão, público e métricas de sucesso) | Alta | Alto: retrabalho e dificuldade para avaliar se o app atende à necessidade | Validar as perguntas em aberto com usuários e stakeholders; priorizar um conjunto mínimo de dados e métricas antes de expandir o escopo. |
| Desempenho inadequado em redes lentas ou dispositivos móveis | Média | Alto: abandono ou dificuldade para consultar rapidamente | Medir a meta de latência em condições representativas, manter a interface interativa durante carregamentos e reduzir chamadas desnecessárias. |
| Layout ou controles inacessíveis em alguns dispositivos ou para pessoas com deficiência | Média | Alto: parte dos usuários não consegue concluir a consulta | Validar em larguras variadas e com teclado e tecnologias assistivas; adotar WCAG 2.2 AA como critério de aceite. |
| Falha de rede ou do serviço sem recuperação clara | Alta | Médio/alto: consulta interrompida e perda de confiança | Apresentar erro compreensível, permitir nova tentativa e definir comportamento para dados em cache, caso sejam suportados. |
| Geolocalização ou coleta de dados sem expectativa clara do usuário | Baixa/média | Alto: perda de confiança e possível exposição de dados pessoais | Solicitar permissão apenas quando necessário, explicar seu uso, oferecer busca manual e definir minimização e retenção de dados. |
| Datas, fusos ou unidades apresentados de forma inconsistente | Média | Médio/alto: previsão pode ser mal interpretada | Definir convenções de localização, associar a previsão ao fuso da cidade e identificar claramente as unidades exibidas. |
| Meta de disponibilidade sem medição ou responsável operacional | Média | Alto: falhas podem persistir sem detecção ou resposta | Definir escopo e método de medição, monitoramento, responsáveis e procedimento de resposta a incidentes. |
| Previsão interpretada como garantia das condições futuras | Baixa | Alto: decisões do usuário podem ser afetadas | Identificar período e local da previsão e comunicar que se trata de uma estimativa fornecida pelo serviço. |

## Perguntas em Aberto

1. **Qual problema prioritário o app deve resolver e para quais públicos ou regiões ele será lançado?** Impacto: sem público e contexto prioritários, não é possível decidir quais tarefas, localidades, dispositivos e idiomas merecem precedência.
2. **Como será medido o sucesso do produto (por exemplo, consultas concluídas, retorno de usuários ou satisfação)?** Impacto: sem métricas e uma linha de base, não será possível avaliar se a solução atende à necessidade ou orientar melhorias.
3. **Quais informações compõem “condições atuais” e cada dia da previsão (temperatura mínima/máxima, sensação térmica, precipitação, vento, umidade, ícones etc.)?** Impacto: a interface, os dados exigidos do provedor e a densidade visual ficam indefinidos; exibir dados demais também pode prejudicar a consulta rápida.
4. **A previsão cobre hoje e os quatro dias seguintes, como assumido, ou os cinco dias completos seguintes? Qual fuso horário define a virada do dia?** Impacto: sem confirmação, usuários podem interpretar incorretamente o período e as datas exibidas.
5. **O que significa “atual” para o clima atual e com que frequência os dados devem ser atualizados? Deve haver atualização automática?** Impacto: sem uma regra de atualização e de idade máxima dos dados, informações antigas podem parecer atuais ou gerar requisições desnecessárias.
6. **Qual nível de precisão e quais limitações dos dados são aceitáveis? A interface deve mostrar horário da última atualização, fonte ou aviso de estimativa?** Impacto: usuários podem confiar em informação desatualizada ou interpretar uma previsão como garantia; também ficam indefinidos os avisos necessários.
7. **Quais países, regiões e localidades são cobertos, e em quais idiomas e convenções regionais o produto deve funcionar?** Impacto: afeta busca, nomes de lugares, fusos horários, formatação de datas e estratégia de localização. pt-BR está assumido, mas seu escopo geográfico e eventual suporte multilíngue não estão confirmados.
8. **A busca aceita nomes em outros idiomas, acentos e entradas parciais? Como ordena resultados e trata consulta vazia, sem correspondência ou erro do serviço de geocodificação?** Impacto: sem regras, resultados podem ser inconsistentes e usuários podem não conseguir encontrar o local desejado.
9. **Quais informações identificam suficientemente uma cidade (região/estado, país, coordenadas), e como o usuário confirma ou altera a seleção?** Impacto: cidades homônimas podem levar a uma previsão do local errado.
10. **A geolocalização automática fará parte do produto? Se sim, quando será solicitada, como será explicada e qual alternativa haverá se a pessoa negar a permissão?** Impacto: afeta privacidade, permissões do navegador e o fluxo inicial; sem alternativa, a consulta pode ficar bloqueada.
11. **Quais unidades além de temperatura devem ser oferecidas (vento, precipitação etc.)? A unidade escolhida persiste entre visitas ou cidades?** Impacto: sem decisão, valores podem aparecer em unidades inesperadas e a preferência pode se perder; persistência também determina se é necessário armazenamento local.
12. **A consulta exige apenas a cidade escolhida nesta sessão ou deve lembrar cidades recentes/favoritas?** Impacto: define se há estado persistente, armazenamento, controles de privacidade e trabalho adicional de interface.
13. **O app precisa funcionar sem conexão ou exibir dados armazenados em cache? Se sim, por quanto tempo e como indicará que estão desatualizados?** Impacto: determina estratégia de cache, comportamento offline e risco de apresentar dados antigos sem contexto.
14. **Qual comportamento é esperado para lentidão, limite de requisições, indisponibilidade ou resposta inválida do provedor? Deve haver repetição automática, tentativa manual ou provedor alternativo?** Impacto: sem política, falhas podem causar esperas longas, requisições repetidas, custos/limites excedidos ou ausência de dados.
15. **As metas de desempenho de 3 segundos e disponibilidade mensal de 99,5% estão aprovadas? Como e em que condições serão medidas?** Impacto: sem definição de rede, dispositivo, ponto de medição, janela e responsabilidades sobre hospedagem, as metas não são testáveis nem há como atribuir falhas.
16. **Quais navegadores, versões e dispositivos precisam ser suportados?** Impacto: sem uma matriz de compatibilidade, não é possível priorizar testes ou definir quando uma falha de suporte é bloqueadora.
17. **O nível WCAG 2.2 AA é requisito formal? Há tecnologias assistivas e cenários de uso que devem ser validados além dos critérios mínimos?** Impacto: sem escopo e validação, barreiras de acesso podem permanecer mesmo que os controles pareçam acessíveis em inspeção visual.
18. **Há requisitos de segurança, privacidade, retenção de dados, analytics ou consentimento? Quais dados, se houver, serão coletados?** Impacto: mesmo sem autenticação ou servidor de persistência assumidos, geolocalização, logs e analytics podem envolver dados pessoais e exigir controles e comunicação apropriados.
19. **Como o produto deve se sustentar e há restrições de custo, publicidade ou uso comercial dos dados do provedor?** Impacto: limites de uso, atribuição exigida ou custos podem inviabilizar a solução ou exigir mudanças de provedor e interface.
20. **Quem é responsável por operação, monitoramento e resposta a incidentes, e qual tempo de recuperação é aceitável?** Impacto: uma meta de disponibilidade sem responsáveis, alertas e procedimento de recuperação não assegura que o serviço volte a funcionar após uma falha.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Justificativa: permite consultar geocodificação e previsão sem exigir credenciais de API para o escopo definido. Resolve a escolha inicial do provedor (pergunta 14); limites, disponibilidade, atribuição e condições de uso ainda precisam ser avaliados.
- **“Cinco dias” significa hoje e os quatro dias seguintes.** Justificativa: fixa um intervalo de previsão consistente com o requisito de cinco dias. Resolve a ambiguidade do período (pergunta 4); o fuso horário usado para determinar a virada do dia ainda precisa ser definido.
- **Unidade padrão de temperatura: Celsius.** Justificativa: oferece um padrão explícito para a interface em pt-BR. Resolve a unidade inicial, mas outras unidades meteorológicas e a persistência da preferência continuam em aberto (pergunta 11).
- **Sem autenticação e sem persistência de dados no servidor.** Justificativa: mantém o escopo simples e evita contas e armazenamento de perfil nesta versão. Resolve a necessidade de autenticação e persistência de servidor, mas não define armazenamento local, analytics, logs ou retenção de dados operacionais (perguntas 12 e 18).
- **Idioma da interface: pt-BR.** Justificativa: define o idioma inicial de conteúdo e interação. Resolve o idioma da primeira versão; cobertura geográfica, convenções regionais e suporte a outros idiomas permanecem em aberto (pergunta 7).
