// ============================================
// Clash Intelligence Pro – Bottom Navigation
// ============================================
// 6-tab bottom navigation with:
//   - SVG icons (no icon library dependency)
//   - Active tab gold highlight + scale
//   - Glassmorphism backdrop
//   - Haptic-style press animation
//   - Safe-area padding for notched devices
// ============================================

import { memo, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';
import { ThemeContext } from '../App';
import { colors } from '../theme/theme';

// ─── Tab Definitions ───────────────────────────────────
const TABS = [
  { label: 'Dashboard', Icon: DashboardIcon },
  { label: 'Upgrades', Icon: BuildIcon },
  { label: 'War', Icon: LocalFireDepartmentIcon },
  { label: 'Clan', Icon: GroupsIcon },
  { label: 'Analytics', Icon: InsightsIcon },
  { label: 'Settings', Icon: SettingsIcon },
];

// ─── Component ─────────────────────────────────────────
function BottomNav({ activeIndex, onChange }) {
  const { mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        display: 'flex',
        alignItems: 'stretch',
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: isDark
          ? 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(11,17,32,0.98) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(245,245,255,0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${isDark ? 'rgba(212,175,55,0.12)' : 'rgba(46,26,71,0.08)'}`,
        boxShadow: isDark
          ? '0 -4px 20px rgba(0,0,0,0.3)'
          : '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = index === activeIndex;
        const { Icon } = tab;

        return (
          <Box
            key={tab.label}
            onClick={() => onChange(index)}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',

              '&:active': {
                transform: 'scale(0.9)',
              },

              // Active indicator line
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '25%',
                right: '25%',
                height: 2,
                borderRadius: '0 0 4px 4px',
                background: isActive ? colors.ROYAL_GOLD : 'transparent',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 8px ${colors.ROYAL_GOLD}44` : 'none',
              },
            }}
          >
            {/* Icon */}
            <Icon
              sx={{
                fontSize: isActive ? 24 : 22,
                color: isActive
                  ? colors.ROYAL_GOLD
                  : isDark
                  ? 'rgba(255,255,255,0.4)'
                  : 'rgba(0,0,0,0.35)',
                transition: 'all 0.25s ease',
                filter: isActive ? `drop-shadow(0 0 4px ${colors.ROYAL_GOLD}44)` : 'none',
              }}
            />

            {/* Label */}
            <Typography
              sx={{
                fontSize: isActive ? '0.6rem' : '0.55rem',
                fontFamily: isActive ? 'Orbitron' : 'Roboto',
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? colors.ROYAL_GOLD
                  : isDark
                  ? 'rgba(255,255,255,0.35)'
                  : 'rgba(0,0,0,0.35)',
                letterSpacing: isActive ? '0.03em' : 0,
                transition: 'all 0.25s ease',
                lineHeight: 1.2,
              }}
            >
              {tab.label}
            </Typography>

            {/* Active glow dot */}
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  bgcolor: colors.ROYAL_GOLD,
                  boxShadow: `0 0 6px ${colors.ROYAL_GOLD}`,
                  animation: 'pulseGlow 2.5s ease-in-out infinite',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default memo(BottomNav);
