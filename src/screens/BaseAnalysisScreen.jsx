// ============================================
// Clash Intelligence Pro – Base Analysis Screen
// ============================================
// Comprehensive base defense analysis with
// radar chart, air/ground scores, splash
// coverage, structural imbalance detection,
// weak compartments, and AI recommendations
// ============================================

import { useState, useEffect, useMemo, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Collapse,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShieldIcon from '@mui/icons-material/Shield';
import FlightIcon from '@mui/icons-material/Flight';
import TerrainIcon from '@mui/icons-material/Terrain';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import BalanceIcon from '@mui/icons-material/Balance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SecurityIcon from '@mui/icons-material/Security';
import { AppContext } from '../App';
import { ThemeContext } from '../App';
import { goldGradient, purpleGradient, colors } from '../theme/theme';
import {
  assessBase,
  calcAirDefenseScore,
  calcGroundDefenseScore,
  calcSplashDensity,
  detectWeakCompartments,
  detectStructuralImbalance,
} from '../utils/baseAnalysisEngine';
import { aiService } from '../services/aiService';

// ─── SVG Radar Chart ───────────────────────────────────
function RadarChart({ data, size = 220 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / data.length;

  // Grid circles
  const gridCircles = Array.from({ length: levels }, (_, i) => {
    const r = (radius / levels) * (i + 1);
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(212,175,55,0.12)"
        strokeWidth={1}
      />
    );
  });

  // Axis lines + labels
  const axes = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x2 = cx + radius * Math.cos(angle);
    const y2 = cy + radius * Math.sin(angle);
    const lx = cx + (radius + 18) * Math.cos(angle);
    const ly = cy + (radius + 18) * Math.sin(angle);
    return (
      <g key={i}>
        <line
          x1={cx}
          y1={cy}
          x2={x2}
          y2={y2}
          stroke="rgba(212,175,55,0.2)"
          strokeWidth={1}
        />
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="central"
          fill="rgba(255,255,255,0.6)"
          fontSize={8}
          fontFamily="Roboto"
        >
          {d.subject.length > 10 ? d.subject.slice(0, 9) + '…' : d.subject}
        </text>
      </g>
    );
  });

  // Data polygon
  const points = data
    .map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (d.value / d.fullMark) * radius;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');

  // Value dots
  const dots = data.map((d, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (d.value / d.fullMark) * radius;
    return (
      <circle
        key={i}
        cx={cx + r * Math.cos(angle)}
        cy={cy + r * Math.sin(angle)}
        r={3}
        fill={colors.ROYAL_GOLD}
        stroke="rgba(0,0,0,0.3)"
        strokeWidth={1}
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridCircles}
      {axes}
      <polygon
        points={points}
        fill="rgba(212,175,55,0.15)"
        stroke={colors.ROYAL_GOLD}
        strokeWidth={2}
      />
      {dots}
    </svg>
  );
}

