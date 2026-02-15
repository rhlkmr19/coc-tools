// ============================================
// Clash Intelligence Pro – Dashboard Screen
// ============================================
// Main overview: player stats, hero progress,
// league info, quick-action cards, AI insight,
// war status banner.
// ============================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Chip, IconButton, Button,
  LinearProgress, Divider, Skeleton, alpha, Tooltip,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, purpleGradient, glassStyle, colors } from '../theme/theme';
import { calcProgressionScore, calcAccountHealth, detectRushLevel, calcWinRate, calcDefenseRate, calcDonationRatio } from '../utils/scoringEngine';
import { aiService } from '../services/aiService';
import { apiService } from '../services/apiService';
import { storageService } from '../services/storageService';

// ─── Score Ring SVG ────────────────────────────────────
function ScoreRing({ value, size = 80, strokeWidth = 6, label, color }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color || colors.ROYAL_GOLD}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>
          {value}
        </Typography>
        {label && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            {label}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function DashboardScreen() {
  const { playerData, clanData, warData, dataMode, navigateTo, SCREENS } = useAppContext();
  const { mode } = useThemeContext();

  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const player = playerData;

  // Computed scores
  const progressionScore = player ? calcProgressionScore(player) : 0;
  const accountHealth = player ? calcAccountHealth(player) : null;
  const rushInfo = player ? detectRushLevel(player) : null;
  const winRate = player ? calcWinRate(player) : 0;
  const defenseRate = player ? calcDefenseRate(player) : 0;
  const donationRatio = player ? calcDonationRatio(player) : 0;

  // Fetch AI insight on mount (if configured)
  useEffect(() => {
    if (!player || aiInsight) return;
    if (!aiService.isConfigured() && dataMode !== 'demo') return;

    const fetchInsight = async () => {
      setAiLoading(true);
      try {
        const result = dataMode === 'demo'
          ? aiService.getMockResponse()
          : await aiService.getFullAnalysis(player, clanData, warData);
        setAiInsight(result);
      } catch {
        // Silently fail – AI insight is optional
      } finally {
        setAiLoading(false);
      }
    };
    fetchInsight();
  }, [player]);

  if (!player) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography color="text.secondary">No player data loaded</Typography>
      </Box>
    );
  }

  const heroes = (player.heroes || []).filter((h) => h.village === 'home');

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        px: 2,
        pt: 2,
        pb: 3,
      }}
    >
      {/* ═══ Player Header ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.15)}`,
        }}
      >
        {/* Gradient accent */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: goldGradient,
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* TH Badge */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: purpleGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontFamily: '"Orbitron"', fontWeight: 800, color: colors.ROYAL_GOLD, fontSize: '1.2rem' }}>
              {player.townHallLevel}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {player.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
              {player.tag}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={player.league?.name || 'Unranked'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  bgcolor: alpha(colors.ROYAL_GOLD, 0.1),
                  color: colors.ROYAL_GOLD,
                  fontWeight: 600,
                }}
              />
              {player.clan && (
                <Chip
                  label={player.clan.name}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    bgcolor: alpha(colors.DEEP_PURPLE, 0.2),
                    color: 'text.secondary',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Progression Score Ring */}
          <ScoreRing value={progressionScore} label="Score" />
        </Box>
      </Paper>

      {/* ═══ Quick Stats Grid ═══ */}
      <Box
        className="stagger-grid"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          mb: 2,
        }}
      >
        {[
          { label: 'Trophies', value: player.trophies?.toLocaleString(), icon: '🏆', color: '#FFD700' },
          { label: 'War Stars', value: player.warStars?.toLocaleString(), icon: '⭐', color: '#FF6B6B' },
          { label: 'XP Level', value: player.expLevel, icon: '📊', color: '#4ade80' },
          { label: 'Win Rate', value: `${winRate}%`, icon: '⚔️', color: '#60a5fa' },
          { label: 'Defense', value: `${defenseRate}%`, icon: '🛡️', color: '#c084fc' },
          { label: 'Donations', value: player.donations?.toLocaleString(), icon: '🤝', color: '#fb923c' },
        ].map((stat) => (
          <Paper
            key={stat.label}
            className="glass-card"
            elevation={0}
            sx={{
              p: 1.5,
              textAlign: 'center',
              border: `1px solid ${alpha(stat.color, 0.12)}`,
            }}
          >
            <Typography sx={{ fontSize: 20, mb: 0.5 }}>{stat.icon}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ═══ Hero Progress ═══ */}
      {heroes.length > 0 && (
        <Paper
          className="animate-fadeSlideUp glass-card"
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            animationDelay: '0.2s',
            border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: colors.ROYAL_GOLD }}>
            ⚔️ Hero Progress
          </Typography>

          {heroes.map((hero) => {
            const pct = hero.maxLevel > 0 ? Math.round((hero.level / hero.maxLevel) * 100) : 0;
            return (
              <Box key={hero.name} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {hero.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {hero.level}/{hero.maxLevel}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(colors.ROYAL_GOLD, 0.08),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                      background: pct === 100
                        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                        : goldGradient,
                    },
                  }}
                />
              </Box>
            );
          })}
        </Paper>
      )}

      {/* ═══ Account Health ═══ */}
      {accountHealth && (
        <Paper
          className="animate-fadeSlideUp glass-card"
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            animationDelay: '0.3s',
            border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.15)}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            📋 Account Health
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}>
            <ScoreRing
              value={accountHealth.overall}
              size={64}
              strokeWidth={5}
              label="Health"
              color={
                accountHealth.overall >= 80 ? '#4ade80'
                  : accountHealth.overall >= 60 ? colors.ROYAL_GOLD
                    : '#FF6B6B'
              }
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {accountHealth.overall >= 80 ? 'Excellent Account' : accountHealth.overall >= 60 ? 'Good Account' : 'Needs Work'}
              </Typography>
              {rushInfo && rushInfo.severity !== 'none' && (
                <Chip
                  label={`Rush: ${rushInfo.severity}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    bgcolor: alpha(
                      rushInfo.severity === 'severe' ? '#ef4444' : rushInfo.severity === 'moderate' ? '#f59e0b' : '#60a5fa',
                      0.15,
                    ),
                    color: rushInfo.severity === 'severe' ? '#ef4444' : rushInfo.severity === 'moderate' ? '#f59e0b' : '#60a5fa',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Health breakdown bars */}
          {accountHealth.breakdown && Object.entries(accountHealth.breakdown).slice(0, 4).map(([key, val]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {val}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={val}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    bgcolor: val >= 80 ? '#4ade80' : val >= 60 ? colors.ROYAL_GOLD : '#FF6B6B',
                  },
                }}
              />
            </Box>
          ))}
        </Paper>
      )}

      {/* ═══ War Status Banner ═══ */}
      {warData && warData.state && warData.state !== 'notInWar' && (
        <Paper
          className="animate-fadeSlideUp glass-card"
          elevation={0}
          onClick={() => navigateTo(SCREENS.WAR)}
          sx={{
            p: 2,
            mb: 2,
            cursor: 'pointer',
            animationDelay: '0.35s',
            border: `1px solid ${alpha('#FF6B6B', 0.2)}`,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha('#FF6B6B', 0.05)}, transparent)`,
            transition: 'all 0.3s ease',
            '&:hover': { transform: 'translateY(-1px)' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FF6B6B' }}>
                ⚔️ War Active
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {warData.clan?.name} vs {warData.opponent?.name}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.ROYAL_GOLD }}>
                {warData.clan?.stars || 0} ⭐
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                vs {warData.opponent?.stars || 0}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* ═══ AI Insight ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          animationDelay: '0.4s',
          border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.15)}`,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: colors.ROYAL_GOLD }}>
          🤖 AI Strategic Insight
        </Typography>

        {aiLoading ? (
          <Box>
            <Skeleton variant="text" width="90%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Skeleton variant="text" width="75%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
          </Box>
        ) : aiInsight ? (
          <Box>
            {(aiInsight.upgradeFocus || []).slice(0, 3).map((tip, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.8 }}>
                <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD }}>▸</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                  {tip}
                </Typography>
              </Box>
            ))}
            {aiInsight.growthProjection?.efficiencyScore != null && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Efficiency Score:
                </Typography>
                <Chip
                  label={`${aiInsight.growthProjection.efficiencyScore}/100`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    bgcolor: alpha(colors.ROYAL_GOLD, 0.15),
                    color: colors.ROYAL_GOLD,
                  }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {aiService.isConfigured() || dataMode === 'demo'
              ? 'AI analysis unavailable at this time.'
              : 'Configure your OpenRouter API key in Settings to enable AI insights.'}
          </Typography>
        )}
      </Paper>

      {/* ═══ Quick Actions ═══ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1.5,
          mb: 2,
        }}
      >
        {[
          { label: 'Upgrade Planner', screen: SCREENS.UPGRADES, icon: '🔧', color: '#4ade80' },
          { label: 'War Intel', screen: SCREENS.WAR, icon: '⚔️', color: '#FF6B6B' },
          { label: 'Base Analysis', screen: SCREENS.BASE_ANALYSIS, icon: '🏰', color: '#60a5fa' },
          { label: 'Analytics', screen: SCREENS.ANALYTICS, icon: '📊', color: '#c084fc' },
        ].map((action) => (
          <Paper
            key={action.label}
            className="glass-card"
            elevation={0}
            onClick={() => navigateTo(action.screen)}
            sx={{
              p: 2,
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${alpha(action.color, 0.12)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                border: `1px solid ${alpha(action.color, 0.3)}`,
              },
            }}
          >
            <Typography sx={{ fontSize: 28, mb: 0.5 }}>{action.icon}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {action.label}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
