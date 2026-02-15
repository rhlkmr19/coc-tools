// ============================================
// Clash Intelligence Pro – War Intelligence Screen
// ============================================
// War readiness score, offensive/defensive index,
// radar chart, star distribution, live war status,
// AI war strategy suggestions.
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Tab, Tabs, Button,
  LinearProgress, Divider, Skeleton, alpha, Avatar,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, colors } from '../theme/theme';
import {
  calcWarReadiness,
  calcOffensiveIndex,
  calcDefensiveIndex,
  analyzeStarDistribution,
  analyzeWarPerformance,
  getWarRadarData,
} from '../utils/warEngine';
import { aiService } from '../services/aiService';

// ─── Inline Radar Chart (SVG) ──────────────────────────
function MiniRadar({ data, size = 200 }) {
  if (!data || data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = (size / 2) - 20;
  const levels = 5;
  const angleStep = (2 * Math.PI) / data.length;

  // Grid polygons
  const gridPolygons = [];
  for (let i = 1; i <= levels; i++) {
    const r = (maxRadius / levels) * i;
    const points = data.map((_, idx) => {
      const angle = angleStep * idx - Math.PI / 2;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');
    gridPolygons.push(points);
  }

  // Data polygon
  const dataPoints = data.map((d, idx) => {
    const r = (d.value / 100) * maxRadius;
    const angle = angleStep * idx - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  // Labels
  const labels = data.map((d, idx) => {
    const angle = angleStep * idx - Math.PI / 2;
    const lr = maxRadius + 14;
    return {
      x: cx + lr * Math.cos(angle),
      y: cy + lr * Math.sin(angle),
      text: d.subject,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(212,175,55,0.12)"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {data.map((_, idx) => {
        const angle = angleStep * idx - Math.PI / 2;
        return (
          <line
            key={idx}
            x1={cx}
            y1={cy}
            x2={cx + maxRadius * Math.cos(angle)}
            y2={cy + maxRadius * Math.sin(angle)}
            stroke="rgba(212,175,55,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={dataPoints}
        fill="rgba(212,175,55,0.15)"
        stroke={colors.ROYAL_GOLD}
        strokeWidth={2}
      />

      {/* Data points */}
      {data.map((d, idx) => {
        const r = (d.value / 100) * maxRadius;
        const angle = angleStep * idx - Math.PI / 2;
        return (
          <circle
            key={idx}
            cx={cx + r * Math.cos(angle)}
            cy={cy + r * Math.sin(angle)}
            r={3}
            fill={colors.ROYAL_GOLD}
          />
        );
      })}

      {/* Labels */}
      {labels.map((lbl, idx) => (
        <text
          key={idx}
          x={lbl.x}
          y={lbl.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize={8}
          fontFamily="Roboto, sans-serif"
        >
          {lbl.text}
        </text>
      ))}
    </svg>
  );
}

export default function WarIntelligenceScreen() {
  const { playerData, warData, clanData, dataMode } = useAppContext();
  const { mode } = useThemeContext();

  const [tab, setTab] = useState(0); // 0=Readiness, 1=Live War, 2=Strategy
  const [aiStrategy, setAiStrategy] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const player = playerData;

  // Computed metrics
  const warReadiness = useMemo(() => player ? calcWarReadiness(player) : null, [player]);
  const offenseIndex = useMemo(() => player ? calcOffensiveIndex(player) : 0, [player]);
  const defenseIndex = useMemo(() => player ? calcDefensiveIndex(player) : 0, [player]);
  const radarData = useMemo(() => player ? getWarRadarData(player) : [], [player]);
  const starDistribution = useMemo(
    () => warData?.clan?.members ? analyzeStarDistribution(warData.clan.members) : null,
    [warData],
  );
  const warPerformance = useMemo(
    () => warData ? analyzeWarPerformance(warData) : null,
    [warData],
  );

  // AI Strategy
  useEffect(() => {
    if (!player || aiStrategy) return;
    if (!aiService.isConfigured() && dataMode !== 'demo') return;

    const fetch = async () => {
      setAiLoading(true);
      try {
        const result = dataMode === 'demo'
          ? aiService.getMockResponse()
          : await aiService.getWarStrategy(player, warData);
        setAiStrategy(result);
      } catch { /* silent */ }
      finally { setAiLoading(false); }
    };
    fetch();
  }, [player]);

  if (!player) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No player data</Typography>
      </Box>
    );
  }

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
        ⚔️ War Intelligence
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
        <Tab label="Readiness" />
        <Tab label="Live War" />
        <Tab label="Strategy" />
      </Tabs>

      {/* ═══ TAB 0: War Readiness ═══ */}
      {tab === 0 && (
        <Box>
          {/* Readiness Score */}
          {warReadiness && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2.5, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.15)}`, textAlign: 'center' }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                War Readiness Score
              </Typography>

              {/* Big Score */}
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <svg width={120} height={120}>
                  <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
                  <circle
                    cx={60} cy={60} r={52}
                    fill="none"
                    stroke={warReadiness.score >= 80 ? '#4ade80' : warReadiness.score >= 60 ? colors.ROYAL_GOLD : '#FF6B6B'}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - warReadiness.score / 100)}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                  />
                </svg>
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{warReadiness.score}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>/ 100</Typography>
                </Box>
              </Box>

              {/* Breakdown */}
              {warReadiness.breakdown && Object.entries(warReadiness.breakdown).map(([key, val]) => (
                <Box key={key} sx={{ mb: 1, textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{val}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={val}
                    sx={{
                      height: 4, borderRadius: 2,
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

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.15)}`, display: 'flex', justifyContent: 'center' }}
            >
              <MiniRadar data={radarData} size={220} />
            </Paper>
          )}

          {/* Offense & Defense Indices */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Paper
              className="glass-card"
              elevation={0}
              sx={{ p: 2, textAlign: 'center', border: `1px solid ${alpha('#FF6B6B', 0.12)}` }}
            >
              <Typography sx={{ fontSize: 24, mb: 0.5 }}>⚔️</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#FF6B6B' }}>{offenseIndex}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Offensive Index</Typography>
            </Paper>
            <Paper
              className="glass-card"
              elevation={0}
              sx={{ p: 2, textAlign: 'center', border: `1px solid ${alpha('#60a5fa', 0.12)}` }}
            >
              <Typography sx={{ fontSize: 24, mb: 0.5 }}>🛡️</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#60a5fa' }}>{defenseIndex}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Defensive Index</Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* ═══ TAB 1: Live War ═══ */}
      {tab === 1 && (
        <Box>
          {!warData || warData.state === 'notInWar' ? (
            <Paper
              className="glass-card"
              elevation={0}
              sx={{ p: 4, textAlign: 'center', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
            >
              <Typography sx={{ fontSize: 48, mb: 1 }}>🕊️</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>No Active War</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your clan is currently not in a war.
              </Typography>
            </Paper>
          ) : (
            <>
              {/* Scoreboard */}
              <Paper
                className="animate-fadeSlideUp glass-card"
                elevation={0}
                sx={{ p: 2.5, mb: 2, border: `1px solid ${alpha('#FF6B6B', 0.15)}` }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {warData.clan?.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: colors.ROYAL_GOLD }}>
                      {warData.clan?.stars || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {warData.clan?.destructionPercentage?.toFixed(1) || 0}%
                    </Typography>
                  </Box>

                  <Box sx={{ px: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      ⚔️
                    </Typography>
                    <Chip
                      label={warData.state === 'inWar' ? 'BATTLE DAY' : warData.state === 'preparation' ? 'PREP' : warData.state}
                      size="small"
                      sx={{
                        mt: 0.5,
                        height: 20,
                        fontSize: '0.55rem',
                        bgcolor: alpha('#FF6B6B', 0.15),
                        color: '#FF6B6B',
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {warData.opponent?.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {warData.opponent?.stars || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {warData.opponent?.destructionPercentage?.toFixed(1) || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Star Distribution */}
              {starDistribution && (
                <Paper
                  className="animate-fadeSlideUp glass-card"
                  elevation={0}
                  sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    ⭐ Star Distribution
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[
                      { stars: 3, count: starDistribution.threeStars, color: '#4ade80' },
                      { stars: 2, count: starDistribution.twoStars, color: colors.ROYAL_GOLD },
                      { stars: 1, count: starDistribution.oneStar, color: '#f59e0b' },
                      { stars: 0, count: starDistribution.zeroStars, color: '#ef4444' },
                    ].map((s) => (
                      <Box key={s.stars} sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: s.color }}>
                          {s.count}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {'⭐'.repeat(s.stars) || '💀'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}

              {/* Members who haven't attacked */}
              {warPerformance?.noAttackMembers?.length > 0 && (
                <Paper
                  className="animate-fadeSlideUp glass-card"
                  elevation={0}
                  sx={{ p: 2, mb: 2, animationDelay: '0.2s', border: `1px solid ${alpha('#ef4444', 0.12)}` }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#ef4444' }}>
                    ⚠️ Haven't Attacked ({warPerformance.noAttackMembers.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {warPerformance.noAttackMembers.slice(0, 10).map((m) => (
                      <Chip
                        key={m.tag}
                        label={`#${m.mapPosition} ${m.name}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6rem',
                          bgcolor: alpha('#ef4444', 0.08),
                          color: '#ef4444',
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}
            </>
          )}
        </Box>
      )}

      {/* ═══ TAB 2: AI Strategy ═══ */}
      {tab === 2 && (
        <Box>
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}` }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: colors.ROYAL_GOLD }}>
              🤖 AI War Strategy
            </Typography>

            {aiLoading ? (
              <Box>
                <Skeleton variant="text" width="90%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                <Skeleton variant="text" width="80%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                <Skeleton variant="text" width="65%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
              </Box>
            ) : aiStrategy ? (
              <Box>
                {/* War improvements */}
                {(aiStrategy.warImprovements || []).length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Key Improvements
                    </Typography>
                    {aiStrategy.warImprovements.map((tip, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: '#FF6B6B' }}>▸</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>{tip}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Army suggestions */}
                {(aiStrategy.armySuggestions || []).length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                      Recommended Armies
                    </Typography>
                    {aiStrategy.armySuggestions.map((army, i) => (
                      <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6 }}>
                        <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD }}>▸</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>{army}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Configure OpenRouter API key to unlock AI war strategy advice.
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
}
