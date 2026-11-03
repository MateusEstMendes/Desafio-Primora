/**
 * Funções utilitárias de métricas e formatação
 * Projeto Integrador — Bolsa Futuro Digital / Distribuidora Vetor
 */

/**
 * Calcula o risco absoluto somando clientes em status de risco e crítico.
 * @param {Object} saudeCarteira - { saudavel, atencao, risco, critico }
 * @returns {number} Risco absoluto em quantidade de clientes
 */
export function calcularRiscoAbsoluto(saudeCarteira) {
  if (!saudeCarteira) return 0;
  return (saudeCarteira.risco || 0) + (saudeCarteira.critico || 0);
}

/**
 * Calcula a taxa de risco proporcional (%) em relação ao tamanho total da carteira.
 * Fórmula pedagógica adotada: ((risco + critico) / carteiraTotalClientes) * 100
 * @param {Object} saudeCarteira 
 * @param {number} carteiraTotalClientes 
 * @returns {number} Taxa percentual normalizada com 2 casas decimais
 */
export function calcularTaxaRiscoProporcional(saudeCarteira, carteiraTotalClientes) {
  if (!carteiraTotalClientes || carteiraTotalClientes <= 0) return 0;
  const absoluto = calcularRiscoAbsoluto(saudeCarteira);
  return Number(((absoluto / carteiraTotalClientes) * 100).toFixed(2));
}

/**
 * Calcula a taxa de sucesso/conversão do funil comercial.
 * Taxa = (funnel.sucesso / funnel.gerada) * 100
 * Denominador: Total de tarefas geradas (declarado conforme requisito 3.5).
 * @param {Object} funnel - { gerada, vista, sucesso }
 * @returns {number} Taxa percentual com 2 casas decimais
 */
export function calcularTaxaConversaoFunil(funnel) {
  if (!funnel || !funnel.gerada || funnel.gerada <= 0) return 0;
  return Number(((funnel.sucesso / funnel.gerada) * 100).toFixed(2));
}

/**
 * Calcula a taxa de visualização do funil comercial.
 * Taxa = (funnel.vista / funnel.gerada) * 100
 * @param {Object} funnel 
 * @returns {number}
 */
export function calcularTaxaVisualizacaoFunil(funnel) {
  if (!funnel || !funnel.gerada || funnel.gerada <= 0) return 0;
  return Number(((funnel.vista / funnel.gerada) * 100).toFixed(2));
}

/**
 * Gera ranking de unidades com base na taxa de risco proporcional.
 * Unidades com maior proporção de risco aparecem em 1º lugar (maior urgência de intervenção).
 * @param {Array} tenants 
 * @returns {Array} Tenants enriquecidos com indicadores e ranking
 */
export function classificarUnidadesPorRisco(tenants) {
  if (!Array.isArray(tenants)) return [];

  const enriquecidos = tenants.map((t) => {
    const riscoAbsoluto = calcularRiscoAbsoluto(t.saudeCarteira);
    const taxaRisco = calcularTaxaRiscoProporcional(t.saudeCarteira, t.carteiraTotalClientes);
    const taxaConversao = calcularTaxaConversaoFunil(t.funnel90d);
    const taxaVisualizacao = calcularTaxaVisualizacaoFunil(t.funnel90d);

    return {
      ...t,
      riscoAbsolutoCalculado: riscoAbsoluto,
      taxaRiscoProporcional: taxaRisco,
      taxaConversaoFunil: taxaConversao,
      taxaVisualizacaoFunil: taxaVisualizacao
    };
  });

  // Ordena por maior taxa proporcional de risco (mais crítica primeiro)
  enriquecidos.sort((a, b) => b.taxaRiscoProporcional - a.taxaRiscoProporcional);

  return enriquecidos.map((item, index) => ({
    ...item,
    posicaoRankingRisco: index + 1
  }));
}

/**
 * Formata número com separadores locais.
 */
export function formatarNumero(num) {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Formata percentual.
 */
export function formatarPercentual(num) {
  if (num === null || num === undefined) return '-';
  return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

