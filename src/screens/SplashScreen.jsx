// ============================================
// Clash Intelligence Pro – Splash Screen
// ============================================
// Animated branded splash with logo, title,
// shimmer effect, and gold spinner.
// Auto-advances via App.jsx (2.5s timer).
// ============================================
import React from 'react';
import { Box, Typography } from '@mui/material';
import { goldGradient, purpleGradient, colors } from '../theme/theme';

export default function SplashScreen() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        background: purpleGradient,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Particles / Glow */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 40%, rgba(212,175,55,0.15) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Shield Logo */}
      <Box
        className="animate-splashLogo"
        sx={{
          width: 120,
          height: 120,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)`,
          position: 'relative',
        }}
      >
        {/* SVG Shield Icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 5L12 22V50C12 74 28 92 50 98C72 92 88 74 88 50V22L50 5Z"
            fill="url(#goldGrad)"
            stroke={colors.ROYAL_GOLD}
            strokeWidth="2"
          />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fill={colors.DEEP_PURPLE}
            fontFamily="Orbitron, sans-serif"
            fontSize="18"
            fontWeight="700"
          >
            CI
          </text>
          <defs>
            <linearGradient id="goldGrad" x1="12" y1="5" x2="88" y2="98" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5D76E" />
              <stop offset="0.5" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#AA8C2C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pulse ring */}
        <Box
          className="animate-pulseGlow"
          sx={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `2px solid rgba(212,175,55,0.3)`,
            pointerEvents: 'none',
          }}
        />
      </Box>

      {/* Title */}
      <Typography
        className="animate-splashText"
        variant="h4"
        sx={{
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 800,
          background: goldGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 1,
          textAlign: 'center',
          letterSpacing: 2,
        }}
      >
        CLASH
      </Typography>

      <Typography
        className="animate-splashText"
        variant="h6"
        sx={{
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 600,
          color: 'rgba(212,175,55,0.8)',
          letterSpacing: 4,
          mb: 3,
          textAlign: 'center',
          animationDelay: '0.3s',
        }}
      >
        INTELLIGENCE PRO
      </Typography>

      {/* Subtitle */}
      <Typography
        className="animate-fadeSlideUp"
        variant="body2"
        sx={{
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          animationDelay: '0.7s',
          mb: 4,
        }}
      >
        Advanced Clash of Clans Companion
      </Typography>

      {/* Loading Spinner */}
      <Box
        className="animate-radarSpin"
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(212,175,55,0.15)',
          borderTopColor: colors.ROYAL_GOLD,
        }}
      />
    </Box>
  );
}
