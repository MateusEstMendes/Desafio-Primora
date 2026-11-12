/**
 * Classe de Domínio: Cliente
 * 
 * Representa uma conta B2B atendida por uma Unidade regional (tenant).
 * 
 * Regras da Sprint 5:
 * - Atributos obrigatórios: id, nome, tenantId, tenantNome, healthSeries e eventos
 * - Preservar o vínculo com Unidade por tenantId
 * - Usar atributos privados (#), getters e validações pertinentes
 * - Não expor referências mutáveis internas sem proteção
 * - Fornecer métodos getEventos() e getHistoricoSaude()
 */

import { Evento } from './Evento.js';
import { RegistroSaude } from './RegistroSaude.js';

export class Cliente {
  #id;
  #nome;
  #tenantId;
  #tenantNome;
  #healthSeries;
  #eventos;

  // Metadados complementares preservados do dataset original
  #segmento;
  #statusSaude;
  #scoreSaudeAtual;
  #tempoContratoMeses;
  #ticketMedioMensal;

  /**
   * @param {Object} params
   * @param {string} params.id - Identificador único do cliente (ex: "CLI-001")
   * @param {string} params.nome - Razão social ou nome fantasia
   * @param {string} params.tenantId - Vínculo obrigatório com a Unidade (ex: "tenant-sudeste")
   * @param {string} [params.tenantNome] - Nome da Unidade vinculada (ou unidadeNome)
   * @param {string} [params.unidadeNome] - Alias da fonte para tenantNome
   * @param {Array<Object|RegistroSaude>} [params.healthSeries] - Histórico de saúde
   * @param {Array<Object|RegistroSaude>} [params.historicoScore] - Alias da fonte para healthSeries
   * @param {Array<Object|Evento>} [params.eventos] - Lista de eventos da jornada
   * @param {string} [params.segmento] - Segmento de atuação
   * @param {string} [params.statusSaude] - Status atual de saúde ("Saudável", "Risco", "Crítico", "Atenção")
   * @param {number} [params.scoreSaudeAtual] - Pontuação atual de saúde
   * @param {number} [params.tempoContratoMeses] - Tempo de contrato em meses
   * @param {string} [params.ticketMedioMensal] - Ticket médio mensal formatado
   */
  constructor({
    id,
    nome,
    tenantId,
    tenantNome,
    unidadeNome,
    healthSeries,
    historicoScore,
    eventos = [],
    segmento = null,
    statusSaude = null,
    scoreSaudeAtual = null,
    tempoContratoMeses = null,
    ticketMedioMensal = null
  } = {}) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('Cliente: "id" é obrigatório e deve ser uma string não vazia.');
    }

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      throw new TypeError('Cliente: "nome" é obrigatório e deve ser uma string não vazia.');
    }

    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      throw new TypeError('Cliente: "tenantId" é obrigatório para preservar o vínculo com a Unidade.');
    }

    this.#id = String(id).trim();
    this.#nome = String(nome).trim();
    this.#tenantId = String(tenantId).trim();

    const resolvedTenantNome = tenantNome ?? unidadeNome ?? '';
    this.#tenantNome = String(resolvedTenantNome).trim();

    // Normaliza e encapsula healthSeries / historicoScore em instâncias de RegistroSaude
    const rawSeries = healthSeries ?? historicoScore ?? [];
    if (!Array.isArray(rawSeries)) {
      throw new TypeError('Cliente: "healthSeries" deve ser um array.');
    }
    this.#healthSeries = rawSeries.map((item) =>
      item instanceof RegistroSaude ? item : new RegistroSaude(item)
    );

    // Normaliza e encapsula eventos em instâncias de Evento
    if (!Array.isArray(eventos)) {
      throw new TypeError('Cliente: "eventos" deve ser um array.');
    }
    this.#eventos = eventos.map((item) =>
      item instanceof Evento ? item : new Evento(item)
    );

    // Metadados complementares preservados
    this.#segmento = segmento ? String(segmento).trim() : null;
    this.#statusSaude = statusSaude ? String(statusSaude).trim() : null;
    this.#scoreSaudeAtual = scoreSaudeAtual !== null && scoreSaudeAtual !== undefined ? Number(scoreSaudeAtual) : null;
    this.#tempoContratoMeses = tempoContratoMeses !== null && tempoContratoMeses !== undefined ? Number(tempoContratoMeses) : null;
    this.#ticketMedioMensal = ticketMedioMensal ? String(ticketMedioMensal).trim() : null;
  }

  /**
   * Identificador do cliente.
   * @returns {string}
   */
  get id() {
    return this.#id;
  }

  /**
   * Nome ou razão social do cliente.
   * @returns {string}
   */
  get nome() {
    return this.#nome;
  }

  /**
   * Identificador da unidade vinculada (tenantId).
   * @returns {string}
   */
  get tenantId() {
    return this.#tenantId;
  }

  /**
   * Nome da unidade vinculada (tenantNome).
   * @returns {string}
   */
  get tenantNome() {
    return this.#tenantNome;
  }

  /**
   * Alias compatível com dataset original (unidadeNome).
   * @returns {string}
   */
  get unidadeNome() {
    return this.#tenantNome;
  }

  /**
   * Lista de instâncias de RegistroSaude (cópia protegida).
   * @returns {ReadonlyArray<RegistroSaude>}
   */
  get healthSeries() {
    return this.getHistoricoSaude();
  }

  /**
   * Alias compatível com dataset original (historicoScore).
   * @returns {ReadonlyArray<RegistroSaude>}
   */
  get historicoScore() {
    return this.getHistoricoSaude();
  }

  /**
   * Lista de instâncias de Evento (cópia protegida).
   * @returns {ReadonlyArray<Evento>}
   */
  get eventos() {
    return this.getEventos();
  }

  /**
   * Método obrigatório da Sprint 5:
   * Retorna os eventos encapsulados como objetos, sem expor a referência mutável interna.
   * @returns {ReadonlyArray<Evento>}
   */
  getEventos() {
    return Object.freeze([...this.#eventos]);
  }

  /**
   * Método obrigatório da Sprint 5:
   * Retorna a série de saúde encapsulada como objetos RegistroSaude, sem expor referência mutável.
   * @returns {ReadonlyArray<RegistroSaude>}
   */
  getHistoricoSaude() {
    return Object.freeze([...this.#healthSeries]);
  }

  get segmento() {
    return this.#segmento;
  }

  get statusSaude() {
    return this.#statusSaude;
  }

  get scoreSaudeAtual() {
    return this.#scoreSaudeAtual;
  }

  get tempoContratoMeses() {
    return this.#tempoContratoMeses;
  }

  get ticketMedioMensal() {
    return this.#ticketMedioMensal;
  }

  /**
   * Retorna representação plana dos dados para serialização.
   * @returns {Readonly<Object>}
   */
  toJSON() {
    return Object.freeze({
      id: this.#id,
      nome: this.#nome,
      tenantId: this.#tenantId,
      tenantNome: this.#tenantNome,
      unidadeNome: this.#tenantNome,
      segmento: this.#segmento,
      statusSaude: this.#statusSaude,
      scoreSaudeAtual: this.#scoreSaudeAtual,
      tempoContratoMeses: this.#tempoContratoMeses,
      ticketMedioMensal: this.#ticketMedioMensal,
      healthSeries: this.#healthSeries.map((s) => s.toJSON()),
      historicoScore: this.#healthSeries.map((s) => s.toJSON()),
      eventos: this.#eventos.map((e) => e.toJSON())
    });
  }
}

export default Cliente;
