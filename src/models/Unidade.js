/**
 * Classe de Domínio: Unidade
 * 
 * Representa uma unidade regional (tenant) da Distribuidora Vetor.
 * 
 * Regras da Sprint 5:
 * - Atributos obrigatórios:
 *   id, nome, porte, carteiraTotalClientes, receitaCarteira90d,
 *   engagementEvents7d, activeUsers7d, engagementTrend30d,
 *   funnel90d, funnelTrend30d, healthDistribution,
 *   riscoAbsoluto e riscoDrivers.
 * - Usar atributos privados (#), getters e validações pertinentes.
 * - Não expor referências mutáveis internas sem proteção.
 * - Manter nomes e formatos dos campos de origem ao converter registros.
 */

export class Unidade {
  #id;
  #nome;
  #porte;
  #carteiraTotalClientes;
  #receitaCarteira90d;
  #engagementEvents7d;
  #activeUsers7d;
  #engagementTrend30d;
  #funnel90d;
  #funnelTrend30d;
  #healthDistribution;
  #riscoAbsoluto;
  #riscoDrivers;

  // Metadados complementares preservados do dataset original
  #regiao;
  #engajamentoMedio;
  #historicoTendencia;

  /**
   * @param {Object} params
   */
  constructor({
    id,
    nome,
    porte = 'Médio',
    carteiraTotalClientes = 0,
    receitaCarteira90d = null,
    engagementEvents7d = null,
    activeUsers7d = null,
    engagementTrend30d = null,
    funnel90d = null,
    funnelTrend30d = null,
    healthDistribution = null,
    saudeCarteira = null,
    riscoAbsoluto = null,
    riscoDrivers = null,
    regiao = null,
    engajamentoMedio = null,
    historicoTendencia = []
  } = {}) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new TypeError('Unidade: "id" é obrigatório e deve ser uma string não vazia.');
    }

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      throw new TypeError('Unidade: "nome" é obrigatório e deve ser uma string não vazia.');
    }

    const carteiraNum = Number(carteiraTotalClientes);
    if (typeof carteiraTotalClientes !== 'number' || !Number.isFinite(carteiraNum) || carteiraNum < 0) {
      throw new RangeError('Unidade: "carteiraTotalClientes" deve ser um número maior ou igual a zero.');
    }

    this.#id = String(id).trim();
    this.#nome = String(nome).trim();
    this.#porte = String(porte).trim();
    this.#carteiraTotalClientes = carteiraNum;

    // Normalização e encapsulamento de healthDistribution / saudeCarteira
    const rawHealth = healthDistribution ?? saudeCarteira ?? {
      saudavel: 0,
      atencao: 0,
      risco: 0,
      critico: 0
    };
    this.#healthDistribution = {
      saudavel: Number(rawHealth.saudavel || 0),
      atencao: Number(rawHealth.atencao || 0),
      risco: Number(rawHealth.risco || 0),
      critico: Number(rawHealth.critico || 0)
    };

    this.#riscoAbsoluto = riscoAbsoluto;

    // Normalização e encapsulamento de funnel90d
    const rawFunnel = funnel90d ?? { gerada: 0, vista: 0, sucesso: 0 };
    this.#funnel90d = {
      gerada: Number(rawFunnel.gerada || 0),
      vista: Number(rawFunnel.vista || 0),
      sucesso: Number(rawFunnel.sucesso || 0)
    };

    // Histórico de tendência (preservado do dataset)
    this.#historicoTendencia = Array.isArray(historicoTendencia)
      ? historicoTendencia.map((item) => ({ ...item }))
      : [];

    // engajamentoMedio
    this.#engajamentoMedio = engajamentoMedio !== null && engajamentoMedio !== undefined
      ? Number(engajamentoMedio)
      : null;

    // Campos ausentes permanecem ausentes: o modelo não estima indicadores.
    this.#engagementTrend30d = engagementTrend30d;
    this.#funnelTrend30d = funnelTrend30d;
    this.#receitaCarteira90d = receitaCarteira90d;
    this.#engagementEvents7d = engagementEvents7d;
    this.#activeUsers7d = activeUsers7d;

    for (const [campo, valor] of Object.entries({ engagementEvents7d, activeUsers7d, riscoAbsoluto })) {
      if (valor !== null && (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0)) {
        throw new TypeError(`Unidade: "${campo}" deve ser um número finito não negativo.`);
      }
    }
    if (riscoDrivers !== null && (!Array.isArray(riscoDrivers) || riscoDrivers.some((item) => typeof item !== 'string'))) {
      throw new TypeError('Unidade: "riscoDrivers" deve ser um array de strings.');
    }
    this.#riscoDrivers = [...(riscoDrivers ?? [])];

    this.#regiao = regiao ? String(regiao).trim() : null;
  }

  // Getters para os 13 atributos obrigatórios
  get id() {
    return this.#id;
  }

  get nome() {
    return this.#nome;
  }

  get porte() {
    return this.#porte;
  }

  get carteiraTotalClientes() {
    return this.#carteiraTotalClientes;
  }

  get receitaCarteira90d() {
    return this.#receitaCarteira90d;
  }

  get engagementEvents7d() {
    return this.#engagementEvents7d;
  }

  get activeUsers7d() {
    return this.#activeUsers7d;
  }

  get engagementTrend30d() {
    return this.#engagementTrend30d;
  }

  /**
   * Retorna cópia imutável do funil de 90 dias.
   * @returns {Readonly<{ gerada: number, vista: number, sucesso: number }>}
   */
  get funnel90d() {
    return Object.freeze({ ...this.#funnel90d });
  }

  get funnelTrend30d() {
    return this.#funnelTrend30d;
  }

  /**
   * Retorna cópia imutável da distribuição de saúde.
   * @returns {Readonly<{ saudavel: number, atencao: number, risco: number, critico: number }>}
   */
  get healthDistribution() {
    return Object.freeze({ ...this.#healthDistribution });
  }

  /**
   * Alias de compatibilidade com dataset original (saudeCarteira).
   * @returns {Readonly<{ saudavel: number, atencao: number, risco: number, critico: number }>}
   */
  get saudeCarteira() {
    return this.healthDistribution;
  }

  get riscoAbsoluto() {
    return this.#riscoAbsoluto;
  }

  /**
   * Retorna cópia imutável da lista de drivers de risco.
   * @returns {ReadonlyArray<string>}
   */
  get riscoDrivers() {
    return Object.freeze([...this.#riscoDrivers]);
  }

  // Getters complementares preservados da fonte
  get regiao() {
    return this.#regiao;
  }

  get engajamentoMedio() {
    return this.#engajamentoMedio;
  }

  /**
   * Retorna cópia imutável do histórico de tendência.
   * @returns {ReadonlyArray<Object>}
   */
  get historicoTendencia() {
    return Object.freeze(this.#historicoTendencia.map((item) => Object.freeze({ ...item })));
  }

  /**
   * Representação plana imutável dos dados para serialização.
   * @returns {Readonly<Object>}
   */
  toJSON() {
    return Object.freeze({
      id: this.#id,
      nome: this.#nome,
      porte: this.#porte,
      regiao: this.#regiao,
      carteiraTotalClientes: this.#carteiraTotalClientes,
      receitaCarteira90d: this.#receitaCarteira90d,
      engagementEvents7d: this.#engagementEvents7d,
      activeUsers7d: this.#activeUsers7d,
      engagementTrend30d: this.#engagementTrend30d,
      funnel90d: { ...this.#funnel90d },
      funnelTrend30d: this.#funnelTrend30d,
      healthDistribution: { ...this.#healthDistribution },
      saudeCarteira: { ...this.#healthDistribution },
      riscoAbsoluto: this.#riscoAbsoluto,
      riscoDrivers: [...this.#riscoDrivers],
      engajamentoMedio: this.#engajamentoMedio,
      historicoTendencia: this.#historicoTendencia.map((item) => ({ ...item }))
    });
  }
}

export default Unidade;
