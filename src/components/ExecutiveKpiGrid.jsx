import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { EXECUTIVE_EASE, NumberTicker } from './MotionPrimitives';

/**
 * Grade executiva reutilizável de KPIs (originada da Visão Executiva).
 * Suporta NumberTicker para valores numéricos ou texto formatado direto (displayValue).
 */
export function ExecutiveKpiGrid({ metrics = [], ariaLabel = 'Indicadores executivos' }) {
  return (
    <section className="reference-kpis" aria-label={ariaLabel}>
      {metrics.map((m, idx) => (
        <motion.article
          key={m.title}
          className="reference-kpi"
          style={{ '--metric-accent': m.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: idx * 0.045, ease: EXECUTIVE_EASE }}
        >
          <h2>{m.title}</h2>
          <div className="reference-kpi-bottom">
            <strong>
              {m.displayValue !== undefined ? (
                m.displayValue
              ) : (
                <NumberTicker
                  value={m.rawValue}
                  isPercent={Boolean(m.isPercent)}
                  decimals={m.decimals ?? 1}
                />
              )}
            </strong>
            {m.note && (
              <span
                className={
                  'metric-note ' +
                  (m.trend !== undefined ? (m.trend >= 0 ? 'is-positive' : 'is-negative') : '')
                }
              >
                {m.trend !== undefined &&
                  (m.trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />)}
                {m.note}
              </span>
            )}
          </div>
        </motion.article>
      ))}
    </section>
  );
}

/**
 * Painel executivo com entrada animada suave (reutilizável entre abas).
 */
export function ExecutivePanel({
  children,
  className = 'reference-panel',
  delay = 0.08,
  ...props
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: EXECUTIVE_EASE }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
