// ============================================
// Clash Intelligence Pro – Account Switcher
// ============================================
// Account selection/management component with:
//   - Current account display with TH badge
//   - Dropdown list of saved accounts
//   - Switch, remove, add actions
//   - Remove confirmation dialog
//   - Glass-card styling
// ============================================

import { useState, memo, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonIcon from '@mui/icons-material/Person';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppContext, ThemeContext } from '../App';
import { colors, goldGradient } from '../theme/theme';

function AccountSwitcher() {
  const {
    activeAccount,
    accounts,
    switchAccount,
    removeAccount,
    navigateTo,
    SCREENS,
  } = useContext(AppContext);
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const [expanded, setExpanded] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const currentAccount = accounts.find((a) => a.tag === activeAccount);

  const handleSwitch = (tag) => {
    if (tag === activeAccount) return;
    switchAccount(tag);
    setExpanded(false);
  };

  const handleRemoveConfirm = () => {
    if (confirmRemove) {
      removeAccount(confirmRemove);
      setConfirmRemove(null);
    }
  };

  const handleAddAccount = () => {
    setExpanded(false);
    navigateTo(SCREENS.LOGIN);
  };

  return (
    <>
      <Paper className="glass-card" sx={{ p: 2, overflow: 'hidden' }}>
        {/* Current Account Header */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            '&:active': { opacity: 0.8 },
          }}
        >
          {/* TH Badge */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: goldGradient,
              boxShadow: `0 2px 8px ${colors.ROYAL_GOLD}33`,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 800,
                fontSize: '0.75rem',
                color: '#1a1a2e',
              }}
            >
              {currentAccount?.townHallLevel
                ? `${currentAccount.townHallLevel}`
                : '?'}
            </Typography>
          </Box>

          {/* Name + Tag */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentAccount?.name || 'No Account'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              {currentAccount?.tag || 'Add an account to get started'}
            </Typography>
          </Box>

          {/* Account count badge */}
          {accounts.length > 1 && (
            <Chip
              label={accounts.length}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: `${colors.ROYAL_GOLD}15`,
                color: colors.ROYAL_GOLD,
              }}
            />
          )}

          {/* Expand toggle */}
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Expanded Account List */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {accounts.map((account) => {
              const isActive = account.tag === activeAccount;

              return (
                <Box
                  key={account.tag}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: isActive
                      ? `${colors.ROYAL_GOLD}10`
                      : 'transparent',
                    border: isActive
                      ? `1px solid ${colors.ROYAL_GOLD}22`
                      : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* TH mini badge */}
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isActive
                        ? `${colors.ROYAL_GOLD}20`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Orbitron',
                        fontWeight: 700,
                        fontSize: '0.6rem',
                        color: isActive ? colors.ROYAL_GOLD : 'text.secondary',
                      }}
                    >
                      {account.townHallLevel || '?'}
                    </Typography>
                  </Box>

                  {/* Name / Tag */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {account.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', fontSize: '0.62rem' }}
                    >
                      {account.tag}
                    </Typography>
                  </Box>

                  {/* Active indicator */}
                  {isActive && (
                    <CheckCircleIcon
                      sx={{ fontSize: 16, color: colors.ROYAL_GOLD }}
                    />
                  )}

                  {/* Switch button */}
                  {!isActive && (
                    <IconButton
                      size="small"
                      onClick={() => handleSwitch(account.tag)}
                      sx={{
                        color: colors.ROYAL_GOLD,
                        bgcolor: `${colors.ROYAL_GOLD}10`,
                        width: 28,
                        height: 28,
                        '&:hover': { bgcolor: `${colors.ROYAL_GOLD}20` },
                      }}
                    >
                      <SwapHorizIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                  {/* Remove button */}
                  <IconButton
                    size="small"
                    onClick={() => setConfirmRemove(account.tag)}
                    sx={{
                      color: 'rgba(244,67,54,0.6)',
                      width: 28,
                      height: 28,
                      '&:hover': { color: '#f44336', bgcolor: 'rgba(244,67,54,0.08)' },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              );
            })}

            {/* Add Account button */}
            <Box
              onClick={handleAddAccount}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                p: 1,
                borderRadius: 2,
                border: `1px dashed ${isDark ? 'rgba(212,175,55,0.2)' : 'rgba(46,26,71,0.15)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: colors.ROYAL_GOLD,
                  bgcolor: `${colors.ROYAL_GOLD}08`,
                },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <AddIcon sx={{ fontSize: 16, color: colors.ROYAL_GOLD }} />
              <Typography
                variant="caption"
                sx={{
                  color: colors.ROYAL_GOLD,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                }}
              >
                Add Account
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={Boolean(confirmRemove)}
        onClose={() => setConfirmRemove(null)}
        PaperProps={{
          sx: {
            background: isDark
              ? 'rgba(30,41,59,0.95)'
              : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            maxWidth: 300,
            border: `1px solid ${isDark ? 'rgba(244,67,54,0.15)' : 'rgba(244,67,54,0.1)'}`,
          },
        }}
      >
        <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700 }}>
          Remove Account?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
            This will remove{' '}
            <strong>{accounts.find((a) => a.tag === confirmRemove)?.name}</strong>{' '}
            ({confirmRemove}) from your saved accounts.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmRemove(null)}
            size="small"
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            size="small"
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default memo(AccountSwitcher);
