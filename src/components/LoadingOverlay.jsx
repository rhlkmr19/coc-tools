// ============================================
// Clash Intelligence Pro – Loading Overlay
// ============================================
// Full-screen loading overlay with:
//   - Frosted glass backdrop
//   - Animated gold spinner ring (SVG)
//   - Configurable message text
//   - Smooth fade transition
//   - Portal-level z-index
// ============================================

import { memo } from 'react';
import { Box, Typography, Fade } from '@mui/material';
import { colors, goldGradient } from '../theme/theme';

/**
 * @param {object}  props
 * @param {boolean} props.open     – Whether overlay is visible
 * @param {string}  [props.message] – Loading text to display
 */
function LoadingOverlay({ open, message = 'Loading...' }) {
  return (
    <Fade in={open} timeout={300} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated spinner */}
        <Box
          sx={{
            position: 'relative',
            width: 72,
            height: 72,
          }}
        >
          {/* Outer rotating ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              animation: 'spin 1.2s linear infinite',
              '@keyframes spin': {
                to: { transform: 'rotate(360deg)' },
              },
            }}
          >
            <svg width={72} height={72} viewBox="0 0 72 72">
              <defs>
                <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={colors.ROYAL_GOLD} stopOpacity="1" />
                  <stop offset="50%" stopColor={colors.GOLD_LIGHT} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={colors.ROYAL_GOLD} stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="url(#spinnerGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="140 48"
              />
            </svg>
          </Box>

          {/* Inner pulsing dot */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: goldGradient,
              boxShadow: `0 0 12px ${colors.ROYAL_GOLD}66`,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 1,
                },
                '50%': {
                  transform: 'translate(-50%, -50%) scale(1.3)',
                  opacity: 0.7,
                },
              },
            }}
          />
        </Box>

        {/* Message */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 600,
            fontSize: '0.8rem',
            color: colors.ROYAL_GOLD,
            textAlign: 'center',
            letterSpacing: '0.06em',
            textShadow: `0 0 12px ${colors.ROYAL_GOLD}33`,
          }}
        >
          {message}
        </Typography>

        {/* Subtle animated dots */}
        <Box sx={{ display: 'flex', gap: 0.8 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: colors.ROYAL_GOLD,
                opacity: 0.4,
                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                '@keyframes dotBounce': {
                  '0%, 80%, 100%': {
                    transform: 'scale(0.6)',
                    opacity: 0.3,
                  },
                  '40%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Fade>
  );
}

export default memo(LoadingOverlay);
