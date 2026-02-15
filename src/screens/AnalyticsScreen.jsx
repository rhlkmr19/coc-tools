// ============================================
// Clash Intelligence Pro – Analytics Screen
// ============================================
// Trophy trends, growth projection, performance
// heatmap, upgrade timeline, donation chart.
// ============================================
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Tab, Tabs,
  LinearProgress, alpha, Skeleton,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, colors } from '../theme/theme';
import {
  buildTrophyTrend,
  buildPerformanceHeatmap,
  projectGrowth,
  buildDonationChartData,
} from '../utils/analyticsEngine';
import { storageService } from '../services/storageService';

// ─── Mini Line Chart (SVG) ─────────────────────────────
function MiniLineChart({ data, dataKey, width = 300, height = 140, color = colors.ROYAL_GOLD }) {
  if (!data || data.length < 2) return null;

  const values = data.map((d) => d[dataKey] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 8;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * chartW;
    const y = padding + chartH - ((v - min) / range) * chartH;
    return `${x},${y}`;
  });

  const areaPath = `M${points[0]} ${points.join(' L')} L${padding + chartW},${padding + chartH} L${padding},${padding + chartH} Z`;
  const linePath = `M${points.join(' L')}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* Area fill */}
      <path d={areaPath} fill={`url(#grad-${dataKey})`} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {/* End dot */}
      {values.length > 0 && (
        <circle
          cx={padding + ((values.length - 1) / (values.length - 1)) * chartW}
          cy={padding + chartH - ((values[values.length - 1] - min) / range) * chartH}
          r={3}
          fill={color}
        />
      )}
      {/* Labels */}
      <text x={padding} y={padding - 2} fill="rgba(255,255,255,0.4)" fontSize={8}>{max.toLocaleString()}</text>
      <text x={padding} y={padding + chartH + 10} fill="rgba(255,255,255,0.4)" fontSize={8}>{min.toLocaleString()}</text>
      {data.length > 0 && (
        <>
          <text x={padding} y={height - 2} fill="rgba(255,255,255,0.3)" fontSize={7}>{data[0].date}</text>
          <text x={width - padding} y={height - 2} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="end">{data[data.length - 1].date}</text>
        </>
      )}
    </svg>
  );
}

// ─── Heatmap Grid (SVG) ────────────────────────────────
function HeatmapGrid({ data, width = 310, height = 160 }) {
  if (!data || data.length === 0) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const cellW = (width - 30) / 24;
  const cellH = (height - 20) / 7;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Day labels */}
      {days.map((day, i) => (
        <text key={day} x={0} y={20 + i * cellH + cellH / 2 + 3} fill="rgba(255,255,255,0.4)" fontSize={7}>
          {day}
        </text>
      ))}

      {/* Hour labels */}
      {[0, 6, 12, 18].map((h) => (
        <text key={h} x={30 + h * cellW + cellW / 2} y={12} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="middle">
          {h}h
        </text>
      ))}

      {/* Cells */}
      {data.map((cell, idx) => {
        const intensity = cell.intensity / 100;
        return (
          <rect
            key={idx}
            x={30 + cell.hour * cellW}
            y={20 + cell.dayIndex * cellH}
            width={cellW - 1}
            height={cellH - 1}
            rx={2}
            fill={`rgba(212, 175, 55, ${intensity * 0.8 + 0.02})`}
          />
        );
      })}
    </svg>
  );
}

