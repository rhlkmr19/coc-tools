// ============================================
// Clash Intelligence Pro – Clan Dashboard Screen
// ============================================
// Clan info, member list, donation leaderboard,
// TH distribution, activity metrics, war log.
// ============================================
import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Tab, Tabs, TextField,
  LinearProgress, InputAdornment, alpha, Badge,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, colors } from '../theme/theme';
import { analyzeClanActivity, buildDonationChartData } from '../utils/analyticsEngine';

// ─── Role Colors ───────────────────────────────────────
const ROLE_STYLES = {
  leader: { label: 'Leader', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  coLeader: { label: 'Co-Leader', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
  admin: { label: 'Elder', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  member: { label: 'Member', color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
};

export default function ClanDashboardScreen() {
  const { clanData, warData } = useAppContext();
  const { mode } = useThemeContext();

  const [tab, setTab] = useState(0); // 0=Overview, 1=Members, 2=War Log
  const [memberSearch, setMemberSearch] = useState('');
  const [sortBy, setSortBy] = useState('trophies'); // trophies | donations | townHallLevel

  const activity = useMemo(() => clanData ? analyzeClanActivity(clanData) : null, [clanData]);
  const donationChartData = useMemo(() => clanData ? buildDonationChartData(clanData, 15) : [], [clanData]);

  if (!clanData) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Typography sx={{ fontSize: 48, mb: 1 }}>🏰</Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>No Clan Data</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          The player might not be in a clan, or clan data is unavailable.
        </Typography>
      </Box>
    );
  }

  const members = clanData.memberList || [];
  const filteredMembers = members
    .filter((m) => m.name?.toLowerCase().includes(memberSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'donations') return (b.donations || 0) - (a.donations || 0);
      if (sortBy === 'townHallLevel') return (b.townHallLevel || 0) - (a.townHallLevel || 0);
      return (b.trophies || 0) - (a.trophies || 0);
    });

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
        🏰 Clan Dashboard
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'none', fontSize: '0.8rem' },
        }}
      >
        <Tab label="Overview" />
        <Tab label={`Members (${members.length})`} />
        <Tab label="War Log" />
      </Tabs>

      {/* ═══ TAB 0: Clan Overview ═══ */}
      {tab === 0 && (
        <Box>
          {/* Clan Info Card */}
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2.5, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.15)}`, position: 'relative', overflow: 'hidden' }}
          >
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: goldGradient }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56, height: 56, borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(colors.ROYAL_GOLD, 0.2)}, ${alpha(colors.DEEP_PURPLE, 0.3)})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, flexShrink: 0,
                }}
              >
                🏰
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {clanData.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {clanData.tag}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <Chip label={`Level ${clanData.clanLevel}`} size="small" sx={{ height: 20, fontSize: '0.6rem', bgcolor: alpha(colors.ROYAL_GOLD, 0.12), color: colors.ROYAL_GOLD, fontWeight: 600 }} />
                  <Chip label={`${members.length}/50`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                </Box>
              </Box>
            </Box>

            {clanData.description && (
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, display: 'block', lineHeight: 1.5 }}>
                {clanData.description}
              </Typography>
            )}
          </Paper>

          {/* Stats Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 2 }}>
            {[
              { label: 'War Wins', value: clanData.warWins || 0, icon: '⚔️', color: '#4ade80' },
              { label: 'Win Streak', value: clanData.warWinStreak || 0, icon: '🔥', color: '#f59e0b' },
              { label: 'Clan Points', value: (clanData.clanPoints || 0).toLocaleString(), icon: '🏆', color: colors.ROYAL_GOLD },
            ].map((s) => (
              <Paper key={s.label} className="glass-card" elevation={0} sx={{ p: 1.5, textAlign: 'center', border: `1px solid ${alpha(s.color, 0.1)}` }}>
                <Typography sx={{ fontSize: 18, mb: 0.3 }}>{s.icon}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>{s.label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Donation Summary */}
          {activity && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.12)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>🤝 Donations</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Total Donated</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#4ade80' }}>{activity.totalDonated.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Avg per Member</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: colors.ROYAL_GOLD }}>{activity.avgDonations.toLocaleString()}</Typography>
                </Box>
              </Box>

              {/* Top Donors */}
              {activity.topDonors?.length > 0 && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Top Donors</Typography>
                  {activity.topDonors.map((d, i) => (
                    <Box key={d.tag} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="caption" sx={{ width: 16, fontWeight: 700, color: i < 3 ? colors.ROYAL_GOLD : 'text.secondary' }}>
                        {i + 1}.
                      </Typography>
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: i < 3 ? 600 : 400 }}>
                        {d.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600 }}>
                        {d.donated.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          )}

          {/* TH Distribution */}
          {activity?.thDistribution && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.15s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>🏠 TH Distribution</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {Object.entries(activity.thDistribution)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([th, count]) => (
                    <Chip
                      key={th}
                      label={`TH${th}: ${count}`}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: alpha(colors.ROYAL_GOLD, Number(th) >= 14 ? 0.15 : 0.06),
                        color: Number(th) >= 14 ? colors.ROYAL_GOLD : 'text.secondary',
                      }}
                    />
                  ))}
              </Box>
            </Paper>
          )}

          {/* Clan Strength */}
          {activity?.clanStrength != null && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.2s', border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}` }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>💪 Clan Strength</Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.ROYAL_GOLD }}>{activity.clanStrength}/100</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={activity.clanStrength}
                sx={{
                  height: 6, borderRadius: 3,
                  bgcolor: alpha(colors.ROYAL_GOLD, 0.08),
                  '& .MuiLinearProgress-bar': { borderRadius: 3, background: goldGradient },
                }}
              />
            </Paper>
          )}

          {/* Inactive Warning */}
          {activity?.inactiveCount > 0 && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.25s', border: `1px solid ${alpha('#f59e0b', 0.15)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                ⚠️ Potentially Inactive ({activity.inactiveCount})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {activity.potentiallyInactive.slice(0, 8).map((m) => (
                  <Chip
                    key={m.tag}
                    label={`${m.name} (TH${m.townHallLevel})`}
                    size="small"
                    sx={{ height: 22, fontSize: '0.6rem', bgcolor: alpha('#f59e0b', 0.08), color: '#f59e0b' }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ═══ TAB 1: Members ═══ */}
      {tab === 1 && (
        <Box>
          {/* Search & Sort */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search members…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ fontSize: 14 }}>🔍</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[
                { key: 'trophies', label: '🏆' },
                { key: 'donations', label: '🤝' },
                { key: 'townHallLevel', label: '🏠' },
              ].map((s) => (
                <Chip
                  key={s.key}
                  label={s.label}
                  size="small"
                  onClick={() => setSortBy(s.key)}
                  sx={{
                    height: 32,
                    cursor: 'pointer',
                    bgcolor: sortBy === s.key ? alpha(colors.ROYAL_GOLD, 0.15) : 'transparent',
                    border: `1px solid ${alpha(colors.ROYAL_GOLD, sortBy === s.key ? 0.3 : 0.1)}`,
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Member List */}
          {filteredMembers.map((member, idx) => {
            const roleStyle = ROLE_STYLES[member.role] || ROLE_STYLES.member;
            return (
              <Paper
                key={member.tag}
                className="glass-card"
                elevation={0}
                sx={{ p: 1.5, mb: 1, border: `1px solid ${alpha(roleStyle.color, 0.08)}` }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Rank */}
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: 1,
                      bgcolor: alpha(colors.ROYAL_GOLD, 0.08),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary' }}>
                      {idx + 1}
                    </Typography>
                  </Box>

                  {/* TH badge */}
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: 1,
                      bgcolor: alpha(colors.DEEP_PURPLE, 0.3),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: colors.ROYAL_GOLD }}>
                      {member.townHallLevel}
                    </Typography>
                  </Box>

                  {/* Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}
                      </Typography>
                      <Chip
                        label={roleStyle.label}
                        size="small"
                        sx={{
                          height: 16, fontSize: '0.5rem', fontWeight: 700,
                          bgcolor: roleStyle.bg, color: roleStyle.color,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mt: 0.3 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        🏆 {(member.trophies || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#4ade80' }}>
                        ↑{(member.donations || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#f59e0b' }}>
                        ↓{(member.donationsReceived || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            );
          })}

          {filteredMembers.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
              No members found
            </Typography>
          )}
        </Box>
      )}

      {/* ═══ TAB 2: War Log ═══ */}
      {tab === 2 && (
        <Box>
          <Paper
            className="glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              📋 War Record
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#4ade80' }}>{clanData.warWins || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Wins</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444' }}>{clanData.warLosses || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Losses</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b' }}>{clanData.warTies || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Ties</Typography>
              </Box>
            </Box>

            {/* Win Rate Bar */}
            {(clanData.warWins || 0) + (clanData.warLosses || 0) > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Win Rate</Typography>
                  <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD, fontWeight: 600 }}>
                    {Math.round((clanData.warWins / (clanData.warWins + clanData.warLosses + (clanData.warTies || 0))) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.round((clanData.warWins / (clanData.warWins + clanData.warLosses + (clanData.warTies || 0))) * 100)}
                  sx={{
                    height: 6, borderRadius: 3,
                    bgcolor: alpha('#ef4444', 0.15),
                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#4ade80' },
                  }}
                />
              </Box>
            )}
          </Paper>

          {/* War Frequency */}
          <Paper
            className="glass-card"
            elevation={0}
            sx={{ p: 2, border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>War Frequency</Typography>
              <Chip
                label={clanData.warFrequency === 'always' ? 'Always' : clanData.warFrequency === 'moreThanOncePerWeek' ? 'Frequent' : clanData.warFrequency || 'Unknown'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  bgcolor: alpha(colors.ROYAL_GOLD, 0.12),
                  color: colors.ROYAL_GOLD,
                  fontWeight: 600,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
              War log is {clanData.isWarLogPublic ? 'public' : 'private'}
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
