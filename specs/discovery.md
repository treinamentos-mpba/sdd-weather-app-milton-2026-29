# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa precisa de uma aplicação para que usuários consultem o clima de cidades e planejem atividades com base nas condições atuais e na previsão dos próximos dias. A experiência deve funcionar também em dispositivos móveis. O briefing ainda não define fonte de dados, nível de detalhe da previsão, tratamento de localização nem requisitos de disponibilidade.

**Personas consideradas**

- **Pessoa que organiza a rotina:** consulta o clima atual para decidir o que vestir ou como se deslocar.
- **Viajante:** pesquisa uma cidade e consulta os próximos dias para planejar atividades e bagagem.
- **Pessoa em mobilidade:** usa principalmente o celular e precisa consultar informações de forma rápida e legível.

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
| Indisponibilidade ou limite de requisições do provedor de clima | Média | Alto: usuários podem ficar sem dados atuais ou previsão | Tratar erros e limites, evitar requisições repetidas e avaliar cache e alternativa de provedor. |
| Busca retorna cidades homônimas ou uma localização incorreta | Média | Alto: previsão exibida pode corresponder a outro local | Exibir contexto suficiente para diferenciar resultados, como estado/região e país, antes da seleção. |
| Conexão lenta ou ausente impede a atualização dos dados | Alta | Médio: consulta demora ou falha | Mostrar carregamento, mensagem clara de erro e opção de tentar novamente; avaliar cache para consultas futuras. |
| Diferenças de tela e interação entre dispositivos prejudicam o uso móvel | Média | Médio: informações ou controles ficam difíceis de acessar | Validar layouts em diferentes larguras e testar os fluxos principais em viewport móvel. |
| Dados meteorológicos podem ser interpretados como garantia de condições futuras | Baixa | Alto: decisões do usuário podem ser afetadas | Identificar período e local da previsão e comunicar que se trata de uma estimativa fornecida pelo serviço. |

## Perguntas em Aberto

1. **Qual nível de detalhe deve ser exibido para o clima atual e para cada dia?** Impacto: define o conteúdo da interface, os dados necessários e a densidade visual.
2. **A previsão de cinco dias deve incluir hoje ou os cinco dias seguintes?** Impacto: altera o intervalo consultado e a expectativa do usuário sobre o período coberto.
3. **A busca deve aceitar apenas nomes de cidades ou também permitir geolocalização automática?** Impacto: influencia permissões, privacidade e o fluxo inicial de uso.
4. **Como o usuário deve escolher entre cidades com o mesmo nome?** Impacto: sem contexto regional, pode consultar o local errado.
5. **É necessário oferecer suporte a outros idiomas além de pt-BR?** Impacto: afeta tradução, formatação de datas e estratégia de localização.
6. **A aplicação deve funcionar offline ou manter dados em cache?** Impacto: afeta disponibilidade percebida, armazenamento e indicação de atualidade dos dados.
7. **Há requisitos de compatibilidade com navegadores específicos?** Impacto: define a matriz de navegadores e versões que deve ser validada.

## Suposições

**Decisões adotadas para destravar a especificação deste treinamento**

- Fonte de dados: **Open-Meteo**, sem necessidade de chave de API.
- Interpretação de “previsão de cinco dias”: **hoje e os quatro dias seguintes**.
- Unidade padrão de temperatura: **Celsius**; o usuário pode alternar para Fahrenheit.
- Não haverá autenticação nem persistência de dados em servidor.
- Idioma da interface: **pt-BR**.
- O acesso será feito por uma interface web responsiva; o briefing não exige aplicativo nativo.

Essas decisões são premissas de trabalho para a próxima etapa e devem ser confirmadas antes de tratar a especificação como definitiva.