// ─── Donation Bar Chart (SVG) ──────────────────────────
function DonationBars({ data, width = 310, height = 160 }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.donated, d.received)));
  const barW = (width - 20) / data.length;
  const chartH = height - 30;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const donH = maxVal > 0 ? (d.donated / maxVal) * chartH : 0;
        const recH = maxVal > 0 ? (d.received / maxVal) * chartH : 0;
        const x = 10 + i * barW;

        return (
          <g key={i}>
            {/* Donated bar */}
            <rect
              x={x}
              y={chartH - donH}
              width={barW * 0.4}
              height={donH}
              rx={2}
              fill="rgba(74, 222, 128, 0.7)"
            />
            {/* Received bar */}
            <rect
              x={x + barW * 0.45}
              y={chartH - recH}
              width={barW * 0.4}
              height={recH}
              rx={2}
              fill="rgba(251, 146, 60, 0.7)"
            />
            {/* Name label */}
            <text
              x={x + barW * 0.4}
              y={height - 4}
              fill="rgba(255,255,255,0.4)"
              fontSize={6}
              textAnchor="middle"
              transform={`rotate(-45, ${x + barW * 0.4}, ${height - 4})`}
            >
              {d.name}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <rect x={width - 80} y={4} width={8} height={8} rx={1} fill="rgba(74, 222, 128, 0.7)" />
      <text x={width - 68} y={12} fill="rgba(255,255,255,0.5)" fontSize={7}>Donated</text>
      <rect x={width - 80} y={16} width={8} height={8} rx={1} fill="rgba(251, 146, 60, 0.7)" />
      <text x={width - 68} y={24} fill="rgba(255,255,255,0.5)" fontSize={7}>Received</text>
    </svg>
  );
}

