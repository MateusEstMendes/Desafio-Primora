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
  return 'light'; // White UI padrão conforme alinhado
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral');
  const [selectedTenantId, setSelectedTenantId] = useState('todos');
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const activeTokens = THEME_TOKENS[themeMode] || THEME_TOKENS.light;

  // Sincroniza o atributo data-theme, a meta tag color-scheme e o localStorage
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

  // Sincroniza mudança de tema entre abas do navegador (storage event)
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
          borderRadius: 4,
          borderRadiusLG: 4,
          borderRadiusSM: 3,
          boxShadow: 'none',
          boxShadowSecondary: 'none',
          motionDurationMid: '0.12s',
          motionDurationSlow: '0.15s',
          fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
        },
        components: {
          Table: {
            headerBg: activeTokens.bgElevated,
            headerColor: activeTokens.textSecondary,
            headerSplitColor: activeTokens.borderDefault,
            borderColor: activeTokens.borderSubtle,
            rowHoverBg: activeTokens.bgSubtle,
            cellPaddingBlock: 10,
            cellPaddingInline: 12
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
                <strong style={{ color: 'var(--text-primary)' }}>
                  Distribuidora Vetor — Inteligência Comercial Multi-Tenant
                </strong>
              </div>

              <span className="tabular-nums">
                Sistema de Tokens: {activeTokens.label} · Flat Design Estrito (1px Solid / 0 Shadow)
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ConfigProvider>
  );
}
