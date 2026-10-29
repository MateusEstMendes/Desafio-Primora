import React, { useState, useEffect } from 'react';
import { ConfigProvider, Grid, theme as antdTheme } from 'antd';
import ptBR from 'antd/locale/pt_BR';

import datasetLocal from './data/dataset_painel_multitenant.json';
import { THEME_TOKENS } from './utils/themeTokens';

import TopBar from './components/TopBar';
import AcademicBanner from './components/AcademicBanner';
import VisaoGeral from './pages/VisaoGeral';
import Comparativo from './pages/Comparativo';
import HistoricoClientes from './pages/HistoricoClientes';

const { useBreakpoint } = Grid;

function getInitialThemeMode() {
  try {
    const stored = localStorage.getItem('color-scheme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch (e) {}
  return 'dark'; // DESIGN.md: Obsidian Dark Theme por padrão
}

const HERO_COPY_BY_TAB = {
  'visao-geral': {
    eyebrow: 'PAINEL EXECUTIVO MULTI-TENANT · 4 REGIONAIS MONITORADAS',
    headlineItalic: 'Domine',
    headlineRoman: ' a saúde comercial da sua carteira nacional.',
    subhead:
      'Diagnóstico instantâneo de exposição proporcional ao risco, conversão de funil em 90 dias e retenção de contas B2B.'
  },
  comparativo: {
    eyebrow: 'AUDITORIA REGIONAL NORMALIZADA · VOLUME VS. PROPORÇÃO',
    headlineItalic: 'Simplifique',
    headlineRoman: ' a comparação entre unidades de portes distintos.',
    subhead:
      'Contraste imediato entre risco bruto absoluto e taxa proporcional para alocar recursos onde a operação realmente precisa.'
  },
  'historico-clientes': {
    eyebrow: 'DRILL-DOWN DE RETENÇÃO · LINHA DO TEMPO AUDITÁVEL',
    headlineItalic: 'Antecipe',
    headlineRoman: ' sinais críticos na jornada de cada conta.',
    subhead:
      'Inspeção cronológica de interações comerciais, alertas de SLA e evolução semestral do score de saúde B2B.'
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral');
  const [selectedTenantId, setSelectedTenantId] = useState('todos');
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiInsight, setAiInsight] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const activeTokens = THEME_TOKENS[themeMode] || THEME_TOKENS.dark;

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.content = themeMode;
    }
    try {
      localStorage.setItem('color-scheme', themeMode);
    } catch (e) {}
  }, [themeMode]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'color-scheme' && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeMode(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleAiPromptSubmit = (customQuery) => {
    const q = (customQuery ?? aiQuery).trim().toLowerCase();
    if (!q) return;

    if (q.includes('crític') || q.includes('centro-oeste') || q.includes('atenção') || q.includes('risco')) {
      setSelectedTenantId('tenant-centro-oeste');
      setCurrentTab('comparativo');
      setAiInsight({
        title: 'Unidade Centro-Oeste em Alerta Crítico (23,33%)',
        text: 'Embora tenha apenas 35 contas em risco absoluto, representa 23,33% de sua carteira total (150 contas). Filtro aplicado.'
      });
    } else if (q.includes('benchmark') || q.includes('sul') || q.includes('sudeste') || q.includes('melhor')) {
      setSelectedTenantId('tenant-sul');
      setCurrentTab('visao-geral');
      setAiInsight({
        title: 'Benchmark Operacional: Unidade Sul (70,0% Conversão)',
        text: 'Menor taxa de risco proporcional (7,78%) e maior eficiência de funil comercial em 90 dias. Escopo filtrado para Unidade Sul.'
      });
    } else if (q.includes('cliente') || q.includes('jornada') || q.includes('cerrado') || q.includes('conta')) {
      setSelectedTenantId('todos');
      setCurrentTab('historico-clientes');
      setAiInsight({
        title: 'Jornada de Clientes: Supermercados Cerrado (Score 34/100)',
        text: 'Queda de 34 pontos em 6 meses após ruptura logística e atraso de SLA. Abrindo histórico cronológico.'
      });
    } else {
      setSelectedTenantId('todos');
      setCurrentTab('visao-geral');
      setAiInsight({
        title: 'Diagnóstico Consolidado Nacional (2.250 Contas)',
        text: 'Exposição consolidada de 11,42% (257 contas em risco/crítico) e conversão média de funil de 60,79%.'
      });
    }
  };

  const heroCopy = HERO_COPY_BY_TAB[currentTab] || HERO_COPY_BY_TAB['visao-geral'];

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm:
          themeMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: activeTokens.brandPrimary,
          colorInfo: activeTokens.brandCyan,
          colorSuccess: activeTokens.statusSuccess,
          colorWarning: activeTokens.statusWarning,
          colorError: activeTokens.statusCritical,
          colorBgBase: activeTokens.bgCanvas,
          colorBgContainer: activeTokens.bgSurface,
          colorBgElevated: activeTokens.bgElevated,
          colorBorder: activeTokens.borderDefault,
          colorBorderSecondary: activeTokens.borderSubtle,
          colorText: activeTokens.textPrimary,
          colorTextSecondary: activeTokens.textSecondary,
          borderRadius: 8,
          borderRadiusLG: 16,
          borderRadiusSM: 8,
          boxShadow: 'none',
          boxShadowSecondary: 'none',
          motionDurationMid: '0.2s',
          motionDurationSlow: '0.2s',
          fontFamily: `'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
        },
        components: {
          Table: {
            headerBg: activeTokens.bgElevated,
            headerColor: activeTokens.textSecondary,
            headerSplitColor: activeTokens.borderDefault,
            borderColor: activeTokens.borderSubtle,
            rowHoverBg: activeTokens.bgSubtle,
            cellPaddingBlock: 12,
            cellPaddingInline: 14
          },
          Select: {
            selectorBg: activeTokens.bgSurface,
            optionSelectedBg: activeTokens.brandPrimarySoft
          },
          Radio: {
            buttonBg: activeTokens.bgSurface,
            buttonCheckedBg: activeTokens.brandPrimary
          }
        }
      }}
    >
      <div className="app-shell">
        <TopBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          selectedTenantId={selectedTenantId}
          onTenantChange={setSelectedTenantId}
          tenants={datasetLocal.tenants}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          isMobile={isMobile}
          mobileDrawerOpen={mobileDrawerOpen}
          setMobileDrawerOpen={setMobileDrawerOpen}
        />

        {/* Atmospheric Hero Band (DESIGN.md) */}
        <section className="origin-hero-band" aria-label="Cabeçalho executivo e assistente analítico">
          <div className="origin-hero-inner">
            <div className="promo-eyebrow-badge">
              <span className="geo-dot geo-dot--cyan" aria-hidden="true" />
              <span>{heroCopy.eyebrow}</span>
            </div>

            <h1 className="origin-display-headline">
              <em>{heroCopy.headlineItalic}</em>
              {heroCopy.headlineRoman}
            </h1>

            <p className="origin-section-subhead">{heroCopy.subhead}</p>

            {/* AI Prompt Input (DESIGN.md Component) */}
            <div className="origin-ai-prompt-wrap">
              <form
                className="origin-ai-prompt-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAiPromptSubmit();
                }}
              >
                <input
                  type="text"
                  className="origin-ai-prompt-input"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Qual unidade exige intervenção prioritária neste mês?"
                  aria-label="Consultar inteligência comercial da carteira"
                />
                <button
                  type="submit"
                  className="origin-ai-submit-btn"
                  aria-label="Executar consulta executiva"
                  title="Executar consulta"
                >
                  &rarr;
                </button>
              </form>

              <div className="origin-ai-Quick-chips">
                <button
                  type="button"
                  className="origin-ai-chip"
                  onClick={() => {
                    setAiQuery('Onde está o maior risco proporcional?');
                    handleAiPromptSubmit('risco');
                  }}
                >
                  Maior risco proporcional
                </button>
                <button
                  type="button"
                  className="origin-ai-chip"
                  onClick={() => {
                    setAiQuery('Qual regional é o benchmark de funil?');
                    handleAiPromptSubmit('benchmark');
                  }}
                >
                  Benchmark de conversão
                </button>
                <button
                  type="button"
                  className="origin-ai-chip"
                  onClick={() => {
                    setAiQuery('Auditar conta em estado crítico');
                    handleAiPromptSubmit('cliente');
                  }}
                >
                  Conta crítica B2B
                </button>
                {selectedTenantId !== 'todos' && (
                  <button
                    type="button"
                    className="origin-ai-chip"
                    onClick={() => {
                      setSelectedTenantId('todos');
                      setAiInsight(null);
                    }}
                  >
                    Ver Consolidado Nacional &times;
                  </button>
                )}
              </div>

              {aiInsight && (
                <div className="origin-ai-answer-box" role="status">
                  <div>
                    <strong style={{ color: 'var(--brand-cyan)', display: 'block', marginBottom: 2 }}>
                      {aiInsight.title}
                    </strong>
                    <span>{aiInsight.text}</span>
                  </div>
                  <button
                    type="button"
                    className="flat-action-btn"
                    onClick={() => setAiInsight(null)}
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>

            {/* Award Laurel Badges (DESIGN.md Social Proof Component) */}
            <div className="origin-laurel-row" aria-label="Credenciais do ecossistema">
              <div className="origin-laurel-badge">
                <span aria-hidden="true" style={{ fontSize: 18, opacity: 0.7 }}>&#10087;</span>
                <div>
                  <span className="origin-laurel-title">Primora Soluções</span>
                  <span className="origin-laurel-sub">ARQUITETURA MULTI-TENANT</span>
                </div>
                <span aria-hidden="true" style={{ fontSize: 18, opacity: 0.7 }}>&#10087;</span>
              </div>

              <div className="origin-laurel-badge">
                <span aria-hidden="true" style={{ fontSize: 18, opacity: 0.7 }}>&#10087;</span>
                <div>
                  <span className="origin-laurel-title">Distribuidora Vetor</span>
                  <span className="origin-laurel-sub">2.250 CONTAS ATIVAS</span>
                </div>
                <span aria-hidden="true" style={{ fontSize: 18, opacity: 0.7 }}>&#10087;</span>
              </div>
            </div>
          </div>
        </section>

        <main className="app-main-content">
          {currentTab === 'visao-geral' && (
            <VisaoGeral
              dataset={datasetLocal}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              onNavigateTab={setCurrentTab}
              themeTokens={activeTokens}
            />
          )}

          {currentTab === 'comparativo' && (
            <Comparativo
              dataset={datasetLocal}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              themeTokens={activeTokens}
            />
          )}

          {currentTab === 'historico-clientes' && (
            <HistoricoClientes
              dataset={datasetLocal}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              themeTokens={activeTokens}
            />
          )}
        </main>

        <footer className="app-footer">
          <div className="app-footer-inner">
            <AcademicBanner />

            <div className="app-footer-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={themeMode === 'dark' ? '/primora-logo-white.webp' : '/primora-logo.png'}
                  alt="Primora"
                  style={{ height: 18, width: 'auto', display: 'block' }}
                />
                <span>·</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 400 }}>
                  Distribuidora Vetor — Inteligência Comercial Multi-Tenant
                </strong>
              </div>

              <span
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-roboto-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                STYLE SYSTEM: {activeTokens.label} · BLUE &amp; CYAN SIGNAL EDITION
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
