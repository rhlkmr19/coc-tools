// ============================================
// Clash Intelligence Pro – Line Chart
// ============================================
// Reusable SVG line / area chart with:
//   - Gradient area fill beneath the line
//   - Multiple series support (up to 4)
//   - Auto-scale Y axis with min/max labels
//   - X axis date/category labels
//   - End-point dot indicator
//   - Gridlines (horizontal)
//   - Optional hover crosshair support
//   - Responsive container wrapper
// ============================================

import { memo, useState, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/theme';

/**
 * @typedef  SeriesConfig
 * @property {string} dataKey  – Key to extract from data items
 * @property {string} [color]  – Line color
 * @property {string} [label]  – Legend label
 * @property {boolean} [showArea=true] – Fill area under line
 */

/**
 * @param {object}   props
 * @param {Array<object>} props.data      – Array of data objects
 * @param {string|SeriesConfig[]} props.dataKey – Single key string or array of series configs
 * @param {number}   [props.width=300]     – SVG width
 * @param {number}   [props.height=160]    – SVG height
 * @param {string}   [props.color]         – Line color (single series)
 * @param {boolean}  [props.showArea=true]  – Show gradient area fill
 * @param {boolean}  [props.showDots=true]  – Show endpoint dot
 * @param {boolean}  [props.showGrid=true]  – Show horizontal gridlines
 * @param {boolean}  [props.showLabels=true] – Show min/max/date labels
 * @param {number}   [props.gridLines=4]    – Number of horizontal grid lines
 * @param {string}   [props.xKey='date']    – Key for x-axis labels
 * @param {number}   [props.strokeWidth=2]  – Line thickness
 * @param {boolean}  [props.smooth=false]   – Use catmull-rom smoothing
 * @param {string}   [props.className]      – CSS class
 */
function LineChartComponent({
  data,
  dataKey,
  width = 300,
  height = 160,
  color: singleColor,
  showArea = true,
  showDots = true,
  showGrid = true,
  showLabels = true,
  gridLines = 4,
  xKey = 'date',
  strokeWidth = 2,
  smooth = false,
  className = '',
}) {
  if (!data || data.length < 2) return null;

  const padding = { top: 12, right: 8, bottom: 20, left: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Normalize series config
  const series = Array.isArray(dataKey)
    ? dataKey
    : [{ dataKey: dataKey, color: singleColor || colors.ROYAL_GOLD, label: dataKey, showArea }];

  // Compute global Y range across all series
  let globalMin = Infinity;
  let globalMax = -Infinity;
  for (const s of series) {
    for (const d of data) {
      const v = d[s.dataKey] ?? 0;
      if (v < globalMin) globalMin = v;
      if (v > globalMax) globalMax = v;
    }
  }
  const yRange = globalMax - globalMin || 1;
  // Add 5% padding
  const yMin = globalMin - yRange * 0.05;
  const yMax = globalMax + yRange * 0.05;
  const effectiveRange = yMax - yMin;

  // Map value → Y coord
  const toY = (v) => padding.top + chartH - ((v - yMin) / effectiveRange) * chartH;
  const toX = (i) => padding.left + (i / (data.length - 1)) * chartW;

  // Build path for a series
  const buildPath = (key) => {
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d[key] ?? 0) }));

    if (smooth && pts.length >= 3) {
      // Catmull-Rom → Cubic Bezier approximation
      let path = `M${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(i - 1, 0)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(i + 2, pts.length - 1)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return { linePath: path, pts };
    }

    const linePath = `M${pts.map((p) => `${p.x},${p.y}`).join(' L')}`;
    return { linePath, pts };
  };

  // Build area path
  const buildAreaPath = (linePath) => {
    const bottom = padding.top + chartH;
    return `${linePath} L${padding.left + chartW},${bottom} L${padding.left},${bottom} Z`;
  };

  // Unique gradient IDs
  const gradientId = (key) => `line-grad-${key}-${width}`;

  return (
    <Box className={className} sx={{ display: 'inline-flex' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.dataKey} id={gradientId(s.dataKey)} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color || colors.ROYAL_GOLD} stopOpacity={0.3} />
              <stop offset="100%" stopColor={s.color || colors.ROYAL_GOLD} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal gridlines */}
        {showGrid &&
          Array.from({ length: gridLines }, (_, i) => {
            const y =
              padding.top + (chartH / (gridLines - 1)) * i;
            return (
              <line
                key={`grid-${i}`}
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
            );
          })}

        {/* Series */}
        {series.map((s) => {
          const { linePath, pts } = buildPath(s.dataKey);
          const sColor = s.color || colors.ROYAL_GOLD;
          const sArea = s.showArea !== false;

          return (
            <g key={s.dataKey}>
              {/* Area fill */}
              {sArea && (
                <path
                  d={buildAreaPath(linePath)}
                  fill={`url(#${gradientId(s.dataKey)})`}
                />
              )}

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={sColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* End dot */}
              {showDots && pts.length > 0 && (
                <circle
                  cx={pts[pts.length - 1].x}
                  cy={pts[pts.length - 1].y}
                  r={3}
                  fill={sColor}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={1}
                />
              )}
            </g>
          );
        })}

        {/* Y-axis labels */}
        {showLabels && (
          <>
            <text
              x={padding.left}
              y={padding.top - 2}
              fill="rgba(255,255,255,0.4)"
              fontSize={8}
              fontFamily="Roboto"
            >
              {globalMax.toLocaleString()}
            </text>
            <text
              x={padding.left}
              y={padding.top + chartH + 10}
              fill="rgba(255,255,255,0.4)"
              fontSize={8}
              fontFamily="Roboto"
            >
              {globalMin.toLocaleString()}
            </text>
          </>
        )}

        {/* X-axis labels */}
        {showLabels && data.length > 0 && (
          <>
            <text
              x={padding.left}
              y={height - 2}
              fill="rgba(255,255,255,0.3)"
              fontSize={7}
              fontFamily="Roboto"
            >
              {data[0][xKey] || ''}
            </text>
            <text
              x={width - padding.right}
              y={height - 2}
              fill="rgba(255,255,255,0.3)"
              fontSize={7}
              fontFamily="Roboto"
              textAnchor="end"
            >
              {data[data.length - 1][xKey] || ''}
            </text>
          </>
        )}

        {/* Legend for multi-series */}
        {series.length > 1 &&
          series.map((s, i) => (
            <g key={`legend-${i}`}>
              <rect
                x={padding.left + i * 70}
                y={2}
                width={8}
                height={8}
                rx={1}
                fill={s.color || colors.ROYAL_GOLD}
                fillOpacity={0.8}
              />
              <text
                x={padding.left + i * 70 + 12}
                y={10}
                fill="rgba(255,255,255,0.5)"
                fontSize={7}
                fontFamily="Roboto"
              >
                {s.label || s.dataKey}
              </text>
            </g>
          ))}
      </svg>
    </Box>
  );
}

export default memo(LineChartComponent);
