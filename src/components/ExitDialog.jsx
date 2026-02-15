// ============================================
// Clash Intelligence Pro – Exit Dialog
// ============================================
// Confirmation dialog for app exit with:
//   - Glassmorphism backdrop
//   - Gold-accent styling
//   - Shield icon + branded text
//   - Confirm / Cancel actions
//   - Keyboard support (Escape to cancel)
// ============================================

import { memo, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { ThemeContext } from '../App';
import { colors, goldGradient, purpleGradient } from '../theme/theme';

/**
 * @param {object}   props
 * @param {boolean}  props.open       – Dialog visibility
 * @param {function} props.onConfirm  – Called when user confirms exit
 * @param {function} props.onCancel   – Called when user cancels
 */
function ExitDialog({ open, onConfirm, onCancel }) {
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          background: isDark
            ? 'linear-gradient(145deg, rgba(30,41,59,0.95), rgba(15,23,42,0.98))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.97), rgba(245,245,255,0.99))',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${isDark ? 'rgba(212,175,55,0.15)' : 'rgba(46,26,71,0.08)'}`,
          borderRadius: '16px',
          maxWidth: 320,
          mx: 2,
        },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${colors.ROYAL_GOLD}15`,
            border: `1px solid ${colors.ROYAL_GOLD}22`,
          }}
        >
          <ExitToAppIcon sx={{ color: colors.ROYAL_GOLD, fontSize: 22 }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '1rem',
            background: goldGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Exit App?
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
            fontSize: '0.85rem',
          }}
        >
          Are you sure you want to exit Clash Intelligence Pro? Your data is saved automatically.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            flex: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
            color: 'text.secondary',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8rem',
            py: 0.8,
            '&:hover': {
              borderColor: colors.ROYAL_GOLD,
              color: colors.ROYAL_GOLD,
              bgcolor: `${colors.ROYAL_GOLD}08`,
            },
          }}
        >
          Stay
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            flex: 1,
            background: purpleGradient,
            color: '#fff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            py: 0.8,
            boxShadow: '0 4px 15px rgba(46,26,71,0.4)',
            '&:hover': {
              background: purpleGradient,
              boxShadow: '0 6px 20px rgba(46,26,71,0.5)',
            },
          }}
        >
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(ExitDialog);
