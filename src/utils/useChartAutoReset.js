import { useState, useRef, useEffect, useCallback } from 'react';

// Fechar uma interação não remonta o SVG nem altera a seleção de negócio.
export function useChartAutoReset(inactivityMs = 3000) {
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const touchRef = useRef(false);

  const resetChart = useCallback(() => {
    clearTimeout(timerRef.current);
    setDismissed(true);
  }, []);

  const triggerInteraction = useCallback((event) => {
    if (event?.pointerType) touchRef.current = event.pointerType === 'touch';
    else if (event?.type?.startsWith('touch')) touchRef.current = true;
    else if (event?.type === 'keydown') touchRef.current = false;
    setDismissed(false);
    clearTimeout(timerRef.current);
    // Mouse e teclado permanecem disponíveis enquanto houver foco/hover.
    if (touchRef.current) {
      timerRef.current = setTimeout(resetChart, inactivityMs);
    }
  }, [inactivityMs, resetChart]);

  useEffect(() => {
    const outside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) resetChart();
    };
    document.addEventListener('pointerdown', outside, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      clearTimeout(timerRef.current);
    };
  }, [resetChart]);

  return {
    containerRef,
    tooltipProps: { active: dismissed ? false : undefined },
    interactionProps: {
      onPointerDown: triggerInteraction,
      onPointerMove: triggerInteraction,
      onTouchStart: triggerInteraction,
      onTouchMove: triggerInteraction,
      onFocus: triggerInteraction,
      onKeyDown: event => event.key === 'Escape' ? resetChart() : triggerInteraction(event),
      onBlur: event => { if (!event.currentTarget.contains(event.relatedTarget)) resetChart(); }
    },
    resetChart,
    triggerInteraction
  };
}

export default useChartAutoReset;
