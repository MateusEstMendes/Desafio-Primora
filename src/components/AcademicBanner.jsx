import React, { useState } from 'react';
import './componentsCSS/AcademicBanner.css';

export default function AcademicBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside className="academic-spec-bar" aria-label="Especificação técnica e contexto acadêmico">
      <div className="academic-spec-header">
        <div className="academic-spec-title-group">
          <span className="geo-badge geo-badge--brand">Protótipo Acadêmico</span>
          <span className="academic-spec-label">
            Desafio Técnico 2 · Bolsa Futuro Digital — Primora Soluções em TI & Distribuidora Vetor
          </span>
          <span className="geo-badge">ReactJS + Ant Design</span>
          <span className="geo-badge">Dataset Local JSON (RF01–RF12)</span>
        </div>

        <button
          type="button"
          className="academic-spec-toggle"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? 'Ocultar nota metodológica ▲' : 'Ver nota metodológica ▼'}
        </button>
      </div>

      {expanded && (
        <div className="academic-spec-details">
          Painel interno de inteligência comercial multi-tenant projetado sob diretrizes estritas de{' '}
          <strong>Flat Design</strong> (cores 100% sólidas, zero sombras, zero gradientes, bordas de
          1px e tipografia com números tabulares <code>tabular-nums</code>). Os dados de unidades
          regionais (tenants) e carteiras de clientes são fictícios para avaliação de arquitetura
          front-end e tomada de decisão executiva.
        </div>
      )}
    </aside>
  );
}
