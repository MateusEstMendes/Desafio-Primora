# Handoff — contraste do tema escuro

Atualizado em 16/11/2026. Leia também [DESIGN.md](DESIGN.md), cuja primeira parte descreve a interface atual. A referência Origin preservada ao final desse arquivo é apenas histórica.

## Pedido atual e ponto de parada

O pedido atual autoriza aumentar o contraste de todo o tema escuro, implementado nas três telas. O refinamento anterior dos gráficos foi preservado. A restrição anterior sobre a lista de clientes continua válida: a lista permanece aberta, a Jornada e o Comparativo mantêm rolagem natural, e o layout compacto da Visão Executiva foi preservado. Não há mudanças de API, modelos, dados ou cálculos.

## Contraste entregue

- Paleta centralizada em `src/utils/themeTokens.js`: principal `#F5F8FF`, secundário `#CDDAEB`, apoio/eixos `#AABBD1`, azul/foco `#9CC0FF`, verde azulado `#70E0D0`, verde `#22C55E`, âmbar `#FFD27A`, laranja `#FFB98D` e vermelho `#FF6B6B`. Tokens de dados e texto atualizados juntos.
- Regionais: Sudeste azul, Sul verde azulado, Nordeste âmbar e Centro-Oeste `#B0C2DB`. Tooltip `#24344A`, com portal e posicionamento preservados.
- Pizzas e barras não selecionadas a 0,65 no escuro, inclusive no componente compartilhado `FlatFunnelHealth`. Tabela interativa do Comparativo e legendas mantêm texto opaco. Cursor do Comparativo usa azul do tema a 6% no escuro.
- Corrigido o número da página ativa da Jornada: o azul derivado pelo Ant Design tinha apenas 1,90:1 no fundo selecionado. CSS restrito ao escuro aplica `--brand-primary`.
- Fundos, KPIs neutros, sombras, layouts, animações, dados, cálculos e tema claro preservados. Nenhuma dependência nova.

## Verificação de contraste

Ajuste posterior solicitado: verde e vermelho mais fortes, agora `#22C55E` / `#FF6B6B`. Contrastes medidos: sobre card 7,02:1 / 5,77:1, sobre tooltip 5,53:1 / 4,54:1, sobre fundos semânticos próprios 5,54:1 / 4,88:1 e a 0,65 sobre card 3,75:1 / 3,15:1. Removida a atenuação adicional de hover apenas no escuro para preservar o mínimo gráfico. Build reexecutado.

- Luminância relativa sRGB e composição alfa: mínimos de texto principal/secundário/apoio de 11,42:1 / 8,57:1 / 6,21:1 entre superfícies usadas; textos semânticos sobre fundos próprios ≥4,88:1; botões preenchidos com texto branco 5,17:1.
- Séries sobre card com opacidade 0,65 ≥3,15:1; hover no escuro preserva a opacidade da série. Superam o mínimo gráfico de 3:1. Eixos opacos seguem o token de apoio. Grades permanecem auxiliares e discretas.
- Chromium: três telas e dois temas nas cinco dimensões previstas (1440×900, 1366×768, 1024×720, 390×844, 1440×650); seleção/desseleção, hover, foco, Escape, troca de cliente, filtros reiniciados, toque e tooltip externa. Console sem erros nos fluxos verificados.
- Na rodada anterior, inspeção programática de textos HTML nos estados selecionados, com composição dos fundos renderizados: 61/131/87 elementos nas três telas, nenhum abaixo de 4,5:1; mínimo 5,17:1. Medição de tokens complementa eixos SVG e séries; não equivale a uma auditoria completa de acessibilidade ou uso com leitor de tela.
- `npm test` aprovado: cálculos, 77 verificações de domínio/DAO e seis testes de API. Build aprovado com avisos preexistentes de chunks vazios e bundles maiores que 500 kB.
- Playwright e Chromium usados fora do projeto em `/tmp/primora-browser`, com `PLAYWRIGHT_BROWSERS_PATH=/tmp/primora-browser/browsers`. Scripts: `dark-contrast.mjs`, `charts-matrix.mjs`, `charts-interaction.mjs`, `client-switch.mjs` e `floating-tooltip.mjs`. Artefatos temporários; toque emulado, sem aparelho físico. Tokens claros conferidos contra a versão anterior, e todos os novos estilos/estados condicionados ao escuro.

## Refinamento anterior dos gráficos


- `src/utils/chartMotion.js`: durações compartilhadas, configuração do Recharts com movimento reduzido e estilo dos pontos ativos.
- `ExecutiveChartTooltip`: apresentação unificada e expansão radial de até 6 px. `usePieSliceRenderer` guarda o raio visível por fatia para continuar animações interrompidas mesmo quando o Recharts substitui seus wrappers. Substitui o `activeIndex` obsoleto do Recharts 3 por seleção explícita na shape.
- `useChartAutoReset`: controla o fechamento do tooltip sem remontagem; toque expira em três segundos, inclusive quando gera foco. Clique/toque fora, saída de foco e Escape fecham a consulta sem limpar a regional selecionada.
- Eixos e legendas com 12 px, tooltip com valores de 13 px e unidades explícitas, grades horizontais, eixos Contas/% e marcações ajustadas no Comparativo. Referências e escalas foram preservadas.
- Teclado nos gráficos cartesianos e controles acessíveis nas três legendas de pizza. A Jornada reinicia o destaque ao trocar de cliente, como antes.
- Pílulas e navegação usam tween de 220 ms. O contador compartilhado de KPIs retoma do número visível ao ser interrompido, sem saltar ao alvo anterior.

