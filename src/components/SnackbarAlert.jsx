// ============================================
// Clash Intelligence Pro – Snackbar Alert
// ============================================
// Reusable snackbar notification component with:
//   - Gold/purple themed styling
//   - Auto-dismiss with configurable duration
//   - Severity levels (success/error/warning/info)
//   - Glass backdrop effect
//   - Optional action button
//   - Bottom-safe positioning
// ============================================

import { memo, useCallback } from 'react';
import { Snackbar, Alert, Button, Slide } from '@mui/material';
import { colors } from '../theme/theme';

// ─── Severity → Color Mapping ──────────────────────────
const SEVERITY_STYLES = {
  success: {
    bgcolor: 'rgba(76, 175, 80, 0.95)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
    color: '#fff',
  },
  error: {
    bgcolor: 'rgba(211, 47, 47, 0.95)',
    borderColor: 'rgba(211, 47, 47, 0.4)',
    color: '#fff',
  },
  warning: {
    bgcolor: 'rgba(46, 26, 71, 0.95)',
    borderColor: `rgba(212, 175, 55, 0.3)`,
    color: colors.ROYAL_GOLD,
  },
  info: {
    bgcolor: 'rgba(46, 26, 71, 0.95)',
    borderColor: `rgba(212, 175, 55, 0.3)`,
    color: colors.ROYAL_GOLD,
  },
};

// Slide transition from bottom
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

/**
 * @param {object}   props
 * @param {boolean}  props.open         – Snackbar visibility
 * @param {function} props.onClose      – Close callback
 * @param {string}   props.message      – Alert message text
 * @param {'success'|'error'|'warning'|'info'} [props.severity='info'] – Alert severity
 * @param {number}   [props.duration=3000] – Auto-hide duration in ms
 * @param {string}   [props.actionLabel] – Optional action button text
 * @param {function} [props.onAction]    – Action button click handler
 * @param {boolean}  [props.hasBottomNav=false] – Add extra bottom margin for bottom nav
 * @param {object}   [props.sx]          – Extra sx overrides
 */
function SnackbarAlert({
  open,
  onClose,
  message,
  severity = 'info',
  duration = 3000,
  actionLabel,
  onAction,
  hasBottomNav = false,
  sx = {},
}) {
  const styles = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;

  const handleAction = useCallback(() => {
    if (onAction) onAction();
    if (onClose) onClose();
  }, [onAction, onClose]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{
        mb: hasBottomNav ? 9 : 2,
        ...sx,
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        action={
          actionLabel ? (
            <Button
              size="small"
              onClick={handleAction}
              sx={{
                color: 'inherit',
                fontWeight: 700,
                fontSize: '0.72rem',
                textTransform: 'none',
                minWidth: 'auto',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
        sx={{
          bgcolor: styles.bgcolor,
          color: styles.color,
          border: `1px solid ${styles.borderColor}`,
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          fontWeight: 600,
          fontSize: '0.82rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          alignItems: 'center',

          '& .MuiAlert-icon': {
            color: styles.color,
            opacity: 0.9,
          },
          '& .MuiAlert-action': {
            pt: 0,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default memo(SnackbarAlert);
