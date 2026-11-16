import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { CHART_TIMING } from '../utils/chartMotion';
import { Sector } from 'recharts';
import { createPortal } from 'react-dom';

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
  anchorRef,
  coordinate,
  payload,
  label,
  valueFormatter,
  labelFormatter
}) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState(null);
  const visible = active && payload?.length > 0;

  useLayoutEffect(() => {
    if (!visible) { setPosition(null); return; }
    const place = () => {
      const anchor = anchorRef?.current;
      const tooltip = tooltipRef.current;
      if (!anchor || !tooltip) return;
      const chart = anchor.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      const height = tooltip.offsetHeight;
      const gap = 12;
      const edge = 12;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const bottomEdge = viewportHeight - (viewportWidth < 1024 ? 88 : edge);
      const clampX = x => Math.max(edge, Math.min(x, viewportWidth - width - edge));
      const clampY = y => Math.max(edge, Math.min(y, bottomEdge - height));
      const x = clampX(chart.left + (coordinate?.x ?? chart.width / 2) - width / 2);
      // Preferir acima/abaixo: a caixa nunca é limitada ao SVG ou ao card.
      const candidates = [
        { left: x, top: chart.top - height - gap },
        { left: x, top: chart.bottom + gap },
        { left: chart.right + gap, top: clampY(chart.top) },
        { left: chart.left - width - gap, top: clampY(chart.top) }
      ];
      const next = candidates.find(p => p.left >= edge && p.left + width <= viewportWidth - edge
        && p.top >= edge && p.top + height <= bottomEdge);
      if (!next || chart.bottom <= 0 || chart.top >= viewportHeight) { setPosition(null); return; }
      setPosition(previous => previous?.left === next.left && previous?.top === next.top ? previous : next);
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    const observer = new ResizeObserver(place);
    if (tooltipRef.current) observer.observe(tooltipRef.current);
    if (anchorRef?.current) observer.observe(anchorRef.current);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      observer.disconnect();
    };
  }, [visible, anchorRef, coordinate?.x, payload, label]);

  if (!visible) return null;

  const resolvedLabel = labelFormatter ? labelFormatter(label, payload) : (label ?? payload[0]?.payload?.name ?? payload[0]?.name);

  return createPortal(
    <div ref={tooltipRef} className="exec-chart-tooltip exec-chart-tooltip--floating"
      style={{ left: position?.left ?? 0, top: position?.top ?? 0, visibility: position ? 'visible' : 'hidden' }}
      role="status" aria-live="polite">
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
    </div>,
    document.body
  );
}
