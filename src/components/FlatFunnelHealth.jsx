import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';
import { formatarNumero, formatarPercentual } from '../utils/metrics';
import './componentsCSS/FlatFunnelHealth.css';

export default function FlatFunnelHealth({ estatisticas, themeTokens }) {
  if (!estatisticas) return null;

  const {
    funil,
    saude,
    carteiraTotal,
    taxaVisualizacao,
    taxaConversao,
    riscoAbsoluto,
    taxaRisco
  } = estatisticas;

  const eficienciaPosVista =
    funil.vista > 0 ? Number(((funil.sucesso / funil.vista) * 100).toFixed(1)) : 0;
  const taxaPerdaTotal = Number((100 - taxaConversao).toFixed(1));

  // Fatias ordenadas da maior para a menor (boas práticas de visualização financeira)
  const categoriasSaude = [
    {
      key: 'saudavel',
      name: 'Saudável',
      dotClass: 'geo-dot--success',
      color: themeTokens?.statusSuccess || '#059669',
      textColor: themeTokens?.statusSuccessText || '#047857',
      value: saude.saudavel || 0
    },
    {
      key: 'atencao',
      name: 'Atenção',
      dotClass: 'geo-dot--warning',
      color: themeTokens?.statusWarning || '#D97706',
      textColor: themeTokens?.statusWarningText || '#92400E',
      value: saude.atencao || 0
    },
    {
      key: 'risco',
      name: 'Risco',
      dotClass: 'geo-dot--risk',
      color: themeTokens?.statusRisk || '#EA580C',
      textColor: themeTokens?.statusRiskText || '#C2410C',
      value: saude.risco || 0
    },
    {
      key: 'critico',
      name: 'Crítico',
      dotClass: 'geo-dot--critical',
      color: themeTokens?.statusCritical || '#DC2626',
      textColor: themeTokens?.statusCriticalText || '#B91C1C',
      value: saude.critico || 0
    }
  ].map((cat) => ({
    ...cat,
    pct: carteiraTotal > 0 ? Number(((cat.value / carteiraTotal) * 100).toFixed(2)) : 0
  }));

  return (
    <div className="summary-middle-grid">
      {/* 1. COMPOSIÇÃO DE SAÚDE DA CARTEIRA (DONUT FINANCEIRO + TABELA DIRETA) */}
      <section className="flat-card" aria-labelledby="health-heading">
        <div className="flat-card-header">
          <h2 id="health-heading" className="flat-card-title">
            Composição de Saúde da Carteira
          </h2>
          <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Risco Consolidado:{' '}
            <strong style={{ color: 'var(--status-critical-text)' }}>
              {formatarPercentual(taxaRisco)} ({formatarNumero(riscoAbsoluto)})
            </strong>
          </span>
        </div>

        <div className="donut-split-layout">
          <div className="donut-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriasSaude}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={1}
                  stroke={themeTokens?.bgSurface || '#FFFFFF'}
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {categoriasSaude.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: themeTokens?.chartTooltipBg,
                    border: `1px solid ${themeTokens?.chartTooltipBorder}`,
                    borderRadius: 4,
                    boxShadow: 'none',
                    color: themeTokens?.textPrimary,
                    fontSize: 12
                  }}
                  formatter={(val, name, props) => [
                    `${formatarNumero(val)} contas (${formatarPercentual(props.payload.pct)})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-label">
              <span className="donut-center-value">{formatarNumero(carteiraTotal)}</span>
              <span className="donut-center-sub">Contas</span>
            </div>
          </div>

          <div>
            <table className="stat-breakdown-table">
              <thead>
                <tr>
                  <th>Faixa</th>
                  <th className="num-col">Contas</th>
                  <th className="num-col">% Base</th>
                </tr>
              </thead>
              <tbody>
                {categoriasSaude.map((cat) => (
                  <tr key={cat.key}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
                        <span className={`geo-dot ${cat.dotClass}`} aria-hidden="true" />
                        <span>{cat.name}</span>
                      </span>
                    </td>
                    <td className="num-col">{formatarNumero(cat.value)}</td>
                    <td className="num-col" style={{ fontWeight: 700, color: cat.textColor }}>
                      {formatarPercentual(cat.pct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="stat-breakdown-footer">
              <span>Exposição Crítica (Risco + Crítico)</span>
              <strong className="tabular-nums" style={{ color: 'var(--status-critical-text)' }}>
                {formatarNumero(riscoAbsoluto)} contas ({formatarPercentual(taxaRisco)})
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FUNIL COMERCIAL DE TAREFAS (90 DIAS) */}
      <section className="flat-card" aria-labelledby="funnel-heading">
        <div className="flat-card-header">
          <h2 id="funnel-heading" className="flat-card-title">
            Funil Comercial (90d)
          </h2>
          <span className="tabular-nums" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Conversão:{' '}
            <strong style={{ color: 'var(--status-success)' }}>
              {formatarPercentual(taxaConversao)}
            </strong>
          </span>
        </div>

        <div className="funnel-minimal-list">
          <div className="funnel-minimal-item">
            <div className="funnel-minimal-row">
              <span className="funnel-minimal-name">1. Geradas</span>
              <span className="funnel-minimal-numbers">
                {formatarNumero(funil.gerada)}
                <span className="funnel-minimal-pct">(100,0%)</span>
              </span>
            </div>
            <div className="funnel-minimal-track">
              <div
                className="funnel-minimal-fill"
                style={{ width: '100%', backgroundColor: 'var(--brand-primary)' }}
              />
            </div>
          </div>

          <div className="funnel-minimal-item">
            <div className="funnel-minimal-row">
              <span className="funnel-minimal-name">2. Visualizadas</span>
              <span className="funnel-minimal-numbers">
                {formatarNumero(funil.vista)}
                <span className="funnel-minimal-pct">
                  ({formatarPercentual(taxaVisualizacao)})
                </span>
              </span>
            </div>
            <div className="funnel-minimal-track">
              <div
                className="funnel-minimal-fill"
                style={{
                  width: `${Math.min(100, taxaVisualizacao)}%`,
                  backgroundColor: 'var(--brand-cyan)'
                }}
              />
            </div>
          </div>

          <div className="funnel-minimal-item">
            <div className="funnel-minimal-row">
              <span className="funnel-minimal-name">3. Convertidas (Sucesso)</span>
              <span className="funnel-minimal-numbers" style={{ color: 'var(--status-success)' }}>
                {formatarNumero(funil.sucesso)}
                <span className="funnel-minimal-pct">({formatarPercentual(taxaConversao)})</span>
              </span>
            </div>
            <div className="funnel-minimal-track">
              <div
                className="funnel-minimal-fill"
                style={{
                  width: `${Math.min(100, taxaConversao)}%`,
                  backgroundColor: 'var(--status-success)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="funnel-minimal-kpis">
          <div>
            <span className="funnel-mini-stat-label">Eficiência Vistas &rarr; Sucesso</span>
            <span className="funnel-mini-stat-val">{formatarPercentual(eficienciaPosVista)}</span>
          </div>
          <div>
            <span className="funnel-mini-stat-label">Não Convertidas</span>
            <span className="funnel-mini-stat-val" style={{ color: 'var(--status-critical-text)' }}>
              {formatarNumero(funil.gerada - funil.sucesso)} ({formatarPercentual(taxaPerdaTotal)})
            </span>
          </div>
          <div>
            <span className="funnel-mini-stat-label">Não Visualizadas</span>
            <span className="funnel-mini-stat-val">
              {formatarNumero(funil.gerada - funil.vista)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
