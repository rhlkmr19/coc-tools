// ============================================
// Clash Intelligence Pro – Stat Card
// ============================================
// Reusable stat display card with:
//   - Icon slot, label, formatted value
//   - Optional trend indicator (up/down/neutral)
//   - Optional subtitle
//   - Glass-card styling
//   - Animated counter entrance
// ============================================

import { memo, useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { ThemeContext } from '../App';
import { colors } from '../theme/theme';

/**
 * @param {object}  props
 * @param {string}  props.label       – Stat title text
 * @param {string|number} props.value – Primary value to display
 * @param {React.ReactNode} [props.icon] – Leading icon element
 * @param {string}  [props.subtitle]  – Secondary text below value
 * @param {'up'|'down'|'neutral'} [props.trend] – Trend direction
 * @param {string}  [props.trendValue] – e.g. "+12" or "-5%"
 * @param {string}  [props.color]     – Accent color for the value
 * @param {object}  [props.sx]        – Extra sx overrides
 * @param {function} [props.onClick]  – Click handler
 */
function StatCard({
  label,
  value,
  icon,
  subtitle,
  trend,
  trendValue,
  color,
  sx = {},
  onClick,
}) {
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const TrendIcon =
    trend === 'up'
      ? TrendingUpIcon
      : trend === 'down'
      ? TrendingDownIcon
      : trend === 'neutral'
      ? TrendingFlatIcon
      : null;

  const trendColor =
    trend === 'up' ? '#4caf50' : trend === 'down' ? '#f44336' : '#ff9800';

  return (
    <Paper
      className="glass-card"
      onClick={onClick}
      sx={{
        p: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:active': onClick ? { transform: 'scale(0.97)' } : {},
        ...sx,
      }}
    >
      {/* Top row: icon + label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.8 }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: `${color || colors.ROYAL_GOLD}15`,
              color: color || colors.ROYAL_GOLD,
              '& svg': { fontSize: 16 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
            flex: 1,
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Value */}
      <Typography
        className="anim-count-up"
        sx={{
          fontFamily: 'Orbitron',
          fontWeight: 700,
          fontSize: '1.2rem',
          color: color || (isDark ? '#fff' : '#1a1a2e'),
          lineHeight: 1.1,
          mb: subtitle || trend ? 0.3 : 0,
        }}
      >
        {value}
      </Typography>

      {/* Bottom row: subtitle + trend */}
      {(subtitle || trend) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.62rem',
                flex: 1,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </Typography>
          )}
          {TrendIcon && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <TrendIcon sx={{ fontSize: 14, color: trendColor }} />
              {trendValue && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: trendColor,
                  }}
                >
                  {trendValue}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}

export default memo(StatCard);
