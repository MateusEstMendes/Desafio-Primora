/**
 * Sistema de Design Tokens — Estrito Flat Design (100% Cores Sólidas, Zero Gradientes, Zero Sombras)
 * Paleta Institucional Primora Soluções em TI adaptada para Inteligência Comercial Executiva
 */

export const THEME_TOKENS = {
  light: {
    mode: 'light',
    label: 'White UI',
    // Superfícies Sólidas (Tons suaves/pastéis frios com alto contraste)
    bgCanvas: '#F4F6F9',
    bgSurface: '#FFFFFF',
    bgSubtle: '#EEF2F6',
    bgElevated: '#F8FAFC',
    bgHeader: '#FFFFFF',
    bgFooter: '#EEF2F6',

    // Bordas Sólidas 1px
    borderDefault: '#D5DCE6',
    borderSubtle: '#E2E8F0',
    borderStrong: '#64748B',
    borderFocus: '#684CB1',

    // Tipografia
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#475569',
    textOnBrand: '#FFFFFF',

    // Identidade Primora (100% Sólida)
    brandPrimary: '#684CB1',
    brandPrimaryHover: '#533898',
    brandPrimarySoft: '#F3F0FA',
    brandPrimaryBorder: '#D4C6F0',

    brandCyan: '#0891B2',
    brandCyanText: '#0E7490',
    brandCyanSoft: '#ECFEFF',
    brandCyanBorder: '#A5F3FC',

    // Semânticas de Decisão (Fills Gráficos + Badges Pastéis + Textos Calibrados)
    statusSuccess: '#059669',
    statusSuccessText: '#047857',
    statusSuccessSoft: '#ECFDF5',
    statusSuccessBorder: '#6EE7B7',

    statusWarning: '#D97706',
    statusWarningText: '#92400E',
    statusWarningSoft: '#FFFBEB',
    statusWarningBorder: '#FCD34D',

    statusRisk: '#EA580C',
    statusRiskText: '#C2410C',
    statusRiskSoft: '#FFF7ED',
    statusRiskBorder: '#FDBA74',

    statusCritical: '#DC2626',
    statusCriticalText: '#B91C1C',
    statusCriticalSoft: '#FEF2F2',
    statusCriticalBorder: '#FCA5A5',

    // Paleta Categórica Neutra para Entidades Geográficas (Desacoplada de Status de Alerta)
    category1: '#684CB1', // Roxo Primora (Sudeste)
    category2: '#0891B2', // Ciano Corporativo (Sul)
    category3: '#2563EB', // Azul Royal (Nordeste)
    category4: '#4F46E5', // Índigo Tecnológico (Centro-Oeste)

    // Gráficos
    chartGrid: '#E2E8F0',
    chartAxis: '#64748B',
    chartTooltipBg: '#FFFFFF',
    chartTooltipBorder: '#CBD5E1'
  },

  dark: {
    mode: 'dark',
    label: 'Dark UI',
    // Superfícies Sólidas (Baseado no Primora Dark #141f2b — sem degradê de vinheta)
    bgCanvas: '#0D151E',
    bgSurface: '#141F2B',
    bgSubtle: '#1B2938',
    bgElevated: '#1F2D3D',
    bgHeader: '#141F2B',
    bgFooter: '#0D151E',

    // Bordas Sólidas 1px de baixo contraste
    borderDefault: '#263648',
    borderSubtle: '#1E2C3B',
    borderStrong: '#47607E',
    borderFocus: '#8B6FD4',

    // Tipografia sem fadiga ocular
    textPrimary: '#F1F5F9',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textOnBrand: '#FFFFFF',

    // Identidade Primora (Ajustada para contraste escuro)
    brandPrimary: '#8B6FD4',
    brandPrimaryHover: '#9F85E0',
    brandPrimarySoft: '#1E1A34',
    brandPrimaryBorder: '#43356E',

    brandCyan: '#0ED5FA',
    brandCyanText: '#38BDF8',
    brandCyanSoft: '#102A37',
    brandCyanBorder: '#164E63',

    // Semânticas de Decisão (Tons pastéis escuros sólidos no fundo e alto contraste no texto)
    statusSuccess: '#34D399',
    statusSuccessText: '#34D399',
    statusSuccessSoft: '#0F2922',
    statusSuccessBorder: '#065F46',

    statusWarning: '#FBBF24',
    statusWarningText: '#FBBF24',
    statusWarningSoft: '#292011',
    statusWarningBorder: '#78350F',

    statusRisk: '#FB923C',
    statusRiskText: '#FB923C',
    statusRiskSoft: '#2C1A12',
    statusRiskBorder: '#7C2D12',

    statusCritical: '#F87171',
    statusCriticalText: '#F87171',
    statusCriticalSoft: '#2C1519',
    statusCriticalBorder: '#7F1D1D',

    // Paleta Categórica Neutra Dark
    category1: '#8B6FD4', // Roxo Primora Dark (Sudeste)
    category2: '#0ED5FA', // Ciano Dark (Sul)
    category3: '#60A5FA', // Azul Claro Dark (Nordeste)
    category4: '#818CF8', // Índigo Claro Dark (Centro-Oeste)

    // Gráficos
    chartGrid: '#1E2C3B',
    chartAxis: '#94A3B8',
    chartTooltipBg: '#1B2938',
    chartTooltipBorder: '#334860'
  }
};

