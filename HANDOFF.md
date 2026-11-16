# Handoff — refinamento visual e Jornada de Clientes

Atualizado em 16/11/2026. Leia também [DESIGN.md](DESIGN.md), cuja primeira parte descreve a interface atual. A referência Origin preservada ao final desse arquivo é apenas histórica.

## Pedido atual e ponto de parada

O usuário pediu: “Não mude isso, crie um handoff e atualise o design.md”. A entrega desta rodada é documental. Não recolher a lista de clientes, não reorganizar a Jornada em dois momentos e não iniciar a antiga etapa 7. Não há nova alteração visual autorizada pendente.

## Histórico das etapas e decisões

| Etapa original | Estado atual |
| --- | --- |
| 1. Limpar KPIs | Implementada: sem pontos, recuos ou faixas laterais. |
| 2. Clarear fundo | Implementada: claro `#FAFBFD`; escuro preservado. |
| 3. Trocar bordas por sombras | Implementada; sombras depois reforçadas. Todos os fundos de KPI são neutros, inclusive o de variação. |
| 4. Remover cabeçalhos redundantes | Implementada; `h1` acessível preservado. |
| 5. Compactar Visão Executiva | Implementada; altura fixa somente a partir de 1024×720, com rolagem interna nos painéis. |
| 6. Fixar KPIs e criar rolagem interna no Comparativo | Cancelada e desfeita a pedido do usuário. O Comparativo usa rolagem natural. |
| 7. Compactar Jornada com colunas roláveis | Não executada. A proposta posterior de recolher a lista também não foi autorizada. |

No lugar da etapa 6, o usuário pediu mover “Clientes das Unidades Regionais” do Comparativo para a Jornada e adaptar a seleção para centenas ou milhares de clientes.

## Comportamento entregue

- `ClientDirectory` apresenta a carteira com busca por nome, código e segmento; normalização de acentos; filtros Todos/Novos/Risco; contagens e paginação de 6/12/24 cards, padrão 6.
- A paginação e os filtros operam sobre os clientes retornados pela API. A busca usa índice em memória e `useDeferredValue`; somente a página visível vira cards no DOM.
- O seletor de quantidade por página é nativo. Substituiu o seletor do Ant Design na implementação para evitar problemas de abertura durante testes com movimento reduzido.
- A regional vem do seletor global. A busca não altera a conta em consulta até que outra seja selecionada.
- A lista não recolhe. Os detalhes ficam abaixo e a página mantém rolagem natural.
- A seleção funciona no card inteiro; o botão interno fornece a ação de teclado e deixa o clique propagar para o card, evitando uma chamada duplicada.
- Ao selecionar, a Jornada atualiza conta, score, ticket, gráficos e eventos. O bloco de detalhes usa chave por cliente; filtros de eventos e fatia ativa da pizza reiniciam na troca.
- Há rolagem suave até a identificação e foco com `preventScroll`. A preferência de movimento reduzido troca a animação por rolagem imediata. “Trocar cliente” retorna ao título da lista.
- Estados sem resultados permitem limpar filtros; uma regional sem contas permite voltar a todas as contas.
- O score do KPI usa verde para ≥70, âmbar para 40–69 e vermelho para <40. Esses rótulos visuais não mudam o status fornecido pela API nos demais componentes.

## Correções recentes que devem ser preservadas

