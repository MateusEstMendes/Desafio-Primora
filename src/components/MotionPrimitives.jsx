import React, { useEffect, useRef, useState } from 'react';
import { motion, animate, useReducedMotion } from 'motion/react';

export const EXECUTIVE_EASE = [0.16, 1, 0.3, 1];

export const SPRING_PILL = {
  type: 'spring',
  stiffness: 440,
  damping: 34,
  mass: 0.8
};

export function PageTransition({ children, pageKey }) {
  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: EXECUTIVE_EASE }}
      style={{ minWidth: 0 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Contagem numérica progressiva para KPIs executivos.
 * Respeita prefers-reduced-motion e mantém tabular-nums.
 */
export function NumberTicker({ value, isPercent = false, decimals = 1, duration = 0.5 }) {
  const shouldReduceMotion = useReducedMotion();
  const numericTarget = Number.isFinite(Number(value)) ? Number(value) : 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(numericTarget);
      prevValueRef.current = numericTarget;
      return;
    }

    const from = prevValueRef.current;
    const controls = animate(from, numericTarget, {
      duration,
      ease: EXECUTIVE_EASE,
      onUpdate: (latest) => setDisplayValue(latest),
      onComplete: () => {
        prevValueRef.current = numericTarget;
      }
    });

    return () => controls.stop();
  }, [numericTarget, duration, shouldReduceMotion]);

  if (isPercent) {
    return `${displayValue.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}%`;
  }

  return Math.round(displayValue).toLocaleString('pt-BR');
}