## Verificações desta rodada

- `npm test`: cálculos, 77 verificações de domínio/DAO e seis testes de API aprovados.
- `npm run build`: aprovado; permanecem avisos preexistentes de chunks vazios (`vendor`, `utils`) e bundles acima de 500 kB.
- Chromium com Playwright disponível fora do projeto, sem adicionar dependências: três telas nos dois temas em 1440×900, 1366×768, 1024×720, 390×844 e 1440×650. Sem rolagem horizontal ou SVGs com dimensões zero.
- Verificados troca rápida de pontos sem remontar o conteúdo do tooltip, período, seleção/desseleção regional, preservação da regional após inatividade, tipo de gráfico, troca de cliente e botões da legenda da Jornada.
- Toque emulado: fechamento após três segundos, reabertura, toque fora e identidade do SVG preservada. Testes de teclado, Escape, foco visível e preferência de movimento reduzido complementam a inspeção visual.
- Limites dos tooltips verificados nas três telas, nos dois temas, em 390 e 1440 px: sem ultrapassar o viewport ou ancestrais com recorte. Foco visível, unidades por teclado e geometria completa do Recharts com movimento reduzido também passaram.
- Console sem erros de carregamento, chaves ou dimensões. Ao emular movimento reduzido, Motion pode emitir seu aviso informativo de desenvolvimento sobre animações desativadas; esse aviso esperado foi separado dos erros.
- Capturas e scripts desta sessão ficam em `/tmp/primora-browser/charts-*`, `chart-access.mjs`, `tooltip-bounds.mjs` e `paint-check.mjs`; são artefatos temporários, não dependências do repositório. Toque foi emulado no Chromium; não houve ensaio em aparelho físico nem leitor de tela.

## Correção posterior: tooltip flutuante

O usuário apontou que a caixa sobre o desenho impedia a leitura do gráfico. `ExecutiveChartTooltip` agora usa portal no `body` e posição fixa, ancorada ao contêiner de cada gráfico. Mantém distância de 12 px e procura espaço acima, abaixo ou nas laterais, sem sobreposição ao gráfico, recorte por painéis ou interceptação do mouse. Respeita a navegação móvel e acompanha rolagem/redimensionamento. Se não houver espaço externo visível, oculta a caixa em vez de encobrir o desenho.

Verificação específica: Chromium em 1440×900 e 390×844, três telas e dois temas, com assertivas de ausência de interseção entre tooltip e gráfico, limites do viewport e portal no `body`; teclado, Escape e encerramento por toque após três segundos. Script temporário: `/tmp/primora-browser/floating-tooltip.mjs`. Build aprovado, com os mesmos avisos de bundles/chunks já registrados.

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

## Histórico de validação do diretório (rodada anterior)

- Build passou após a última alteração de código. Há avisos de chunks `vendor`/`utils` vazios e bundle acima de 500 kB.
- Testes de navegador com 2.000 clientes simulados verificaram busca fora da página atual, 6 cards por padrão no DOM, paginação de 24, último cliente, seleção exata, filtros e estados vazios.
- Dimensões verificadas no diretório: 1440, 1366, 1024 e 390 px, nos dois temas; a Visão Executiva também foi verificada nos limites de altura definidos em DESIGN.md.
- A regressão de seleção foi verificada com os três clientes reais: clique no nome, corpo do card e botão via teclado; identificação, score, ticket e quantidade de eventos mudaram para a conta correta.
- Nessa regressão, o console não apresentou os avisos de chave/dimensão reportados, nem respostas HTTP 500.
- Rolagem suave: posições intermediárias, destino e foco verificados; rolagem imediata confirmada com movimento reduzido.
- As verificações de navegador usaram Playwright instalado em `/tmp/primora-browser`, com scripts e imagens nessa pasta. São artefatos temporários locais, não testes versionados nem dependência do projeto.
- A rodada anterior foi documental. A execução atual de build e `npm test` está registrada nas verificações do refinamento dos gráficos, acima.

Para executar localmente: `npm run dev:server` inicia a API; `npm run dev` inicia o Vite. A URL padrão da API é `http://localhost:3001/api/v1`, configurável por `VITE_API_BASE_URL`. Para verificar compilação, use `npm run build`.

## Limitações e cuidados para continuidade

- A API continua retornando a coleção inteira. Paginação e busca no servidor não foram implementadas; 2.000 clientes simulados validam a interface, não a carga da API ou volumes arbitrários.
- O filtro Novos preserva a regra existente: IDs diferentes de `CLI-001`/`CLI-002`/`CLI-003` ou `isNovo`. Não reinterpretar essa classificação sem novo pedido.
- Busca, filtro e página permanecem enquanto `ClientDirectory` estiver montado; não há persistência ao sair e voltar da Jornada.
- Existem alterações de implementação locais e arquivos novos no workspace. Não executar reset/checkout para limpar o diretório, nem descartar mudanças anteriores à rodada documental.
- Não reintroduzir fundos semânticos nos KPIs, cabeçalhos gerais, abas por cliente ou a rolagem interna cancelada do Comparativo.
- A próxima mudança de layout da Jornada precisa de uma nova orientação do usuário. A proposta de recolher a lista foi recusada; manter o comportamento atual.
