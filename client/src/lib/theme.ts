// Theme configuration for Njaboot Connect
// Official brand colors and theme management

export const brandColors = {
  // Primary colors
  primary: {
    yellow: '#FBB03B',
    green: '#258C42',
  },
  // Secondary colors
  secondary: {
    black: '#041B26',
    blackAlt: '#000000',
    white: '#FFFFFF',
    gray: '#E5E5E5',
  },
  // Semantic colors
  semantic: {
    success: '#258C42',
    warning: '#FBB03B',
    error: '#DC2626',
    info: '#3B82F6',
  }
} as const;

export const themes = {
  manager: {
    name: 'manager',
    colors: {
      // Navigation
      navBg: brandColors.secondary.black,
      navText: brandColors.secondary.white,
      navTextActive: brandColors.primary.yellow,
      navHover: brandColors.primary.yellow,
      navBorder: brandColors.secondary.gray,
      
      // Buttons
      buttonPrimary: brandColors.primary.yellow,
      buttonPrimaryText: brandColors.secondary.black,
      buttonSecondary: brandColors.secondary.gray,
      buttonSecondaryText: brandColors.secondary.black,
      buttonOutline: brandColors.secondary.black,
      buttonOutlineText: brandColors.secondary.black,
      
      // Backgrounds
      bgPrimary: brandColors.secondary.white,
      bgSecondary: brandColors.secondary.gray,
      bgAccent: brandColors.primary.yellow,
      
      // Text
      textPrimary: brandColors.secondary.black,
      textSecondary: brandColors.secondary.black,
      textMuted: '#6B7280',
      textOnAccent: brandColors.secondary.black,
      
      // Cards and surfaces
      cardBg: brandColors.secondary.white,
      cardBorder: brandColors.secondary.gray,
      cardHover: '#F9FAFB',
      
      // Status colors
      success: brandColors.semantic.success,
      warning: brandColors.semantic.warning,
      error: brandColors.semantic.error,
      info: brandColors.semantic.info,
    }
  },
  customer: {
    name: 'customer',
    colors: {
      // Navigation
      navBg: brandColors.primary.yellow,
      navText: brandColors.secondary.black,
      navTextActive: brandColors.primary.green,
      navHover: brandColors.primary.green,
      navBorder: brandColors.secondary.gray,
      
      // Buttons
      buttonPrimary: brandColors.primary.green,
      buttonPrimaryText: brandColors.secondary.white,
      buttonSecondary: brandColors.secondary.gray,
      buttonSecondaryText: brandColors.secondary.black,
      buttonOutline: brandColors.primary.green,
      buttonOutlineText: brandColors.primary.green,
      
      // Backgrounds
      bgPrimary: brandColors.secondary.white,
      bgSecondary: brandColors.secondary.gray,
      bgAccent: brandColors.primary.yellow,
      
      // Text
      textPrimary: brandColors.secondary.black,
      textSecondary: brandColors.secondary.black,
      textMuted: '#6B7280',
      textOnAccent: brandColors.secondary.black,
      
      // Cards and surfaces
      cardBg: brandColors.secondary.white,
      cardBorder: brandColors.secondary.gray,
      cardHover: '#F9FAFB',
      
      // Status colors
      success: brandColors.semantic.success,
      warning: brandColors.semantic.warning,
      error: brandColors.semantic.error,
      info: brandColors.semantic.info,
    }
  }
} as const;

// Design tokens iOS-inspired
export const designTokens = {
  // Rayons de bordure (coins arrondis)
  borderRadius: {
    xs: '0.25rem',      // 4px - petits éléments
    sm: '0.5rem',       // 8px - boutons, inputs
    md: '0.75rem',      // 12px - cartes standard
    lg: '1rem',         // 16px - cartes importantes
    xl: '1.25rem',      // 20px - conteneurs principaux
    '2xl': '1.5rem',    // 24px - sections larges
    '3xl': '2rem'       // 32px - éléments hero
  },
  
  // Ombres (shadows)
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  // Transitions et animations
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out'
  },
  
  // Espacements spécifiques iOS
  spacing: {
    cardPadding: '1rem',        // 16px
    cardPaddingLg: '1.5rem',    // 24px
    sectionGap: '1.5rem',       // 24px
    componentGap: '0.75rem'     // 12px
  }
} as const;

