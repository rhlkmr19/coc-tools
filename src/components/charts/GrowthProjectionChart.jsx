// ============================================
// Clash Intelligence Pro – Growth Projection Chart
// ============================================
// Specialized composite chart for trophy/stat
// projections combining:
//   - Historical solid line (actual data)
//   - Projected dashed line (forecast)
//   - Confidence band (shaded area)
//   - Current value marker
//   - Target line (optional)
//   - Gradient area fill for history
//   - Date axis labels
//   - Stat summary overlay
// ============================================

import { memo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { colors } from '../../theme/theme';

/**
 * @param {object}   props
 * @param {Array<{date:string, value:number}>} props.history – Historical data points
 * @param {Array<{date:string, value:number, low?:number, high?:number}>} props.projection – Forecasted points
 * @param {number}   [props.target]          – Optional target value (draws horizontal line)
 * @param {string}   [props.targetLabel='Target'] – Label for target line
 * @param {number}   [props.width=310]       – SVG width
 * @param {number}   [props.height=200]      – SVG height
 * @param {string}   [props.historyColor]    – History line color
 * @param {string}   [props.projectionColor] – Projection line color
 * @param {string}   [props.bandColor]       – Confidence band fill
 * @param {string}   [props.label='']        – Chart title label
 * @param {string}   [props.unit='']         – Value unit ('trophies', '%', etc.)
 * @param {boolean}  [props.showSummary=true] – Show rate/trend summary
 * @param {string}   [props.className]       – CSS class
 */
function GrowthProjectionChart({
  history = [],
  projection = [],
  target,
  targetLabel = 'Target',
  width = 310,
  height = 200,
  historyColor,
  projectionColor,
  bandColor,
  label = '',
  unit = '',
  showSummary = true,
  className = '',
}) {
  if (history.length < 2 && projection.length < 2) return null;

  const hColor = historyColor || colors.ROYAL_GOLD;
  const pColor = projectionColor || '#64b5f6';
  const bColor = bandColor || 'rgba(100, 181, 246, 0.1)';

  const padding = { top: 16, right: 8, bottom: 22, left: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Merge all values for Y scaling
  const allValues = [
    ...history.map((d) => d.value),
    ...projection.map((d) => d.value),
    ...projection.filter((d) => d.high != null).map((d) => d.high),
    ...projection.filter((d) => d.low != null).map((d) => d.low),
  ];
  if (target != null) allValues.push(target);

  const yMin = Math.min(...allValues) * 0.97;
  const yMax = Math.max(...allValues) * 1.03;
  const yRange = yMax - yMin || 1;

  const totalPoints = history.length + projection.length;
  const toX = (i) => padding.left + (i / Math.max(totalPoints - 1, 1)) * chartW;
  const toY = (v) => padding.top + chartH - ((v - yMin) / yRange) * chartH;

  // ─── History path ──────────────────────────────────
  const historyPts = history.map((d, i) => ({ x: toX(i), y: toY(d.value) }));
  const historyLine = historyPts.length > 1
    ? `M${historyPts.map((p) => `${p.x},${p.y}`).join(' L')}`
    : '';
  const historyArea = historyLine
    ? `${historyLine} L${historyPts[historyPts.length - 1].x},${padding.top + chartH} L${historyPts[0].x},${padding.top + chartH} Z`
    : '';

  // ─── Projection path ──────────────────────────────
  const projStart = history.length > 0 ? history.length - 1 : 0;
  const projectionPts = projection.map((d, i) => ({
    x: toX(projStart + i + (history.length > 0 ? 1 : 0)),
    y: toY(d.value),
  }));

  // Connect last history point to first projection point
  const connectionPt = historyPts.length > 0 ? historyPts[historyPts.length - 1] : null;
  const projLine = projectionPts.length > 0
    ? `M${connectionPt ? `${connectionPt.x},${connectionPt.y} L` : ''}${projectionPts.map((p) => `${p.x},${p.y}`).join(' L')}`
    : '';

  // ─── Confidence band ──────────────────────────────
  const bandData = projection.filter((d) => d.low != null && d.high != null);
  let bandPath = '';
  if (bandData.length >= 2) {
    const bandPts = bandData.map((d, i) => {
      const idx = projStart + i + (history.length > 0 ? 1 : 0);
      return {
        x: toX(idx),
        yHigh: toY(d.high),
        yLow: toY(d.low),
      };
    });
    const topLine = bandPts.map((p) => `${p.x},${p.yHigh}`).join(' L');
    const bottomLine = [...bandPts].reverse().map((p) => `${p.x},${p.yLow}`).join(' L');
    bandPath = `M${topLine} L${bottomLine} Z`;
  }

  // ─── Compute trend ────────────────────────────────
  const currentValue = history.length > 0 ? history[history.length - 1].value : null;
  const projectedValue = projection.length > 0 ? projection[projection.length - 1].value : null;
  const prevValue = history.length > 1 ? history[0].value : null;

  let dailyRate = null;
  if (history.length >= 2) {
    dailyRate = ((history[history.length - 1].value - history[0].value) / (history.length - 1));
  }

  const trendUp = dailyRate != null && dailyRate > 0;
  const trendDown = dailyRate != null && dailyRate < 0;

  // ─── Unique gradient IDs ──────────────────────────
  const gradId = `proj-grad-${width}-${height}`;

  return (
    <Box className={className} sx={{ display: 'inline-flex', flexDirection: 'column' }}>
      {/* Header */}
      {(label || showSummary) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {label && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.7rem' }}>
              {label}
            </Typography>
          )}
          <Box sx={{ flex: 1 }} />
          {showSummary && dailyRate != null && (
            <Chip
              icon={
                trendUp ? (
                  <TrendingUpIcon sx={{ fontSize: '14px !important', color: '#4caf50 !important' }} />
                ) : trendDown ? (
                  <TrendingDownIcon sx={{ fontSize: '14px !important', color: '#f44336 !important' }} />
                ) : undefined
              }
              label={`${dailyRate >= 0 ? '+' : ''}${dailyRate.toFixed(1)}${unit ? ' ' + unit : ''}/day`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6rem',
                fontFamily: 'Orbitron',
                fontWeight: 600,
                bgcolor: trendUp ? 'rgba(76,175,80,0.12)' : trendDown ? 'rgba(244,67,54,0.12)' : 'rgba(255,255,255,0.06)',
                color: trendUp ? '#4caf50' : trendDown ? '#f44336' : 'text.secondary',
                '& .MuiChip-icon': { ml: 0.3 },
              }}
            />
          )}
        </Box>
      )}

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hColor} stopOpacity={0.25} />
            <stop offset="100%" stopColor={hColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {Array.from({ length: 4 }, (_, i) => {
          const y = padding.top + (chartH / 3) * i;
          return (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          );
        })}

        {/* Target line */}
        {target != null && (
          <>
            <line
              x1={padding.left}
              y1={toY(target)}
              x2={padding.left + chartW}
              y2={toY(target)}
              stroke="#ff9800"
              strokeWidth={1}
              strokeDasharray="6,3"
              opacity={0.6}
            />
            <text
              x={padding.left + chartW}
              y={toY(target) - 4}
              textAnchor="end"
              fill="#ff9800"
              fontSize={7}
              fontFamily="Roboto"
              opacity={0.7}
            >
              {targetLabel} {target.toLocaleString()}
            </text>
          </>
        )}

        {/* Confidence band */}
        {bandPath && (
          <path d={bandPath} fill={bColor} />
        )}

        {/* History area fill */}
        {historyArea && (
          <path d={historyArea} fill={`url(#${gradId})`} />
        )}

        {/* History line */}
        {historyLine && (
          <path
            d={historyLine}
            fill="none"
            stroke={hColor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Projection line (dashed) */}
        {projLine && (
          <path
            d={projLine}
            fill="none"
            stroke={pColor}
            strokeWidth={2}
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        )}

        {/* Current value marker */}
        {currentValue != null && historyPts.length > 0 && (
          <>
            <circle
              cx={historyPts[historyPts.length - 1].x}
              cy={historyPts[historyPts.length - 1].y}
              r={4}
              fill={hColor}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1.5}
            />
            <text
              x={historyPts[historyPts.length - 1].x}
              y={historyPts[historyPts.length - 1].y - 8}
              textAnchor="middle"
              fill={hColor}
              fontSize={8}
              fontWeight="bold"
              fontFamily="Orbitron"
            >
              {currentValue.toLocaleString()}
            </text>
          </>
        )}

        {/* Projected end marker */}
        {projectedValue != null && projectionPts.length > 0 && (
          <>
            <circle
              cx={projectionPts[projectionPts.length - 1].x}
              cy={projectionPts[projectionPts.length - 1].y}
              r={3}
              fill={pColor}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
            />
            <text
              x={projectionPts[projectionPts.length - 1].x}
              y={projectionPts[projectionPts.length - 1].y - 7}
              textAnchor="end"
              fill={pColor}
              fontSize={7}
              fontWeight="bold"
              fontFamily="Orbitron"
            >
              {projectedValue.toLocaleString()}
            </text>
          </>
        )}

        {/* Y-axis labels */}
        <text x={padding.left} y={padding.top - 3} fill="rgba(255,255,255,0.35)" fontSize={7} fontFamily="Roboto">
          {Math.round(yMax).toLocaleString()}
        </text>
        <text x={padding.left} y={padding.top + chartH + 10} fill="rgba(255,255,255,0.35)" fontSize={7} fontFamily="Roboto">
          {Math.round(yMin).toLocaleString()}
        </text>

        {/* X-axis labels */}
        {history.length > 0 && (
          <text x={padding.left} y={height - 3} fill="rgba(255,255,255,0.25)" fontSize={7} fontFamily="Roboto">
            {history[0].date}
          </text>
        )}
        {projection.length > 0 && (
          <text x={width - padding.right} y={height - 3} fill="rgba(255,255,255,0.25)" fontSize={7} fontFamily="Roboto" textAnchor="end">
            {projection[projection.length - 1].date}
          </text>
        )}

        {/* Divider: history ↔ projection boundary */}
        {history.length > 0 && projection.length > 0 && historyPts.length > 0 && (
          <line
            x1={historyPts[historyPts.length - 1].x}
            y1={padding.top}
            x2={historyPts[historyPts.length - 1].x}
            y2={padding.top + chartH}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            strokeDasharray="2,4"
          />
        )}

        {/* Legend */}
        <rect x={width - 130} y={2} width={8} height={8} rx={1} fill={hColor} />
        <text x={width - 118} y={10} fill="rgba(255,255,255,0.45)" fontSize={7} fontFamily="Roboto">Actual</text>
        <rect x={width - 75} y={2} width={8} height={8} rx={1} fill={pColor} opacity={0.8} />
        <text x={width - 63} y={10} fill="rgba(255,255,255,0.45)" fontSize={7} fontFamily="Roboto">Projected</text>
      </svg>

      {/* Summary stats row */}
      {showSummary && (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 0.5 }}>
          {currentValue != null && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Current</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'Orbitron', fontWeight: 700, color: hColor }}>
                {currentValue.toLocaleString()}
              </Typography>
            </Box>
          )}
          {projectedValue != null && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Projected</Typography>
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'Orbitron', fontWeight: 700, color: pColor }}>
                {projectedValue.toLocaleString()}
              </Typography>
            </Box>
          )}
          {currentValue != null && projectedValue != null && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Change</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  color: projectedValue >= currentValue ? '#4caf50' : '#f44336',
                }}
              >
                {projectedValue >= currentValue ? '+' : ''}
                {(projectedValue - currentValue).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default memo(GrowthProjectionChart);
