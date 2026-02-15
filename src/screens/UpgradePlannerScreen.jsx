// ============================================
// Clash Intelligence Pro – Upgrade Planner Screen
// ============================================
// Priority-sorted upgrade list, cost breakdown,
// builder optimization, AI upgrade suggestions.
// ============================================
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Chip, Tab, Tabs, Button,
  LinearProgress, Divider, Skeleton, alpha, Collapse,
  ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { useAppContext, useThemeContext } from '../App';
import { goldGradient, colors } from '../theme/theme';
import {
  getUpgradeComparison,
  estimateBuilderOptimization,
  estimateCostBreakdown,
  getUpgradePriorityList,
  formatUpgradeTime,
} from '../utils/upgradeEngine';
import { aiService } from '../services/aiService';

// ─── Priority Color Map ────────────────────────────────
const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#60a5fa',
  low: '#94A3B8',
};

const PRIORITY_LABELS = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

export default function UpgradePlannerScreen() {
  const { playerData, dataMode } = useAppContext();
  const { mode } = useThemeContext();

  const [tab, setTab] = useState(0); // 0=Priority, 1=Heroes, 2=Troops, 3=Spells
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  const player = playerData;

  // Computed data
  const upgradeComparison = useMemo(() => player ? getUpgradeComparison(player) : null, [player]);
  const builderOptimization = useMemo(() => player ? estimateBuilderOptimization(player) : null, [player]);
  const costBreakdown = useMemo(() => player ? estimateCostBreakdown(player) : null, [player]);
  const priorityList = useMemo(() => player ? getUpgradePriorityList(player) : [], [player]);

  // Fetch AI suggestions
  useEffect(() => {
    if (!player || aiSuggestions) return;
    if (!aiService.isConfigured() && dataMode !== 'demo') return;

    const fetch = async () => {
      setAiLoading(true);
      try {
        const result = dataMode === 'demo'
          ? aiService.getMockResponse()
          : await aiService.getUpgradePriority(player);
        setAiSuggestions(result);
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

  const tabItems = [
    { label: 'Priority', count: priorityList.length },
    { label: 'Heroes', count: upgradeComparison?.heroes?.filter((h) => h.level < h.maxLevel).length || 0 },
    { label: 'Troops', count: upgradeComparison?.troops?.filter((t) => t.level < t.maxLevel).length || 0 },
    { label: 'Spells', count: upgradeComparison?.spells?.filter((s) => s.level < s.maxLevel).length || 0 },
  ];

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
        🔧 Upgrade Planner
      </Typography>

      {/* ═══ Cost Breakdown Summary ═══ */}
      {costBreakdown && (
        <Paper
          className="animate-fadeSlideUp glass-card"
          elevation={0}
          sx={{ p: 2, mb: 2, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.1)}` }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            💰 Remaining Upgrade Costs
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {[
              { label: 'Gold', value: costBreakdown.gold, color: '#FFD700', icon: '🟡' },
              { label: 'Elixir', value: costBreakdown.elixir, color: '#E879F9', icon: '🟣' },
              { label: 'Dark Elixir', value: costBreakdown.darkElixir, color: '#1E293B', icon: '⚫' },
            ].map((res) => (
              <Box key={res.label} sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: 18 }}>{res.icon}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: res.color }}>
                  {formatLargeNumber(res.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                  {res.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ═══ Builder Optimization ═══ */}
      {builderOptimization && (
        <Paper
          className="animate-fadeSlideUp glass-card"
          elevation={0}
          sx={{ p: 2, mb: 2, animationDelay: '0.1s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.15)}` }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            🏗️ Builder Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Est. Completion
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ROYAL_GOLD }}>
                {builderOptimization.estimatedCompletion || 'N/A'}
              </Typography>
            </Box>
            {builderOptimization.bottleneck && (
              <Chip
                label={`Bottleneck: ${builderOptimization.bottleneck}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#f59e0b', 0.12),
                  color: '#f59e0b',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* ═══ AI Suggestions ═══ */}
      <Paper
        className="animate-fadeSlideUp glass-card"
        elevation={0}
        sx={{ p: 2, mb: 2, animationDelay: '0.15s', border: `1px solid ${alpha(colors.DEEP_PURPLE, 0.1)}` }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: colors.ROYAL_GOLD }}>
          🤖 AI Upgrade Advice
        </Typography>
        {aiLoading ? (
          <Box>
            <Skeleton variant="text" width="85%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
            <Skeleton variant="text" width="70%" sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
          </Box>
        ) : aiSuggestions?.upgradeFocus ? (
          <Box>
            {aiSuggestions.upgradeFocus.slice(0, 4).map((tip, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.6 }}>
                <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD }}>▸</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>{tip}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Configure OpenRouter API to get AI upgrade advice.
          </Typography>
        )}
      </Paper>

      {/* ═══ Tabs ═══ */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
        sx={{
          mb: 2,
          minHeight: 36,
          '& .MuiTab-root': { minHeight: 36, py: 0.5, textTransform: 'none', fontSize: '0.8rem' },
        }}
      >
        {tabItems.map((t) => (
          <Tab
            key={t.label}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {t.label}
                {t.count > 0 && (
                  <Chip
                    label={t.count}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', minWidth: 24 }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* ═══ Tab Content ═══ */}
      {tab === 0 && (
        <Box>
          {priorityList.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              All upgrades complete! 🎉
            </Typography>
          ) : (
            priorityList.slice(0, 20).map((item, idx) => (
              <UpgradeCard
                key={`${item.name}-${idx}`}
                item={item}
                index={idx}
                expanded={expandedItem === idx}
                onToggle={() => setExpandedItem(expandedItem === idx ? null : idx)}
              />
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <UpgradeList items={upgradeComparison?.heroes || []} type="hero" />
      )}

      {tab === 2 && (
        <UpgradeList items={upgradeComparison?.troops || []} type="troop" />
      )}

      {tab === 3 && (
        <UpgradeList items={upgradeComparison?.spells || []} type="spell" />
      )}
    </Box>
  );
}

// ─── Upgrade Card Component ────────────────────────────
function UpgradeCard({ item, index, expanded, onToggle }) {
  const pct = item.maxLevel > 0 ? Math.round((item.level / item.maxLevel) * 100) : 100;
  const priorityColor = PRIORITY_COLORS[item.priority] || '#94A3B8';

  return (
    <Paper
      className="glass-card"
      elevation={0}
      onClick={onToggle}
      sx={{
        p: 1.5,
        mb: 1,
        cursor: 'pointer',
        border: `1px solid ${alpha(priorityColor, 0.15)}`,
        transition: 'all 0.2s ease',
        '&:hover': { border: `1px solid ${alpha(priorityColor, 0.3)}` },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Priority badge */}
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            bgcolor: alpha(priorityColor, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: '0.7rem', color: priorityColor }}>
            #{index + 1}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.name}
            </Typography>
            <Chip
              label={PRIORITY_LABELS[item.priority] || item.priority}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.55rem',
                bgcolor: alpha(priorityColor, 0.15),
                color: priorityColor,
                fontWeight: 700,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Lv {item.level} → {item.maxLevel}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.04)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  bgcolor: priorityColor,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              {pct}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {item.type === 'hero' && '⚔️ Hero'}
            {item.type === 'troop' && '🗡️ Troop'}
            {item.type === 'spell' && '✨ Spell'}
            {' • '}
            Remaining levels: {item.maxLevel - item.level}
            {item.estimatedTime && ` • Est. time: ${formatUpgradeTime(item.estimatedTime)}`}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── Upgrade List Component ────────────────────────────
function UpgradeList({ items, type }) {
  const incomplete = items.filter((i) => i.level < i.maxLevel);
  const complete = items.filter((i) => i.level >= i.maxLevel);

  return (
    <Box>
      {incomplete.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
          All {type}s maxed! 🎉
        </Typography>
      )}

      {incomplete.map((item, idx) => {
        const pct = item.maxLevel > 0 ? Math.round((item.level / item.maxLevel) * 100) : 100;
        return (
          <Paper
            key={item.name}
            className="glass-card"
            elevation={0}
            sx={{ p: 1.5, mb: 1, border: `1px solid ${alpha(colors.ROYAL_GOLD, 0.08)}` }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.name}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.ROYAL_GOLD, fontWeight: 600 }}>
                {item.level}/{item.maxLevel}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{
                height: 5,
                borderRadius: 2.5,
                bgcolor: alpha(colors.ROYAL_GOLD, 0.06),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2.5,
                  background: pct === 100 ? '#4ade80' : goldGradient,
                },
              }}
            />
          </Paper>
        );
      })}

      {complete.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            ✅ Maxed ({complete.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {complete.map((item) => (
              <Chip
                key={item.name}
                label={item.name}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6rem',
                  bgcolor: alpha('#4ade80', 0.1),
                  color: '#4ade80',
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Helpers ───────────────────────────────────────────
function formatLargeNumber(num) {
  if (!num && num !== 0) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
