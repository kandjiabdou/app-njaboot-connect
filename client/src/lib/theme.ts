// Design tokens et constantes de couleurs pour Njaboot Connect

export const BRAND_COLORS = {
  // Couleurs principales
  yellow: '#FBB03B',
  green: '#258C42',
  
  // Couleurs secondaires
  black: '#041B26',
  blackAlt: '#000000',
  white: '#FFFFFF',
  gray: '#E5E5E5',
} as const;

export const COLOR_TOKENS = {
  // HSL values pour CSS variables
  yellow: '45 90% 60%',      // #FBB03B
  green: '140 55% 35%',      // #258C42
  black: '200 100% 8%',      // #041B26
  white: '0 0% 100%',        // #FFFFFF
  gray: '0 0% 90%',          // #E5E5E5
} as const;

export type UserRole = 'manager' | 'customer';

export const THEME_CONFIG = {
  manager: {
    primary: BRAND_COLORS.black,
    secondary: BRAND_COLORS.yellow,
    accent: BRAND_COLORS.yellow,
    className: 'theme-manager',
  },
  customer: {
    primary: BRAND_COLORS.yellow,
    secondary: BRAND_COLORS.black,
    accent: BRAND_COLORS.green,
    className: 'theme-client',
  },
} as const;

/**
 * Applique le thème approprié selon le rôle utilisateur
 */
export function applyTheme(role: UserRole) {
  const theme = THEME_CONFIG[role];
  const body = document.body;
  
  // Supprime les autres classes de thème
  body.classList.remove('theme-manager', 'theme-client');
  
  // Applique la nouvelle classe de thème
  body.classList.add(theme.className);
  
  return theme;
}

/**
 * Récupère le thème actuel basé sur le rôle
 */
export function getTheme(role: UserRole) {
  return THEME_CONFIG[role];
}

/**
 * Récupère la couleur de navigation selon le profil
 */
export function getNavigationColors(role: UserRole) {
  const theme = THEME_CONFIG[role];
  
  return {
    background: theme.primary,
    text: role === 'manager' ? BRAND_COLORS.white : BRAND_COLORS.black,
    accent: theme.secondary,
    hover: role === 'manager' ? BRAND_COLORS.yellow : BRAND_COLORS.green,
  };
}

/**
 * Classes Tailwind utilitaires pour les couleurs de marque
 */
export const BRAND_CLASSES = {
  text: {
    yellow: 'text-brand-yellow',
    green: 'text-brand-green',
    black: 'text-brand-black',
  },
  bg: {
    yellow: 'bg-brand-yellow',
    green: 'bg-brand-green',
    black: 'bg-brand-black',
  },
  border: {
    yellow: 'border-brand-yellow',
    green: 'border-brand-green',
    black: 'border-brand-black',
  },
} as const;