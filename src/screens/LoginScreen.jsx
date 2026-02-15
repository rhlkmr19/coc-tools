// ============================================
// Clash Intelligence Pro – Login Screen
// ============================================
// API Setup screen where user enters:
//   1) In-game verification token (from Game Settings)
//   2) Player tag (#ABC123)
// Validates via CoC API, then creates account
// entry and proceeds to SyncScreen.
// ============================================
import React, { useState, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Alert,
  CircularProgress, InputAdornment, IconButton, Chip, alpha,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useAppContext } from '../App';
import { apiService } from '../services/apiService';
import { goldGradient, colors } from '../theme/theme';

export default function LoginScreen() {
  const { navigateTo, addAccount, dataMode, SCREENS } = useAppContext();

  const [tag, setTag] = useState('#');
  const [gameToken, setGameToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [tokenWarning, setTokenWarning] = useState('');
  const [verified, setVerified] = useState(null);

  // Format tag input – always starts with #, uppercase
  const handleTagChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9#]/g, '');
    if (!value.startsWith('#')) value = '#' + value;
    // Only one # at the start
    value = '#' + value.replace(/#/g, '');
    setTag(value);
    setError('');
    setVerified(null);
    setTokenWarning('');
  };

  const handleTokenChange = (e) => {
    setGameToken(e.target.value.trim());
    setError('');
    setTokenWarning('');
  };

  const handleConnect = async () => {
    const cleanTag = tag.trim();
    if (cleanTag.length < 4) {
      setError('Player tag must be at least 3 characters after #');
      return;
    }
    if (!gameToken) {
      setError('Please enter your in-game API token.');
      return;
    }

    setVerifying(true);
    setError('');
    setTokenWarning('');
    setVerified(null);

    try {
      if (dataMode === 'demo') {
        // Simulate verification for demo mode
        await new Promise((r) => setTimeout(r, 1000));
        setVerified({ name: 'DemoChief', tag: cleanTag, tokenVerified: true });
      } else {
        // Step 1: Fetch player data to verify tag exists
        const playerResult = await apiService.verifyPlayer(cleanTag);
        if (!playerResult.valid) {
          setError(playerResult.error || 'Player not found. Check your tag and try again.');
          setVerifying(false);
          return;
        }

        // Step 2: Verify in-game token for ownership
        const tokenResult = await apiService.verifyPlayerToken(cleanTag, gameToken);

        if (tokenResult.verified) {
          // Both tag and token verified!
          setVerified({
            name: playerResult.name,
            tag: playerResult.tag,
            tokenVerified: true,
          });
        } else {
          // Tag is valid but token verification failed/unavailable
          // Still allow connection — show warning
          setVerified({
            name: playerResult.name,
            tag: playerResult.tag,
            tokenVerified: false,
          });
          setTokenWarning(
            tokenResult.error || 'Token could not be verified, but player tag is valid.'
          );
        }
      }
    } catch (err) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!verified) return;
    addAccount({
      tag: verified.tag,
      name: verified.name,
      gameToken: gameToken, // store for future verification
      addedAt: Date.now(),
    });
    navigateTo(SCREENS.SYNC);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !verifying) {
      if (verified) handleContinue();
      else handleConnect();
    }
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
      {/* Logo */}
      <Box
        className="animate-fadeSlideUp"
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `2px solid ${colors.ROYAL_GOLD}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          background: `linear-gradient(135deg, ${alpha(colors.DEEP_PURPLE, 0.6)}, ${alpha(colors.DARK_SLATE, 0.8)})`,
        }}
      >
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
          <path d="M14 8L20 4L26 8V18L20 22L14 18V8Z" stroke={colors.ROYAL_GOLD} strokeWidth="2" fill={alpha(colors.ROYAL_GOLD, 0.15)} />
          <path d="M12 20L20 26L28 20" stroke={colors.ROYAL_GOLD} strokeWidth="2" fill="none" />
          <path d="M12 24L20 30L28 24" stroke={colors.ROYAL_GOLD} strokeWidth="1.5" fill="none" opacity="0.6" />
          <line x1="16" y1="12" x2="24" y2="16" stroke={colors.ROYAL_GOLD} strokeWidth="1.5" />
          <line x1="24" y1="12" x2="16" y2="16" stroke={colors.ROYAL_GOLD} strokeWidth="1.5" />
        </svg>
      </Box>

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
          mb: 0.5,
          textAlign: 'center',
        }}
      >
        API SETUP
      </Typography>

      <Typography
        className="animate-fadeSlideUp"
        variant="body2"
        sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', animationDelay: '0.1s' }}
      >
        Enter your CoC API Token and Player Tag to connect.
      </Typography>

      {/* Input Card */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 380,
          p: 3,
          animationDelay: '0.2s',
          border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.15)}`,
        }}
      >
        {/* CoC API Token Input */}
        <TextField
          fullWidth
          label="CoC API Token"
          placeholder="Enter your in-game token"
          value={gameToken}
          onChange={handleTokenChange}
          onKeyDown={handleKeyPress}
          disabled={verifying}
          type={showToken ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowToken(!showToken)}
                  edge="end"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: 1,
            },
          }}
          sx={{ mb: 1.5 }}
        />

        {/* How to get API Token — expandable */}
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            mb: 2,
            bgcolor: 'transparent',
            border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.12)}`,
            borderRadius: '8px !important',
            '&:before': { display: 'none' },
            '& .MuiAccordionSummary-root': {
              minHeight: 36,
              px: 1.5,
            },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: colors.ROYAL_GOLD, fontSize: 18 }} />}>
            <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD, fontWeight: 600 }}>
              How to get API Token?
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 1.5, pt: 0, pb: 1.5 }}>
            {[
              '1. Open Clash of Clans',
              '2. Go to Settings (gear icon)',
              '3. Tap "More Settings"',
              '4. Scroll down to find "API Token"',
              '5. Copy the token shown there',
            ].map((step) => (
              <Typography key={step} variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.8 }}>
                {step}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Player Tag Input */}
        <TextField
          fullWidth
          label="Player Tag"
          placeholder="#CP2Y00GQ"
          value={tag}
          onChange={handleTagChange}
          onKeyDown={handleKeyPress}
          disabled={verifying}
          InputProps={{
            sx: {
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              fontWeight: 600,
              letterSpacing: 1,
              color: colors.DEEP_PURPLE_LIGHT || '#B39DDB',
            },
          }}
          helperText="Find your tag in-game under Profile"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: alpha(colors.DEEP_PURPLE, 0.4),
              },
            },
          }}
        />

        {/* Error */}
        {error && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon sx={{ color: '#f59e0b' }} />}
            sx={{
              mb: 2,
              borderRadius: 2,
              bgcolor: alpha('#f59e0b', 0.08),
              border: `1px solid ${alpha('#f59e0b', 0.25)}`,
              color: '#fbbf24',
              '& .MuiAlert-message': { color: '#fbbf24' },
            }}
          >
            {error}
          </Alert>
        )}

        {/* Token warning (token verify failed but tag is valid) */}
        {tokenWarning && !error && (
          <Alert
            severity="info"
            sx={{
              mb: 2,
              borderRadius: 2,
              bgcolor: alpha('#3b82f6', 0.08),
              border: `1px solid ${alpha('#3b82f6', 0.25)}`,
            }}
          >
            {tokenWarning}
          </Alert>
        )}

        {/* Verified result */}
        {verified && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: alpha(verified.tokenVerified ? '#4ade80' : '#f59e0b', 0.08),
              border: `1px solid ${alpha(verified.tokenVerified ? '#4ade80' : '#f59e0b', 0.3)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box sx={{ fontSize: 28 }}>{verified.tokenVerified ? '✅' : '⚠️'}</Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: verified.tokenVerified ? '#4ade80' : '#fbbf24' }}>
                {verified.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                {verified.tag}
                {verified.tokenVerified && ' — Token Verified ✓'}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Action Button */}
        {!verified ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleConnect}
            disabled={verifying || tag.length < 4}
            sx={{
              py: 1.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: 1,
              borderRadius: 2,
              background: goldGradient,
              color: '#1a1a2e',
              boxShadow: `0 4px 20px ${alpha(colors.ROYAL_GOLD, 0.3)}`,
              '&:hover': {
                background: goldGradient,
                boxShadow: `0 6px 28px ${alpha(colors.ROYAL_GOLD, 0.45)}`,
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            {verifying ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} sx={{ color: '#1a1a2e' }} />
                <span>Verifying…</span>
              </Box>
            ) : (
              'CONNECT & START'
            )}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={handleContinue}
            sx={{
              py: 1.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: 1,
              borderRadius: 2,
              background: goldGradient,
              color: '#1a1a2e',
              boxShadow: `0 4px 20px ${alpha(colors.ROYAL_GOLD, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 28px ${alpha(colors.ROYAL_GOLD, 0.45)}`,
              },
            }}
          >
            CONTINUE →
          </Button>
        )}
      </Paper>

      {/* Skip for Demo */}
      {dataMode === 'demo' && (
        <Button
          className="animate-fadeSlideUp"
          variant="text"
          onClick={() => {
            addAccount({ tag: '#DEMO000', name: 'DemoChief', addedAt: Date.now() });
            navigateTo(SCREENS.SYNC);
          }}
          sx={{
            mt: 2,
            color: 'text.secondary',
            animationDelay: '0.5s',
            textTransform: 'none',
          }}
        >
          Skip → Use Demo Account
        </Button>
      )}
    </Box>
  );
}
