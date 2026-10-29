import React from 'react';
import { formatarNumero, formatarPercentual } from '../utils/metrics';
import './componentsCSS/ExecutiveSummaryStrip.css';

export default function ExecutiveSummaryStrip({
  unidadesClassificadas = [],
  clientes = [],
  selectedTenantId,
  onSelectTenant,
  onNavigateTab
}) {
  // 1. Unidades que merecem atenção agora (Taxa de risco proporcional >= 15%)
  const unidadesCriticas = unidadesClassificadas.filter((u) => u.taxaRiscoProporcional >= 15);

  // 2. Unidades estáveis / Benchmarks (Menor taxa de risco proporcional e maior conversão)
  const unidadesEstaveis = [...unidadesClassificadas]
    .filter((u) => u.taxaRiscoProporcional < 15)
    .sort((a, b) => b.taxaConversaoFunil - a.taxaConversaoFunil);

  // 3. Clientes ordenados por urgência de jornada (menor score primeiro)
  const clientesPrioritarios = [...clientes].sort(
    (a, b) => a.scoreSaudeAtual - b.scoreSaudeAtual
  );

  const getDeltaSemestral = (tenant) => {
    const hist = tenant?.historicoTendencia || [];
    if (hist.length < 2) return 0;
    return Number((hist[hist.length - 1].engajamento - hist[0].engajamento).toFixed(1));
  };

  return (
    <section
      aria-label="Painéis cromáticos de decisão executiva (Regra dos 5 segundos)"
      className="exec-strip-grid"
    >
      {/* CARD 1: BRIGHT BLUE GLEAM (#2970FF) — Quais unidades merecem atenção agora? */}
      <article className="exec-pillar exec-pillar--blue-gleam">
        <div>
          <div className="exec-pillar-top">
            <span className="exec-eyebrow-mono">01 · DECISÃO IMEDIATA</span>
            <span className="exec-pill-tag">{unidadesCriticas.length} EM ALERTA</span>
          </div>
          <h2 className="exec-pillar-question">
            <em>Atenção</em> prioritária por risco proporcional
          </h2>
          <p className="exec-pillar-desc">
            Unidades com exposição crítica normalizada pelo porte da carteira ativa.
          </p>
        </div>

        <div className="exec-pillar-rows">
          {unidadesCriticas.map((u) => {
            const delta = getDeltaSemestral(u);
            const isSelected = selectedTenantId === u.id;
            return (
              <div
                key={u.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTenant(isSelected ? 'todos' : u.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTenant(isSelected ? 'todos' : u.id);
                  }
                }}
                className={`exec-item-row exec-item-row--on-blue ${
                  isSelected ? 'exec-item-row--selected' : ''
                }`}
                title="Clique para filtrar esta unidade no painel"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title">{u.nome}</span>
                  <span className="exec-item-sub">
                    Porte {u.porte} · {formatarNumero(u.riscoAbsolutoCalculado)}/
                    {formatarNumero(u.carteiraTotalClientes)} em risco
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span className="exec-item-metric-val">
                    {formatarPercentual(u.taxaRiscoProporcional)}
                  </span>
                  <span className="exec-item-delta">
                    ▼ {delta > 0 ? `+${delta}` : delta} pts (6m)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer">
          <span>Normalizado por carteira</span>
          <button
            type="button"
            className="exec-action-link"
            onClick={() => onNavigateTab('comparativo')}
          >
            Auditar ranking &rarr;
          </button>
        </div>
      </article>

      {/* CARD 2: DEEP BLUE (#1D4ED8) — Como está a jornada de cada cliente? */}
      <article className="exec-pillar exec-pillar--deep-blue">
        <div>
          <div className="exec-pillar-top">
            <span className="exec-eyebrow-mono">02 · RETENÇÃO & JORNADA</span>
            <span className="exec-pill-tag">{clientesPrioritarios.length} CONTAS</span>
          </div>
          <h2 className="exec-pillar-question">
            <em>Jornada</em> das contas monitoradas
          </h2>
          <p className="exec-pillar-desc">
            Acompanhamento cronológico de interações, alertas operacionais e score B2B.
          </p>
        </div>

        <div className="exec-pillar-rows">
          {clientesPrioritarios.map((cli) => {
            const hist = cli.historicoScore || [];
            const deltaScore =
              hist.length >= 2 ? hist[hist.length - 1].score - hist[0].score : 0;

            return (
              <div
                key={cli.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onSelectTenant(cli.tenantId);
                  onNavigateTab('historico-clientes');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTenant(cli.tenantId);
                    onNavigateTab('historico-clientes');
                  }
                }}
                className="exec-item-row exec-item-row--on-blue"
                title="Abrir linha do tempo de eventos deste cliente"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title">{cli.nome}</span>
                  <span className="exec-item-sub">
                    {cli.unidadeNome.replace('Unidade ', '')} · {cli.ticketMedioMensal}
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span className="exec-item-metric-val">
                    {cli.scoreSaudeAtual}/100
                  </span>
                  <span className="exec-item-delta">
                    {deltaScore >= 0 ? `▲ +${deltaScore}` : `▼ ${deltaScore}`} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer">
          <span>Timeline de eventos</span>
          <button
            type="button"
            className="exec-action-link"
            onClick={() => onNavigateTab('historico-clientes')}
          >
            Inspecionar contas &rarr;
          </button>
        </div>
      </article>

      {/* CARD 3: SILVER INVERTED CARD (#CACACA, #000000 TEXT — DESIGN.md Stat/Inverted Card) */}
      <article className="exec-pillar exec-pillar--silver-inverted">
        <div>
          <div className="exec-pillar-top">
            <span className="exec-eyebrow-mono exec-eyebrow-mono--dark">03 · BENCHMARK INTERNO</span>
            <span className="exec-pill-tag exec-pill-tag--dark">OPERAÇÃO ESTÁVEL</span>
          </div>
          <h2 className="exec-pillar-question exec-pillar-question--dark">
            <em>Referência</em> de conversão e estabilidade
          </h2>
          <p className="exec-pillar-desc exec-pillar-desc--dark">
            Unidades com alta conversão no funil de 90 dias e risco controlado.
          </p>
        </div>

        <div className="exec-pillar-rows">
          {unidadesEstaveis.map((u) => {
            const delta = getDeltaSemestral(u);
            const isSelected = selectedTenantId === u.id;
            const taxaSaudavel = Number(
              (((u.saudeCarteira?.saudavel || 0) / u.carteiraTotalClientes) * 100).toFixed(1)
            );
            return (
              <div
                key={u.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTenant(isSelected ? 'todos' : u.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTenant(isSelected ? 'todos' : u.id);
                  }
                }}
                className={`exec-item-row exec-item-row--on-silver ${
                  isSelected ? 'exec-item-row--selected-silver' : ''
                }`}
                title="Clique para inspecionar os indicadores desta unidade referência"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title exec-item-title--dark">{u.nome}</span>
                  <span className="exec-item-sub exec-item-sub--dark">
                    {formatarPercentual(taxaSaudavel)} saudável · Risco{' '}
                    {formatarPercentual(u.taxaRiscoProporcional)}
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span className="exec-item-metric-val exec-item-metric-val--dark">
                    Funil {formatarPercentual(u.taxaConversaoFunil)}
                  </span>
                  <span className="exec-item-delta exec-item-delta--dark">
                    ▲ +{delta} pts engaj.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer exec-pillar-footer--dark">
          <span>Benchmark de retenção</span>
          {selectedTenantId !== 'todos' ? (
            <button
              type="button"
              className="exec-action-link exec-action-link--dark"
              onClick={() => onSelectTenant('todos')}
            >
              Resetar filtro &rarr;
            </button>
          ) : (
            <span>Clique para drill-down</span>
          )}
        </div>
      </article>
    </section>
  );
}
