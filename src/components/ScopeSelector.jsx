import React, { useState, useRef, useEffect } from 'react';
import {
  DownOutlined,
  CheckOutlined,
  GlobalOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import './componentsCSS/ScopeSelector.css';

export default function ScopeSelector({
  value = 'todos',
  onChange,
  tenants = [],
  isMobile = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha ao clicar fora ou ao pressionar Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const options = [
    {
      value: 'todos',
      label: 'Todas as regionais',
      sublabel: 'Visão consolidada',
      icon: <GlobalOutlined />
    },
    ...tenants.map(t => ({
      value: t.id,
      label: t.regiao || t.nome,
      sublabel: `Porte ${t.porte || '-'} · ${t.carteiraTotalClientes || 0} contas`,
      icon: <EnvironmentOutlined />
    }))
  ];

  const currentOption = options.find(o => o.value === value) || options[0];

  const handleSelect = (val) => {
    onChange?.(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`scope-selector-container ${isMobile ? 'is-mobile' : 'is-desktop'} ${className} ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        className="scope-selector-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filtrar por unidade regional"
      >
        <span className="scope-trigger-icon" aria-hidden="true">
          {currentOption.icon}
        </span>
        <span className="scope-trigger-label">
          {currentOption.label}
        </span>
        <DownOutlined className={`scope-trigger-chevron ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="scope-selector-dropdown" role="listbox">
          <div className="scope-dropdown-header">
            <span>UNIDADE REGIONAL</span>
            <span className="scope-count">{tenants.length} unidades</span>
          </div>
          <div className="scope-dropdown-list">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`scope-option-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="scope-option-icon">{opt.icon}</span>
                  <div className="scope-option-text">
                    <span className="scope-option-title">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="scope-option-subtitle">{opt.sublabel}</span>
                    )}
                  </div>
                  {isSelected && (
                    <CheckOutlined className="scope-option-check" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
