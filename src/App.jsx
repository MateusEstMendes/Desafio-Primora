import React, { useState, useEffect } from 'react';
import { ConfigProvider, Grid, theme as antdTheme } from 'antd';
import ptBR from 'antd/locale/pt_BR';

import datasetLocal from './data/dataset_painel_multitenant.json';
import { THEME_TOKENS } from './utils/themeTokens';

import TopBar from './components/TopBar';
import DaoDemoModal from './components/DaoDemoModal';
import VisaoGeral from './pages/VisaoGeral';
import Comparativo from './pages/Comparativo';
import HistoricoClientes from './pages/HistoricoClientes';
import './components/componentsCSS/ReferenceSystem.css';

const { useBreakpoint } = Grid;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)', margin: 24 }}>
          <h3 style={{ color: 'var(--status-critical, #EF4444)', marginBottom: 8 }}>Ops, ocorreu um erro ao carregar esta visualização</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>{this.state.error?.message || 'Erro inesperado no componente.'}</p>
          <button
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--brand-primary, #0074FF)',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
          >
            Recarregar visualização
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function getInitialThemeMode() {
  try {
    const stored = localStorage.getItem('color-scheme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch (e) {}
  return 'light';
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
  const [focusedClientId, setFocusedClientId] = useState(null);
  const [isDaoDemoOpen, setIsDaoDemoOpen] = useState(false);

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
    const baseClientIds = new Set((datasetLocal.clientes || []).map((c) => c.id));
    const addedClients = (clientes || []).filter((c) => !baseClientIds.has(c.id));

    const enrichedTenants = (datasetLocal.tenants || []).map((t) => {
      const extraForThisTenant = addedClients.filter((c) => c.tenantId === t.id);
      if (extraForThisTenant.length === 0) return t;

      const saudeUpdated = { ...(t.saudeCarteira || { saudavel: 0, atencao: 0, risco: 0, critico: 0 }) };
      extraForThisTenant.forEach((c) => {
        const status = (c.statusSaude || '').toLowerCase();
        if (status.includes('saud')) saudeUpdated.saudavel = (saudeUpdated.saudavel || 0) + 1;
        else if (status.includes('aten')) saudeUpdated.atencao = (saudeUpdated.atencao || 0) + 1;
        else if (status.includes('crit')) saudeUpdated.critico = (saudeUpdated.critico || 0) + 1;
        else saudeUpdated.risco = (saudeUpdated.risco || 0) + 1;
      });

      return {
        ...t,
        carteiraTotalClientes: (t.carteiraTotalClientes || 0) + extraForThisTenant.length,
        saudeCarteira: saudeUpdated,
        novosClientesAdicionados: extraForThisTenant.length
      };
    });

    return {
      ...datasetLocal,
      tenants: enrichedTenants,
      clientes
    };
  }, [clientes]);

  const screens = useBreakpoint();
  const isMobile = screens.lg !== undefined ? !screens.lg : (typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

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
          isMobile={isMobile}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          selectedTenantId={selectedTenantId}
          onTenantChange={setSelectedTenantId}
          tenants={dynamicDataset.tenants}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
          onOpenDaoDemo={() => setIsDaoDemoOpen(true)}
        />

        <main className="app-main-content">
          <ErrorBoundary key={currentTab} onReset={() => setCurrentTab('visao-geral')}>
            {currentTab !== 'visao-geral' && (
              <header className="module-heading">
                <span>{currentTab === 'comparativo' ? 'Distribuidora Vetor · Camada Tática (Benchmarking)' : 'Distribuidora Vetor · Camada Operacional (Supervisão & Ação)'}</span>
                <h1>{currentTab === 'comparativo' ? 'Comparativo Regional' : 'Jornada de Clientes'}</h1>
                <p>{currentTab === 'comparativo' ? 'Metamorfose adaptativa de matriz tabular para cartões autônomos contextuais.' : 'Triagem cronológica de eventos em tempo real e mitigação de risco da carteira.'}</p>
              </header>
            )}
            {currentTab === 'visao-geral' && (
              <VisaoGeral
                dataset={dynamicDataset}
                isMobile={isMobile}
                selectedTenantId={selectedTenantId}
                onSelectTenant={setSelectedTenantId}
                onNavigateTab={setCurrentTab}
                themeTokens={activeTokens}
                onOpenClient={(client) => {
                  setFocusedClientId(client.id);
                  setSelectedTenantId(client.tenantId);
                  setCurrentTab('historico-clientes');
                }}
              />
            )}

            {currentTab === 'comparativo' && (
              <Comparativo
                dataset={dynamicDataset}
                isMobile={isMobile}
                selectedTenantId={selectedTenantId}
                onSelectTenant={setSelectedTenantId}
                themeTokens={activeTokens}
                onNavigateTab={setCurrentTab}
                onAddCliente={handleAddCliente}
                onUpdateCliente={handleUpdateCliente}
                onDeleteCliente={handleDeleteCliente}
              />
            )}

            {currentTab === 'historico-clientes' && (
              <HistoricoClientes
                initialClientId={focusedClientId}
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
          </ErrorBoundary>
        </main>

        <DaoDemoModal
          open={isDaoDemoOpen}
          onClose={() => setIsDaoDemoOpen(false)}
        />
      </div>
    </ConfigProvider>
  );
}
