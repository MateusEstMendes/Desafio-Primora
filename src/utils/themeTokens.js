/** Paleta semântica compartilhada pelo CSS, Ant Design e gráficos. */
export const THEME_TOKENS = {
  light: {
    mode: 'light', label: 'Claro',
    bgCanvas: '#FAFBFD', bgAbyss: '#E9EEF5', bgSurface: '#FFFFFF',
    bgSubtle: '#EDF1F7', bgElevated: '#F8FAFC', bgSteel: '#D6DEEA',
    bgSilver: '#17243B', bgHeader: 'rgba(255, 255, 255, 0.94)', bgFooter: '#EDF1F7',
    borderDefault: '#D6DEEA', borderSubtle: '#E3E9F1', borderStrong: '#8795AA', borderFocus: '#2563EB',
    textPrimary: '#17243B', textCloud: '#17243B', textSecondary: '#52627A', textMuted: '#5C6D84', textOnBrand: '#FFFFFF',
    brandPrimary: '#2563EB', brandPrimaryHover: '#1D4ED8', brandSolid: '#2563EB',
    brandPrimarySoft: '#EDF3FF', brandPrimaryBorder: '#C5D6FB',
    brandCyan: '#0F766E', brandCyanText: '#0F766E', brandCyanSoft: '#EAF7F5', brandCyanBorder: '#AADBD5',
    statusSuccess: '#15803D', statusSuccessText: '#166534', statusSuccessSoft: '#EDF8F0', statusSuccessBorder: '#B5DFC1',
    statusWarning: '#A16207', statusWarningText: '#854D0E', statusWarningSoft: '#FFF8E7', statusWarningBorder: '#EAD39A',
    statusRisk: '#C2410C', statusRiskText: '#9A3412', statusRiskSoft: '#FFF3EB', statusRiskBorder: '#F2C8AE',
    statusCritical: '#DC2626', statusCriticalText: '#B91C1C', statusCriticalSoft: '#FEF0F0', statusCriticalBorder: '#F0BBBB',
    category1: '#2563EB', category2: '#0F766E', category3: '#A16207', category4: '#64748B',
    chartGrid: '#E3E9F1', chartAxis: '#5C6D84', chartTooltipBg: '#FFFFFF', chartTooltipBorder: '#D6DEEA',
    shadowCard: '0 2px 10px rgba(23, 36, 59, 0.10)',
    shadowCardHover: '0 6px 18px rgba(23, 36, 59, 0.12)'
  },
  dark: {
    mode: 'dark', label: 'Escuro',
    bgCanvas: '#101722', bgAbyss: '#0C121C', bgSurface: '#182231',
    bgSubtle: '#222F42', bgElevated: '#1D293A', bgSteel: '#34445C',
    bgSilver: '#D6DEEA', bgHeader: 'rgba(24, 34, 49, 0.94)', bgFooter: '#0C121C',
    borderDefault: '#35455D', borderSubtle: '#2B394D', borderStrong: '#70839D', borderFocus: '#9CC0FF',
    textPrimary: '#F5F8FF', textCloud: '#F5F8FF', textSecondary: '#CDDAEB', textMuted: '#AABBD1', textOnBrand: '#FFFFFF',
    brandPrimary: '#9CC0FF', brandPrimaryHover: '#BAD2FF', brandSolid: '#2563EB',
    brandPrimarySoft: '#203658', brandPrimaryBorder: '#3C5E94',
    brandCyan: '#70E0D0', brandCyanText: '#70E0D0', brandCyanSoft: '#163A3B', brandCyanBorder: '#32645F',
    statusSuccess: '#22C55E', statusSuccessText: '#22C55E', statusSuccessSoft: '#19392D', statusSuccessBorder: '#34664C',
    statusWarning: '#FFD27A', statusWarningText: '#FFD27A', statusWarningSoft: '#3B321D', statusWarningBorder: '#756039',
    statusRisk: '#FFB98D', statusRiskText: '#FFB98D', statusRiskSoft: '#402B23', statusRiskBorder: '#80533C',
    statusCritical: '#FF6B6B', statusCriticalText: '#FF6B6B', statusCriticalSoft: '#40272F', statusCriticalBorder: '#80434F',
    category1: '#9CC0FF', category2: '#70E0D0', category3: '#FFD27A', category4: '#B0C2DB',
    chartGrid: '#2B394D', chartAxis: '#AABBD1', chartTooltipBg: '#24344A', chartTooltipBorder: '#35455D',
    shadowCard: '0 3px 12px rgba(0, 0, 0, 0.26)',
    shadowCardHover: '0 6px 18px rgba(0, 0, 0, 0.30)'
  }
};

/** Aplica a mesma fonte de cores ao documento, inclusive componentes em portais. */
export function applyThemeTokens(mode) {
  const tokens = THEME_TOKENS[mode] || THEME_TOKENS.light;
  const root = document.documentElement;
  root.dataset.theme = tokens.mode;
  root.style.colorScheme = tokens.mode;
  Object.entries(tokens).forEach(([name, value]) => {
    if (name === 'mode' || name === 'label') return;
    const cssName = name.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
    root.style.setProperty(`--${cssName}`, value);
  });
}

/**
 * Retorna cores estáveis por regional, compartilhadas entre as telas.
 */
export function getRegionalColors(tokens) {
  return {
    'tenant-sudeste': tokens?.category1 || THEME_TOKENS.light.category1,
    'tenant-sul': tokens?.category2 || THEME_TOKENS.light.category2,
    'tenant-nordeste': tokens?.category3 || THEME_TOKENS.light.category3,
    'tenant-centro-oeste': tokens?.category4 || THEME_TOKENS.light.category4
  };
}

/** A cor expressa o resultado da variação, inclusive quando reduzir é melhor. */
export function getTrendTone(value, lowerIsBetter = false) {
  if (!Number.isFinite(value) || value === 0) return 'neutral';
  const improved = lowerIsBetter ? value < 0 : value > 0;
  return improved ? 'positive' : 'negative';
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