export default function AnalyticsScreen() {
  const { playerData, clanData, dataMode, activeAccount } = useAppContext();
  const { mode } = useThemeContext();

  const [tab, setTab] = useState(0); // 0=Trends, 1=Heatmap, 2=Donations, 3=Projection
  const [playerHistory, setPlayerHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load history
  useEffect(() => {
    const load = async () => {
      try {
        const history = await storageService.getPlayerHistory(activeAccount || '#DEMO000');
        setPlayerHistory(history || []);
      } catch {
        // Generate demo history if none exists
        if (dataMode === 'demo') {
          setPlayerHistory(generateDemoHistory());
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeAccount, dataMode]);

  // Computed
  const trophyTrend = useMemo(() => buildTrophyTrend(playerHistory), [playerHistory]);
  const heatmapData = useMemo(() => buildPerformanceHeatmap(playerHistory), [playerHistory]);
  const growthProj = useMemo(() => projectGrowth(playerHistory, 30), [playerHistory]);
  const donationData = useMemo(() => clanData ? buildDonationChartData(clanData, 10) : [], [clanData]);

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
        📊 Analytics
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'none', fontSize: '0.75rem' },
        }}
      >
        <Tab label="Trends" />
        <Tab label="Heatmap" />
        <Tab label="Donations" />
        <Tab label="Projection" />
      </Tabs>

      {loading && (
        <Box sx={{ p: 2 }}>
          <Skeleton variant="rounded" width="100%" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2, borderRadius: 3 }} />
          <Skeleton variant="rounded" width="100%" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 3 }} />
        </Box>
      )}

      {/* ═══ TAB 0: Trophy Trends ═══ */}
      {!loading && tab === 0 && (
        <Box>
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`, overflow: 'hidden' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>🏆 Trophy Trend</Typography>
            {trophyTrend.length >= 2 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <MiniLineChart data={trophyTrend} dataKey="trophies" color={colors.ROYAL_GOLD} />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Not enough historical data yet. Check back after a few syncs.
              </Typography>
            )}
          </Paper>

          {/* Attack Wins Trend */}
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha('#4ade80', 0.1)}`, overflow: 'hidden' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>⚔️ Attack Wins</Typography>
            {trophyTrend.length >= 2 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <MiniLineChart data={trophyTrend} dataKey="attackWins" color="#4ade80" />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Insufficient data for chart display.
              </Typography>
            )}
          </Paper>

          {/* Quick Stats from Latest */}
          {playerData && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, animationDelay: '0.2s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>📈 Current Snapshot</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                {[
                  { label: 'Trophies', value: playerData.trophies?.toLocaleString(), color: colors.ROYAL_GOLD },
                  { label: 'Best Trophies', value: playerData.bestTrophies?.toLocaleString(), color: '#4ade80' },
                  { label: 'War Stars', value: playerData.warStars?.toLocaleString(), color: '#FF6B6B' },
                  { label: 'Attack Wins', value: playerData.attackWins?.toLocaleString(), color: '#60a5fa' },
                ].map((s) => (
                  <Box key={s.label}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: s.color }}>{s.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ═══ TAB 1: Performance Heatmap ═══ */}
      {!loading && tab === 1 && (
        <Box>
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`, overflow: 'hidden' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>🔥 Activity Heatmap</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
              Shows when you're most active (brighter = more activity)
            </Typography>
            {heatmapData.length > 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <HeatmapGrid data={heatmapData} />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Heatmap requires multiple data snapshots over time.
              </Typography>
            )}
          </Paper>

          {/* Legend */}
          <Paper className="glass-card" elevation={0} sx={{ p: 1.5, border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.08)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Less</Typography>
              {[0.05, 0.2, 0.4, 0.6, 0.8].map((opacity) => (
                <Box
                  key={opacity}
                  sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: `rgba(212, 175, 55, ${opacity})` }}
                />
              ))}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>More</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* ═══ TAB 2: Donations ═══ */}
      {!loading && tab === 2 && (
        <Box>
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`, overflow: 'hidden' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>🤝 Clan Donation Comparison</Typography>
            {donationData.length > 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <DonationBars data={donationData} />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                No clan data available for donation chart.
              </Typography>
            )}
          </Paper>

          {/* Your stats */}
          {playerData && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Your Donations</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Donated</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#4ade80' }}>
                    {(playerData.donations || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Received</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#fb923c' }}>
                    {(playerData.donationsReceived || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* ═══ TAB 3: Growth Projection ═══ */}
      {!loading && tab === 3 && (
        <Box>
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}`, overflow: 'hidden' }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>📈 Trophy Projection (30 Days)</Typography>
            {growthProj.trophyProjection.length >= 2 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <MiniLineChart data={growthProj.trophyProjection} dataKey="projected" color="#c084fc" />
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Need more historical data to project growth.
              </Typography>
            )}
          </Paper>

          {/* Daily Rates */}
          {growthProj.dailyRates && (
            <Paper
              className="animate-fadeSlideUp glass-card"
              elevation={0}
              sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>📊 Daily Rates</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: colors.ROYAL_GOLD }}>
                    {growthProj.dailyRates.trophies > 0 ? '+' : ''}{growthProj.dailyRates.trophies}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>🏆/day</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#FF6B6B' }}>
                    +{growthProj.dailyRates.warStars}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>⭐/day</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#4ade80' }}>
                    +{growthProj.dailyRates.attackWins}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>⚔️/day</Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Trend Indicator */}
          <Paper
            className="animate-fadeSlideUp glass-card"
            elevation={0}
            sx={{ p: 2, animationDelay: '0.15s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Overall Trend</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Based on {growthProj.dataPoints || 0} data points over {growthProj.daySpan || 0} days
                </Typography>
              </Box>
              <Chip
                label={
                  growthProj.trend === 'growing' ? '📈 Growing'
                    : growthProj.trend === 'slight_growth' ? '↗️ Slight Growth'
                      : growthProj.trend === 'declining' ? '📉 Declining'
                        : growthProj.trend === 'slight_decline' ? '↘️ Slight Decline'
                          : growthProj.trend === 'stable' ? '➡️ Stable'
                            : '❓ Insufficient Data'
                }
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  bgcolor: alpha(
                    growthProj.trend?.includes('grow') ? '#4ade80'
                      : growthProj.trend?.includes('declin') ? '#ef4444'
                        : colors.ROYAL_GOLD,
                    0.12,
                  ),
                  color:
                    growthProj.trend?.includes('grow') ? '#4ade80'
                      : growthProj.trend?.includes('declin') ? '#ef4444'
                        : colors.ROYAL_GOLD,
                }}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

// ─── Demo History Generator ────────────────────────────
function generateDemoHistory() {
  const history = [];
  const now = Date.now();
  const baseT = 5000;
  const baseStars = 1400;
  const baseAttacks = 3100;

  for (let i = 30; i >= 0; i--) {
    history.push({
      timestamp: now - i * 24 * 3600 * 1000,
      trophies: baseT + (30 - i) * 8 + Math.floor(Math.random() * 40 - 20),
      bestTrophies: 5600,
      warStars: baseStars + Math.floor((30 - i) * 1.5),
      attackWins: baseAttacks + (30 - i) * 3,
      defenseWins: 650 + Math.floor((30 - i) * 0.8),
    });
  }

  return history;
}
