import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar o auto-retorno de gráficos Recharts ao estado original após inatividade.
 * Quando o usuário clica ou toca em um ponto do gráfico, ele fica selecionado (tooltip / activeDot).
 * Após o período de inatividade especificado (padrão: 3 segundos) ou ao clicar fora do gráfico,
 * a chave interna do gráfico é atualizada, fazendo com que o Recharts retorne ao seu estado limpo original.
 *
 * @param {number} inactivityMs - Tempo em milissegundos de inatividade antes de resetar (padrão: 3000ms)
 * @returns {{
 *   chartKey: number,
 *   containerRef: React.RefObject<HTMLDivElement>,
 *   interactionProps: {
 *     onMouseDown: (e: any) => void,
 *     onClick: (e: any) => void,
 *     onTouchStart: (e: any) => void,
 *     onTouchMove: (e: any) => void,
 *     onMouseMove: (e: any) => void
 *   },
 *   resetChart: () => void,
 *   triggerInteraction: () => void
 * }}
 */
export function useChartAutoReset(inactivityMs = 3000) {
  const [chartKey, setChartKey] = useState(0);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const isInteractingRef = useRef(false);

  const resetChart = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (isInteractingRef.current) {
      isInteractingRef.current = false;
      setChartKey((k) => (k + 1) % 100000);
    }
  }, []);

  const triggerInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      resetChart();
    }, inactivityMs);
  }, [inactivityMs, resetChart]);

  // Listener para detectar clique/toque fora do gráfico e desativar imediatamente
  useEffect(() => {
    const handleGlobalPointerDown = (e) => {
      if (!isInteractingRef.current) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        resetChart();
      }
    };

    document.addEventListener('pointerdown', handleGlobalPointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handleGlobalPointerDown, true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetChart]);

  const interactionProps = {
    onTouchStart: triggerInteraction,
    onTouchMove: triggerInteraction
  };

  return {
    chartKey,
    containerRef,
    interactionProps,
    resetChart,
    triggerInteraction
  };
}

export default useChartAutoReset;
