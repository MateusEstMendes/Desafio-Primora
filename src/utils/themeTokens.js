/** Paleta semântica compartilhada pelo CSS, Ant Design e gráficos. */
export const THEME_TOKENS = {
  light: {
    mode: 'light', label: 'Claro',
    bgCanvas: '#F4F6FA', bgAbyss: '#E9EEF5', bgSurface: '#FFFFFF',
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
    shadowCard: '0 2px 5px rgba(23, 36, 59, 0.025)',
    shadowCardHover: '0 6px 18px rgba(23, 36, 59, 0.07)'
  },
  dark: {
    mode: 'dark', label: 'Escuro',
    bgCanvas: '#101722', bgAbyss: '#0C121C', bgSurface: '#182231',
    bgSubtle: '#222F42', bgElevated: '#1D293A', bgSteel: '#34445C',
    bgSilver: '#D6DEEA', bgHeader: 'rgba(24, 34, 49, 0.94)', bgFooter: '#0C121C',
    borderDefault: '#35455D', borderSubtle: '#2B394D', borderStrong: '#70839D', borderFocus: '#8AB4FF',
    textPrimary: '#EDF2FA', textCloud: '#EDF2FA', textSecondary: '#B3C1D4', textMuted: '#95A7C0', textOnBrand: '#FFFFFF',
    brandPrimary: '#8AB4FF', brandPrimaryHover: '#BAD2FF', brandSolid: '#2563EB',
    brandPrimarySoft: '#203658', brandPrimaryBorder: '#3C5E94',
    brandCyan: '#5FD3C4', brandCyanText: '#5FD3C4', brandCyanSoft: '#163A3B', brandCyanBorder: '#32645F',
    statusSuccess: '#6DD69A', statusSuccessText: '#6DD69A', statusSuccessSoft: '#19392D', statusSuccessBorder: '#34664C',
    statusWarning: '#F2C568', statusWarningText: '#F2C568', statusWarningSoft: '#3B321D', statusWarningBorder: '#756039',
    statusRisk: '#FBAD7B', statusRiskText: '#FBAD7B', statusRiskSoft: '#402B23', statusRiskBorder: '#80533C',
    statusCritical: '#FF9494', statusCriticalText: '#FF9494', statusCriticalSoft: '#40272F', statusCriticalBorder: '#80434F',
    category1: '#8AB4FF', category2: '#5FD3C4', category3: '#F2C568', category4: '#95A7C0',
    chartGrid: '#2B394D', chartAxis: '#95A7C0', chartTooltipBg: '#182231', chartTooltipBorder: '#35455D',
    shadowCard: '0 2px 5px rgba(0, 0, 0, 0.08)',
    shadowCardHover: '0 6px 18px rgba(0, 0, 0, 0.16)'
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