1. **Clique no card:** inicialmente só “Ver jornada” selecionava a conta. O relato do usuário foi reproduzido clicando no nome do segundo cliente; o evento agora fica no card inteiro.
2. **Chaves do Comparativo:** `dadosGrafico` não carregava `id`, apesar de as células usarem `key={entry.id}`. O `id` regional foi adicionado ao mapeamento.
3. **Gráfico oculto:** a Visão Executiva renderizava o gráfico de detalhes da empresa mesmo com o bloco oculto no celular. Agora recebe `isMobile` e não monta esse bloco no layout móvel, evitando os avisos de dimensão zero observados.
4. **Rolagem:** o salto imediato ao detalhe foi substituído por `scrollIntoView` com `smooth`; com `prefers-reduced-motion: reduce`, usa `instant`. O foco não deve interromper a animação.

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| [src/utils/themeTokens.js](src/utils/themeTokens.js) | Paleta e sombras dos dois temas. |
| [src/App.jsx](src/App.jsx) | Navegação, dados, tema, `h1` acessível e classe exclusiva de layout executivo. |
| [src/components/ClientDirectory.jsx](src/components/ClientDirectory.jsx) | Busca, filtros, paginação e seleção dos cards. |
| [src/components/componentsCSS/ClientDirectory.css](src/components/componentsCSS/ClientDirectory.css) | Seleção, paginação e ação de retorno à lista. |
| [src/pages/HistoricoClientes.jsx](src/pages/HistoricoClientes.jsx) | Conta selecionada, KPIs, gráficos, histórico, rolagem e foco. |
| [src/pages/Comparativo.jsx](src/pages/Comparativo.jsx) | Comparativo sem lista de clientes; `id` nos dados das barras. |
| [src/components/componentsCSS/Comparativo.css](src/components/componentsCSS/Comparativo.css) | Estilos do Comparativo e estilos de cards reutilizados pelo diretório. |
| [src/pages/VisaoGeral.jsx](src/pages/VisaoGeral.jsx) | Visão Executiva; evita montar detalhes ocultos no celular. |
| [src/components/componentsCSS/VisaoGeral.css](src/components/componentsCSS/VisaoGeral.css) | Layout compacto e limite desktop de 1024×720. |
| [src/components/ExecutiveKpiGrid.jsx](src/components/ExecutiveKpiGrid.jsx) e [ReferenceSystem.css](src/components/componentsCSS/ReferenceSystem.css) | KPIs compartilhados, cores apenas no texto e superfícies com sombras. |
| [src/components/MotionPrimitives.jsx](src/components/MotionPrimitives.jsx) | Transição de página com classe usada pelo layout executivo. |

## Verificação realizada antes deste handoff

- Build passou após a última alteração de código. Há avisos de chunks `vendor`/`utils` vazios e bundle acima de 500 kB.
- Testes de navegador com 2.000 clientes simulados verificaram busca fora da página atual, 6 cards por padrão no DOM, paginação de 24, último cliente, seleção exata, filtros e estados vazios.
- Dimensões verificadas no diretório: 1440, 1366, 1024 e 390 px, nos dois temas; a Visão Executiva também foi verificada nos limites de altura definidos em DESIGN.md.
- A regressão de seleção foi verificada com os três clientes reais: clique no nome, corpo do card e botão via teclado; identificação, score, ticket e quantidade de eventos mudaram para a conta correta.
- Nessa regressão, o console não apresentou os avisos de chave/dimensão reportados, nem respostas HTTP 500.
- Rolagem suave: posições intermediárias, destino e foco verificados; rolagem imediata confirmada com movimento reduzido.
- As verificações de navegador usaram Playwright instalado em `/tmp/primora-browser`, com scripts e imagens nessa pasta. São artefatos temporários locais, não testes versionados nem dependência do projeto.
- Esta rodada altera apenas documentação. Não atribuir a ela uma nova execução de build ou da suíte completa `npm test`.

Para executar localmente: `npm run dev:server` inicia a API; `npm run dev` inicia o Vite. A URL padrão da API é `http://localhost:3001/api/v1`, configurável por `VITE_API_BASE_URL`. Para verificar compilação, use `npm run build`.

## Limitações e cuidados para continuidade

- A API continua retornando a coleção inteira. Paginação e busca no servidor não foram implementadas; 2.000 clientes simulados validam a interface, não a carga da API ou volumes arbitrários.
- O filtro Novos preserva a regra existente: IDs diferentes de `CLI-001`/`CLI-002`/`CLI-003` ou `isNovo`. Não reinterpretar essa classificação sem novo pedido.
- Busca, filtro e página permanecem enquanto `ClientDirectory` estiver montado; não há persistência ao sair e voltar da Jornada.
- Existem alterações de implementação locais e arquivos novos no workspace. Não executar reset/checkout para limpar o diretório, nem descartar mudanças anteriores à rodada documental.
- Não reintroduzir fundos semânticos nos KPIs, cabeçalhos gerais, abas por cliente ou a rolagem interna cancelada do Comparativo.
- A próxima mudança de layout da Jornada precisa de uma nova orientação do usuário. A proposta de recolher a lista foi recusada; manter o comportamento atual.