// ─── Score Ring SVG ────────────────────────────────────
function ScoreRing({ score, size = 90, label, color }) {
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = color || (score >= 80 ? '#4caf50' : score >= 60 ? colors.ROYAL_GOLD : score >= 40 ? '#ff9800' : '#f44336');

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.28}
          fontWeight="bold"
          fontFamily="Orbitron"
        >
          {score}
        </text>
      </svg>
      {label && (
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.65rem' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}

// ─── Rating Badge ──────────────────────────────────────
function RatingBadge({ rating }) {
  const colorMap = {
    S: '#ff6f00',
    A: '#4caf50',
    B: '#2196f3',
    C: colors.ROYAL_GOLD,
    D: '#ff9800',
    F: '#f44336',
  };
  return (
    <Chip
      label={`Rank ${rating}`}
      size="small"
      sx={{
        background: `${colorMap[rating] || '#666'}22`,
        color: colorMap[rating] || '#aaa',
        border: `1px solid ${colorMap[rating] || '#666'}44`,
        fontWeight: 700,
        fontFamily: 'Orbitron',
        fontSize: '0.7rem',
      }}
    />
  );
}

// ─── Imbalance Bar ─────────────────────────────────────
function ImbalanceBar({ offenseScore, defenseScore }) {
  const total = offenseScore + defenseScore || 1;
  const offPct = (offenseScore / total) * 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#64b5f6', fontWeight: 600 }}>
          Offense {offenseScore}%
        </Typography>
        <Typography variant="caption" sx={{ color: '#ef5350', fontWeight: 600 }}>
          Defense {defenseScore}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        <Box sx={{ width: `${offPct}%`, background: 'linear-gradient(90deg, #1565c0, #64b5f6)', transition: 'width 1s ease' }} />
        <Box sx={{ width: `${100 - offPct}%`, background: 'linear-gradient(90deg, #ef5350, #c62828)', transition: 'width 1s ease' }} />
      </Box>
    </Box>
  );
}

// ─── Priority Color Helper ─────────────────────────────
function getPriorityColor(priority) {
  if (priority === 'high') return '#f44336';
  if (priority === 'medium') return '#ff9800';
  return '#4caf50';
}

// ─── Base Analysis Screen ──────────────────────────────
export default function BaseAnalysisScreen() {
  const { playerData, navigateTo } = useContext(AppContext);
  const { mode } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState(0);
  const [expandedCompartments, setExpandedCompartments] = useState({});
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Compute all analysis data
  const analysis = useMemo(() => assessBase(playerData), [playerData]);
  const airData = useMemo(() => calcAirDefenseScore(playerData), [playerData]);
  const groundData = useMemo(() => calcGroundDefenseScore(playerData), [playerData]);
  const splashData = useMemo(() => calcSplashDensity(playerData), [playerData]);
  const compartments = useMemo(() => detectWeakCompartments(playerData), [playerData]);
  const imbalance = useMemo(() => detectStructuralImbalance(playerData), [playerData]);

  // Fetch AI insight
  useEffect(() => {
    if (!analysis) return;
    let cancelled = false;
    const fetchAI = async () => {
      setAiLoading(true);
      try {
        const prompt = `Analyze this Clash of Clans base (TH${analysis.thLevel}): Overall score ${analysis.overallScore}/100 (${analysis.overallRating}). Air defense: ${airData.score}/100. Ground defense: ${groundData.score}/100. Splash coverage: ${splashData.score}/100. ${imbalance ? `Imbalance: ${imbalance.severity} (offense ${imbalance.offenseScore}% vs defense ${imbalance.defenseScore}%).` : ''} Weak compartments: ${analysis.weakCompartments.map(c => `${c.category} (${c.score}%)`).join(', ') || 'none'}. Provide specific upgrade priorities and strategic advice in 2-3 sentences.`;
        const result = await aiService.chat(prompt);
        if (!cancelled) setAiInsight(result);
      } catch {
        if (!cancelled) setAiInsight('AI analysis unavailable. Review the detailed metrics below for insights.');
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    };
    fetchAI();
    return () => { cancelled = true; };
  }, [analysis, airData, groundData, splashData, imbalance]);

  const toggleCompartment = (category) => {
    setExpandedCompartments((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  if (!analysis) {
    return (
      <Box sx={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <SecurityIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography color="text.secondary">No player data available for analysis</Typography>
      </Box>
    );
  }

  // ─── TAB: Overview ─────────────────────────────────
  const renderOverview = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Overall Score + Radar */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2.5, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <ShieldIcon sx={{ color: colors.ROYAL_GOLD }} />
          <Typography variant="h6" sx={{ fontFamily: 'Orbitron', background: goldGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Base Assessment
          </Typography>
          <RatingBadge rating={analysis.overallRating} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <ScoreRing score={analysis.overallScore} size={110} label="Overall" />
          <RadarChart data={analysis.radarData} size={200} />
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1.5, display: 'block' }}>
          TH{analysis.thLevel} base analyzed across 5 defense dimensions
        </Typography>
      </Paper>

      {/* Quick Scores Grid */}
      <Grid container spacing={1.5} className="animate-fadeSlideUp" sx={{ animationDelay: '0.1s' }}>
        {[
          { label: 'Air Def', score: airData.score, rating: airData.rating, icon: <FlightIcon fontSize="small" />, color: '#64b5f6' },
          { label: 'Ground Def', score: groundData.score, rating: groundData.rating, icon: <TerrainIcon fontSize="small" />, color: '#81c784' },
          { label: 'Splash', score: splashData.score, rating: splashData.rating, icon: <BubbleChartIcon fontSize="small" />, color: '#ffb74d' },
          { label: 'Balance', score: Math.max(0, 100 - (imbalance?.absImbalance || 0)), rating: imbalance?.severity === 'balanced' ? 'A' : imbalance?.severity === 'slight' ? 'B' : 'D', icon: <BalanceIcon fontSize="small" />, color: '#ce93d8' },
        ].map((item) => (
          <Grid item xs={6} key={item.label}>
            <Paper className="glass-card" sx={{ p: 1.5, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1 }}>
                <Box sx={{ color: item.color }}>{item.icon}</Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                  {item.label}
                </Typography>
              </Box>
              <ScoreRing score={item.score} size={64} />
              <Box sx={{ mt: 0.5 }}>
                <RatingBadge rating={item.rating} />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* AI Insight */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2, animationDelay: '0.2s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <TipsAndUpdatesIcon sx={{ color: colors.ROYAL_GOLD, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
            AI Strategic Insight
          </Typography>
        </Box>
        {aiLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: colors.ROYAL_GOLD }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Analyzing base...</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.8rem' }}>
            {aiInsight || 'Loading analysis...'}
          </Typography>
        )}
      </Paper>
    </Box>
  );

  // ─── TAB: Defense Detail ───────────────────────────
  const renderDefenseDetail = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Air Defense Card */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FlightIcon sx={{ color: '#64b5f6' }} />
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700 }}>
            Air Defense
          </Typography>
          <Box sx={{ flex: 1 }} />
          <ScoreRing score={airData.score} size={50} />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Score: {airData.earnedPoints}/{airData.maxPoints} pts
            </Typography>
            <RatingBadge rating={airData.rating} />
          </Box>
          <LinearProgress
            variant="determinate"
            value={airData.score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #1565c0, #64b5f6)',
              },
            }}
          />
        </Box>

        {airData.weakPoints?.length > 0 && (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              Weak Points ({airData.weakPoints.length})
            </Typography>
            {airData.weakPoints.map((wp, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, pl: 1 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#64b5f6' }} />
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {wp.name}
                </Typography>
                <Chip
                  label={`${wp.level}/${wp.maxLevel}`}
                  size="small"
                  sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(100,181,246,0.15)', color: '#64b5f6' }}
                />
                <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600, fontSize: '0.6rem' }}>
                  -{wp.deficit} lvl
                </Typography>
              </Box>
            ))}
          </>
        )}
        {airData.weakPoints?.length === 0 && (
          <Chip label="All Air Defenses Maxed ✓" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 600 }} />
        )}
      </Paper>

      {/* Ground Defense Card */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2, animationDelay: '0.1s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TerrainIcon sx={{ color: '#81c784' }} />
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700 }}>
            Ground Defense
          </Typography>
          <Box sx={{ flex: 1 }} />
          <ScoreRing score={groundData.score} size={50} />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Score: {groundData.earnedPoints}/{groundData.maxPoints} pts
            </Typography>
            <RatingBadge rating={groundData.rating} />
          </Box>
          <LinearProgress
            variant="determinate"
            value={groundData.score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #2e7d32, #81c784)',
              },
            }}
          />
        </Box>

        {groundData.weakPoints?.length > 0 && (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
              Weak Points ({groundData.weakPoints.length})
            </Typography>
            {groundData.weakPoints.map((wp, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8, pl: 1 }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#81c784' }} />
                <Typography variant="caption" sx={{ flex: 1 }}>
                  {wp.name}
                </Typography>
                <Chip
                  label={`${wp.level}/${wp.maxLevel}`}
                  size="small"
                  sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(129,199,132,0.15)', color: '#81c784' }}
                />
                <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600, fontSize: '0.6rem' }}>
                  -{wp.deficit} lvl
                </Typography>
              </Box>
            ))}
          </>
        )}
        {groundData.weakPoints?.length === 0 && (
          <Chip label="All Ground Defenses Maxed ✓" size="small" sx={{ bgcolor: 'rgba(76,175,80,0.15)', color: '#4caf50', fontWeight: 600 }} />
        )}
      </Paper>

      {/* Splash Coverage Card */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2, animationDelay: '0.2s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BubbleChartIcon sx={{ color: '#ffb74d' }} />
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700 }}>
            Splash Coverage
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Chip
            label={splashData.coverage?.toUpperCase()}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              bgcolor: splashData.score >= 70 ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
              color: splashData.score >= 70 ? '#4caf50' : '#ff9800',
            }}
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={splashData.score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.06)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #e65100, #ffb74d)',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            {splashData.score}% splash defense completion
          </Typography>
        </Box>

        {splashData.buildings?.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {splashData.buildings.map((b, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem' }}>
                  {b.name}
                </Typography>
                <Box sx={{ flex: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={b.completionPct}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: b.completionPct >= 80 ? '#4caf50' : b.completionPct >= 50 ? '#ffb74d' : '#f44336',
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', minWidth: 36, textAlign: 'right' }}>
                  {b.level}/{b.maxLevel}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );

  // ─── TAB: Imbalance & Compartments ─────────────────
  const renderImbalance = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Structural Imbalance */}
      {imbalance && (
        <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BalanceIcon sx={{ color: '#ce93d8' }} />
            <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700 }}>
              Structural Balance
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Chip
              label={imbalance.severity.toUpperCase()}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                bgcolor:
                  imbalance.severity === 'balanced'
                    ? 'rgba(76,175,80,0.15)'
                    : imbalance.severity === 'slight'
                    ? 'rgba(255,183,77,0.15)'
                    : 'rgba(244,67,54,0.15)',
                color:
                  imbalance.severity === 'balanced'
                    ? '#4caf50'
                    : imbalance.severity === 'slight'
                    ? '#ffb74d'
                    : '#f44336',
              }}
            />
          </Box>

          {/* Offense vs Defense comparison */}
          <ImbalanceBar offenseScore={imbalance.offenseScore} defenseScore={imbalance.defenseScore} />

          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

          {/* Breakdown */}
          <Grid container spacing={1}>
            {[
              { label: 'Heroes', score: imbalance.breakdown.heroScore, color: '#ce93d8' },
              { label: 'Troops', score: imbalance.breakdown.troopScore, color: '#64b5f6' },
              { label: 'Spells', score: imbalance.breakdown.spellScore, color: '#ffb74d' },
              { label: 'Defense', score: imbalance.breakdown.defenseScore, color: '#81c784' },
            ].map((item) => (
              <Grid item xs={3} key={item.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: item.color, fontFamily: 'Orbitron', fontSize: '0.9rem' }}>
                    {item.score}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '0.72rem' }}>
              {imbalance.recommendation}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Weak Compartments */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2, animationDelay: '0.1s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <WarningAmberIcon sx={{ color: '#ff9800' }} />
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontSize: '0.85rem', fontWeight: 700 }}>
            Defense Compartments
          </Typography>
        </Box>

        {compartments.length === 0 ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>No compartment data available.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {compartments.map((comp) => (
              <Box key={comp.category}>
                <Box
                  onClick={() => toggleCompartment(comp.category)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: comp.isWeak ? 'rgba(244,67,54,0.06)' : 'rgba(76,175,80,0.04)',
                    border: `1px solid ${comp.isWeak ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.1)'}`,
                    '&:active': { transform: 'scale(0.98)' },
                    transition: 'all 0.15s ease',
                  }}
                >
                  {comp.isWeak && <WarningAmberIcon sx={{ fontSize: 16, color: '#ff9800' }} />}
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, fontSize: '0.8rem' }}>
                    {comp.category}
                  </Typography>
                  <Chip
                    label={`${comp.score}%`}
                    size="small"
                    sx={{
                      height: 22,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      fontFamily: 'Orbitron',
                      bgcolor: comp.isWeak ? 'rgba(244,67,54,0.15)' : 'rgba(76,175,80,0.15)',
                      color: comp.isWeak ? '#f44336' : '#4caf50',
                    }}
                  />
                  <RatingBadge rating={comp.rating} />
                  {expandedCompartments[comp.category] ? (
                    <ExpandLessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                </Box>

                <Collapse in={expandedCompartments[comp.category]}>
                  <Box sx={{ pl: 2, pt: 1, pb: 0.5 }}>
                    {comp.buildings.map((b, bi) => (
                      <Box key={bi} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                        <Typography variant="caption" sx={{ flex: 1, fontSize: '0.7rem' }}>
                          {b.name}
                        </Typography>
                        <Box sx={{ width: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={b.pct}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 2,
                                background: b.pct >= 80 ? '#4caf50' : b.pct >= 50 ? '#ffb74d' : '#f44336',
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem', minWidth: 36, textAlign: 'right' }}>
                          {b.level}/{b.maxLevel}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );

  // ─── TAB: Recommendations ──────────────────────────
  const renderRecommendations = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {analysis.recommendations?.length > 0 ? (
        analysis.recommendations.map((rec, i) => (
          <Paper
            key={i}
            className="glass-card animate-fadeSlideUp"
            sx={{ p: 2, animationDelay: `${i * 0.08}s`, borderLeft: `3px solid ${getPriorityColor(rec.priority)}` }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: '1.1rem' }}>{rec.icon}</Typography>
              <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 700, fontSize: '0.8rem' }}>
                {rec.title}
              </Typography>
              <Chip
                label={rec.priority.toUpperCase()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  bgcolor: `${getPriorityColor(rec.priority)}22`,
                  color: getPriorityColor(rec.priority),
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '0.78rem' }}>
              {rec.description}
            </Typography>
          </Paper>
        ))
      ) : (
        <Paper className="glass-card" sx={{ p: 3, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontFamily: 'Orbitron', fontWeight: 700 }}>
            Base Fully Optimized
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            No critical recommendations. Your base defenses are well-maintained!
          </Typography>
        </Paper>
      )}

      {/* AI Deep Analysis */}
      <Paper className="glass-card animate-fadeSlideUp" sx={{ p: 2, animationDelay: '0.3s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TipsAndUpdatesIcon sx={{ color: colors.ROYAL_GOLD, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontFamily: 'Orbitron', fontSize: '0.75rem' }}>
            AI Deep Analysis
          </Typography>
        </Box>
        {aiLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} sx={{ color: colors.ROYAL_GOLD }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Generating deep analysis...</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.78rem' }}>
            {aiInsight || 'Analysis pending...'}
          </Typography>
        )}
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          background: mode === 'dark'
            ? 'linear-gradient(135deg, rgba(46,26,71,0.95), rgba(15,23,42,0.98))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,245,255,0.98))',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.08)'}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <IconButton onClick={() => navigateTo('DASHBOARD')} size="small" sx={{ color: colors.ROYAL_GOLD }}>
          <ArrowBackIcon />
        </IconButton>
        <ShieldIcon sx={{ color: colors.ROYAL_GOLD, fontSize: 22 }} />
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: goldGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Base Analysis
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Chip
          label={`TH${analysis.thLevel}`}
          size="small"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            fontSize: '0.65rem',
            background: purpleGradient,
            color: '#fff',
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          minHeight: 40,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          '& .MuiTab-root': {
            minHeight: 40,
            textTransform: 'none',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'text.secondary',
            '&.Mui-selected': { color: colors.ROYAL_GOLD },
          },
          '& .MuiTabs-indicator': { backgroundColor: colors.ROYAL_GOLD, height: 2 },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Defense" />
        <Tab label="Balance" />
        <Tab label="Advice" />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 0 && renderOverview()}
        {activeTab === 1 && renderDefenseDetail()}
        {activeTab === 2 && renderImbalance()}
        {activeTab === 3 && renderRecommendations()}
      </Box>
    </Box>
  );
}
