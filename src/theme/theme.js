// ============================================
// Clash Intelligence Pro – MUI v5 Theme System
// ============================================
// Design tokens:
//   Primary:    Royal Gold   #D4AF37
//   Secondary:  Deep Purple  #2E1A47
//   Background: Dark Slate   #0F172A
//   Accent font: Orbitron (headings)
//   Body font:   Roboto
// ============================================
import { createTheme, alpha } from '@mui/material/styles';

// ─── Color Tokens ──────────────────────────────────────
const ROYAL_GOLD = '#D4AF37';
const DEEP_PURPLE = '#2E1A47';
const DARK_SLATE = '#0F172A';
const LIGHT_BG = '#F0F2F5';
const LIGHT_SURFACE = '#FFFFFF';
const DARK_SURFACE = '#1A2332';
const DARK_CARD = '#1E293B';
const LIGHT_CARD = '#FFFFFF';
const GOLD_LIGHT = '#F5D76E';
const GOLD_DARK = '#AA8C2C';

// ─── Shared Component Overrides ────────────────────────
const sharedComponents = (mode) => {
  const isDark = mode === 'dark';
  const bgDefault = isDark ? DARK_SLATE : LIGHT_BG;
  const surfaceColor = isDark ? DARK_SURFACE : LIGHT_SURFACE;
  const cardColor = isDark ? DARK_CARD : LIGHT_CARD;
  const textPrimary = isDark ? '#E2E8F0' : '#1A202C';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        'html, body, #root': {
          minHeight: '100dvh',
          backgroundColor: bgDefault,
          color: textPrimary,
        },
        '::-webkit-scrollbar': { width: 6 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          background: alpha(ROYAL_GOLD, 0.3),
          borderRadius: 3,
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: alpha(ROYAL_GOLD, 0.5),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: cardColor,
          borderRadius: 16,
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: isDark
            ? alpha(DARK_CARD, 0.7)
            : alpha(LIGHT_CARD, 0.9),
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${isDark
            ? alpha(ROYAL_GOLD, 0.12)
            : alpha(DEEP_PURPLE, 0.08)
          }`,
          borderRadius: 16,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: alpha(ROYAL_GOLD, 0.3),
            boxShadow: `0 8px 32px ${alpha(ROYAL_GOLD, 0.08)}`,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${ROYAL_GOLD} 50%, ${GOLD_DARK} 100%)`,
          color: DARK_SLATE,
          boxShadow: `0 4px 20px ${alpha(ROYAL_GOLD, 0.35)}`,
          '&:hover': {
            background: `linear-gradient(135deg, ${ROYAL_GOLD} 0%, ${GOLD_DARK} 100%)`,
            boxShadow: `0 6px 28px ${alpha(ROYAL_GOLD, 0.5)}`,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderColor: alpha(ROYAL_GOLD, 0.5),
          color: ROYAL_GOLD,
          '&:hover': {
            borderColor: ROYAL_GOLD,
            backgroundColor: alpha(ROYAL_GOLD, 0.08),
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: isDark
            ? alpha(DARK_SLATE, 0.95)
            : alpha(LIGHT_SURFACE, 0.95),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${isDark
            ? alpha(ROYAL_GOLD, 0.12)
            : alpha(DEEP_PURPLE, 0.08)
          }`,
          height: 64,
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: textSecondary,
          minWidth: 'auto',
          padding: '6px 0',
          transition: 'color 0.2s ease',
          '&.Mui-selected': {
            color: ROYAL_GOLD,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 500,
            marginTop: 2,
            '&.Mui-selected': {
              fontSize: '0.7rem',
              fontWeight: 700,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '0.8rem',
        },
        filled: {
          backgroundColor: alpha(ROYAL_GOLD, 0.15),
          color: ROYAL_GOLD,
        },
        outlined: {
          borderColor: alpha(ROYAL_GOLD, 0.3),
          color: ROYAL_GOLD,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: isDark
            ? alpha(ROYAL_GOLD, 0.08)
            : alpha(DEEP_PURPLE, 0.08),
        },
        bar: {
          borderRadius: 8,
          background: `linear-gradient(90deg, ${GOLD_DARK} 0%, ${ROYAL_GOLD} 50%, ${GOLD_LIGHT} 100%)`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: isDark
                ? alpha(ROYAL_GOLD, 0.2)
                : alpha(DEEP_PURPLE, 0.2),
              transition: 'border-color 0.2s ease',
            },
            '&:hover fieldset': {
              borderColor: alpha(ROYAL_GOLD, 0.4),
            },
            '&.Mui-focused fieldset': {
              borderColor: ROYAL_GOLD,
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: ROYAL_GOLD,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: isDark ? DARK_SURFACE : LIGHT_SURFACE,
          backgroundImage: 'none',
          borderRadius: 20,
          border: `1px solid ${alpha(ROYAL_GOLD, 0.15)}`,
          boxShadow: `0 24px 64px ${alpha('#000', 0.4)}`,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: ROYAL_GOLD,
            '& + .MuiSwitch-track': {
              backgroundColor: alpha(ROYAL_GOLD, 0.5),
            },
          },
        },
        track: {
          backgroundColor: textSecondary,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: isDark ? DARK_CARD : '#333',
          color: '#fff',
          fontSize: '0.8rem',
          borderRadius: 8,
          padding: '8px 14px',
          border: `1px solid ${alpha(ROYAL_GOLD, 0.2)}`,
        },
      },
    },
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: isDark
            ? alpha(ROYAL_GOLD, 0.1)
            : alpha(DEEP_PURPLE, 0.08),
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(ROYAL_GOLD, 0.1),
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          '&.Mui-selected': {
            color: ROYAL_GOLD,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: ROYAL_GOLD,
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
  };
};

// ─── Theme Factory ─────────────────────────────────────
export function createAppTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: ROYAL_GOLD,
        light: GOLD_LIGHT,
        dark: GOLD_DARK,
        contrastText: DARK_SLATE,
      },
      secondary: {
        main: DEEP_PURPLE,
        light: '#4A2D6B',
        dark: '#1A0F2E',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDark ? DARK_SLATE : LIGHT_BG,
        paper: isDark ? DARK_SURFACE : LIGHT_SURFACE,
      },
      text: {
        primary: isDark ? '#E2E8F0' : '#1A202C',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      success: {
        main: '#22C55E',
        light: '#4ADE80',
        dark: '#16A34A',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
      },
      divider: isDark
        ? alpha(ROYAL_GOLD, 0.1)
        : alpha(DEEP_PURPLE, 0.08),
      gold: {
        main: ROYAL_GOLD,
        light: GOLD_LIGHT,
        dark: GOLD_DARK,
      },
    },
    typography: {
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: {
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontWeight: 900,
        fontSize: '2.5rem',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      },
      h2: {
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '0.01em',
        lineHeight: 1.3,
      },
      h3: {
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontWeight: 700,
        fontSize: '1.5rem',
        letterSpacing: '0.01em',
        lineHeight: 1.3,
      },
      h4: {
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.1rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle1: {
        fontWeight: 500,
        fontSize: '0.95rem',
        lineHeight: 1.5,
        letterSpacing: '0.01em',
      },
      subtitle2: {
        fontWeight: 500,
        fontSize: '0.85rem',
        lineHeight: 1.5,
        color: isDark ? '#94A3B8' : '#64748B',
      },
      body1: {
        fontSize: '0.95rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.85rem',
        lineHeight: 1.6,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
        color: isDark ? '#64748B' : '#94A3B8',
      },
      overline: {
        fontFamily: "'Orbitron', 'Roboto', sans-serif",
        fontWeight: 600,
        fontSize: '0.7rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: ROYAL_GOLD,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      `0 2px 8px ${alpha('#000', isDark ? 0.3 : 0.08)}`,
      `0 4px 16px ${alpha('#000', isDark ? 0.35 : 0.1)}`,
      `0 6px 24px ${alpha('#000', isDark ? 0.4 : 0.12)}`,
      `0 8px 32px ${alpha('#000', isDark ? 0.45 : 0.14)}`,
      `0 12px 40px ${alpha('#000', isDark ? 0.5 : 0.16)}`,
      ...Array(19).fill(`0 16px 48px ${alpha('#000', isDark ? 0.5 : 0.18)}`),
    ],
    components: sharedComponents(mode),
  });
}

// ─── Glass morphism style helper ───────────────────────
export const glassStyle = (mode = 'dark', intensity = 'medium') => {
  const isDark = mode === 'dark';
  const blurMap = { light: 8, medium: 16, heavy: 24 };
  const blur = blurMap[intensity] || 16;

  return {
    backgroundColor: isDark
      ? alpha(DARK_CARD, intensity === 'heavy' ? 0.85 : 0.6)
      : alpha(LIGHT_CARD, intensity === 'heavy' ? 0.9 : 0.7),
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: `1px solid ${isDark
      ? alpha(ROYAL_GOLD, 0.12)
      : alpha(DEEP_PURPLE, 0.08)
    }`,
    borderRadius: 16,
  };
};

// ─── Gradient helpers ──────────────────────────────────
export const goldGradient = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${ROYAL_GOLD} 50%, ${GOLD_DARK} 100%)`;
export const purpleGradient = `linear-gradient(135deg, #4A2D6B 0%, ${DEEP_PURPLE} 50%, #1A0F2E 100%)`;
export const darkGradient = `linear-gradient(180deg, ${DARK_SLATE} 0%, #0B1120 100%)`;

// ─── Color token exports ───────────────────────────────
export const colors = {
  ROYAL_GOLD,
  DEEP_PURPLE,
  DARK_SLATE,
  GOLD_LIGHT,
  GOLD_DARK,
  DARK_SURFACE,
  DARK_CARD,
  LIGHT_BG,
  LIGHT_SURFACE,
  LIGHT_CARD,
};

export default createAppTheme;
