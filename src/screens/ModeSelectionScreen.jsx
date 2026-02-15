// ============================================
// Clash Intelligence Pro – Mode Selection Screen
// ============================================
// Allows user to pick:
//   1) Live Mode – requires CoC API token
//   2) Demo Mode – uses mock/sample data
// ============================================
import React from 'react';
import { Box, Typography, Button, Paper, Chip, alpha } from '@mui/material';
import { useAppContext } from '../App';
import { goldGradient, purpleGradient, glassStyle, colors } from '../theme/theme';
import { apiService } from '../services/apiService';

export default function ModeSelectionScreen() {
  const { navigateTo, setDataMode, SCREENS } = useAppContext();

  const handleLiveMode = () => {
    setDataMode('live');
    navigateTo(SCREENS.LOGIN);
  };

  const handleDemoMode = () => {
    setDataMode('demo');
    navigateTo(SCREENS.SYNC);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        px: 3,
        py: 4,
      }}
    >
      {/* Header */}
      <Typography
        className="animate-fadeSlideUp"
        variant="h5"
        sx={{
          fontFamily: '"Orbitron", sans-serif',
          fontWeight: 700,
          background: goldGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 1,
          textAlign: 'center',
        }}
      >
        Choose Your Mode
      </Typography>

      <Typography
        className="animate-fadeSlideUp"
        variant="body2"
        sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', animationDelay: '0.1s' }}
      >
        Select how you want to use Clash Intelligence Pro
      </Typography>

      {/* Live Mode Card */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        onClick={handleLiveMode}
        sx={{
          width: '100%',
          maxWidth: 360,
          p: 3,
          mb: 2,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          animationDelay: '0.2s',
          border: (theme) => `1px solid ${alpha(colors.ROYAL_GOLD, 0.25)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            border: (theme) => `1px solid ${alpha(colors.ROYAL_GOLD, 0.5)}`,
            boxShadow: `0 8px 32px ${alpha(colors.ROYAL_GOLD, 0.15)}`,
          },
        }}
      >
        {/* Recommended badge */}
        <Chip
          label="RECOMMENDED"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: goldGradient,
            color: colors.DEEP_PURPLE,
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 22,
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(colors.ROYAL_GOLD, 0.2)}, ${alpha(colors.ROYAL_GOLD, 0.05)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: 24,
            }}
          >
            ⚡
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.ROYAL_GOLD }}>
              Live Mode
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Real-time data from CoC API
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
          Connect your Clash of Clans account with your player tag. Get real-time stats,
          war intelligence, upgrade tracking, and AI-powered strategic analysis.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {['Real-time Stats', 'War Intel', 'AI Analysis', 'Notifications'].map((feat) => (
            <Chip
              key={feat}
              label={feat}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.65rem',
                height: 22,
                borderColor: alpha(colors.ROYAL_GOLD, 0.3),
                color: 'text.secondary',
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* Demo Mode Card */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        onClick={handleDemoMode}
        sx={{
          width: '100%',
          maxWidth: 360,
          p: 3,
          mb: 4,
          cursor: 'pointer',
          animationDelay: '0.35s',
          border: (theme) => `1px solid ${alpha(colors.DEEP_PURPLE, 0.3)}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            border: (theme) => `1px solid ${alpha(colors.DEEP_PURPLE, 0.5)}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(colors.DEEP_PURPLE, 0.3)}, ${alpha(colors.DEEP_PURPLE, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              fontSize: 24,
            }}
          >
            🎮
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Demo Mode
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Explore with sample data
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Try out all features with pre-loaded sample data. Perfect for exploring
          the app before connecting your account. No API key needed.
        </Typography>
      </Paper>

      {/* API status indicator */}
      <Box
        className="animate-fadeSlideUp"
        sx={{ animationDelay: '0.5s', display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: apiService.isConfigured() ? '#4ade80' : 'rgba(255,255,255,0.3)',
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {apiService.isConfigured() ? 'API Token Configured' : 'No API Token Detected'}
        </Typography>
      </Box>
    </Box>
  );
}
