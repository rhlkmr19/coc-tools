// ============================================
// Clash Intelligence Pro – Root Application
// ============================================
// Architecture:
//   - Single-page with screen-based navigation
//   - popstate + history.pushState for native back behavior
//   - Double-back exit logic (Snackbar → Confirm dialog)
//   - Bottom navigation with 6 tabs
//   - Slide/Fade transitions between screens
//   - Dark/Light theme toggle via context
// ============================================
import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useRef } from 'react';
import { ThemeProvider, CssBaseline, Snackbar, Alert, Slide, Fade, Box } from '@mui/material';
import { createAppTheme } from './theme/theme';

// ─── Screens ───────────────────────────────────────────
import SplashScreen from './screens/SplashScreen';
import ModeSelectionScreen from './screens/ModeSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import SyncScreen from './screens/SyncScreen';
import DashboardScreen from './screens/DashboardScreen';
import UpgradePlannerScreen from './screens/UpgradePlannerScreen';
import WarIntelligenceScreen from './screens/WarIntelligenceScreen';
import ClanDashboardScreen from './screens/ClanDashboardScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import BaseAnalysisScreen from './screens/BaseAnalysisScreen';

// ─── Components ────────────────────────────────────────
import BottomNav from './components/BottomNav';
import ExitDialog from './components/ExitDialog';
import LoadingOverlay from './components/LoadingOverlay';

// ─── Services ──────────────────────────────────────────
import { storageService } from './services/storageService';

// ============================================
// Contexts
// ============================================
export const AppContext = createContext(null);
export const ThemeContext = createContext(null);

export const useAppContext = () => useContext(AppContext);
export const useThemeContext = () => useContext(ThemeContext);

// ============================================
// Screen Definitions
// ============================================
const SCREENS = {
  SPLASH: 'splash',
  MODE_SELECT: 'mode_select',
  LOGIN: 'login',
  SYNC: 'sync',
  DASHBOARD: 'dashboard',
  UPGRADES: 'upgrades',
  WAR: 'war',
  CLAN: 'clan',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  BASE_ANALYSIS: 'base_analysis',
};

// Screens that show the bottom navigation
const NAV_SCREENS = [
  SCREENS.DASHBOARD,
  SCREENS.UPGRADES,
  SCREENS.WAR,
  SCREENS.CLAN,
  SCREENS.ANALYTICS,
  SCREENS.SETTINGS,
];

// Map bottom nav index → screen key
const NAV_INDEX_MAP = [
  SCREENS.DASHBOARD,
  SCREENS.UPGRADES,
  SCREENS.WAR,
  SCREENS.CLAN,
  SCREENS.ANALYTICS,
  SCREENS.SETTINGS,
];

