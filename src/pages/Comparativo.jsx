import React, { useMemo, useState } from 'react';
import { Table, Radio, Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  classificarUnidadesPorRisco,
  formatarNumero,
  formatarPercentual
} from '../utils/metrics';
import { getRiskSemanticTokens, getRegionalColors } from '../utils/themeTokens';
import '../components/componentsCSS/Comparativo.css';

export default function Comparativo({
  dataset,
  isMobile = false,
  selectedTenantId = 'todos',
  onSelectTenant,
  themeTokens
}) {
  const [tipoGrafico, setTipoGrafico] = useState('composto');
  const [modoDonut, setModoDonut] = useState('risco'); // 'risco' ou 'carteira'
  const [showRationale, setShowRationale] = useState(false);

  const tenants = dataset?.tenants || [];

  const dadosClassificados = useMemo(() => {
    return classificarUnidadesPorRisco(tenants);
  }, [tenants]);

  // Paleta categórica neutra (sem colidir com vermelho/amarelo de status de risco)
  const regionalColors = useMemo(
    () => getRegionalColors(themeTokens),
    [themeTokens]
  );

  // Dados para o Donut Financeiro de Concentração Regional
  const donutRegionalData = useMemo(() => {
    const totalRisco = dadosClassificados.reduce((acc, d) => acc + d.riscoAbsolutoCalculado, 0);
    const totalCarteira = dadosClassificados.reduce((acc, d) => acc + d.carteiraTotalClientes, 0);
    const denominador = modoDonut === 'risco' ? totalRisco : totalCarteira;

    const slices = dadosClassificados.map((d) => {
      const val = modoDonut === 'risco' ? d.riscoAbsolutoCalculado : d.carteiraTotalClientes;
      const pct = denominador > 0 ? Number(((val / denominador) * 100).toFixed(1)) : 0;
      return {
        id: d.id,
        name: d.nome.replace('Unidade ', '').replace(' (Matriz)', ''),
        porte: d.porte,
        value: val,
        pct,
        color: regionalColors[d.id] || themeTokens.brandPrimary
      };
    });

    // Ordenar da maior fatia para a menor
    slices.sort((a, b) => b.value - a.value);

    return {
      total: denominador,
      slices
    };
  }, [dadosClassificados, modoDonut, regionalColors, themeTokens]);

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'posicaoRankingRisco',
      key: 'posicaoRankingRisco',
      width: 85,
      sorter: (a, b) => a.posicaoRankingRisco - b.posicaoRankingRisco,
      defaultSortOrder: 'ascend',
      render: (pos, record) => {
        const isCrit = record.taxaRiscoProporcional >= 20;
        const isWarn = record.taxaRiscoProporcional >= 10 && !isCrit;
        return (
          <span
            className={`geo-badge ${
              isCrit
                ? 'geo-badge--critical'
                : isWarn
                ? 'geo-badge--warning'
                : 'geo-badge--success'
            }`}
          >
            #{pos}º
          </span>
        );
      }
    },
    {
      title: 'Unidade Regional',
      dataIndex: 'nome',
      key: 'nome',
      width: 210,
      render: (nome, record) => {
        const isFocused = selectedTenantId === record.id;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{nome}</strong>
              {isFocused && <span className="geo-badge geo-badge--brand">Em Foco</span>}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Região {record.regiao}
            </span>
          </div>
        );
      }
    },
    {
      title: 'Porte',
      dataIndex: 'porte',
      key: 'porte',
      width: 95,
      filters: [
        { text: 'Grande', value: 'Grande' },
        { text: 'Médio', value: 'Médio' },
        { text: 'Pequeno', value: 'Pequeno' }
      ],
      onFilter: (value, record) => record.porte === value,
      render: (porte) => <span className="geo-badge">{porte}</span>
    },
    {
      title: 'Carteira',
      dataIndex: 'carteiraTotalClientes',
      key: 'carteiraTotalClientes',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.carteiraTotalClientes - b.carteiraTotalClientes,
      render: (total) => (
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {formatarNumero(total)}
        </span>
      )
    },
    {
      title: 'Saudável / Atenção',
      key: 'saudavelAtencao',
      width: 145,
      align: 'right',
      render: (_, record) => (
        <span className="tabular-nums" style={{ fontSize: 12 }}>
          <strong style={{ color: 'var(--status-success-text)' }}>
            {formatarNumero(record.saudeCarteira?.saudavel)}
          </strong>{' '}
          /{' '}
          <span style={{ color: 'var(--status-warning-text)' }}>
            {formatarNumero(record.saudeCarteira?.atencao)}
          </span>
        </span>
      )
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span>Risco Bruto</span>
          <Tooltip title="Soma de Risco + Crítico em quantidade absoluta de contas.">
            <InfoCircleOutlined style={{ color: 'var(--text-muted)' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'riscoAbsolutoCalculado',
      key: 'riscoAbsolutoCalculado',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.riscoAbsolutoCalculado - b.riscoAbsolutoCalculado,
      render: (risco, record) => (
        <div className="tabular-nums">
          <strong style={{ color: 'var(--status-critical-text)' }}>{formatarNumero(risco)}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
            ({record.saudeCarteira?.risco}R + {record.saudeCarteira?.critico}C)
          </span>
        </div>
      )
    },
    {
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span>Taxa Prop. (%)</span>
          <Tooltip title="Fórmula: ((Risco + Crítico) / Carteira Total) × 100.">
            <InfoCircleOutlined style={{ color: 'var(--text-muted)' }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'taxaRiscoProporcional',
      key: 'taxaRiscoProporcional',
      width: 145,
      align: 'right',
      sorter: (a, b) => a.taxaRiscoProporcional - b.taxaRiscoProporcional,
      render: (taxa) => {
        const sem = getRiskSemanticTokens(taxa, themeTokens);
        return (
          <span className="tabular-nums" style={{ fontWeight: 700, color: sem.color }}>
            {sem.symbol} {formatarPercentual(taxa)}
          </span>
        );
      }
    },
    {
      title: 'Funil (90d)',
      dataIndex: 'taxaConversaoFunil',
      key: 'taxaConversaoFunil',
      width: 135,
      align: 'right',
      sorter: (a, b) => a.taxaConversaoFunil - b.taxaConversaoFunil,
      render: (taxa, record) => (
        <div className="tabular-nums">
          <strong style={{ color: 'var(--brand-primary)' }}>{formatarPercentual(taxa)}</strong>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>
            ({record.funnel90d?.sucesso}/{record.funnel90d?.gerada})
          </span>
        </div>
      )
    },
    {
      title: 'Engaj.',
      dataIndex: 'engajamentoMedio',
      key: 'engajamentoMedio',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.engajamentoMedio - b.engajamentoMedio,
      render: (eng) => (
        <span className="tabular-nums" style={{ fontWeight: 600 }}>
          {formatarPercentual(eng)}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'acao',
      width: 155,
      render: (_, record) => {
        const sem = getRiskSemanticTokens(record.taxaRiscoProporcional, themeTokens);
        const cls =
          record.taxaRiscoProporcional >= 20
            ? 'geo-badge--critical'
            : record.taxaRiscoProporcional >= 10
            ? 'geo-badge--warning'
            : 'geo-badge--success';
        return (
          <span className={`geo-badge ${cls}`}>
            {sem.symbol} {sem.actionLabel}
          </span>
        );
      }
    }
  ];

  const dadosGrafico = useMemo(() => {
    return dadosClassificados.map((d) => ({
      nome: isMobile
        ? d.nome.replace('Unidade ', '').replace(' (Matriz)', '')
        : d.nome.replace('Unidade ', ''),
      porte: d.porte,
      riscoAbsoluto: d.riscoAbsolutoCalculado,
      taxaRiscoProporcional: d.taxaRiscoProporcional,
      carteiraTotal: d.carteiraTotalClientes,
      sucessoFunil: d.taxaConversaoFunil
    }));
  }, [dadosClassificados, isMobile]);

  return (
    <div className="comparativo-container">
      {/* 1. PAINEL ANALÍTICO DUPLO: GRÁFICO DE ESCALAS + DONUT DE CONCENTRAÇÃO REGIONAL */}
      <div className="comparativo-top-charts-grid">
        {/* Esquerda: Contraste Volume Bruto vs. Taxa Proporcional (%) */}
        <section className="flat-card" aria-labelledby="comparativo-chart-heading">
          <div className="flat-card-header">
            <h2 id="comparativo-chart-heading" className="flat-card-title">
              Risco Absoluto vs. Taxa Proporcional (%)
            </h2>

            <Radio.Group
              value={tipoGrafico}
              onChange={(e) => setTipoGrafico(e.target.value)}
              size="small"
              buttonStyle="solid"
            >
              <Radio.Button value="composto">Volume vs %</Radio.Button>
              <Radio.Button value="barras">Taxas (%)</Radio.Button>
            </Radio.Group>
          </div>

          <div style={{ height: isMobile ? 220 : 250, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {tipoGrafico === 'composto' ? (
                <ComposedChart
                  data={dadosGrafico}
                  margin={{ top: 8, right: 16, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke={themeTokens.chartGrid} />
                  <XAxis
                    dataKey="nome"
                    stroke={themeTokens.chartAxis}
                    tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke={themeTokens.brandPrimary}
                    tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 30]}
                    unit="%"
                    stroke={themeTokens.statusCritical}
                    tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeTokens.chartTooltipBg,
                      border: `1px solid ${themeTokens.chartTooltipBorder}`,
                      borderRadius: 4,
                      boxShadow: 'none',
                      color: themeTokens.textPrimary,
                      fontSize: 12
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="riscoAbsoluto"
                    name="Risco Bruto (Contas)"
                    fill={themeTokens.brandPrimary}
                    barSize={isMobile ? 22 : 34}
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="right"
                    type="linear"
                    dataKey="taxaRiscoProporcional"
                    name="Taxa Proporcional (%)"
                    stroke={themeTokens.statusCritical}
                    strokeWidth={2}
                    dot={{ r: 4, fill: themeTokens.statusCritical, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              ) : (
                <BarChart
                  data={dadosGrafico}
                  margin={{ top: 8, right: 16, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke={themeTokens.chartGrid} />
                  <XAxis
                    dataKey="nome"
                    stroke={themeTokens.chartAxis}
                    tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    stroke={themeTokens.chartAxis}
                    tick={{ fontSize: 11, fill: themeTokens.chartAxis }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeTokens.chartTooltipBg,
                      border: `1px solid ${themeTokens.chartTooltipBorder}`,
                      borderRadius: 4,
                      boxShadow: 'none',
                      color: themeTokens.textPrimary,
                      fontSize: 12
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={28}
                    wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="taxaRiscoProporcional"
                    name="Risco Proporcional (%)"
                    fill={themeTokens.statusCritical}
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="sucessoFunil"
                    name="Conversão Funil (%)"
                    fill={themeTokens.brandCyan}
                    radius={[2, 2, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* Direita: Donut Financeiro de Concentração Regional (Risco vs Carteira) */}
        <section className="flat-card" aria-labelledby="concentration-donut-heading">
          <div className="flat-card-header">
            <h2 id="concentration-donut-heading" className="flat-card-title">
              Concentração por Regional
            </h2>

            <Radio.Group
              value={modoDonut}
              onChange={(e) => setModoDonut(e.target.value)}
              size="small"
              buttonStyle="solid"
            >
              <Radio.Button value="risco">Share de Risco</Radio.Button>
              <Radio.Button value="carteira">Share de Carteira</Radio.Button>
            </Radio.Group>
          </div>

          <div className="regional-donut-layout">
            <div className="regional-donut-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutRegionalData.slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke={themeTokens.bgSurface}
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {donutRegionalData.slices.map((s) => (
                      <Cell
                        key={s.id}
                        fill={s.color}
                        cursor="pointer"
                        onClick={() => onSelectTenant(selectedTenantId === s.id ? 'todos' : s.id)}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: themeTokens.chartTooltipBg,
                      border: `1px solid ${themeTokens.chartTooltipBorder}`,
                      borderRadius: 4,
                      boxShadow: 'none',
                      color: themeTokens.textPrimary,
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
                <span className="donut-center-value">
                  {formatarNumero(donutRegionalData.total)}
                </span>
                <span className="donut-center-sub">
                  {modoDonut === 'risco' ? 'Em Risco' : 'Carteira'}
                </span>
              </div>
            </div>

            <table className="regional-share-table">
              <thead>
                <tr>
                  <th>Regional</th>
                  <th className="num-col">Volume</th>
                  <th className="num-col">Share %</th>
                </tr>
              </thead>
              <tbody>
                {donutRegionalData.slices.map((s) => {
                  const isSelected = selectedTenantId === s.id;
                  return (
                    <tr
                      key={s.id}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                      className={isSelected ? 'regional-share-row-selected' : ''}
                      onClick={() => onSelectTenant(isSelected ? 'todos' : s.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectTenant(isSelected ? 'todos' : s.id);
                        }
                      }}
                      title="Clique ou pressione Enter para filtrar esta regional"
                    >
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <span
                            className="geo-dot"
                            style={{ backgroundColor: s.color }}
                            aria-hidden="true"
                          />
                          <span>{s.name}</span>
                        </span>
                      </td>
                      <td className="num-col">{formatarNumero(s.value)}</td>
                      <td className="num-col" style={{ fontWeight: 700 }}>
                        {formatarPercentual(s.pct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 2. TABELA MULTIDIMENSIONAL DE PRECISÃO ESTATÍSTICA (ANT DESIGN TABLE - SPRINT 2) */}
      <section className="flat-card" aria-labelledby="comparativo-table-heading">
        <div className="flat-card-header">
          <div>
            <span className="flat-section-eyebrow">ESTRUTURA DE TABELA COMPACTA · SPRINT 2</span>
            <h2 id="comparativo-table-heading" className="flat-card-title">
              Matriz Comparativa de Indicadores por Regional
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="geo-badge geo-badge--cyan">
              Ant Design Table
            </span>
            <span className="geo-badge">
              Dados Fictícios
            </span>
            {selectedTenantId !== 'todos' && (
              <button
                type="button"
                className="flat-action-btn"
                onClick={() => onSelectTenant('todos')}
              >
                Limpar seleção
              </button>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Clique nas colunas para ordenar
            </span>
          </div>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="comparativo-table-heading"
          className="table-region-wrapper"
        >
          <Table
            columns={columns}
            dataSource={dadosClassificados}
            rowKey="id"
            pagination={false}
            scroll={{ x: 960 }}
            bordered
            size="small"
            rowClassName={(record) =>
              record.id === selectedTenantId ? 'comparativo-row-focused' : ''
            }
            onRow={(record) => ({
              onClick: () =>
                onSelectTenant(selectedTenantId === record.id ? 'todos' : record.id),
              style: { cursor: 'pointer' }
            })}
          />
        </div>
      </section>

      {/* 3. FUNDAMENTAÇÃO METODOLÓGICA COLAPSÁVEL (Inicia recolhida para manter minimalismo) */}
      <section className="flat-card" aria-labelledby="ux-rationale-heading">
        <div
          className="flat-card-header"
          style={{
            marginBottom: showRationale ? 12 : 0,
            borderBottom: showRationale ? undefined : 'none',
            paddingBottom: showRationale ? 12 : 0
          }}
        >
          <h2 id="ux-rationale-heading" className="flat-card-title" style={{ fontSize: 13 }}>
            Notas Metodológicas: Indicador Proporcional e Critério Gráfico vs. Tabela
          </h2>
          <button
            type="button"
            className="flat-action-btn"
            onClick={() => setShowRationale((prev) => !prev)}
            aria-expanded={showRationale}
          >
            {showRationale ? 'Ocultar notas ▲' : 'Expandir notas ▼'}
          </button>
        </div>

        {showRationale && (
          <div className="ux-rationale-grid">
            <div className="ux-rationale-block">
              <h4>1. Critério do Indicador Proporcional de Risco</h4>
              <code className="ux-formula-code">
                Taxa_Risco_Proporcional = ((clientes_risco + clientes_critico) / carteira_total) × 100
              </code>
              <p style={{ margin: '0 0 6px 0' }}>
                <strong>Por que normalizar por porte:</strong> A Matriz Sudeste possui 100 contas em
                risco sobre 1.200 clientes (<strong>8,33%</strong>), enquanto o Centro-Oeste possui
                35 contas em risco sobre 150 clientes (<strong>23,33%</strong>). A taxa proporcional
                corrige o viés de escala.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Limites:</strong> Atribui pesos iguais a Risco e Crítico e não pondera o
                ticket médio financeiro individual.
              </p>
            </div>

            <div className="ux-rationale-block">
              <h4>2. Quando utilizar Gráfico vs. Tabela?</h4>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Gráfico Composto & Donut:</strong> Ideais para evidenciar assimetrias de
                escala (volume absoluto vs. taxa relativa) e participação percentual (share) no
                risco total.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Tabela Tabular:</strong> Essencial para consulta de precisão numérica,
                ordenação multi-coluna e aplicação de filtros por porte.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
