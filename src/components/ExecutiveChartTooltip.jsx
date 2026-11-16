import React, { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { CHART_TIMING } from '../utils/chartMotion';
import { Sector } from 'recharts';

// O raio continua do valor visível quando o usuário troca rapidamente de fatia.
function AnimatedPieSlice({ expanded, motionState, ...props }) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState(motionState.offset);
  useEffect(() => {
    const target = expanded ? 6 : 0;
    if (reduced) { motionState.offset = target; setOffset(target); return; }
    const controls = animate(motionState.offset, target, {
      duration: CHART_TIMING.highlight / 1000,
      ease: 'easeOut',
      onUpdate: value => { motionState.offset = value; setOffset(value); }
    });
    return () => controls.stop();
  }, [expanded, reduced, motionState]);
  return <Sector {...props} outerRadius={(props.outerRadius || 0) + offset}
    stroke="var(--bg-surface)" strokeWidth={2} />;
}

// Guardar o raio fora da Shape preserva o estado visível mesmo quando o
// Recharts troca o wrapper interno de uma fatia ativa/inativa.
export function usePieSliceRenderer(selectedKey, dismissed = false, keyField = 'id') {
  const offsets = useRef(new Map());
  return props => {
    const key = keyField === 'index' ? props.index : props.payload?.[keyField];
    if (!offsets.current.has(key)) offsets.current.set(key, { offset: 0 });
    return <AnimatedPieSlice {...props} motionState={offsets.current.get(key)}
      expanded={key === selectedKey || (props.isActive && !dismissed)} />;
  };
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

  const resolvedLabel = labelFormatter ? labelFormatter(label, payload) : (label ?? payload[0]?.payload?.name ?? payload[0]?.name);

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
            : [typeof rawVal === 'number' ? rawVal.toLocaleString('pt-BR') : rawVal, name];
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
