import { consultarArray } from '../config/api.js';
import { Unidade } from '../models/Unidade.js';

export class UnidadeDAO {
  #consultar;
  // Permite injetar o cliente HTTP; a execução normal sempre consulta a API.
  constructor(consultar = consultarArray) { this.#consultar = consultar; }
  async listar() {
    const registros = await this.#consultar('/unidades');
    if (!Array.isArray(registros)) throw new TypeError('A API deve retornar um array.');
    return registros.map(item => new Unidade(item));
  }
  async buscarPorId(id) {
    if (typeof id !== 'string' || !id.trim()) return null;
    return (await this.listar()).find(item => item.id === id.trim()) ?? null;
  }
}
export default UnidadeDAO;
