/**
 * Classe de Domínio: RegistroSaude
 * 
 * Representa um ponto histórico de score de saúde da carteira/cliente.
 * Corresponde aos itens de healthSeries / historicoScore.
 * 
 * Regras da Sprint 5:
 * - Atributos privados (#)
 * - Getters e validações pertinentes
 * - Não expor referências mutáveis
 */

export class RegistroSaude {
  #data;
  #score;

  /**
   * @param {Object} params
   * @param {string} [params.data] - Data ou período do registro (ex: "Mai/2026" ou ISO)
   * @param {string} [params.periodo] - Alias para data aceito a partir do dataset
   * @param {number} params.score - Pontuação de saúde (0 a 100)
   */
  constructor({ data, periodo, score } = {}) {
    const rawData = data ?? periodo;
    if (!rawData || typeof rawData !== 'string' || rawData.trim() === '') {
      throw new TypeError('RegistroSaude: "data" ou "periodo" é obrigatório e deve ser uma string não vazia.');
    }

    const numScore = Number(score);
    if (typeof score !== 'number' || !Number.isFinite(numScore)) {
      throw new TypeError('RegistroSaude: "score" é obrigatório e deve ser um número válido.');
    }

    if (numScore < 0 || numScore > 100) {
      throw new RangeError(`RegistroSaude: "score" deve estar entre 0 e 100. Recebido: ${numScore}`);
    }

    this.#data = String(rawData).trim();
    this.#score = numScore;
  }

  /**
   * Data ou período do registro de saúde.
   * @returns {string}
   */
  get data() {
    return this.#data;
  }

  /**
   * Alias de compatibilidade com o dataset original (historicoScore.periodo).
   * @returns {string}
   */
  get periodo() {
    return this.#data;
  }

  /**
   * Score de saúde registrado (0 a 100).
   * @returns {number}
   */
  get score() {
    return this.#score;
  }

  /**
   * Retorna representação plana imutável dos dados.
   * @returns {Readonly<{ data: string, score: number, periodo: string }>}
   */
  toJSON() {
    return Object.freeze({
      data: this.#data,
      score: this.#score,
      periodo: this.#data
    });
  }
}

export default RegistroSaude;
