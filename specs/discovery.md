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

## Suposições

**Decisões adotadas para destravar a especificação deste treinamento**

- Fonte de dados: **Open-Meteo**, sem necessidade de chave de API.
- Interpretação de “previsão de cinco dias”: **hoje e os quatro dias seguintes**.
- Unidade padrão de temperatura: **Celsius**; o usuário pode alternar para Fahrenheit.
- Não haverá autenticação nem persistência de dados em servidor.
- Idioma da interface: **pt-BR**.
- O acesso será feito por uma interface web responsiva; o briefing não exige aplicativo nativo.

Essas decisões são premissas de trabalho para a próxima etapa e devem ser confirmadas antes de tratar a especificação como definitiva.
