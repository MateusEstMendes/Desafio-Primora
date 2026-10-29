import React from 'react';
import { Select, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import './componentsCSS/TopBar.css';

export default function TopBar({
  currentTab,
  onTabChange,
  selectedTenantId,
  onTenantChange,
  tenants = [],
  themeMode,
  onToggleTheme,
  isMobile,
  mobileDrawerOpen,
  setMobileDrawerOpen
}) {
  const navItems = [
    { key: 'visao-geral', step: '01', label: 'Visão Executiva' },
    { key: 'comparativo', step: '02', label: 'Comparativo Regional' },
    { key: 'historico-clientes', step: '03', label: 'Jornada de Clientes' }
  ];

  const tenantOptions = [
    {
      value: 'todos',
      label: 'Todas as Unidades (Consolidado)'
    },
    ...tenants.map((t) => ({
      value: t.id,
      label: `${t.nome} · Porte ${t.porte}`
    }))
  ];

  const handleNavSelect = (key) => {
    onTabChange(key);
    if (mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  };

  return (
    <>
      <header className="topbar-header">
        <div className="topbar-inner">
          {/* Identidade Institucional Primora + Distribuidora Vetor */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleNavSelect('visao-geral');
            }}
            className="topbar-brand"
          >
            <img
              src={themeMode === 'dark' ? '/primora-logo-white.webp' : '/primora-logo.png'}
              alt="Primora Soluções em Tecnologia"
              className="topbar-logo"
            />
            <span className="topbar-brand-divider" aria-hidden="true" />
            <div className="topbar-brand-titles">
              <span className="topbar-company-name">Distribuidora Vetor</span>
              <span className="topbar-system-label">MULTI-TENANT INTELLIGENCE</span>
            </div>
          </a>

          {/* Navegação Central Desktop — Nav Glass Buttons (DESIGN.md) */}
          {!isMobile && (
            <nav className="topbar-nav" aria-label="Módulos do painel">
              {navItems.map((item) => {
                const isActive = currentTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavSelect(item.key)}
                    className={`topbar-nav-btn ${isActive ? 'topbar-nav-btn--active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="topbar-nav-step">{item.step}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Controles Globais: Escopo Multi-Tenant + Alternador Tema + Primary White CTA */}
          <div className="topbar-controls">
            {!isMobile && (
              <div className="topbar-tenant-control">
                <label htmlFor="global-tenant-select" className="topbar-control-label">
                  ESCOPO
                </label>
                <Select
                  id="global-tenant-select"
                  value={selectedTenantId}
                  onChange={onTenantChange}
                  options={tenantOptions}
                  style={{ width: 250 }}
                  size="middle"
                  aria-label="Selecionar unidade regional (tenant)"
                />
              </div>
            )}

            <button
              type="button"
              onClick={onToggleTheme}
              className="topbar-theme-toggle"
              aria-label={
                themeMode === 'dark'
                  ? 'Alternar para modo claro (Silver Day)'
                  : 'Alternar para modo escuro (Obsidian Gallery)'
              }
              title="Alternar tema visual (Obsidian Dark / Silver Light)"
            >
              <span
                className={`geo-dot ${themeMode === 'dark' ? 'geo-dot--cyan' : 'geo-dot--brand'}`}
                aria-hidden="true"
              />
              <span>{themeMode === 'dark' ? 'OBSIDIAN' : 'SILVER'}</span>
            </button>

            {!isMobile && (
              <button
                type="button"
                className="topbar-primary-cta"
                onClick={() => {
                  onTenantChange('tenant-centro-oeste');
                  handleNavSelect('comparativo');
                }}
                title="Auditar a unidade mais crítica agora (Unidade Centro-Oeste)"
              >
                <span>Auditar Críticos</span>
                <span aria-hidden="true">&rarr;</span>
              </button>
            )}

            {isMobile && (
              <Button
                type="default"
                icon={<MenuOutlined />}
                onClick={() => setMobileDrawerOpen(true)}
                aria-label="Abrir menu de navegação"
              />
            )}
          </div>

          {/* Sub-barra Mobile com Seletor Global Multi-Tenant sempre visível */}
          {isMobile && (
            <div className="topbar-mobile-subbar">
              <span className="topbar-control-label">ESCOPO</span>
              <Select
                value={selectedTenantId}
                onChange={onTenantChange}
                options={tenantOptions}
                style={{ flex: 1 }}
                size="small"
                aria-label="Selecionar unidade regional (tenant)"
              />
            </div>
          )}
        </div>
      </header>

      {/* Drawer Mobile */}
      <Drawer
        title="Módulos de Inteligência"
        placement="right"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        width={280}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavSelect(item.key)}
                className={`topbar-nav-btn ${isActive ? 'topbar-nav-btn--active' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 14px' }}
              >
                <span className="topbar-nav-step">{item.step}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </Drawer>

      {/* Barra Inferior Mobile */}
      {isMobile && (
        <nav className="mobile-bottom-nav" aria-label="Navegação rápida mobile">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavSelect(item.key)}
                className={`mobile-bottom-nav-btn ${isActive ? 'mobile-bottom-nav-btn--active' : ''}`}
              >
                <span className="tabular-nums">{item.step}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </>
  );
}
