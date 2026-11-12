import React, { useId } from 'react';
import { motion } from 'motion/react';
import { SPRING_PILL } from './MotionPrimitives';

/**
 * Controle segmentado executivo com pílula deslizante (substitui Radio.Group do AntD).
 * Mantém a mesma linguagem visual do seletor de período da Visão Executiva.
 */
export default function SegmentedPill({
  options = [],
  value,
  onChange,
  ariaLabel = 'Filtro de visualização',
  size = 'md'
}) {
  const layoutGroupId = useId();

  return (
    <div
      className={`exec-segmented ${size === 'sm' ? 'exec-segmented--sm' : ''}`}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={`exec-segmented-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {isActive && (
              <motion.span
                layoutId={`seg-pill-${layoutGroupId}`}
                className="exec-segmented-pill"
                transition={SPRING_PILL}
                aria-hidden="true"
              />
            )}
            <span className="exec-segmented-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
