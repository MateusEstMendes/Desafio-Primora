/**
 * DAO: ClienteDAO
 * 
 * Camada de acesso aos dados de Clientes B2B.
 * 
 * Regras da Sprint 5:
 * - Métodos obrigatórios assíncronos (async/Promise):
 *   - listar(): Array de instâncias de Cliente a partir de clientes
 *   - buscarPorId(id): Instância de Cliente ou null
 *   - listarPorUnidade(tenantId): Array de clientes cujo tenantId corresponde ao informado
 * - Converter registros em instâncias da classe de domínio Cliente
 * - Retornar null para busca sem correspondência e [] para listagem sem registros
 * - Preservar vínculo com a Unidade por tenantId
 */

import datasetDefault from '../data/datasetLoader.js';
import { Cliente } from '../models/Cliente.js';

export class ClienteDAO {
  #dataSource;

  /**
   * @param {Object} [dataSource] - Fonte opcional de dados (padrão: dataset_painel_multitenant.json)
   */
  constructor(dataSource = null) {
    this.#dataSource = dataSource || datasetDefault;
  }

  /**
   * Recupera todos os clientes cadastrados.
   * @returns {Promise<Cliente[]>}
   */
  async listar() {
    await Promise.resolve();

    const rawClientes = this.#dataSource?.clientes;
    if (!Array.isArray(rawClientes) || rawClientes.length === 0) {
      return [];
    }

    return rawClientes.map((item) => new Cliente(item));
  }

  /**
   * Busca um cliente pelo seu identificador único.
   * @param {string} id - Identificador do cliente (ex: "CLI-001")
   * @returns {Promise<Cliente|null>}
   */
  async buscarPorId(id) {
    await Promise.resolve();

    if (!id || typeof id !== 'string') {
      return null;
    }

    const rawClientes = this.#dataSource?.clientes;
    if (!Array.isArray(rawClientes)) {
      return null;
    }

    const target = rawClientes.find((item) => item.id === id.trim());
    if (!target) {
      return null;
    }

    return new Cliente(target);
  }

  /**
   * Recupera todos os clientes vinculados a uma determinada Unidade (tenantId).
   * @param {string} tenantId - Identificador do tenant (ex: "tenant-sudeste", "tenant-sul")
   * @returns {Promise<Cliente[]>} Array de clientes da unidade ou array vazio se nenhum encontrado
   */
  async listarPorUnidade(tenantId) {
    await Promise.resolve();

    if (!tenantId || typeof tenantId !== 'string') {
      return [];
    }

    const rawClientes = this.#dataSource?.clientes;
    if (!Array.isArray(rawClientes) || rawClientes.length === 0) {
      return [];
    }

    const filtrados = rawClientes.filter((item) => item.tenantId === tenantId.trim());
    return filtrados.map((item) => new Cliente(item));
  }
}

export default ClienteDAO;
