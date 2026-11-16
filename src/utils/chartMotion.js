import { useReducedMotion } from 'motion/react';

export const CHART_TIMING = Object.freeze({ enter: 450, highlight: 180, tooltip: 140, navigation: 220 });

export function useChartMotion() {
  const reduced = useReducedMotion();
  return {
    isAnimationActive: !reduced,
    animationBegin: 0,
    animationDuration: CHART_TIMING.enter,
    animationEasing: 'ease-out'
  };
}

export const activeChartDot = { r: 5, stroke: 'var(--bg-surface)', strokeWidth: 3, className: 'chart-active-dot' };
