import { consultarArray } from '../config/api.js';
import { Cliente } from '../models/Cliente.js';

export class ClienteDAO {
  #consultar;
  // Permite injetar o cliente HTTP; a execução normal sempre consulta a API.
  constructor(consultar = consultarArray) { this.#consultar = consultar; }
  async listar() {
    const registros = await this.#consultar('/clientes');
    if (!Array.isArray(registros)) throw new TypeError('A API deve retornar um array.');
    return registros.map(item => new Cliente(item));
  }
  async buscarPorId(id) {
    if (typeof id !== 'string' || !id.trim()) return null;
    return (await this.listar()).find(item => item.id === id.trim()) ?? null;
  }

  async listarPorUnidade(tenantId) {
    if (typeof tenantId !== 'string' || !tenantId.trim()) return [];
    return (await this.listar()).filter(item => item.tenantId === tenantId.trim());
  }
}
export default ClienteDAO;