/**
 * Retorna o mapa de cores categóricas neutras por unidade regional
 */
export function getRegionalColors(tokens) {
  return {
    'tenant-sudeste': tokens?.category1 || '#684CB1',
    'tenant-sul': tokens?.category2 || '#0891B2',
    'tenant-nordeste': tokens?.category3 || '#2563EB',
    'tenant-centro-oeste': tokens?.category4 || '#4F46E5'
  };
}

/**
 * Retorna os tokens semânticos de acordo com a taxa de risco proporcional (%) ou status direto
 */
export function getRiskSemanticTokens(taxaOuStatus, tokens = THEME_TOKENS.light) {
  if (typeof taxaOuStatus === 'string') {
    if (taxaOuStatus === 'Crítico') {
      return {
        level: 'Crítico',
        actionLabel: 'Intervenção Imediata',
        symbol: '▲',
        color: tokens.statusCriticalText || tokens.statusCritical,
        dotColor: tokens.statusCritical,
        bg: tokens.statusCriticalSoft,
        border: tokens.statusCriticalBorder,
        badgeClass: 'geo-badge--critical',
        dotClass: 'geo-dot--critical'
      };
    }
    if (taxaOuStatus === 'Risco') {
      return {
        level: 'Risco',
        actionLabel: 'Risco Elevado',
        symbol: '▲',
        color: tokens.statusRiskText || tokens.statusRisk,
        dotColor: tokens.statusRisk,
        bg: tokens.statusRiskSoft,
        border: tokens.statusRiskBorder,
        badgeClass: 'geo-badge--risk',
        dotClass: 'geo-dot--risk'
      };
    }
    if (taxaOuStatus === 'Atenção') {
      return {
        level: 'Atenção',
        actionLabel: 'Atenção Prioritária',
        symbol: '▲',
        color: tokens.statusWarningText || tokens.statusWarning,
        dotColor: tokens.statusWarning,
        bg: tokens.statusWarningSoft,
        border: tokens.statusWarningBorder,
        badgeClass: 'geo-badge--warning',
        dotClass: 'geo-dot--warning'
      };
    }
    return {
      level: 'Saudável',
      actionLabel: 'Operação Estável',
      symbol: '●',
      color: tokens.statusSuccessText || tokens.statusSuccess,
      dotColor: tokens.statusSuccess,
      bg: tokens.statusSuccessSoft,
      border: tokens.statusSuccessBorder,
      badgeClass: 'geo-badge--success',
      dotClass: 'geo-dot--success'
    };
  }

  const taxaRisco = Number(taxaOuStatus) || 0;
  if (taxaRisco >= 20) {
    return {
      level: 'Crítico',
      actionLabel: 'Intervenção Imediata',
      symbol: '▲',
      color: tokens.statusCriticalText || tokens.statusCritical,
      dotColor: tokens.statusCritical,
      bg: tokens.statusCriticalSoft,
      border: tokens.statusCriticalBorder,
      badgeClass: 'geo-badge--critical',
      dotClass: 'geo-dot--critical'
    };
  }
  if (taxaRisco >= 10) {
    return {
      level: 'Atenção',
      actionLabel: 'Atenção Prioritária',
      symbol: '▲',
      color: tokens.statusWarningText || tokens.statusWarning,
      dotColor: tokens.statusWarning,
      bg: tokens.statusWarningSoft,
      border: tokens.statusWarningBorder,
      badgeClass: 'geo-badge--warning',
      dotClass: 'geo-dot--warning'
    };
  }
  return {
    level: 'Estável',
    actionLabel: 'Operação Estável',
    symbol: '●',
    color: tokens.statusSuccessText || tokens.statusSuccess,
    dotColor: tokens.statusSuccess,
    bg: tokens.statusSuccessSoft,
    border: tokens.statusSuccessBorder,
    badgeClass: 'geo-badge--success',
    dotClass: 'geo-dot--success'
  };
}
