/**
 * Sistema de Design Tokens — Origin Gallery Style Reference (DESIGN.md)
 * Edição Blue & Bright Blue (Zero Roxo / Zero Violeta)
 * Superfícies por contraste de camada (#0f1011 Obsidian → #2e2e2e Graphite → #cacaca Silver)
 */

export const THEME_TOKENS = {
  dark: {
    mode: 'dark',
    label: 'Obsidian Gallery',
    // Superfícies DESIGN.md
    bgCanvas: '#0F1011',     // Obsidian Canvas
    bgAbyss: '#090A0B',      // Abyss
    bgSurface: '#181A1C',    // Elevated Obsidian Panel
    bgSubtle: '#222427',     // Mid-Dark Interactive
    bgElevated: '#2E2E2E',   // Graphite Card
    bgSteel: '#3F4041',      // Steel Hover
    bgSilver: '#CACACA',     // Silver Inverted Card
    bgHeader: 'rgba(15, 16, 17, 0.78)',
    bgFooter: '#090A0B',

    // Bordas Flat de Precisão
    borderDefault: '#2E2E2E',
    borderSubtle: '#222427',
    borderStrong: '#3F4041',
    borderFocus: '#2970FF',

    // Tipografia DESIGN.md (Pure #ffffff, Cloud #f5f5f7, Ash #9f9fa0, Fog #6a6b6b)
    textPrimary: '#FFFFFF',
    textCloud: '#F5F5F7',
    textSecondary: '#9F9FA0',
    textMuted: '#6A6B6B',
    textOnBrand: '#FFFFFF',

    // Acento Cromático Principal: Bright Blue & Cyan Signal (Substituindo qualquer roxo)
    brandPrimary: '#2970FF',
    brandPrimaryHover: '#3B82F6',
    brandPrimarySoft: '#102347',
    brandPrimaryBorder: '#1D4ED8',

    brandCyan: '#00B3DD',
    brandCyanText: '#38BDF8',
    brandCyanSoft: '#092832',
    brandCyanBorder: '#0086A8',

    // Semânticas de Decisão Calibradas sobre Obsidian/Graphite
    statusSuccess: '#10B981',
    statusSuccessText: '#34D399',
    statusSuccessSoft: '#0D2821',
    statusSuccessBorder: '#065F46',

    statusWarning: '#F59E0B',
    statusWarningText: '#FBBF24',
    statusWarningSoft: '#281F10',
    statusWarningBorder: '#78350F',

    statusRisk: '#F97316',
    statusRiskText: '#FB923C',
    statusRiskSoft: '#2A1810',
    statusRiskBorder: '#7C2D12',

    statusCritical: '#EF4444',
    statusCriticalText: '#F87171',
    statusCriticalSoft: '#2A1417',
    statusCriticalBorder: '#7F1D1D',

    // Paleta Categórica Azul & Ciano (Zero Roxo)
    category1: '#2970FF', // Bright Blue Gleam (Sudeste)
    category2: '#00B3DD', // Cyan Signal (Sul)
    category3: '#90B8F0', // Periwinkle Blue (Nordeste)
    category4: '#1D4ED8', // Deep Royal Blue (Centro-Oeste)

    // Gráficos
    chartGrid: '#262729',
    chartAxis: '#9F9FA0',
    chartTooltipBg: '#090A0B',
    chartTooltipBorder: '#3F4041'
  },

  light: {
    mode: 'light',
    label: 'Silver Day Gallery',
    // Superfícies Claras Inspiradas em Cloud (#f5f5f7) e Silver (#cacaca)
    bgCanvas: '#F5F5F7',
    bgAbyss: '#EAECEF',
    bgSurface: '#FFFFFF',
    bgSubtle: '#ECEEF2',
    bgElevated: '#F8FAFC',
    bgSteel: '#CACACA',
    bgSilver: '#0F1011',
    bgHeader: 'rgba(245, 245, 247, 0.84)',
    bgFooter: '#EAECEF',

    // Bordas
    borderDefault: '#D4D8E0',
    borderSubtle: '#E4E7EC',
    borderStrong: '#6A6B6B',
    borderFocus: '#2563EB',

    // Tipografia
    textPrimary: '#0F1011',
    textCloud: '#090A0B',
    textSecondary: '#4A4B4D',
    textMuted: '#6A6B6B',
    textOnBrand: '#FFFFFF',

    // Identidade Azul Brilhante (Sem Roxo)
    brandPrimary: '#2563EB',
    brandPrimaryHover: '#1D4ED8',
    brandPrimarySoft: '#EFF6FF',
    brandPrimaryBorder: '#BFDBFE',

    brandCyan: '#0095B8',
    brandCyanText: '#007794',
    brandCyanSoft: '#ECFEFF',
    brandCyanBorder: '#A5F3FC',

    // Semânticas de Decisão
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

    // Paleta Categórica Azul & Ciano (Sem Roxo)
    category1: '#2563EB', // Bright Royal Blue (Sudeste)
    category2: '#00B3DD', // Cyan Signal (Sul)
    category3: '#3B82F6', // Electric Sky Blue (Nordeste)
    category4: '#1E40AF', // Deep Sapphire Blue (Centro-Oeste)

    // Gráficos
    chartGrid: '#E2E8F0',
    chartAxis: '#6A6B6B',
    chartTooltipBg: '#FFFFFF',
    chartTooltipBorder: '#CACACA'
  }
};

/**
 * Retorna o mapa de cores categóricas por unidade regional (100% espectro Azul/Ciano)
 */
export function getRegionalColors(tokens) {
  return {
    'tenant-sudeste': tokens?.category1 || '#2970FF',
    'tenant-sul': tokens?.category2 || '#00B3DD',
    'tenant-nordeste': tokens?.category3 || '#90B8F0',
    'tenant-centro-oeste': tokens?.category4 || '#1D4ED8'
  };
}

/**
 * Retorna os tokens semânticos de acordo com a taxa de risco proporcional (%) ou status direto
 */
export function getRiskSemanticTokens(taxaOuStatus, tokens = THEME_TOKENS.dark) {
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
