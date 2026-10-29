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
            Desafio Técnico 2 · Bolsa Futuro Digital — Primora Soluções em TI &amp; Distribuidora Vetor
          </span>
          <span className="geo-badge">Origin Gallery Style (Blue Edition)</span>
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
          Painel interno de inteligência comercial multi-tenant redesenhado segundo a referência{' '}
          <strong>Origin Gallery (DESIGN.md — Blue &amp; Bright Blue Edition)</strong>: superfícies
          noturnas em camadas (Obsidian <code>#0f1011</code>, Graphite <code>#2e2e2e</code> e Silver
          Inverted <code>#cacaca</code>), cartões cromáticos full-bleed em azul brilhante (
          <code>#2970ff</code>) e azul profundo (<code>#1d4ed8</code>), sinais de dados em Cyan
          Signal (<code>#00b3dd</code>) e tipografia em três vozes (Serif Display peso 300, Sans UI
          e Roboto Mono uppercase com <code>tabular-nums</code>).
        </div>
      )}
    </aside>
  );
}
