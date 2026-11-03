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

function getInitialClients() {
  try {
    const stored = localStorage.getItem('painel_vetor_clientes');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return datasetLocal.clientes || [];
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral');
  const [selectedTenantId, setSelectedTenantId] = useState('todos');
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [clientes, setClientes] = useState(getInitialClients);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Operações de CRUD para Clientes (Create, Read, Update, Delete) com persistência
  const handleAddCliente = (novoCliente) => {
    setClientes((prev) => {
      const updated = [novoCliente, ...prev];
      try {
        localStorage.setItem('painel_vetor_clientes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleUpdateCliente = (clienteAtualizado) => {
    setClientes((prev) => {
      const updated = prev.map((c) =>
        c.id === clienteAtualizado.id ? { ...c, ...clienteAtualizado } : c
      );
      try {
        localStorage.setItem('painel_vetor_clientes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteCliente = (clienteId) => {
    setClientes((prev) => {
      const updated = prev.filter((c) => c.id !== clienteId);
      try {
        localStorage.setItem('painel_vetor_clientes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const dynamicDataset = React.useMemo(() => {
    return {
      ...datasetLocal,
      clientes
    };
  }, [clientes]);

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
          tenants={dynamicDataset.tenants}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />

        <main className="app-main-content">
          {currentTab === 'visao-geral' && (
            <VisaoGeral
              dataset={dynamicDataset}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              onNavigateTab={setCurrentTab}
              themeTokens={activeTokens}
            />
          )}

          {currentTab === 'comparativo' && (
            <Comparativo
              dataset={dynamicDataset}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              themeTokens={activeTokens}
            />
          )}

          {currentTab === 'historico-clientes' && (
            <HistoricoClientes
              dataset={dynamicDataset}
              isMobile={isMobile}
              selectedTenantId={selectedTenantId}
              onSelectTenant={setSelectedTenantId}
              themeTokens={activeTokens}
              onAddCliente={handleAddCliente}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
            />
          )}
        </main>

        <footer className="app-footer">
          <div className="app-footer-inner">
            <AcademicBanner />

            <div className="app-footer-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src="/primora-logo-white.webp"
                  alt="Primora"
                  className="primora-brand-img"
                  style={{ height: 18, width: 'auto', display: 'block' }}
                />
                <span>·</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
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
