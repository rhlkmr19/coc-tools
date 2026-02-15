// ============================================
// Clash Intelligence Pro – Glass Card
// ============================================
// Reusable glassmorphism card wrapper with:
//   - Auto dark/light glass styling
//   - Configurable intensity (light/medium/heavy)
//   - Optional gold-glow hover effect
//   - Optional header with icon + title
//   - Press animation when clickable
//   - Extends MUI Paper
// ============================================

import { forwardRef, memo, useContext } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { ThemeContext } from '../App';
import { colors, glassStyle } from '../theme/theme';

/**
 * @param {object}  props
 * @param {React.ReactNode} props.children – Card content
 * @param {'light'|'medium'|'heavy'} [props.intensity='medium'] – Glass blur level
 * @param {boolean} [props.glow=false]     – Enable gold-glow hover border
 * @param {React.ReactNode} [props.icon]   – Optional header icon
 * @param {string}  [props.title]          – Optional header title
 * @param {string}  [props.titleFont='Orbitron'] – Header font family
 * @param {function} [props.onClick]       – Click handler (adds press animation)
 * @param {string}  [props.className]      – Additional CSS class
 * @param {number}  [props.p=2]            – Padding shorthand
 * @param {object}  [props.sx]             – Extra sx overrides
 * @param {object}  [props.headerSx]       – Extra sx for header row
 */
const GlassCard = forwardRef(function GlassCard(
  {
    children,
    intensity = 'medium',
    glow = false,
    icon,
    title,
    titleFont = 'Orbitron',
    onClick,
    className = '',
    p = 2,
    sx = {},
    headerSx = {},
    ...rest
  },
  ref
) {
  const { mode } = useContext(ThemeContext);
  const glassClasses =
    mode === 'dark'
      ? intensity === 'heavy'
        ? 'glass-card-heavy'
        : 'glass-card'
      : 'glass-card-light';

  return (
    <Paper
      ref={ref}
      elevation={0}
      className={`${glassClasses} ${className}`}
      onClick={onClick}
      sx={{
        p,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',

        // Press animation
        ...(onClick && {
          '&:active': { transform: 'scale(0.98)' },
        }),

        // Gold glow on hover
        ...(glow && {
          '&:hover': {
            borderColor: `${colors.ROYAL_GOLD}40`,
            boxShadow: `0 0 20px ${colors.ROYAL_GOLD}12, 0 8px 32px ${colors.ROYAL_GOLD}08`,
          },
        }),

        ...sx,
      }}
      {...rest}
    >
      {/* Optional Header */}
      {(icon || title) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1.5,
            ...headerSx,
          }}
        >
          {icon && (
            <Box sx={{ color: colors.ROYAL_GOLD, display: 'flex', '& svg': { fontSize: 20 } }}>
              {icon}
            </Box>
          )}
          {title && (
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: titleFont,
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </Typography>
          )}
        </Box>
      )}

      {children}
    </Paper>
  );
});

export default memo(GlassCard);
