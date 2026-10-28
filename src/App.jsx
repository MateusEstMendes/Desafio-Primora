import React, { useState } from 'react';
import {
  Layout,
  Menu,
  ConfigProvider,
  Typography,
  Space,
  Tag,
  Button,
  Drawer,
  Grid
} from 'antd';
import {
  DashboardOutlined,
  BarChartOutlined,
  UserOutlined,
  MenuOutlined
} from '@ant-design/icons';
import ptBR from 'antd/locale/pt_BR';

// Importação do dataset JSON oficial/local (conforme Requisitos 3.5 e RF01-RF12)
import datasetLocal from './data/dataset_painel_multitenant.json';

// Componentes
import AcademicBanner from './components/AcademicBanner';
import VisaoGeral from './pages/VisaoGeral';
import Comparativo from './pages/Comparativo';
import HistoricoClientes from './pages/HistoricoClientes';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

export default function App() {
  const [currentTab, setCurrentTab] = useState('visao-geral');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const screens = useBreakpoint();

  // Define se a tela atual é considerada mobile (menor que breakpoint md / 768px)
  const isMobile = !screens.md;

  const menuItems = [
    {
      key: 'visao-geral',
      icon: <DashboardOutlined />,
      label: '1. Visão Geral'
    },
    {
      key: 'comparativo',
      icon: <BarChartOutlined />,
      label: '2. Comparativo entre Unidades'
    },
    {
      key: 'historico-clientes',
      icon: <UserOutlined />,
      label: '3. Histórico de Clientes'
    }
  ];

  const handleMenuClick = (key) => {
    setCurrentTab(key);
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#684cb1', // Primora Purple
          colorInfo: '#0ed5fa',    // Primora Electric Cyan
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 10,
          fontFamily: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
        },
        components: {
          Card: {
            headerBg: 'transparent',
            headerFontSize: 15
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#1e293b',
            headerSplitColor: 'transparent',
            rowHoverBg: '#f1f5f9'
          },
          Tag: {
            borderRadiusSM: 6
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Cabeçalho Primora Tech com Navegação 100% Centralizada */}
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 28px',
            backgroundColor: '#141f2b', // Fundo institucional Primora
            boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
            height: isMobile ? 62 : 72,
            lineHeight: 'normal',
            borderBottom: '2px solid transparent',
            borderImage: 'linear-gradient(90deg, #684cb1 0%, #0ed5fa 50%, #684cb1 100%) 1'
          }}
        >
          {/* Coluna Esquerda: Logo e Identidade Primora + Vetor */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: isMobile ? 'initial' : '1 1 0',
              minWidth: isMobile ? 'auto' : 250
            }}
          >
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textDecoration: 'none'
              }}
            >
              <img
                src="/primora-logo-white.webp"
                alt="Primora Soluções em Tecnologia"
                style={{
                  height: isMobile ? 28 : 34,
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
              <div
                style={{
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  paddingLeft: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  lineHeight: 1.2
                }}
              >
                <div
                  style={{
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: isMobile ? 12 : 14,
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  DISTRIBUIDORA VETOR
                </div>
                <div
                  style={{
                    color: '#0ed5fa',
                    fontSize: isMobile ? 9 : 10,
                    fontWeight: '700',
                    letterSpacing: '0.4px',
                    marginTop: 3,
                    whiteSpace: 'nowrap'
                  }}
                >
                  PAINEL MULTI-TENANT
                </div>
              </div>
            </a>
          </div>

          {/* Coluna Central: Navegação Perfeitamente Centralizada */}
          {!isMobile ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flex: '2 1 auto'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  padding: '5px 6px',
                  borderRadius: 12,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
                }}
              >
                {menuItems.map((item) => {
                  const active = currentTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleMenuClick(item.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 18px',
                        borderRadius: 8,
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        background: active
                          ? 'linear-gradient(135deg, #684cb1 0%, #533898 100%)'
                          : 'transparent',
                        color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                        fontSize: 13,
                        fontWeight: active ? '700' : '600',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: active ? '0 4px 12px rgba(104, 76, 177, 0.45)' : 'none',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = '#0ed5fa';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          color: active ? '#0ed5fa' : 'inherit',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Botão Hambúrguer Mobile */
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: '#0ed5fa', fontSize: 22 }} />}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Abrir menu"
            />
          )}

          {/* Coluna Direita: Badges de Resumo com mesma largura para equilíbrio perfeito */}
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flex: '1 1 0',
                minWidth: 250
              }}
            >
              <Space size="small">
                <Tag
                  style={{
                    margin: 0,
                    backgroundColor: 'rgba(104, 76, 177, 0.25)',
                    color: '#c4b5fd',
                    border: '1px solid rgba(104, 76, 177, 0.5)',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 6
                  }}
                >
                  4 Tenants
                </Tag>
                <Tag
                  style={{
                    margin: 0,
                    backgroundColor: 'rgba(14, 213, 250, 0.15)',
                    color: '#0ed5fa',
                    border: '1px solid rgba(14, 213, 250, 0.4)',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 6
                  }}
                >
                  3 Clientes
                </Tag>
              </Space>
            </div>
          )}
        </Header>

        {/* Drawer de Navegação para Celulares */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/primora-logo.png" alt="Primora" height={24} />
              <span style={{ fontWeight: '700', color: '#141f2b' }}>Primora & Vetor</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={280}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Módulos de Inteligência
            </Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentTab]}
            onClick={(e) => handleMenuClick(e.key)}
            items={menuItems}
            style={{ borderRight: 'none', fontSize: 14, fontWeight: 600 }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 20,
              right: 20,
              background: 'linear-gradient(135deg, rgba(104, 76, 177, 0.08) 0%, rgba(14, 213, 250, 0.08) 100%)',
              padding: 14,
              borderRadius: 10,
              border: '1px solid rgba(104, 76, 177, 0.2)'
            }}
          >
            <Text strong style={{ fontSize: 12, color: '#684cb1', display: 'block', marginBottom: 4 }}>
              Projeto Integrador
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 8 }}>
              Bolsa Futuro Digital · Desafio Técnico 2
            </Text>
            <Space wrap size={[4, 4]}>
              <Tag color="purple">Vetor</Tag>
              <Tag color="cyan">Dados Fictícios</Tag>
            </Space>
          </div>
        </Drawer>

        {/* Barra de Navegação Rápida Inferior (Bottom Nav Mobile) */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999,
              backgroundColor: '#141f2b',
              borderTop: '1px solid rgba(14, 213, 250, 0.3)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              height: 58,
              boxShadow: '0 -4px 16px rgba(0,0,0,0.2)'
            }}
          >
            {menuItems.map((item) => {
              const active = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentTab(item.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: active ? '#0ed5fa' : 'rgba(255,255,255,0.55)',
                    fontSize: 10,
                    fontWeight: active ? '700' : '500',
                    padding: '4px 8px',
                    flex: 1,
                    transition: 'color 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: 19, marginBottom: 2 }}>{item.icon}</span>
                  <span>{item.label.replace(/^\d\.\s*/, '')}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Área de Conteúdo */}
        <Content
          style={{
            padding: isMobile ? '14px 12px 76px 12px' : '28px 36px',
            maxWidth: 1400,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Banner de Identificação Acadêmica */}
          <AcademicBanner isMobile={isMobile} />

          {/* Renderização Condicional das Telas */}
          {currentTab === 'visao-geral' && <VisaoGeral dataset={datasetLocal} isMobile={isMobile} />}
          {currentTab === 'comparativo' && <Comparativo dataset={datasetLocal} isMobile={isMobile} />}
          {currentTab === 'historico-clientes' && <HistoricoClientes dataset={datasetLocal} isMobile={isMobile} />}
        </Content>

        {/* Rodapé Corporativo Primora */}
        <Footer
          style={{
            textAlign: 'center',
            backgroundColor: '#141f2b',
            color: 'rgba(255,255,255,0.7)',
            padding: isMobile ? '24px 16px 84px 16px' : '32px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <img src="/primora-logo-white.webp" alt="Primora" height={22} style={{ opacity: 0.85 }} />
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
            <Text strong style={{ color: '#ffffff', fontSize: 13 }}>
              Distribuidora Vetor
            </Text>
          </div>
          <Text style={{ fontSize: isMobile ? 11 : 12, color: 'rgba(255,255,255,0.55)', display: 'block' }}>
            Projeto Integrador — Bolsa Futuro Digital · Desafio Técnico 2 (Frontend ReactJS + Ant Design)
          </Text>
          <div style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
              Identidade visual inspirada em Primora Soluções em Tecnologia · Protótipo Acadêmico com Dados Fictícios
            </Text>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
