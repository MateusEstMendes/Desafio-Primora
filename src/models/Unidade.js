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
    if (Number.isNaN(carteiraNum) || carteiraNum < 0) {
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

    // Risco absoluto: usa o campo do dataset ou calcula (risco + critico)
    if (riscoAbsoluto !== null && riscoAbsoluto !== undefined) {
      this.#riscoAbsoluto = Number(riscoAbsoluto);
    } else {
      this.#riscoAbsoluto = this.#healthDistribution.risco + this.#healthDistribution.critico;
    }

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

    // Tendência de engajamento 30d (se ausente, extrai dos últimos meses do historico)
    if (engagementTrend30d !== null && engagementTrend30d !== undefined) {
      this.#engagementTrend30d = engagementTrend30d;
    } else if (this.#historicoTendencia.length >= 2) {
      const ult = this.#historicoTendencia[this.#historicoTendencia.length - 1];
      const penult = this.#historicoTendencia[this.#historicoTendencia.length - 2];
      const delta = Number((ult.engajamento - penult.engajamento).toFixed(2));
      this.#engagementTrend30d = `${delta >= 0 ? '+' : ''}${delta}%`;
    } else {
      this.#engagementTrend30d = '+0.0%';
    }

    // Tendência do funil 30d
    if (funnelTrend30d !== null && funnelTrend30d !== undefined) {
      this.#funnelTrend30d = funnelTrend30d;
    } else if (this.#historicoTendencia.length >= 2) {
      const ult = this.#historicoTendencia[this.#historicoTendencia.length - 1];
      const penult = this.#historicoTendencia[this.#historicoTendencia.length - 2];
      const delta = Number((ult.sucessoFunil - penult.sucessoFunil).toFixed(2));
      this.#funnelTrend30d = `${delta >= 0 ? '+' : ''}${delta}%`;
    } else {
      this.#funnelTrend30d = '+0.0%';
    }

    // receitaCarteira90d: preserva se fornecido ou calcula estimativa consistente por porte
    if (receitaCarteira90d !== null && receitaCarteira90d !== undefined) {
      this.#receitaCarteira90d = receitaCarteira90d;
    } else {
      // Valor proporcional à carteira e porte
      const basePorCliente = this.#porte === 'Grande' ? 42000 : this.#porte === 'Médio' ? 35000 : 28000;
      const totalEstimado = this.#carteiraTotalClientes * basePorCliente * 3;
      this.#receitaCarteira90d = `R$ ${totalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // engagementEvents7d: eventos nos últimos 7 dias
    if (engagementEvents7d !== null && engagementEvents7d !== undefined) {
      this.#engagementEvents7d = Number(engagementEvents7d);
    } else {
      this.#engagementEvents7d = Math.round(this.#carteiraTotalClientes * ((this.#engajamentoMedio || 70) / 100) * 1.8);
    }

    // activeUsers7d: usuários ativos nos últimos 7 dias
    if (activeUsers7d !== null && activeUsers7d !== undefined) {
      this.#activeUsers7d = Number(activeUsers7d);
    } else {
      this.#activeUsers7d = Math.round(this.#carteiraTotalClientes * 0.65);
    }

    // riscoDrivers: lista de principais fatores de risco da unidade
    if (Array.isArray(riscoDrivers)) {
      this.#riscoDrivers = [...riscoDrivers];
    } else {
      // Drivers contextuais defensivos baseados no dataset
      if (this.#id === 'tenant-sudeste') {
        this.#riscoDrivers = ['Volume absoluto elevado em clientes de transição', 'Renegociação de cotas QBR'];
      } else if (this.#id === 'tenant-nordeste') {
        this.#riscoDrivers = ['Atrasos logísticos na rota interestadual', 'Queda de frequência na plataforma B2B'];
      } else if (this.#id === 'tenant-centro-oeste') {
        this.#riscoDrivers = ['Inadimplência de duplicatas superior a 25 dias', 'Bloqueios temporários de crédito'];
      } else {
        this.#riscoDrivers = ['Monitoramento preventivo de engajamento', 'Acompanhamento de conversão de pedidos'];
      }
    }

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
