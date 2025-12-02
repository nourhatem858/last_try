/**
 * Theme Configuration
 * Centralized color scheme and styling constants
 */

export const theme = {
  colors: {
    // Primary Colors
    primary: {
      bg: '#0D1B2A',        // Dark Blue
      bgDark: '#0A1420',    // Darker Blue for inputs
      bgHover: '#1A2332',   // Hover state
    },
    secondary: {
      bg: '#000000',        // Black
    },
    accent: {
      default: '#1F77FF',   // Bright Blue
      hover: '#3D8FFF',     // Lighter Blue
      light: '#5A9FFF',     // Even lighter
    },
    text: {
      primary: '#FFFFFF',   // White
      secondary: '#CCCCCC', // Light Gray
      muted: '#999999',     // Muted Gray
      disabled: '#666666',  // Disabled Gray
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    border: {
      default: 'rgba(31, 119, 255, 0.2)',
      focus: 'rgba(31, 119, 255, 0.5)',
      hover: 'rgba(31, 119, 255, 0.3)',
    },
    shadow: {
      sm: 'rgba(31, 119, 255, 0.1)',
      md: 'rgba(31, 119, 255, 0.2)',
      lg: 'rgba(31, 119, 255, 0.3)',
    },
  },

  // Tailwind CSS Classes
  classes: {
    // Backgrounds
    bgPrimary: 'bg-[#0D1B2A]',
    bgSecondary: 'bg-black',
    bgInput: 'bg-[#0A1420]',
    bgHover: 'hover:bg-[#1A2332]',
    
    // Buttons
    btnPrimary: 'bg-[#1F77FF] hover:bg-[#3D8FFF] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-[#1F77FF]/30 hover:shadow-[#1F77FF]/50 hover:scale-[1.02] transform',
    btnSecondary: 'bg-[#0D1B2A] hover:bg-[#1A2332] text-white border border-[#1F77FF]/30 font-semibold rounded-lg transition-all duration-200',
    btnOutline: 'bg-transparent hover:bg-[#1F77FF]/10 text-[#1F77FF] border border-[#1F77FF]/50 hover:border-[#1F77FF] font-semibold rounded-lg transition-all duration-200',
    
    // Inputs
    input: 'w-full px-4 py-3 bg-[#0A1420] border border-[#1F77FF]/30 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-[#1F77FF] focus:border-transparent transition-all duration-200',
    inputError: 'w-full px-4 py-3 bg-[#0A1420] border border-red-500/50 rounded-lg text-white placeholder-[#999999] focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200',
    
    // Cards
    card: 'bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 shadow-lg',
    cardHover: 'bg-[#0D1B2A] rounded-2xl border border-[#1F77FF]/20 shadow-lg hover:border-[#1F77FF]/40 hover:shadow-[#1F77FF]/20 transition-all duration-200',
    
    // Text
    textPrimary: 'text-white',
    textSecondary: 'text-[#CCCCCC]',
    textMuted: 'text-[#999999]',
    textAccent: 'text-[#1F77FF]',
    textAccentHover: 'text-[#1F77FF] hover:text-[#3D8FFF]',
    
    // Links
    link: 'text-[#1F77FF] hover:text-[#3D8FFF] transition-colors duration-200',
    linkUnderline: 'text-[#1F77FF] hover:text-[#3D8FFF] underline transition-colors duration-200',
    
    // Borders
    border: 'border-[#1F77FF]/20',
    borderFocus: 'border-[#1F77FF]/50',
    borderHover: 'border-[#1F77FF]/30',
    
    // Shadows
    shadowSm: 'shadow-sm shadow-[#1F77FF]/10',
    shadowMd: 'shadow-md shadow-[#1F77FF]/20',
    shadowLg: 'shadow-lg shadow-[#1F77FF]/30',
    shadowXl: 'shadow-xl shadow-[#1F77FF]/40',
    
    // Gradients
    gradientPrimary: 'bg-gradient-to-r from-[#1F77FF] to-[#0D1B2A]',
    gradientAccent: 'bg-gradient-to-br from-[#1F77FF] to-[#3D8FFF]',
    gradientCard: 'bg-gradient-to-br from-[#0D1B2A] to-black',
    
    // Animations
    fadeIn: 'animate-in fade-in duration-200',
    slideInTop: 'animate-in fade-in slide-in-from-top duration-200',
    slideInBottom: 'animate-in fade-in slide-in-from-bottom duration-200',
    zoomIn: 'animate-in fade-in zoom-in-95 duration-500',
    
    // States
    disabled: 'opacity-50 cursor-not-allowed',
    loading: 'opacity-70 cursor-wait',
  },

  // Spacing
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
  },

  // Border Radius
  radius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // Transitions
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
};

// Helper function to get theme classes
export const getThemeClasses = (variant: keyof typeof theme.classes) => {
  return theme.classes[variant];
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default theme;
