// ============================================
// Clash Intelligence Pro – Sync Screen
// ============================================
// Fetches all player data (player + clan + war)
// with animated progress steps, then navigates
// to Dashboard.
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, LinearProgress, Paper, alpha, Fade,
} from '@mui/material';
import { useAppContext } from '../App';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { goldGradient, colors } from '../theme/theme';

// Demo data for offline / demo mode
const DEMO_PLAYER = {
  tag: '#DEMO000',
  name: 'DemoChief',
  townHallLevel: 15,
  townHallWeaponLevel: 5,
  expLevel: 230,
  trophies: 5200,
  bestTrophies: 5600,
  warStars: 1450,
  attackWins: 3200,
  defenseWins: 680,
  builderHallLevel: 10,
  versusTrophies: 4000,
  league: { id: 29000022, name: 'Legend League', iconUrls: {} },
  clan: { tag: '#DEMOCLN', name: 'Demo Warriors', clanLevel: 18, badgeUrls: {} },
  role: 'leader',
  donations: 4500,
  donationsReceived: 2100,
  heroes: [
    { name: 'Barbarian King', level: 80, maxLevel: 95, village: 'home' },
    { name: 'Archer Queen', level: 82, maxLevel: 95, village: 'home' },
    { name: 'Grand Warden', level: 60, maxLevel: 70, village: 'home' },
    { name: 'Royal Champion', level: 38, maxLevel: 45, village: 'home' },
  ],
  troops: [
    { name: 'Barbarian', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Archer', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Giant', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Goblin', level: 9, maxLevel: 9, village: 'home' },
    { name: 'Wall Breaker', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Balloon', level: 10, maxLevel: 12, village: 'home' },
    { name: 'Wizard', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Healer', level: 8, maxLevel: 9, village: 'home' },
    { name: 'Dragon', level: 10, maxLevel: 11, village: 'home' },
    { name: 'P.E.K.K.A', level: 10, maxLevel: 11, village: 'home' },
    { name: 'Lava Hound', level: 6, maxLevel: 7, village: 'home' },
    { name: 'Witch', level: 6, maxLevel: 6, village: 'home' },
    { name: 'Golem', level: 11, maxLevel: 12, village: 'home' },
    { name: 'Hog Rider', level: 12, maxLevel: 13, village: 'home' },
    { name: 'Miner', level: 9, maxLevel: 10, village: 'home' },
    { name: 'Electro Dragon', level: 6, maxLevel: 7, village: 'home' },
    { name: 'Yeti', level: 4, maxLevel: 5, village: 'home' },
  ],
  spells: [
    { name: 'Lightning Spell', level: 10, maxLevel: 11 },
    { name: 'Healing Spell', level: 9, maxLevel: 10 },
    { name: 'Rage Spell', level: 6, maxLevel: 6 },
    { name: 'Freeze Spell', level: 7, maxLevel: 8 },
    { name: 'Earthquake Spell', level: 5, maxLevel: 6 },
    { name: 'Bat Spell', level: 6, maxLevel: 7 },
    { name: 'Invisibility Spell', level: 4, maxLevel: 5 },
  ],
  achievements: [],
};

const DEMO_CLAN = {
  tag: '#DEMOCLN',
  name: 'Demo Warriors',
  description: 'A demo clan for Clash Intelligence Pro!',
  clanLevel: 18,
  clanPoints: 42000,
  clanVersusPoints: 38000,
  requiredTrophies: 4000,
  requiredTownhallLevel: 12,
  warFrequency: 'always',
  warWinStreak: 5,
  warWins: 320,
  warLosses: 85,
  warTies: 12,
  isWarLogPublic: true,
  members: 46,
  memberList: Array.from({ length: 46 }, (_, i) => ({
    tag: `#MEMBER${i}`,
    name: `Warrior${i + 1}`,
    role: i === 0 ? 'leader' : i < 5 ? 'coLeader' : i < 15 ? 'admin' : 'member',
    expLevel: 150 + Math.floor(Math.random() * 100),
    league: { name: i < 10 ? 'Legend League' : i < 25 ? 'Titan League I' : 'Champion League I' },
    trophies: 4800 - i * 60 + Math.floor(Math.random() * 200),
    townHallLevel: Math.max(10, 17 - Math.floor(i / 5)),
    donations: Math.max(0, 5000 - i * 100 + Math.floor(Math.random() * 500)),
    donationsReceived: Math.max(0, 2500 - i * 50 + Math.floor(Math.random() * 300)),
  })),
  badgeUrls: {},
};

const DEMO_WAR = {
  state: 'inWar',
  teamSize: 30,
  startTime: new Date(Date.now() - 6 * 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + '.000Z',
  endTime: new Date(Date.now() + 18 * 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + '.000Z',
  clan: {
    tag: '#DEMOCLN',
    name: 'Demo Warriors',
    clanLevel: 18,
    stars: 72,
    destructionPercentage: 85.4,
    attacks: 48,
    members: Array.from({ length: 30 }, (_, i) => ({
      tag: `#MEMBER${i}`,
      name: `Warrior${i + 1}`,
      townhallLevel: Math.max(12, 17 - Math.floor(i / 4)),
      mapPosition: i + 1,
      attacks: i < 24
        ? [{ stars: Math.min(3, Math.floor(Math.random() * 4)), destructionPercentage: 60 + Math.random() * 40, order: i + 1, defenderTag: `#OPP${29 - i}` }]
        : [],
      opponentAttacks: Math.random() > 0.5
        ? Math.floor(Math.random() * 2) + 1
        : 0,
      bestOpponentAttack: Math.random() > 0.5
        ? { stars: Math.floor(Math.random() * 3) + 1, destructionPercentage: 50 + Math.random() * 50 }
        : null,
    })),
  },
  opponent: {
    tag: '#OPPCLN',
    name: 'Opponent Clan',
    clanLevel: 15,
    stars: 58,
    destructionPercentage: 72.1,
    attacks: 42,
  },
};

// Sync step definitions
const SYNC_STEPS = [
  { key: 'player', label: 'Loading player profile…', icon: '👤' },
  { key: 'clan', label: 'Fetching clan data…', icon: '🏰' },
  { key: 'war', label: 'Checking war status…', icon: '⚔️' },
  { key: 'storage', label: 'Saving to local storage…', icon: '💾' },
  { key: 'notifications', label: 'Setting up notifications…', icon: '🔔' },
  { key: 'done', label: 'All data synced!', icon: '✅' },
];

export default function SyncScreen() {
  const {
    navigateTo, SCREENS,
    activeAccount, dataMode,
    setPlayerData, setClanData, setWarData,
    showLoading, hideLoading,
  } = useAppContext();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState({}); // key → 'loading' | 'done' | 'error'
  const [error, setError] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    startSync();
  }, []);

  const advanceStep = (key, status = 'done') => {
    setStepStatus((prev) => ({ ...prev, [key]: status }));
    setCurrentStep((prev) => Math.min(prev + 1, SYNC_STEPS.length - 1));
  };

  const startSync = async () => {
    const playerTag = activeAccount || '#DEMO000';

    try {
      // Step 1: Player
      setStepStatus({ player: 'loading' });

      let player, clan, war;

      if (dataMode === 'demo') {
        await new Promise((r) => setTimeout(r, 600));
        player = DEMO_PLAYER;
        advanceStep('player');

        // Step 2: Clan
        setStepStatus((p) => ({ ...p, clan: 'loading' }));
        await new Promise((r) => setTimeout(r, 500));
        clan = DEMO_CLAN;
        advanceStep('clan');

        // Step 3: War
        setStepStatus((p) => ({ ...p, war: 'loading' }));
        await new Promise((r) => setTimeout(r, 400));
        war = DEMO_WAR;
        advanceStep('war');
      } else {
        // Live mode – use apiService.fetchAllPlayerData
        const result = await apiService.fetchAllPlayerData(playerTag);

        if (!result.player) {
          throw new Error(result.errors[0]?.error || 'Failed to load player data');
        }

        player = result.player;
        advanceStep('player');

        await new Promise((r) => setTimeout(r, 200));
        clan = result.clan;
        advanceStep('clan');

        await new Promise((r) => setTimeout(r, 200));
        war = result.war;
        advanceStep('war');
      }

      // Step 4: Save to storage
      setStepStatus((p) => ({ ...p, storage: 'loading' }));
      await new Promise((r) => setTimeout(r, 300));

      try {
        await storageService.recordPlayerSnapshot(playerTag, player);
      } catch {
        // Non-critical – continue
      }
      advanceStep('storage');

      // Step 5: Notifications
      setStepStatus((p) => ({ ...p, notifications: 'loading' }));
      await new Promise((r) => setTimeout(r, 300));

      try {
        if (player) notificationService.setupFromPlayerData(player);
      } catch {
        // Non-critical
      }
      advanceStep('notifications');

      // Step 6: Done
      setStepStatus((p) => ({ ...p, done: 'done' }));
      setPlayerData(player);
      setClanData(clan || null);
      setWarData(war || null);

      // Navigate to dashboard after a brief pause
      await new Promise((r) => setTimeout(r, 600));
      navigateTo(SCREENS.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Sync failed');
      const failedStep = SYNC_STEPS[currentStep]?.key;
      if (failedStep) {
        setStepStatus((p) => ({ ...p, [failedStep]: 'error' }));
      }
    }
  };

  const progress = Math.round(((currentStep) / (SYNC_STEPS.length - 1)) * 100);

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
        }}
      >
        Syncing Data
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', mb: 4, textAlign: 'center' }}
      >
        {dataMode === 'demo' ? 'Loading demo data…' : `Fetching data for ${activeAccount || 'account'}…`}
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ width: '100%', maxWidth: 340, mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(colors.ROYAL_GOLD, 0.1),
            '& .MuiLinearProgress-bar': {
              background: goldGradient,
              borderRadius: 3,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mt: 0.5, display: 'block', textAlign: 'right' }}
        >
          {progress}%
        </Typography>
      </Box>

      {/* Steps */}
      <Paper
        className="glass-card"
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 340,
          p: 2,
          border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`,
        }}
      >
        {SYNC_STEPS.map((step, idx) => {
          const status = stepStatus[step.key];
          const isActive = idx === currentStep;
          const isPast = status === 'done';
          const isError = status === 'error';

          return (
            <Fade in key={step.key} timeout={300} style={{ transitionDelay: `${idx * 80}ms` }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1,
                  px: 1,
                  borderRadius: 1.5,
                  bgcolor: isActive ? alpha(colors.ROYAL_GOLD, 0.05) : 'transparent',
                  opacity: isPast || isActive || isError ? 1 : 0.35,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Status indicator */}
                <Box sx={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                  {isError ? '❌' : isPast ? '✅' : isActive && status === 'loading' ? (
                    <Box
                      className="animate-radarSpin"
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: `2px solid ${alpha(colors.ROYAL_GOLD, 0.2)}`,
                        borderTopColor: colors.ROYAL_GOLD,
                        mx: 'auto',
                      }}
                    />
                  ) : step.icon}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 600 : 400,
                    color: isError
                      ? 'error.main'
                      : isActive
                        ? colors.ROYAL_GOLD
                        : isPast
                          ? 'text.secondary'
                          : 'text.disabled',
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            </Fade>
          );
        })}
      </Paper>

      {/* Error state */}
      {error && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'error.main', mb: 2 }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setError('');
              setCurrentStep(0);
              setStepStatus({});
              hasStarted.current = false;
              startSync();
            }}
            sx={{ mr: 1 }}
          >
            Retry
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={() => navigateTo(SCREENS.MODE_SELECT, { replace: true, direction: 'right' })}
          >
            Go Back
          </Button>
        </Box>
      )}
    </Box>
  );
}
