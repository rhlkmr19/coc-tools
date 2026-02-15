// ============================================
// Clash Intelligence Pro – Hero Strength Bar
// ============================================
// Hero level progress bar with:
//   - Hero name + level display
//   - Gradient-filled progress bar
//   - Max-level detection with gold badge
//   - Unique color per hero
//   - Shimmer animation on bar fill
//   - Compact or expanded layout
// ============================================

import { memo, useContext } from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import { ThemeContext } from '../App';
import { colors } from '../theme/theme';

// ─── Hero Color Map ────────────────────────────────────
const HERO_COLORS = {
  'Barbarian King': { primary: '#f44336', secondary: '#e57373', gradient: 'linear-gradient(90deg, #b71c1c, #f44336, #ef9a9a)' },
  'Archer Queen': { primary: '#9c27b0', secondary: '#ba68c8', gradient: 'linear-gradient(90deg, #6a1b9a, #9c27b0, #ce93d8)' },
  'Grand Warden': { primary: '#2196f3', secondary: '#64b5f6', gradient: 'linear-gradient(90deg, #1565c0, #2196f3, #90caf9)' },
  'Royal Champion': { primary: '#ff9800', secondary: '#ffb74d', gradient: 'linear-gradient(90deg, #e65100, #ff9800, #ffcc80)' },
  'Minion Prince': { primary: '#607d8b', secondary: '#90a4ae', gradient: 'linear-gradient(90deg, #37474f, #607d8b, #b0bec5)' },
};

// Fallback for unknown heroes
const DEFAULT_HERO_COLOR = {
  primary: colors.ROYAL_GOLD,
  secondary: '#FFD700',
  gradient: `linear-gradient(90deg, #B8860B, ${colors.ROYAL_GOLD}, #FFD700)`,
};

/**
 * @param {object}  props
 * @param {string}  props.name       – Hero name (e.g. "Barbarian King")
 * @param {number}  props.level      – Current hero level
 * @param {number}  props.maxLevel   – Maximum level for this TH
 * @param {'compact'|'expanded'} [props.variant='expanded'] – Layout variant
 * @param {boolean} [props.showShimmer=true] – Show bar shimmer animation
 * @param {object}  [props.sx]       – Extra sx overrides
 */
function HeroStrengthBar({
  name,
  level = 0,
  maxLevel = 1,
  variant = 'expanded',
  showShimmer = true,
  sx = {},
}) {
  const { mode } = useContext(ThemeContext);

  const heroColor = HERO_COLORS[name] || DEFAULT_HERO_COLOR;
  const progress = maxLevel > 0 ? (level / maxLevel) * 100 : 0;
  const isMaxed = level >= maxLevel;

  // ─── Compact variant: single-line bar ──────────────
  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
        {/* Hero initial badge */}
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${heroColor.primary}20`,
            border: `1px solid ${heroColor.primary}30`,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 800,
              fontSize: '0.55rem',
              color: heroColor.primary,
            }}
          >
            {name.charAt(0)}
          </Typography>
        </Box>

        {/* Bar */}
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            className={showShimmer && !isMaxed ? 'anim-bar-shimmer' : ''}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: isMaxed ? colors.ROYAL_GOLD : heroColor.gradient,
                transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              },
            }}
          />
        </Box>

        {/* Level */}
        <Typography
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '0.6rem',
            color: isMaxed ? colors.ROYAL_GOLD : heroColor.primary,
            minWidth: 32,
            textAlign: 'right',
          }}
        >
          {level}/{maxLevel}
        </Typography>
      </Box>
    );
  }

  // ─── Expanded variant: full card-style ─────────────
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isMaxed ? `${colors.ROYAL_GOLD}20` : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.2s ease',
        ...sx,
      }}
    >
      {/* Top row: name + level chip */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {/* Hero color dot */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: heroColor.primary,
            boxShadow: `0 0 6px ${heroColor.primary}55`,
            flexShrink: 0,
          }}
        />

        {/* Name */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.8rem',
            flex: 1,
            color: isMaxed ? colors.ROYAL_GOLD : 'text.primary',
          }}
        >
          {name}
        </Typography>

        {/* Level badge */}
        {isMaxed ? (
          <Chip
            label="MAX"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.58rem',
              fontFamily: 'Orbitron',
              fontWeight: 800,
              bgcolor: `${colors.ROYAL_GOLD}20`,
              color: colors.ROYAL_GOLD,
              border: `1px solid ${colors.ROYAL_GOLD}30`,
            }}
          />
        ) : (
          <Typography
            sx={{
              fontFamily: 'Orbitron',
              fontWeight: 700,
              fontSize: '0.72rem',
              color: heroColor.primary,
            }}
          >
            {level}
            <Typography
              component="span"
              sx={{
                color: 'text.secondary',
                fontSize: '0.6rem',
                fontWeight: 500,
                fontFamily: 'Roboto',
              }}
            >
              /{maxLevel}
            </Typography>
          </Typography>
        )}
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        className={showShimmer && !isMaxed ? 'anim-bar-shimmer' : ''}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.06)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: isMaxed
              ? `linear-gradient(90deg, #B8860B, ${colors.ROYAL_GOLD}, #FFD700)`
              : heroColor.gradient,
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
          },
        }}
      />

      {/* Progress percentage */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.58rem',
            fontWeight: 600,
          }}
        >
          {Math.round(progress)}% complete
        </Typography>
      </Box>
    </Box>
  );
}

export default memo(HeroStrengthBar);
