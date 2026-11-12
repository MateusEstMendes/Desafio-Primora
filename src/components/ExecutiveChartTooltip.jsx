import React from 'react';
import { Sector } from 'recharts';

/**
 * Fatia ativa para Pie Charts ao selecionar/clicar:
 * cresce radialmente (+7px) e realça a vivacidade da cor.
 */
export function renderActivePieSlice(props) {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    stroke
  } = props;

  return (
    <g className="exec-pie-active-slice">
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={(outerRadius || 0) + 7}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={stroke || '#ffffff'}
        strokeWidth={2.5}
      />
    </g>
  );
}

/**
 * Tooltip executivo unificado para Recharts.
 * Projetado para resposta instantânea (sem lag de animação) e leitura tabular.
 */
export default function ExecutiveChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter
}) {
  if (!active || !payload || !payload.length) return null;

  const resolvedLabel = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className="exec-chart-tooltip" role="status" aria-live="polite">
      {resolvedLabel !== undefined && resolvedLabel !== null && resolvedLabel !== '' && (
        <div className="exec-chart-tooltip-label">{resolvedLabel}</div>
      )}
      <div className="exec-chart-tooltip-items">
        {payload.map((entry, idx) => {
          const rawVal = entry.value;
          const name = entry.name || entry.dataKey || '';
          const formatted = valueFormatter
            ? valueFormatter(rawVal, name, entry, idx)
            : [rawVal, name];
          const [displayVal, displayName] = Array.isArray(formatted)
            ? formatted
            : [formatted, name];
          const dotColor = entry.color || entry.payload?.color || 'var(--brand-primary)';

          return (
            <div key={`${name}-${idx}`} className="exec-chart-tooltip-row">
              <span
                className="exec-chart-tooltip-dot"
                style={{ backgroundColor: dotColor }}
                aria-hidden="true"
              />
              <span className="exec-chart-tooltip-name">{displayName}</span>
              <strong className="exec-chart-tooltip-val tabular-nums">{displayVal}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
