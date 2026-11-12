/**
 * DAO: UnidadeDAO
 * 
 * Camada de acesso aos dados de Unidades Regionais (tenants).
 * 
 * Regras da Sprint 5:
 * - Métodos obrigatórios assíncronos (async/Promise):
 *   - listar(): Array de instâncias de Unidade a partir de tenants
 *   - buscarPorId(id): Instância de Unidade ou null
 * - Converter registros em instâncias da classe de domínio Unidade
 * - Retornar null para busca sem correspondência e [] para listagem vazia
 * - Consulta ao JSON local conforme escopo acadêmico pedagógico
 */

import datasetDefault from '../data/datasetLoader.js';
import { Unidade } from '../models/Unidade.js';

export class UnidadeDAO {
  #dataSource;

  /**
   * @param {Object} [dataSource] - Fonte opcional de dados (padrão: dataset_painel_multitenant.json)
   */
  constructor(dataSource = null) {
    this.#dataSource = dataSource || datasetDefault;
  }

  /**
   * Recupera todas as unidades cadastradas.
   * @returns {Promise<Unidade[]>}
   */
  async listar() {
    // Simula resolução assíncrona (preparando futura comunicação com backend)
    await Promise.resolve();

    const rawTenants = this.#dataSource?.tenants;
    if (!Array.isArray(rawTenants) || rawTenants.length === 0) {
      return [];
    }

    return rawTenants.map((item) => new Unidade(item));
  }

  /**
   * Busca uma unidade pelo seu identificador único.
   * @param {string} id - Identificador da unidade (ex: "tenant-sudeste")
   * @returns {Promise<Unidade|null>}
   */
  async buscarPorId(id) {
    await Promise.resolve();

    if (!id || typeof id !== 'string') {
      return null;
    }

    const rawTenants = this.#dataSource?.tenants;
    if (!Array.isArray(rawTenants)) {
      return null;
    }

    const target = rawTenants.find((item) => item.id === id.trim());
    if (!target) {
      return null;
    }

    return new Unidade(target);
  }
}

export default UnidadeDAO;
