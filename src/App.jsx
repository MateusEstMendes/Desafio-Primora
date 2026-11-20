import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Alert, Button, Empty, Spin, ConfigProvider, Grid, message, theme as antdTheme } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ptBR from 'antd/locale/pt_BR';
import { MotionConfig, AnimatePresence } from 'motion/react';

import { UnidadeDAO, ClienteDAO } from './dao/index.js';
import { THEME_TOKENS, applyThemeTokens } from './utils/themeTokens';
import {
  carregarClientesLocais,
  salvarClientesLocais,
  limparClientesLocais,
  classificarSaudePorScore,
  gerarProximoIdCliente,
  gerarIdEvento,
  calcularDataExclusao,
  expurgarClientesExpirados
} from './utils/clienteStorage.js';
import {
  sincronizarSoftDeleteSupabase,
  sincronizarReativacaoSupabase,
  sincronizarExclusaoDefinitivaSupabase,
  sincronizarUpsertClienteSupabase
} from './services/supabaseSync.js';
import defaultDataset from '../server/data/dataset_painel_multitenant.json';

import TopBar from './components/TopBar';
import { PageTransition } from './components/MotionPrimitives';
import VisaoGeral from './pages/VisaoGeral';
import Comparativo from './pages/Comparativo';
import HistoricoClientes from './pages/HistoricoClientes';
import './components/componentsCSS/ReferenceSystem.css';