// Classes communes iOS-inspired pour tous les composants
export const iosClasses = {
  // Conteneurs
  container: 'rounded-xl shadow-sm transition-all duration-300',
  containerHover: 'hover:shadow-md hover:scale-[1.01]',
  
  // Boutons de base
  button: 'rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2',
  buttonSm: 'px-3 py-2 text-sm',
  buttonMd: 'px-4 py-2.5 text-sm',
  buttonLg: 'px-6 py-3 text-base',
  buttonHover: 'hover:scale-[1.02] hover:shadow-lg',
  
  // Cartes
  card: 'rounded-xl shadow-sm border transition-all duration-300',
  cardHover: 'hover:shadow-md',
  cardBody: 'p-4 sm:p-6',
  
  // Inputs
  input: 'rounded-lg border transition-all duration-300 focus:ring-2 focus:ring-offset-0',
  
  // Badges
  badge: 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-300',
  
  // Animations
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  
  // Surfaces
  surface: 'bg-white/80 backdrop-blur-sm border border-white/20',
  glassmorphism: 'backdrop-blur-md bg-white/10 border border-white/20'
} as const;

export type ThemeType = keyof typeof themes;
export type Theme = typeof themes[ThemeType];

// Theme utility functions
export const getTheme = (userRole: 'manager' | 'customer' | string): Theme => {
  return userRole === 'manager' ? themes.manager : themes.customer;
};

export const getThemeColors = (userRole: 'manager' | 'customer' | string) => {
  return getTheme(userRole).colors;
};

// CSS custom properties generator for dynamic theming
export const generateCSSVariables = (theme: Theme) => {
  const cssVars: Record<string, string> = {};
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    cssVars[`--theme-${key}`] = value;
  });
  
  return cssVars;
};

