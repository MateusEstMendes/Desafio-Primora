import React from 'react';
import { Select } from 'antd';
import { BarChartOutlined, BuildOutlined, TeamOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import './componentsCSS/TopBar.css';

const navItems = [
  { key: 'visao-geral', label: 'Visão Executiva', short: 'Visão', icon: <BarChartOutlined /> },
  { key: 'comparativo', label: 'Comparativo Regional', short: 'Comparativo', icon: <BuildOutlined /> },
  { key: 'historico-clientes', label: 'Jornada de Clientes', short: 'Jornada', icon: <TeamOutlined /> }
];

export default function TopBar({ currentTab, onTabChange, selectedTenantId, onTenantChange, tenants = [], themeMode, onToggleTheme }) {
  const brand = <><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M7 31 17 21 23 24 35 8M16 21l-3-8M23 24l3-10" /></svg></span><span className="brand-word">Primora</span></>;
  const scope = <Select aria-label="Filtrar por unidade regional" value={selectedTenantId} onChange={onTenantChange}
    options={[{ value: 'todos', label: 'Todas as regionais' }, ...tenants.map(t => ({ value: t.id, label: t.regiao || t.nome }))]}
    popupMatchSelectWidth={false} className="reference-scope" />;
  const themeButton = <button type="button" className="reference-theme" onClick={onToggleTheme} aria-label={themeMode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}>
    {themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}<span>{themeMode === 'light' ? 'Claro' : 'Escuro'}</span>
  </button>;
  return <>
    <aside className="reference-sidebar" aria-label="Navegação principal">
      <div><a className="reference-brand" href="#" onClick={e => { e.preventDefault(); onTabChange('visao-geral'); }}>{brand}</a>
        <p className="reference-company">Distribuidora Vetor</p>
        <nav className="reference-desktop-nav">{navItems.map((item, i) => <button type="button" key={item.key} onClick={() => onTabChange(item.key)} aria-current={currentTab === item.key ? 'page' : undefined}>
          <span>{String(i + 1).padStart(2, '0')}</span>{item.label}
        </button>)}</nav>
      </div>
      <div className="reference-sidebar-bottom"><label className="scope-label">Unidade regional</label>{scope}{themeButton}</div>
    </aside>
    <header className="reference-mobile-header"><a className="reference-brand" href="#" onClick={e => { e.preventDefault(); onTabChange('visao-geral'); }}>{brand}</a>{themeButton}</header>
    <div className="reference-mobile-scope">{scope}</div>
    <nav className="reference-bottom-nav" aria-label="Navegação principal mobile">{navItems.map(item => <button type="button" key={item.key} onClick={() => onTabChange(item.key)} aria-current={currentTab === item.key ? 'page' : undefined}>
      {item.icon}<span>{item.short}</span>
    </button>)}</nav>
  </>;
}
