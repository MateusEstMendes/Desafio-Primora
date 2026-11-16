import { readFileSync } from 'node:fs';
import { Unidade, Cliente } from '../src/models/index.js';

export function validarDataset(dados) {
  try {
    if (!Array.isArray(dados?.tenants) || !Array.isArray(dados?.clientes)) throw new Error('tenants e clientes devem ser arrays');
    const ids = new Set();
    for (const unidade of dados.tenants) {
      new Unidade(unidade);
      // Rejeita indicadores malformados antes de disponibilizar as rotas.
      for (const [campo, chaves] of [['funnel90d', ['gerada', 'vista', 'sucesso']], ['saudeCarteira', ['saudavel', 'atencao', 'risco', 'critico']]]) {
        for (const chave of chaves) {
          const valor = unidade[campo]?.[chave];
          if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) throw new Error(`${unidade.id}.${campo}.${chave} deve ser número não negativo`);
        }
      }
      if (typeof unidade.engajamentoMedio !== 'number' || !Number.isFinite(unidade.engajamentoMedio)) throw new Error(`engajamento inválido: ${unidade.id}`);
      if (ids.has(unidade.id)) throw new Error(`unidade duplicada: ${unidade.id}`);
      ids.add(unidade.id);
      if (!Array.isArray(unidade.historicoTendencia) || !unidade.funnel90d || !unidade.saudeCarteira) throw new Error(`coleções da unidade ${unidade.id} inválidas`);
    }
    for (const unidade of dados.tenants) {
      for (const ponto of unidade.historicoTendencia) {
        if (typeof ponto.mes !== 'string' || !ponto.mes.trim() || !Number.isFinite(ponto.engajamento) || !Number.isFinite(ponto.sucessoFunil)) throw new Error(`histórico inválido: ${unidade.id}`);
      }
    }
    const clientes = new Set();
    for (const cliente of dados.clientes) {
      new Cliente(cliente);
      if (!ids.has(cliente.tenantId)) throw new Error(`unidade inexistente: ${cliente.tenantId}`);
      if (clientes.has(cliente.id)) throw new Error(`cliente duplicado: ${cliente.id}`);
      clientes.add(cliente.id);
      if (!Array.isArray(cliente.eventos) || !Array.isArray(cliente.healthSeries ?? cliente.historicoScore)) throw new Error(`coleções do cliente ${cliente.id} inválidas`);
    }
    return dados;
  } catch (error) { throw new Error(`Dataset inválido: ${error.message}`, { cause: error }); }
}
// Mantém os registros originais para que a API preserve inclusive os aliases.
function carregarDataset() {
  try {
    return validarDataset(JSON.parse(readFileSync(new URL('./data/dataset_painel_multitenant.json', import.meta.url), 'utf8')));
  } catch (erro) {
    throw new Error(`Falha ao carregar dataset: ${erro.message}`, { cause: erro });
  }
}
export const dataset = carregarDataset();
