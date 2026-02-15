// ============================================
// Clash Intelligence Pro – Settings Screen
// ============================================
// Theme toggle, account management, notification
// settings, data export/import, cache clear,
// API status, about section.
// ============================================
import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Switch, Button, Divider,
  List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, alpha, Snackbar, Alert, IconButton,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, colors } from '../theme/theme';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { aiService } from '../services/aiService';
import { notificationService } from '../services/notificationService';

export default function SettingsScreen() {
  const {
    accounts, activeAccount, switchAccount, removeAccount, addAccount,
    navigateTo, SCREENS, dataMode, setDataMode,
  } = useAppContext();
  const { mode, toggleTheme } = useThemeContext();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState('#');
  const [confirmRemoveTag, setConfirmRemoveTag] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [notifEnabled, setNotifEnabled] = useState(() => {
    return storageService.get('notificationsEnabled') !== false;
  });

  const showSnack = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ─── Notifications Toggle ──────────────────────────
  const handleNotifToggle = async () => {
    const next = !notifEnabled;
    setNotifEnabled(next);
    storageService.set('notificationsEnabled', next);

    if (next) {
      const perm = await notificationService.requestPermission();
      if (perm !== 'granted') {
        setNotifEnabled(false);
        storageService.set('notificationsEnabled', false);
        showSnack('Notification permission denied. Enable in browser settings.', 'warning');
      } else {
        showSnack('Notifications enabled');
      }
    } else {
      notificationService.cancelAll();
      showSnack('Notifications disabled');
    }
  };

  // ─── Export Data ───────────────────────────────────
  const handleExport = async () => {
    try {
      const data = await storageService.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clash-intel-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSnack('Data exported successfully');
    } catch (err) {
      showSnack('Export failed: ' + err.message, 'error');
    }
  };

  // ─── Import Data ───────────────────────────────────
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await storageService.importAllData(data);
        showSnack('Data imported successfully. Reload recommended.', 'success');
      } catch (err) {
        showSnack('Import failed: ' + err.message, 'error');
      }
    };
    input.click();
  };

  // ─── Clear Cache ───────────────────────────────────
  const handleClearCache = () => {
    apiService.clearCache();
    showSnack('API cache cleared');
  };

  // ─── Add Account ───────────────────────────────────
  const handleAddAccount = () => {
    const tag = newTag.trim().toUpperCase();
    if (tag.length < 4) return;
    addAccount({ tag, name: tag, addedAt: Date.now() });
    setAddDialogOpen(false);
    setNewTag('#');
    navigateTo(SCREENS.SYNC);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: 2, pt: 2, pb: 3 }}>
      {/* Header */}
      <Typography
        className="animate-fadeSlideUp"
        variant="h6"
        sx={{
          fontFamily: '"Orbitron"',
          fontWeight: 700,
          background: goldGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          mb: 2,
        }}
      >
        ⚙️ Settings
      </Typography>

      {/* ═══ Appearance ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ mb: 2, border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}` }}
      >
        <List disablePadding>
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>🎨</ListItemIcon>
            <ListItemText
              primary="Dark Mode"
              secondary={mode === 'dark' ? 'Dark theme active' : 'Light theme active'}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <ListItemSecondaryAction>
              <Switch checked={mode === 'dark'} onChange={toggleTheme} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* ═══ Notifications ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ mb: 2, animationDelay: '0.05s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}` }}
      >
        <List disablePadding>
          <ListItem sx={{ py: 1.5, px: 2 }}>
            <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>🔔</ListItemIcon>
            <ListItemText
              primary="Notifications"
              secondary="War reminders, upgrade alerts"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            <ListItemSecondaryAction>
              <Switch checked={notifEnabled} onChange={handleNotifToggle} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      {/* ═══ Accounts ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}` }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            👤 Accounts
          </Typography>
        </Box>

        <List disablePadding>
          {accounts.map((acc) => (
            <ListItem
              key={acc.tag}
              sx={{
                py: 1,
                px: 2,
                bgcolor: acc.tag === activeAccount ? alpha(colors.ROYAL_GOLD, 0.05) : 'transparent',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {acc.name}
                    </Typography>
                    {acc.tag === activeAccount && (
                      <Chip
                        label="ACTIVE"
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.5rem',
                          fontWeight: 700,
                          bgcolor: alpha('#4ade80', 0.15),
                          color: '#4ade80',
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={acc.tag}
                secondaryTypographyProps={{ variant: 'caption', fontFamily: 'monospace', fontSize: '0.65rem' }}
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {acc.tag !== activeAccount && (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => switchAccount(acc.tag)}
                      sx={{ fontSize: '0.65rem', minWidth: 'auto', textTransform: 'none' }}
                    >
                      Switch
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setConfirmRemoveTag(acc.tag)}
                    sx={{ fontSize: '0.65rem', minWidth: 'auto', color: '#ef4444', textTransform: 'none' }}
                  >
                    Remove
                  </Button>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}

          {accounts.length === 0 && (
            <ListItem sx={{ py: 2, px: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                No accounts added yet
              </Typography>
            </ListItem>
          )}
        </List>

        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => setAddDialogOpen(true)}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            + Add Account
          </Button>
        </Box>
      </Paper>

      {/* ═══ Data Management ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ mb: 2, animationDelay: '0.15s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}` }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>💾 Data Management</Typography>
        </Box>
        <List disablePadding>
          <ListItem
            component="div"
            onClick={handleExport}
            sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
          >
            <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>📤</ListItemIcon>
            <ListItemText
              primary="Export Data"
              secondary="Download all data as JSON backup"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem
            component="div"
            onClick={handleImport}
            sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
          >
            <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>📥</ListItemIcon>
            <ListItemText
              primary="Import Data"
              secondary="Restore from a JSON backup file"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
          <ListItem
            component="div"
            onClick={handleClearCache}
            sx={{ py: 1.5, px: 2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}
          >
            <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>🗑️</ListItemIcon>
            <ListItemText
              primary="Clear API Cache"
              secondary="Force fresh data on next sync"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* ═══ API Status ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ mb: 2, animationDelay: '0.2s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}` }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>🔗 API Status</Typography>
        </Box>
        <List disablePadding>
          <ListItem sx={{ py: 1, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: apiService.isConfigured() ? '#4ade80' : '#ef4444',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>CoC API</Typography>
            </Box>
            <Chip
              label={apiService.isConfigured() ? 'Connected' : 'Not Configured'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 600,
                bgcolor: alpha(apiService.isConfigured() ? '#4ade80' : '#ef4444', 0.12),
                color: apiService.isConfigured() ? '#4ade80' : '#ef4444',
              }}
            />
          </ListItem>
          <ListItem sx={{ py: 1, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: aiService.isConfigured() ? '#4ade80' : '#f59e0b',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>AI (OpenRouter)</Typography>
            </Box>
            <Chip
              label={aiService.isConfigured() ? 'Connected' : 'Optional'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 600,
                bgcolor: alpha(aiService.isConfigured() ? '#4ade80' : '#f59e0b', 0.12),
                color: aiService.isConfigured() ? '#4ade80' : '#f59e0b',
              }}
            />
          </ListItem>
          <ListItem sx={{ py: 1, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%',
                  bgcolor: dataMode === 'demo' ? '#f59e0b' : '#4ade80',
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Data Mode</Typography>
            </Box>
            <Chip
              label={dataMode === 'demo' ? 'Demo' : 'Live'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 600,
                bgcolor: alpha(dataMode === 'demo' ? '#f59e0b' : '#4ade80', 0.12),
                color: dataMode === 'demo' ? '#f59e0b' : '#4ade80',
              }}
            />
          </ListItem>
        </List>
      </Paper>

      {/* ═══ About ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ p: 2, mb: 2, animationDelay: '0.25s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}`, textAlign: 'center' }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontFamily: '"Orbitron"',
            fontWeight: 700,
            background: goldGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 0.5,
          }}
        >
          Clash Intelligence Pro
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          v1.0.0 • Advanced Clash of Clans Companion
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}>
          Not affiliated with Supercell. Clash of Clans is a trademark of Supercell.
        </Typography>
      </Paper>

      {/* ═══ Add Account Dialog ═══ */}
      <Dialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 340, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem' }}>Add Account</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Player Tag"
            placeholder="#ABC123"
            value={newTag}
            onChange={(e) => {
              let v = e.target.value.toUpperCase().replace(/[^A-Z0-9#]/g, '');
              if (!v.startsWith('#')) v = '#' + v;
              v = '#' + v.replace(/#/g, '');
              setNewTag(v);
            }}
            sx={{ mt: 1 }}
            InputProps={{
              sx: { fontFamily: 'monospace', fontWeight: 600 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={handleAddAccount}
            variant="contained"
            disabled={newTag.length < 4}
            sx={{ textTransform: 'none' }}
          >
            Add & Sync
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Confirm Remove Dialog ═══ */}
      <Dialog
        open={Boolean(confirmRemoveTag)}
        onClose={() => setConfirmRemoveTag(null)}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 300, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444' }}>Remove Account?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Remove <strong>{confirmRemoveTag}</strong> from your accounts? This won't delete stored history.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveTag(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            onClick={() => {
              removeAccount(confirmRemoveTag);
              setConfirmRemoveTag(null);
              showSnack('Account removed');
            }}
            sx={{ textTransform: 'none', color: '#ef4444' }}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ Snackbar ═══ */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
