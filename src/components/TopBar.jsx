import React from 'react';
import { motion } from 'motion/react';
import { BarChartOutlined, BuildOutlined, TeamOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import ScopeSelector from './ScopeSelector';
import { SPRING_PILL } from './MotionPrimitives';
import './componentsCSS/TopBar.css';

const navItems = [
  { key: 'visao-geral', label: 'Visão Executiva', short: 'Visão', icon: <BarChartOutlined /> },
  { key: 'comparativo', label: 'Comparativo Regional', short: 'Comparativo', icon: <BuildOutlined /> },
  { key: 'historico-clientes', label: 'Jornada de Clientes', short: 'Jornada', icon: <TeamOutlined /> }
];

export default function TopBar({
  isMobile = false,
  currentTab,
  onTabChange,
  selectedTenantId,
  onTenantChange,
  tenants = [],
  themeMode,
  onToggleTheme
}) {
  const logoSrc = themeMode === 'light' ? '/primora-logo.png' : '/primora-logo-white.png';
  const brand = (
    <img
      src={logoSrc}
      alt="Primora"
      className="primora-brand-img sidebar-brand-logo"
    />
  );

  const themeButton = (
    <button
      type="button"
      className="reference-theme"
      onClick={onToggleTheme}
      aria-label={themeMode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
    >
      {themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}
      <span>{themeMode === 'light' ? 'Claro' : 'Escuro'}</span>
    </button>
  );


  if (isMobile) {
    return (
      <>
        {/* HEADER MOBILE / TABLET (< 1024px) */}
        <header className="reference-mobile-header">
          <a
            className="reference-brand"
            href="#"
            onClick={e => {
              e.preventDefault();
              onTabChange('visao-geral');
            }}
          >
            {brand}
          </a>
          <div className="mobile-header-controls">
            <ScopeSelector
              value={selectedTenantId}
              onChange={onTenantChange}
              tenants={tenants}
              isMobile={true}
            />
            {themeButton}
          </div>
        </header>

        {/* NAVEGAÇÃO INFERIOR MOBILE (< 1024px) */}
        <nav className="reference-bottom-nav" aria-label="Navegação principal mobile">
          {navItems.map(item => (
            <button
              type="button"
              key={item.key}
              onClick={() => onTabChange(item.key)}
              aria-current={currentTab === item.key ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.short}</span>
            </button>
          ))}
        </nav>
      </>
    );
  }

  // DESKTOP (>= 1024px)
  return (
    <aside className="reference-sidebar" aria-label="Navegação principal">
      <div className="reference-sidebar-top">
        <a
          className="reference-brand"
          href="#"
          onClick={e => {
            e.preventDefault();
            onTabChange('visao-geral');
          }}
        >
          {brand}
        </a>
        <p className="reference-company">Distribuidora Vetor</p>

        {/* Seletor de Escopo Regional no Topo (Acessível, Rápido e Sem Quebra) */}
        <div className="reference-sidebar-scope-box">
          <label className="scope-label">
            Unidade Regional
          </label>
          <ScopeSelector
            value={selectedTenantId}
            onChange={onTenantChange}
            tenants={tenants}
            isMobile={false}
          />
        </div>

        <nav className="reference-desktop-nav">
          {navItems.map((item, i) => {
            const isActive = currentTab === item.key;
            return (
              <motion.button
                type="button"
                key={item.key}
                whileTap={{ scale: 0.985 }}
                onClick={() => onTabChange(item.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-nav-pill"
                    className="sidebar-nav-pill"
                    transition={SPRING_PILL}
                    aria-hidden="true"
                  />
                )}
                <span className="nav-index">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="reference-sidebar-bottom">
        {themeButton}
      </div>
    </aside>
  );
}
