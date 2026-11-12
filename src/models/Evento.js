/**
 * Classe de Domínio: Evento
 * 
 * Representa um evento na jornada ou histórico de relacionamento do cliente.
 * 
 * Regras da Sprint 5:
 * - Atributos obrigatórios: data, tipo, titulo e valor (opcional)
 * - Não criar id obrigatório ausente do dataset (id é estritamente opcional)
 * - Usar atributos privados (#), getters e validações pertinentes
 * - Não expor referências mutáveis internas sem proteção
 */

export class Evento {
  #data;
  #tipo;
  #titulo;
  #valor;
  #id;
  #categoria;
  #descricao;

  /**
   * @param {Object} params
   * @param {string} params.data - Data/timestamp do evento (ISO ou string formatada)
   * @param {string} params.tipo - Tipo do evento (ex: "Reunião Comercial", "Sucesso na Tarefa")
   * @param {string} [params.titulo] - Título descritivo do evento
   * @param {number|string} [params.valor] - Valor associado ao evento (opcional)
   * @param {string} [params.id] - Identificador opcional (NÃO obrigatório)
   * @param {string} [params.categoria] - Categoria visual/semântica preservada da fonte
   * @param {string} [params.descricao] - Descrição detalhada preservada da fonte
   */
  constructor({ data, tipo, titulo, valor = null, id = null, categoria = null, descricao = null } = {}) {
    if (!data || typeof data !== 'string' || data.trim() === '') {
      throw new TypeError('Evento: "data" é obrigatório e deve ser uma string não vazia.');
    }

    if (!tipo || typeof tipo !== 'string' || tipo.trim() === '') {
      throw new TypeError('Evento: "tipo" é obrigatório e deve ser uma string não vazia.');
    }

    // O título pode ser explicitamente fornecido ou derivado da descrição/tipo
    const resolvedTitulo = titulo ?? descricao ?? tipo;
    if (!resolvedTitulo || typeof resolvedTitulo !== 'string' || resolvedTitulo.trim() === '') {
      throw new TypeError('Evento: "titulo" é obrigatório ou deve haver uma descrição/tipo válidos.');
    }

    this.#data = String(data).trim();
    this.#tipo = String(tipo).trim();
    this.#titulo = String(resolvedTitulo).trim();

    // Valor é opcional; se fornecido e for número, armazena; se for string, preserva ou converte
    if (valor !== null && valor !== undefined) {
      this.#valor = typeof valor === 'number' ? valor : String(valor).trim();
    } else {
      this.#valor = null;
    }

    // Metadados opcionais da fonte (sem torná-los obrigatórios)
    this.#id = id ? String(id).trim() : null;
    this.#categoria = categoria ? String(categoria).trim() : null;
    this.#descricao = descricao ? String(descricao).trim() : this.#titulo;
  }

  /**
   * Data do evento.
   * @returns {string}
   */
  get data() {
    return this.#data;
  }

  /**
   * Tipo do evento.
   * @returns {string}
   */
  get tipo() {
    return this.#tipo;
  }

  /**
   * Título do evento.
   * @returns {string}
   */
  get titulo() {
    return this.#titulo;
  }

  /**
   * Valor financeiro ou numérico associado ao evento (ou null se ausente).
   * @returns {number|string|null}
   */
  get valor() {
    return this.#valor;
  }

  /**
   * Identificador do evento, se presente no dataset (opcional).
   * @returns {string|null}
   */
  get id() {
    return this.#id;
  }

  /**
   * Categoria semântica do evento (comercial, operacional, sucesso, alerta, critico, suporte).
   * @returns {string|null}
   */
  get categoria() {
    return this.#categoria;
  }

  /**
   * Descrição detalhada do evento preservada do dataset de origem.
   * @returns {string}
   */
  get descricao() {
    return this.#descricao;
  }

  /**
   * Retorna representação plana imutável dos dados.
   * @returns {Readonly<Object>}
   */
  toJSON() {
    return Object.freeze({
      id: this.#id,
      data: this.#data,
      tipo: this.#tipo,
      titulo: this.#titulo,
      valor: this.#valor,
      categoria: this.#categoria,
      descricao: this.#descricao
    });
  }
}

export default Evento;
