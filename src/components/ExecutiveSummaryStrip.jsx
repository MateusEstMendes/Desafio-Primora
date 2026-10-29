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
  // 1. Unidades que merecem atenção agora (Taxa de risco proporcional > 15%)
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
    <section aria-label="Resumo executivo de decisão rápida em 5 segundos" className="exec-strip-grid">
      {/* PERGUNTA 1: Quais unidades merecem atenção agora? */}
      <article className="exec-pillar exec-pillar--critical">
        <div>
          <div className="exec-pillar-top">
            <div>
              <span className="flat-section-eyebrow">01 · Decisão Imediata</span>
              <h2 className="exec-pillar-question">Quais unidades merecem atenção agora?</h2>
            </div>
            <span className="geo-badge geo-badge--critical">
              <span className="geo-dot geo-dot--critical" aria-hidden="true" />
              {unidadesCriticas.length} em Alerta
            </span>
          </div>
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
                className={`exec-item-row exec-item-row--interactive ${
                  isSelected ? 'exec-item-row--selected' : ''
                }`}
                title="Clique para filtrar esta unidade no painel"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title">
                    <span className="geo-dot geo-dot--critical" aria-hidden="true" />
                    {u.nome}
                  </span>
                  <span className="exec-item-sub">
                    Porte {u.porte} · {formatarNumero(u.riscoAbsolutoCalculado)} de{' '}
                    {formatarNumero(u.carteiraTotalClientes)} contas em risco/crítico
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span
                    className="exec-item-metric-val"
                    style={{ color: 'var(--status-critical)' }}
                  >
                    {formatarPercentual(u.taxaRiscoProporcional)}
                  </span>
                  <span className="geo-delta geo-delta--negative">
                    ▼ {delta > 0 ? `+${delta}` : delta} pts (6m)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer">
          <span>Critério: Risco proporcional normalizado por porte</span>
          <button
            type="button"
            className="exec-action-link"
            onClick={() => onNavigateTab('comparativo')}
          >
            Auditar ranking &rarr;
          </button>
        </div>
      </article>

      {/* PERGUNTA 2: Como está a jornada de cada cliente? */}
      <article className="exec-pillar exec-pillar--journey">
        <div>
          <div className="exec-pillar-top">
            <div>
              <span className="flat-section-eyebrow">02 · Fluxo Comercial & Retenção</span>
              <h2 className="exec-pillar-question">Como está a jornada de cada cliente?</h2>
            </div>
            <span className="geo-badge geo-badge--brand">
              {clientesPrioritarios.length} Contas Monitoradas
            </span>
          </div>
        </div>

        <div className="exec-pillar-rows">
          {clientesPrioritarios.map((cli) => {
            const hist = cli.historicoScore || [];
            const deltaScore =
              hist.length >= 2 ? hist[hist.length - 1].score - hist[0].score : 0;
            const isCrit = cli.statusSaude === 'Crítico';
            const isRisk = cli.statusSaude === 'Risco';
            const dotClass = isCrit
              ? 'geo-dot--critical'
              : isRisk
              ? 'geo-dot--risk'
              : 'geo-dot--success';
            const colorVar = isCrit
              ? 'var(--status-critical)'
              : isRisk
              ? 'var(--status-risk)'
              : 'var(--status-success)';

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
                className="exec-item-row exec-item-row--interactive"
                title="Abrir linha do tempo de eventos deste cliente"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title">
                    <span className={`geo-dot ${dotClass}`} aria-hidden="true" />
                    {cli.nome}
                  </span>
                  <span className="exec-item-sub">
                    {cli.unidadeNome.replace('Unidade ', '')} · Ticket {cli.ticketMedioMensal}
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span className="exec-item-metric-val" style={{ color: colorVar }}>
                    Score {cli.scoreSaudeAtual}/100
                  </span>
                  <span
                    className={`geo-delta ${
                      deltaScore >= 0 ? 'geo-delta--positive' : 'geo-delta--negative'
                    }`}
                  >
                    {deltaScore >= 0 ? `▲ +${deltaScore}` : `▼ ${deltaScore}`} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer">
          <span>Eventos ordenados cronologicamente</span>
          <button
            type="button"
            className="exec-action-link"
            onClick={() => onNavigateTab('historico-clientes')}
          >
            Inspecionar timeline &rarr;
          </button>
        </div>
      </article>

      {/* PERGUNTA 3: Onde a operação está funcionando bem? */}
      <article className="exec-pillar exec-pillar--benchmark">
        <div>
          <div className="exec-pillar-top">
            <div>
              <span className="flat-section-eyebrow">03 · Benchmark Interno</span>
              <h2 className="exec-pillar-question">Onde a operação está funcionando bem?</h2>
            </div>
            <span className="geo-badge geo-badge--success">
              <span className="geo-dot geo-dot--success" aria-hidden="true" />
              Entrega Estável
            </span>
          </div>
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
                className={`exec-item-row exec-item-row--interactive ${
                  isSelected ? 'exec-item-row--selected' : ''
                }`}
                title="Clique para inspecionar os indicadores desta unidade referência"
              >
                <div className="exec-item-main">
                  <span className="exec-item-title">
                    <span className="geo-dot geo-dot--success" aria-hidden="true" />
                    {u.nome}
                  </span>
                  <span className="exec-item-sub">
                    {formatarPercentual(taxaSaudavel)} saudável · Risco controlado (
                    {formatarPercentual(u.taxaRiscoProporcional)})
                  </span>
                </div>
                <div className="exec-item-metric">
                  <span
                    className="exec-item-metric-val"
                    style={{ color: 'var(--status-success)' }}
                  >
                    Funil {formatarPercentual(u.taxaConversaoFunil)}
                  </span>
                  <span className="geo-delta geo-delta--positive">
                    ▲ +{delta} pts engaj.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="exec-pillar-footer">
          <span>Referência de conversão e retenção de carteira</span>
          {selectedTenantId !== 'todos' ? (
            <button
              type="button"
              className="exec-action-link"
              onClick={() => onSelectTenant('todos')}
            >
              Resetar filtro global
            </button>
          ) : (
            <span>Clique em uma unidade para drill-down</span>
          )}
        </div>
      </article>
    </section>
  );
}