const { useBreakpoint } = Grid;
const MODULES = {
  'visao-geral': 'Visão Executiva',
  comparativo: 'Comparativo Regional',
  'historico-clientes': 'Jornada de Clientes'
};

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
        <div style={{ padding: 32, textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 12, boxShadow: 'var(--shadow-card)', margin: 24 }}>
          <h3 style={{ color: 'var(--status-critical, #EF4444)', marginBottom: 8 }}>Ops, ocorreu um erro ao carregar esta visualização</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 13 }}>{this.state.error?.message || 'Erro inesperado no componente.'}</p>
          <button
            type="button"
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--brand-solid, #2563EB)',
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
  const [modoOffline, setModoOffline] = useState(false);

  useEffect(() => {
    // O cleanup impede que uma resposta antiga substitua a carga mais recente.
    let cargaAtual = true;
    definirEstadoCarga({ carregando: true, erro: null });
    // Publica o painel somente quando as duas coleções estiverem disponíveis.
    Promise.all([new UnidadeDAO().listar(), new ClienteDAO().listar()])
      .then(([unidades, clientes]) => {
        if (!cargaAtual) return;
        const clientesAPI = clientes.map(c => c.toJSON());
        const clientesLocais = carregarClientesLocais();
        const clientesBase = clientesLocais && clientesLocais.length > 0 ? clientesLocais : clientesAPI;

        // Purga automática dos clientes cuja carência de 15 dias já expirou
        const { clientesRestantes, clientesExpurgados } = expurgarClientesExpirados(clientesBase);
        if (clientesExpurgados.length > 0) {
          clientesExpurgados.forEach(c => sincronizarExclusaoDefinitivaSupabase(c.id));
        }
        salvarClientesLocais(clientesRestantes);

        definirDados({
          tenants: unidades.map(u => u.toJSON()),
          clientes: clientesRestantes
        });
        setModoOffline(false);
        definirEstadoCarga({ carregando: false, erro: null });
      })
      .catch(() => {
        if (!cargaAtual) return;
        // Fallback gracioso para dados locais quando a API local não está rodando (ex: apenas Vite na porta 5173)
        const clientesLocais = carregarClientesLocais() || defaultDataset.clientes;
        const { clientesRestantes, clientesExpurgados } = expurgarClientesExpirados(clientesLocais);
        if (clientesExpurgados.length > 0) {
          clientesExpurgados.forEach(c => sincronizarExclusaoDefinitivaSupabase(c.id));
        }
        salvarClientesLocais(clientesRestantes);

        definirDados({
          tenants: defaultDataset.tenants,
          clientes: clientesRestantes
        });
        setModoOffline(true);
        definirEstadoCarga({ carregando: false, erro: null });
      });
    return () => { cargaAtual = false; };
  }, [tentativa]);

  // Handlers de Gestão (CRUD) de Clientes
  const handleAddCliente = (novoClienteData) => {
    definirDados((prev) => {
      const id = gerarProximoIdCliente(prev.clientes);
      const tenantId = novoClienteData.tenantId;
      const tenantObj = prev.tenants.find((t) => t.id === tenantId);
      const score = Number(novoClienteData.scoreSaudeAtual ?? 80);
      const statusSaude = classificarSaudePorScore(score);

      // Gera série inicial de 6 meses até o mês atual/score informado
      const mesesPadrao = ['Mai/2026', 'Jun/2026', 'Jul/2026', 'Ago/2026', 'Set/2026', 'Out/2026'];
      const historicoScore = mesesPadrao.map((periodo, idx) => {
        const scorePasso = Math.max(0, Math.min(100, Math.round(score - (mesesPadrao.length - 1 - idx) * 2)));
        return { periodo, score: idx === mesesPadrao.length - 1 ? score : scorePasso };
      });

      const initialEvent = {
        id: gerarIdEvento(),
        data: new Date().toISOString(),
        tipo: 'Início de Contrato',
        categoria: 'sucesso',
        descricao: `Contrato iniciado com a unidade ${tenantObj?.nome || tenantId}. Monitoramento de saúde ativo.`,
        valor: novoClienteData.ticketMedioMensal || null
      };

      const novoCliente = {
        id,
        nome: novoClienteData.nome.trim(),
        tenantId,
        tenantNome: tenantObj?.nome || tenantId,
        unidadeNome: tenantObj?.nome || tenantId,
        segmento: novoClienteData.segmento,
        ticketMedioMensal: novoClienteData.ticketMedioMensal,
        tempoContratoMeses: Number(novoClienteData.tempoContratoMeses ?? 12),
        scoreSaudeAtual: score,
        statusSaude,
        historicoScore,
        healthSeries: historicoScore,
        eventos: [initialEvent],
        ativo: true,
        desativadoEm: null,
        excluirEm: null,
        isNovo: true
      };

      const atualizados = [novoCliente, ...prev.clientes];
      salvarClientesLocais(atualizados);
      sincronizarUpsertClienteSupabase(novoCliente);
      setFocusedClientId(novoCliente.id);
      message.success(`Cliente ${novoCliente.nome} (${novoCliente.id}) adicionado com sucesso!`);
      return { ...prev, clientes: atualizados };
    });
  };

  const handleUpdateCliente = (clienteAtualizado) => {
    definirDados((prev) => {
      const tenantObj = prev.tenants.find((t) => t.id === clienteAtualizado.tenantId);
      const score = Number(clienteAtualizado.scoreSaudeAtual ?? 80);
      const statusSaude = classificarSaudePorScore(score);

      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteAtualizado.id) return c;
        const hist = [...(c.historicoScore || [])];
        if (hist.length > 0) {
          hist[hist.length - 1] = { ...hist[hist.length - 1], score };
        }
        const merged = {
          ...c,
          ...clienteAtualizado,
          tenantNome: tenantObj?.nome || c.tenantNome,
          unidadeNome: tenantObj?.nome || c.unidadeNome,
          scoreSaudeAtual: score,
          statusSaude,
          historicoScore: hist,
          healthSeries: hist
        };
        sincronizarUpsertClienteSupabase(merged);
        return merged;
      });

      salvarClientesLocais(atualizados);
      message.success(`Dados de ${clienteAtualizado.nome} atualizados com sucesso!`);
      return { ...prev, clientes: atualizados };
    });
  };

  // Soft-Delete: Desativa e agenda exclusão definitiva em 15 dias corridos
  const handleDeleteCliente = (clienteId) => {
    definirDados((prev) => {
      const clienteAlvo = prev.clientes.find((c) => c.id === clienteId);
      if (!clienteAlvo) return prev;

      const desativadoEm = new Date().toISOString();
      const excluirEm = calcularDataExclusao(desativadoEm);

      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        return {
          ...c,
          ativo: false,
          desativadoEm,
          excluirEm
        };
      });

      salvarClientesLocais(atualizados);
      sincronizarSoftDeleteSupabase(clienteId, desativadoEm, excluirEm);

      const ativosRestantes = atualizados.filter((c) => c.ativo !== false);
      if (focusedClientId === clienteId) {
        setFocusedClientId(ativosRestantes[0]?.id || null);
      }

      message.warning(`Conta ${clienteAlvo.nome} desativada. A exclusão definitiva ocorrerá automaticamente em 15 dias.`);
      return { ...prev, clientes: atualizados };
    });
  };

  // Reativação da conta dentro do período de carência de 15 dias
  const handleReativarCliente = (clienteId) => {
    definirDados((prev) => {
      const clienteAlvo = prev.clientes.find((c) => c.id === clienteId);
      if (!clienteAlvo) return prev;

      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        return {
          ...c,
          ativo: true,
          desativadoEm: null,
          excluirEm: null
        };
      });

      salvarClientesLocais(atualizados);
      sincronizarReativacaoSupabase(clienteId);
      setFocusedClientId(clienteId);

      message.success(`Conta ${clienteAlvo.nome} reativada com sucesso!`);
      return { ...prev, clientes: atualizados };
    });
  };

  // Handlers de Gestão (CRUD) de Eventos
  const handleAddEvento = (clienteId, novoEvento) => {
    definirDados((prev) => {
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const evts = [
          ...(c.eventos || []),
          {
            id: gerarIdEvento(),
            ...novoEvento
          }
        ];
        return { ...c, eventos: evts };
      });
      salvarClientesLocais(atualizados);
      message.success('Evento registrado na jornada do cliente!');
      return { ...prev, clientes: atualizados };
    });
  };

  const handleUpdateEvento = (clienteId, eventoAtualizado) => {
    definirDados((prev) => {
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const evts = (c.eventos || []).map((e) =>
          e.id === eventoAtualizado.id ? { ...e, ...eventoAtualizado } : e
        );
        return { ...c, eventos: evts };
      });
      salvarClientesLocais(atualizados);
      message.success('Evento atualizado com sucesso!');
      return { ...prev, clientes: atualizados };
    });
  };

  const handleDeleteEvento = (clienteId, eventoId) => {
    definirDados((prev) => {
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const evts = (c.eventos || []).filter((e) => e.id !== eventoId);
        return { ...c, eventos: evts };
      });
      salvarClientesLocais(atualizados);
      return { ...prev, clientes: atualizados };
    });
  };

  // Handlers de Gestão de Meses / Histórico de Saúde
  const handleAddMesScore = (clienteId, { periodo, score }) => {
    definirDados((prev) => {
      const numScore = Number(score);
      const statusSaude = classificarSaudePorScore(numScore);
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const hist = [...(c.historicoScore || [])];
        const idxExistente = hist.findIndex((item) => item.periodo === periodo);
        if (idxExistente !== -1) {
          hist[idxExistente] = { ...hist[idxExistente], score: numScore };
        } else {
          hist.push({ periodo, score: numScore });
        }
        return {
          ...c,
          historicoScore: hist,
          healthSeries: hist,
          scoreSaudeAtual: numScore,
          statusSaude
        };
      });
      salvarClientesLocais(atualizados);
      return { ...prev, clientes: atualizados };
    });
  };

  const handleUpdateMesScore = (clienteId, periodoOriginal, { periodo, score }) => {
    definirDados((prev) => {
      const numScore = Number(score);
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const hist = (c.historicoScore || []).map((item) =>
          item.periodo === periodoOriginal ? { periodo: periodo || item.periodo, score: numScore } : item
        );
        const ultimo = hist[hist.length - 1];
        const ultimoScore = ultimo ? ultimo.score : c.scoreSaudeAtual;
        return {
          ...c,
          historicoScore: hist,
          healthSeries: hist,
          scoreSaudeAtual: ultimoScore,
          statusSaude: classificarSaudePorScore(ultimoScore)
        };
      });
      salvarClientesLocais(atualizados);
      return { ...prev, clientes: atualizados };
    });
  };

  const handleDeleteMesScore = (clienteId, periodo) => {
    definirDados((prev) => {
      const atualizados = prev.clientes.map((c) => {
        if (c.id !== clienteId) return c;
        const hist = (c.historicoScore || []).filter((item) => item.periodo !== periodo);
        const ultimo = hist[hist.length - 1];
        const ultimoScore = ultimo ? ultimo.score : c.scoreSaudeAtual;
        return {
          ...c,
          historicoScore: hist,
          healthSeries: hist,
          scoreSaudeAtual: ultimoScore,
          statusSaude: classificarSaudePorScore(ultimoScore)
        };
      });
      salvarClientesLocais(atualizados);
      return { ...prev, clientes: atualizados };
    });
  };

  const screens = useBreakpoint();
  const isMobile = screens.lg !== undefined ? !screens.lg : (typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  const activeTokens = THEME_TOKENS[themeMode] || THEME_TOKENS.dark;

  useLayoutEffect(() => {
    applyThemeTokens(themeMode);
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
          colorPrimary: activeTokens.brandSolid,
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
          colorTextTertiary: activeTokens.textMuted,
          colorTextPlaceholder: activeTokens.textMuted,
          borderRadius: 8,
          borderRadiusLG: 16,
          controlHeight: 40,
          borderRadiusSM: 8,
          boxShadow: activeTokens.shadowCard,
          boxShadowSecondary: activeTokens.shadowCard,
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
        <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
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

        <main id="main-content" className={`app-main-content${currentTab === 'visao-geral' ? ' app-main-content--executive' : ''}`} tabIndex={-1}>
          <h1 className="sr-only">{MODULES[currentTab]}</h1>
          {modoOffline && (
            <Alert
              type="info"
              showIcon
              closable
              message="Modo Local / Sincronização no Navegador Ativa"
              description="A API backend na porta 3001 não respondeu. O painel está totalmente funcional com armazenamento local (LocalStorage), permitindo adicionar, editar e excluir clientes, eventos e meses normalmente."
              action={
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button size="small" onClick={() => definirTentativa((a) => a + 1)}>
                    Reconectar à API
                  </Button>
                </div>
              }
              style={{ marginBottom: 16 }}
            />
          )}
          {estadoCarga.carregando ? <Spin tip="Carregando dados da API…"><div style={{ minHeight: 240 }} /></Spin>
          : estadoCarga.erro ? <Alert type="error" showIcon message="Não foi possível carregar os dados" description={estadoCarga.erro} action={<Button onClick={() => definirTentativa(a => a + 1)}>Tentar novamente</Button>} />
          : dadosPainel.tenants.length === 0 && dadosPainel.clientes.length === 0 ? <Empty description="Nenhum resultado encontrado." />
          : (() => {
            const clientesAtivos = dadosPainel.clientes.filter((c) => c.ativo !== false);
            const datasetAtivo = { tenants: dadosPainel.tenants, clientes: clientesAtivos };

            return (
              <ErrorBoundary key={currentTab} onReset={() => setCurrentTab('visao-geral')}>
                <AnimatePresence mode="wait">
                  <PageTransition pageKey={currentTab}>
                    {currentTab === 'visao-geral' && (
                      <VisaoGeral
                        dataset={datasetAtivo}
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
                        dataset={datasetAtivo}
                        isMobile={isMobile}
                        selectedTenantId={selectedTenantId}
                        onSelectTenant={setSelectedTenantId}
                        themeTokens={activeTokens}
                      />
                    )}

                    {currentTab === 'historico-clientes' && (
                      <HistoricoClientes
                        initialClientId={focusedClientId}
                        dataset={datasetAtivo}
                        isMobile={isMobile}
                        selectedTenantId={selectedTenantId}
                        onSelectTenant={setSelectedTenantId}
                        themeTokens={activeTokens}
                        onAddCliente={handleAddCliente}
                        onUpdateCliente={handleUpdateCliente}
                        onDeleteCliente={handleDeleteCliente}
                        onAddEvento={handleAddEvento}
                        onUpdateEvento={handleUpdateEvento}
                        onDeleteEvento={handleDeleteEvento}
                        onAddMesScore={handleAddMesScore}
                        onUpdateMesScore={handleUpdateMesScore}
                        onDeleteMesScore={handleDeleteMesScore}
                        clientesDesativados={dadosPainel.clientes.filter(c => c.ativo === false)}
                        onReativarCliente={handleReativarCliente}
                      />
                    )}
                  </PageTransition>
                </AnimatePresence>
              </ErrorBoundary>
            );
          })()}
        </main>

      </div>
    </ConfigProvider>
    </MotionConfig>
  );
}
