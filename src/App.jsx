import React, { useState, useEffect } from 'react';
import { Alert, Button, Empty, Spin, ConfigProvider, Grid, theme as antdTheme } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { MotionConfig, AnimatePresence } from 'motion/react';

import { UnidadeDAO, ClienteDAO } from './dao/index.js';
import { THEME_TOKENS } from './utils/themeTokens';

import TopBar from './components/TopBar';
import { PageTransition } from './components/MotionPrimitives';
import VisaoGeral from './pages/VisaoGeral';
import Comparativo from './pages/Comparativo';
import HistoricoClientes from './pages/HistoricoClientes';
import './components/componentsCSS/ReferenceSystem.css';

const { useBreakpoint } = Grid;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, erro: null };
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
              this.setState({ hasError: false, erro: null });
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

export default function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral');
  const [selectedTenantId, setSelectedTenantId] = useState('todos');
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [dadosPainel, definirDados] = useState({ tenants: [], clientes: [] });
  const [estadoCarga, definirEstadoCarga] = useState({ carregando: true, erro: null });
  const [tentativa, definirTentativa] = useState(0);
  const [focusedClientId, setFocusedClientId] = useState(null);

  useEffect(() => {
    // O cleanup impede que uma resposta antiga substitua a carga mais recente.
    let cargaAtual = true;
    definirEstadoCarga({ carregando: true, erro: null });
    // Publica o painel somente quando as duas coleções estiverem disponíveis.
    Promise.all([new UnidadeDAO().listar(), new ClienteDAO().listar()])
      .then(([unidades, clientes]) => {
        if (!cargaAtual) return;
        definirDados({ tenants: unidades.map(u => u.toJSON()), clientes: clientes.map(c => c.toJSON()) });
        definirEstadoCarga({ carregando: false, erro: null });
      })
      .catch(error => { if (cargaAtual) definirEstadoCarga({ carregando: false, erro: error.message }); });
    return () => { cargaAtual = false; };
  }, [tentativa]);

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
    <MotionConfig reducedMotion="user">
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
          tenants={dadosPainel.tenants}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />

        <main className="app-main-content">
          {estadoCarga.carregando ? <Spin tip="Carregando dados da API…"><div style={{ minHeight: 240 }} /></Spin>
          : estadoCarga.erro ? <Alert type="error" showIcon message="Não foi possível carregar os dados" description={estadoCarga.erro} action={<Button onClick={() => definirTentativa(a => a + 1)}>Tentar novamente</Button>} />
          : dadosPainel.tenants.length === 0 && dadosPainel.clientes.length === 0 ? <Empty description="Nenhum resultado encontrado." />
          : <ErrorBoundary key={currentTab} onReset={() => setCurrentTab('visao-geral')}>
            <AnimatePresence mode="wait">
              <PageTransition pageKey={currentTab}>
                {currentTab === 'visao-geral' && (
                  <VisaoGeral
                    dataset={dadosPainel}
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
                    dataset={dadosPainel}
                    isMobile={isMobile}
                    selectedTenantId={selectedTenantId}
                    onSelectTenant={setSelectedTenantId}
                    themeTokens={activeTokens}
                    onNavigateTab={setCurrentTab}
                  />
                )}

                {currentTab === 'historico-clientes' && (
                  <HistoricoClientes
                    initialClientId={focusedClientId}
                    dataset={dadosPainel}
                    isMobile={isMobile}
                    selectedTenantId={selectedTenantId}
                    onSelectTenant={setSelectedTenantId}
                    themeTokens={activeTokens}
                  />
                )}
              </PageTransition>
            </AnimatePresence>
          </ErrorBoundary>}
        </main>

      </div>
    </ConfigProvider>
    </MotionConfig>
  );
}
