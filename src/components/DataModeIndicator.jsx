// ============================================
// Clash Intelligence Pro – Data Mode Indicator
// ============================================
// Compact indicator showing current data mode:
//   - Live Mode: green dot + "LIVE" label
//   - Demo Mode: amber dot + "DEMO" label
//   - Pulsing dot animation for live mode
//   - Clickable to switch modes (optional)
//   - Fits in app bars and headers
// ============================================

import { memo, useContext } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import ScienceIcon from '@mui/icons-material/Science';
import { AppContext } from '../App';
import { colors } from '../theme/theme';

/**
 * @param {object}  props
 * @param {'chip'|'dot'|'badge'} [props.variant='chip'] – Display variant
 * @param {function} [props.onClick]  – Click handler
 * @param {object}  [props.sx]        – Extra sx overrides
 */
function DataModeIndicator({ variant = 'chip', onClick, sx = {} }) {
  const { dataMode } = useContext(AppContext);

  const isLive = dataMode === 'live';
  const label = isLive ? 'LIVE' : 'DEMO';
  const dotColor = isLive ? '#4caf50' : '#ff9800';
  const Icon = isLive ? WifiIcon : ScienceIcon;

  // ─── Dot variant: minimal pulsing dot + label ──────
  if (variant === 'dot') {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: dotColor,
            boxShadow: `0 0 6px ${dotColor}88`,
            ...(isLive && {
              animation: 'livePulse 2s ease-in-out infinite',
              '@keyframes livePulse': {
                '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                '50%': { opacity: 0.6, transform: 'scale(1.3)' },
              },
            }),
          }}
        />
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.58rem',
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: dotColor,
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  // ─── Badge variant: compact rounded badge ──────────
  if (variant === 'badge') {
    return (
      <Box
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.4,
          px: 0.8,
          py: 0.25,
          borderRadius: '6px',
          bgcolor: `${dotColor}15`,
          border: `1px solid ${dotColor}30`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.15s ease',
          '&:active': onClick ? { transform: 'scale(0.95)' } : {},
          ...sx,
        }}
      >
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: dotColor,
            ...(isLive && {
              animation: 'livePulse 2s ease-in-out infinite',
              '@keyframes livePulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 },
              },
            }),
          }}
        />
        <Typography
          sx={{
            fontSize: '0.55rem',
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: dotColor,
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  }

  // ─── Chip variant (default): MUI Chip ─────────────
  return (
    <Chip
      icon={<Icon sx={{ fontSize: '14px !important', color: `${dotColor} !important` }} />}
      label={label}
      size="small"
      onClick={onClick}
      sx={{
        height: 26,
        fontSize: '0.62rem',
        fontFamily: 'Orbitron',
        fontWeight: 700,
        letterSpacing: '0.05em',
        bgcolor: `${dotColor}12`,
        color: dotColor,
        border: `1px solid ${dotColor}25`,
        '& .MuiChip-icon': { ml: 0.5 },
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        '&:hover': onClick
          ? { bgcolor: `${dotColor}20`, borderColor: `${dotColor}40` }
          : {},
        ...sx,
      }}
    />
  );
}

export default memo(DataModeIndicator);