// Apply theme to document root
export const applyThemeToDocument = (theme: Theme) => {
  const root = document.documentElement;
  const cssVars = generateCSSVariables(theme);
  
  Object.entries(cssVars).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// Tailwind CSS class generators avec design iOS
export const getNavbarClasses = (userRole: 'manager' | 'customer' | string) => {
  const isManager = userRole === 'manager';
  
  return {
    navbar: isManager 
      ? 'bg-[#041B26]/95 backdrop-blur-lg border-b border-gray-200/20 shadow-lg' 
      : 'bg-[#FBB03B]/95 backdrop-blur-lg border-b border-gray-200/20 shadow-lg',
    navText: isManager 
      ? 'text-white transition-colors duration-300' 
      : 'text-black transition-colors duration-300',
    navTextActive: isManager 
      ? 'text-[#FBB03B] font-medium' 
      : 'text-[#258C42] font-medium',
    navHover: isManager 
      ? 'hover:text-[#FBB03B] transition-all duration-300 rounded-lg px-2 py-1 hover:bg-white/5' 
      : 'hover:text-[#258C42] transition-all duration-300 rounded-lg px-2 py-1 hover:bg-black/5',
    logo: isManager 
      ? 'text-white font-bold' 
      : 'text-black font-bold',
    buttonPrimary: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} ${iosClasses.buttonHover} bg-[#FBB03B] text-black hover:bg-[#E09F35] focus:ring-[#FBB03B]/30` 
      : `${iosClasses.button} ${iosClasses.buttonMd} ${iosClasses.buttonHover} bg-[#258C42] text-white hover:bg-[#1F7A37] focus:ring-[#258C42]/30`,
    buttonOutline: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} border-2 border-[#FBB03B] text-[#FBB03B] hover:bg-[#FBB03B] hover:text-black transition-all duration-300` 
      : `${iosClasses.button} ${iosClasses.buttonMd} border-2 border-[#258C42] text-[#258C42] hover:bg-[#258C42] hover:text-white transition-all duration-300`,
    buttonGhost: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} text-white hover:bg-white/10` 
      : `${iosClasses.button} ${iosClasses.buttonMd} text-black hover:bg-black/10`,
  };
};

export const getPageClasses = (userRole: 'manager' | 'customer' | string) => {
  const isManager = userRole === 'manager';
  
  return {
    // Headers avec design iOS
    pageHeader: isManager 
      ? `bg-gradient-to-r from-[#041B26] to-[#FBB03B] text-white ${iosClasses.container} shadow-lg` 
      : `bg-gradient-to-r from-[#FBB03B] to-[#258C42] text-black ${iosClasses.container} shadow-lg`,
    
    // Cartes avec accents iOS
    card: isManager 
      ? `${iosClasses.card} ${iosClasses.cardHover} border-[#FBB03B]/10 ${iosClasses.cardBody}` 
      : `${iosClasses.card} ${iosClasses.cardHover} border-[#258C42]/10 ${iosClasses.cardBody}`,
    
    cardAccent: isManager 
      ? `border-l-4 border-[#FBB03B] ${iosClasses.fadeIn}` 
      : `border-l-4 border-[#258C42] ${iosClasses.fadeIn}`,
    
    // Boutons avec design iOS
    buttonPrimary: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} ${iosClasses.buttonHover} bg-[#FBB03B] text-black hover:bg-[#E09F35] focus:ring-[#FBB03B]/30 shadow-md` 
      : `${iosClasses.button} ${iosClasses.buttonMd} ${iosClasses.buttonHover} bg-[#258C42] text-white hover:bg-[#1F7A37] focus:ring-[#258C42]/30 shadow-md`,
    
    buttonSecondary: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} bg-[#041B26] text-white hover:bg-[#041B26]/90 transition-all duration-300 shadow-sm` 
      : `${iosClasses.button} ${iosClasses.buttonMd} bg-[#FBB03B] text-black hover:bg-[#E09F35] transition-all duration-300 shadow-sm`,
    
    buttonGhost: isManager 
      ? `${iosClasses.button} ${iosClasses.buttonMd} text-[#041B26] hover:bg-[#041B26]/5 border border-[#041B26]/20` 
      : `${iosClasses.button} ${iosClasses.buttonMd} text-[#258C42] hover:bg-[#258C42]/5 border border-[#258C42]/20`,
    
    // Icônes et accents
    iconAccent: isManager 
      ? 'text-[#FBB03B] transition-colors duration-300' 
      : 'text-[#258C42] transition-colors duration-300',
    
    // Arrière-plans avec effets iOS
    bgAccent: isManager 
      ? `bg-[#FBB03B]/10 ${iosClasses.container}` 
      : `bg-[#258C42]/10 ${iosClasses.container}`,
    
    bgGradient: isManager 
      ? 'bg-gradient-to-br from-gray-50 via-white to-gray-100' 
      : 'bg-gradient-to-br from-yellow-50 via-white to-orange-50',
    
    // Inputs avec design iOS
    input: isManager 
      ? `${iosClasses.input} border-[#041B26]/20 focus:border-[#FBB03B] focus:ring-[#FBB03B]/20` 
      : `${iosClasses.input} border-[#041B26]/20 focus:border-[#258C42] focus:ring-[#258C42]/20`,
    
    // Badges avec design iOS
    badge: isManager 
      ? `${iosClasses.badge} bg-[#FBB03B]/10 text-[#FBB03B] border border-[#FBB03B]/20` 
      : `${iosClasses.badge} bg-[#258C42]/10 text-[#258C42] border border-[#258C42]/20`,
    
    badgeSuccess: `${iosClasses.badge} bg-[#258C42]/10 text-[#258C42] border border-[#258C42]/20`,
    badgeWarning: `${iosClasses.badge} bg-[#FBB03B]/10 text-[#FBB03B] border border-[#FBB03B]/20`,
    badgeError: `${iosClasses.badge} bg-red-50 text-red-600 border border-red-200`,
  };
};

// Theme context hook utility
export const useThemeClasses = (userRole: 'manager' | 'customer' | string) => {
  return {
    navbar: getNavbarClasses(userRole),
    page: getPageClasses(userRole),
    theme: getTheme(userRole),
    colors: getThemeColors(userRole),
  };
};