// ============================================
// App Component
// ============================================
export default function App() {
  // ─── State ─────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SPLASH);
  const [previousScreen, setPreviousScreen] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    return storageService.get('themeMode') || 'dark';
  });
  const [playerData, setPlayerData] = useState(null);
  const [clanData, setClanData] = useState(null);
  const [warData, setWarData] = useState(null);
  const [dataMode, setDataMode] = useState(() => {
    return storageService.get('dataMode') || null;
  });
  const [activeAccount, setActiveAccount] = useState(() => {
    return storageService.get('activeAccount') || null;
  });
  const [accounts, setAccounts] = useState(() => {
    return storageService.get('accounts') || [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // ─── Exit Logic State ──────────────────────────────
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [showExitSnackbar, setShowExitSnackbar] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const backTimerRef = useRef(null);

  // ─── Transition State ──────────────────────────────
  const [transitionIn, setTransitionIn] = useState(true);
  const [slideDirection, setSlideDirection] = useState('left');

  // ─── Theme ─────────────────────────────────────────
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storageService.set('themeMode', next);
      return next;
    });
  }, []);

  // ─── Navigation ────────────────────────────────────
  const navigateTo = useCallback((screen, { replace = false, direction = 'left' } = {}) => {
    if (screen === currentScreen) return;

    setSlideDirection(direction);
    setTransitionIn(false);

    // Wait for exit animation, then switch screen
    setTimeout(() => {
      setPreviousScreen(currentScreen);
      setCurrentScreen(screen);
      setTransitionIn(true);

      if (!replace) {
        window.history.pushState({ screen }, '', `?screen=${screen}`);
      } else {
        window.history.replaceState({ screen }, '', `?screen=${screen}`);
      }
    }, 200);
  }, [currentScreen]);

  const navigateToTab = useCallback((index) => {
    const screen = NAV_INDEX_MAP[index];
    if (!screen || screen === currentScreen) return;

    const currentIndex = NAV_INDEX_MAP.indexOf(currentScreen);
    const direction = index > currentIndex ? 'left' : 'right';

    navigateTo(screen, { direction });
  }, [currentScreen, navigateTo]);

  // ─── Back / popstate Handling ──────────────────────
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;

      if (state?.screen && NAV_SCREENS.includes(state.screen)) {
        setTransitionIn(false);
        setTimeout(() => {
          setCurrentScreen(state.screen);
          setTransitionIn(true);
        }, 200);
        return;
      }

      // If on a main nav screen with no history → trigger exit logic
      if (NAV_SCREENS.includes(currentScreen)) {
        // Re-push current state so we don't actually leave
        window.history.pushState({ screen: currentScreen }, '', `?screen=${currentScreen}`);
        handleExitAttempt();
        return;
      }

      // If on onboarding screens, go back normally
      const onboardingFlow = [SCREENS.SPLASH, SCREENS.MODE_SELECT, SCREENS.LOGIN, SCREENS.SYNC];
      const idx = onboardingFlow.indexOf(currentScreen);
      if (idx > 0) {
        navigateTo(onboardingFlow[idx - 1], { replace: true, direction: 'right' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentScreen, navigateTo]);

  // ─── Double-Back Exit Logic ────────────────────────
  const handleExitAttempt = useCallback(() => {
    if (backPressedOnce) {
      // Second press → show confirm dialog
      setShowExitSnackbar(false);
      setShowExitDialog(true);
      setBackPressedOnce(false);
      if (backTimerRef.current) clearTimeout(backTimerRef.current);
    } else {
      // First press → show snackbar
      setBackPressedOnce(true);
      setShowExitSnackbar(true);

      backTimerRef.current = setTimeout(() => {
        setBackPressedOnce(false);
        setShowExitSnackbar(false);
      }, 2500);
    }
  }, [backPressedOnce]);

  const handleExitConfirm = useCallback(() => {
    setShowExitDialog(false);
    // Best-effort close on mobile; on desktop this is a no-op
    window.close();
    // Fallback: navigate to blank
    if (!window.closed) {
      window.location.href = 'about:blank';
    }
  }, []);

  const handleExitCancel = useCallback(() => {
    setShowExitDialog(false);
    setBackPressedOnce(false);
  }, []);

  // ─── Notification Click from SW ────────────────────
  useEffect(() => {
    const handleSWClick = (event) => {
      const { url, notificationType } = event.detail || {};
      if (notificationType === 'war') navigateTo(SCREENS.WAR);
      else if (notificationType === 'upgrade' || notificationType === 'builder') navigateTo(SCREENS.UPGRADES);
      else if (url?.includes('screen=')) {
        const screen = url.split('screen=')[1];
        if (NAV_SCREENS.includes(screen)) navigateTo(screen);
      }
    };

    window.addEventListener('sw-notification-click', handleSWClick);
    return () => window.removeEventListener('sw-notification-click', handleSWClick);
  }, [navigateTo]);

  // ─── URL param sync on mount ───────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (screen && NAV_SCREENS.includes(screen) && activeAccount) {
      setCurrentScreen(screen);
      window.history.replaceState({ screen }, '', `?screen=${screen}`);
    }
  }, []);

  // ─── Splash auto-advance ──────────────────────────
  useEffect(() => {
    if (currentScreen === SCREENS.SPLASH) {
      const timer = setTimeout(() => {
        // If user already has an active account, skip onboarding
        if (activeAccount && dataMode) {
          navigateTo(SCREENS.DASHBOARD, { replace: true });
        } else {
          navigateTo(SCREENS.MODE_SELECT, { replace: true });
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, activeAccount, dataMode, navigateTo]);

  // ─── Persist accounts/active ───────────────────────
  useEffect(() => {
    storageService.set('accounts', accounts);
  }, [accounts]);

  useEffect(() => {
    storageService.set('activeAccount', activeAccount);
  }, [activeAccount]);

  useEffect(() => {
    if (dataMode) storageService.set('dataMode', dataMode);
  }, [dataMode]);

  // ─── Account Management ────────────────────────────
  const addAccount = useCallback((account) => {
    setAccounts((prev) => {
      const exists = prev.find((a) => a.tag === account.tag);
      if (exists) return prev.map((a) => (a.tag === account.tag ? { ...a, ...account } : a));
      return [...prev, account];
    });
    setActiveAccount(account.tag);
  }, []);

  const switchAccount = useCallback((tag) => {
    setActiveAccount(tag);
    setPlayerData(null);
    setClanData(null);
    setWarData(null);
    navigateTo(SCREENS.SYNC, { replace: true });
  }, [navigateTo]);

  const removeAccount = useCallback((tag) => {
    setAccounts((prev) => prev.filter((a) => a.tag !== tag));
    if (activeAccount === tag) {
      setActiveAccount(null);
      setPlayerData(null);
      setClanData(null);
      setWarData(null);
      navigateTo(SCREENS.MODE_SELECT, { replace: true });
    }
  }, [activeAccount, navigateTo]);

  // ─── Loading Helpers ───────────────────────────────
  const showLoading = useCallback((msg = 'Loading...') => {
    setLoadingMessage(msg);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  // ─── Context Values ────────────────────────────────
  const appContextValue = useMemo(() => ({
    // Navigation
    currentScreen,
    navigateTo,
    navigateToTab,
    SCREENS,
    // Data
    playerData,
    setPlayerData,
    clanData,
    setClanData,
    warData,
    setWarData,
    dataMode,
    setDataMode,
    // Accounts
    activeAccount,
    accounts,
    addAccount,
    switchAccount,
    removeAccount,
    // Loading
    isLoading,
    showLoading,
    hideLoading,
    loadingMessage,
  }), [
    currentScreen, navigateTo, navigateToTab,
    playerData, clanData, warData, dataMode,
    activeAccount, accounts, addAccount, switchAccount, removeAccount,
    isLoading, showLoading, hideLoading, loadingMessage,
  ]);

  const themeContextValue = useMemo(() => ({
    mode: themeMode,
    toggleTheme,
  }), [themeMode, toggleTheme]);

  // ─── Screen Renderer ──────────────────────────────
  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.SPLASH:
        return <SplashScreen />;
      case SCREENS.MODE_SELECT:
        return <ModeSelectionScreen />;
      case SCREENS.LOGIN:
        return <LoginScreen />;
      case SCREENS.SYNC:
        return <SyncScreen />;
      case SCREENS.DASHBOARD:
        return <DashboardScreen />;
      case SCREENS.UPGRADES:
        return <UpgradePlannerScreen />;
      case SCREENS.WAR:
        return <WarIntelligenceScreen />;
      case SCREENS.CLAN:
        return <ClanDashboardScreen />;
      case SCREENS.ANALYTICS:
        return <AnalyticsScreen />;
      case SCREENS.SETTINGS:
        return <SettingsScreen />;
      case SCREENS.BASE_ANALYSIS:
        return <BaseAnalysisScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const showBottomNav = NAV_SCREENS.includes(currentScreen);
  const activeNavIndex = NAV_INDEX_MAP.indexOf(currentScreen);

  // ─── Render ────────────────────────────────────────
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContext.Provider value={appContextValue}>
          <Box
            sx={{
              minHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Screen Content with Transitions */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                pb: showBottomNav ? '64px' : 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Use Fade for onboarding, Slide for main tabs */}
              {NAV_SCREENS.includes(currentScreen) ? (
                <Slide
                  direction={slideDirection === 'left' ? 'left' : 'right'}
                  in={transitionIn}
                  timeout={250}
                  mountOnEnter
                  unmountOnExit
                >
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {renderScreen()}
                  </Box>
                </Slide>
              ) : (
                <Fade in={transitionIn} timeout={300}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {renderScreen()}
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Bottom Navigation */}
            {showBottomNav && (
              <BottomNav
                activeIndex={activeNavIndex}
                onChange={navigateToTab}
              />
            )}

            {/* Loading Overlay */}
            <LoadingOverlay open={isLoading} message={loadingMessage} />

            {/* Exit Snackbar – "Press back again to exit" */}
            <Snackbar
              open={showExitSnackbar}
              autoHideDuration={2500}
              onClose={() => setShowExitSnackbar(false)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              sx={{ mb: showBottomNav ? 8 : 2 }}
            >
              <Alert
                severity="info"
                variant="filled"
                sx={{
                  bgcolor: 'rgba(46, 26, 71, 0.95)',
                  color: '#D4AF37',
                  fontWeight: 600,
                  borderRadius: 2,
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                Press back again to exit
              </Alert>
            </Snackbar>

            {/* Exit Confirmation Dialog */}
            <ExitDialog
              open={showExitDialog}
              onConfirm={handleExitConfirm}
              onCancel={handleExitCancel}
            />
          </Box>
        </AppContext.Provider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
