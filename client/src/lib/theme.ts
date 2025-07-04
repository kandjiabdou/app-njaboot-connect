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

// Tailwind CSS class generators
export const getNavbarClasses = (userRole: 'manager' | 'customer' | string) => {
  const isManager = userRole === 'manager';
  
  return {
    navbar: isManager 
      ? 'bg-[#041B26] border-b border-gray-200' 
      : 'bg-[#FBB03B] border-b border-gray-200',
    navText: isManager 
      ? 'text-white' 
      : 'text-black',
    navTextActive: isManager 
      ? 'text-[#FBB03B]' 
      : 'text-[#258C42]',
    navHover: isManager 
      ? 'hover:text-[#FBB03B]' 
      : 'hover:text-[#258C42]',
    logo: isManager 
      ? 'text-white' 
      : 'text-black',
    buttonPrimary: isManager 
      ? 'bg-[#FBB03B] text-black hover:bg-[#E09F35]' 
      : 'bg-[#258C42] text-white hover:bg-[#1F7A37]',
    buttonOutline: isManager 
      ? 'border-[#FBB03B] text-[#FBB03B] hover:bg-[#FBB03B] hover:text-black' 
      : 'border-[#258C42] text-[#258C42] hover:bg-[#258C42] hover:text-white',
    buttonGhost: isManager 
      ? 'text-white hover:bg-white/10' 
      : 'text-black hover:bg-black/10',
  };
};

export const getPageClasses = (userRole: 'manager' | 'customer' | string) => {
  const isManager = userRole === 'manager';
  
  return {
    pageHeader: isManager 
      ? 'bg-gradient-to-r from-[#041B26] to-[#FBB03B] text-white' 
      : 'bg-gradient-to-r from-[#FBB03B] to-[#258C42] text-black',
    cardAccent: isManager 
      ? 'border-l-4 border-[#FBB03B]' 
      : 'border-l-4 border-[#258C42]',
    buttonPrimary: isManager 
      ? 'bg-[#FBB03B] text-black hover:bg-[#E09F35]' 
      : 'bg-[#258C42] text-white hover:bg-[#1F7A37]',
    buttonSecondary: isManager 
      ? 'bg-[#041B26] text-white hover:bg-[#041B26]/90' 
      : 'bg-[#FBB03B] text-black hover:bg-[#E09F35]',
    iconAccent: isManager 
      ? 'text-[#FBB03B]' 
      : 'text-[#258C42]',
    bgAccent: isManager 
      ? 'bg-[#FBB03B]/10' 
      : 'bg-[#258C42]/10',
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