// ============================================
// Clash Intelligence Pro – Heatmap Chart
// ============================================
// Reusable SVG heatmap grid with:
//   - Day × Hour activity grid (7×24)
//   - Configurable color ramp (gold default)
//   - Row & column labels
//   - Cell intensity based on 0-100 value
//   - Rounded cell corners
//   - Pop-in animation per cell
//   - Legend bar with intensity labels
//   - Custom row/column labels support
// ============================================

import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/theme';

/**
 * @typedef  HeatmapCell
 * @property {number} row        – Row index (0-based)
 * @property {number} col        – Column index (0-based)
 * @property {number} intensity  – Value 0-100
 * @property {string} [label]    – Optional tooltip text
 */

/**
 * @param {object}   props
 * @param {HeatmapCell[]} props.data       – Cell data array
 * @param {number}   [props.rows=7]         – Number of rows
 * @param {number}   [props.cols=24]        – Number of columns
 * @param {string[]} [props.rowLabels]      – Custom row labels (default: Mon-Sun)
 * @param {number[]} [props.colLabels]      – Which col indices to label
 * @param {string}   [props.colLabelSuffix='h'] – Suffix for column labels
 * @param {number}   [props.width=310]      – SVG width
 * @param {number}   [props.height=170]     – SVG height
 * @param {function} [props.colorFn]        – Custom (intensity:number) => string
 * @param {string}   [props.baseColor]      – Base heatmap color (default: ROYAL_GOLD)
 * @param {number}   [props.cellRadius=2]   – Cell border radius
 * @param {number}   [props.cellGap=1]      – Gap between cells in px
 * @param {boolean}  [props.showLegend=true] – Show intensity legend below
 * @param {boolean}  [props.animated=true]   – Animate cells in
 * @param {string}   [props.className]       – CSS class
 *
 * Note: for Day×Hour grids pass data with { dayIndex, hour, intensity }
 *       which maps to { row: dayIndex, col: hour, intensity }
 */
function HeatmapComponent({
  data,
  rows = 7,
  cols = 24,
  rowLabels: customRowLabels,
  colLabels: customColLabels,
  colLabelSuffix = 'h',
  width = 310,
  height = 170,
  colorFn,
  baseColor,
  cellRadius = 2,
  cellGap = 1,
  showLegend = true,
  animated = true,
  className = '',
}) {
  if (!data || data.length === 0) return null;

  const rowLabels = customRowLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const colLabelIndices = customColLabels || [0, 6, 12, 18];

  const labelW = 28;
  const labelH = 14;
  const legendH = showLegend ? 20 : 0;
  const gridW = width - labelW;
  const gridH = height - labelH - legendH;
  const cellW = gridW / cols - cellGap;
  const cellH = gridH / rows - cellGap;

  const heatColor = baseColor || colors.ROYAL_GOLD;

  // Default color function: gold with variable opacity
  const getColor = colorFn || ((intensity) => {
    const norm = Math.max(0, Math.min(100, intensity)) / 100;
    // Low → dark, High → bright gold
    const r = 212;
    const g = 175;
    const b = 55;
    const alpha = norm * 0.8 + 0.03;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  });

  // Normalize data: support both { row, col } and { dayIndex, hour } formats
  const normalizedData = data.map((d) => ({
    row: d.row ?? d.dayIndex ?? 0,
    col: d.col ?? d.hour ?? 0,
    intensity: d.intensity ?? 0,
    label: d.label || '',
  }));

  return (
    <Box className={className} sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={width} height={height - legendH} viewBox={`0 0 ${width} ${height - legendH}`}>
        {/* Row labels */}
        {rowLabels.slice(0, rows).map((label, i) => (
          <text
            key={`row-${i}`}
            x={0}
            y={labelH + i * (cellH + cellGap) + cellH / 2 + 3}
            fill="rgba(255,255,255,0.4)"
            fontSize={7}
            fontFamily="Roboto"
          >
            {label}
          </text>
        ))}

        {/* Column labels */}
        {colLabelIndices.map((h) => (
          <text
            key={`col-${h}`}
            x={labelW + h * (cellW + cellGap) + cellW / 2}
            y={10}
            fill="rgba(255,255,255,0.3)"
            fontSize={7}
            fontFamily="Roboto"
            textAnchor="middle"
          >
            {h}{colLabelSuffix}
          </text>
        ))}

        {/* Cells */}
        {normalizedData.map((cell, idx) => {
          const x = labelW + cell.col * (cellW + cellGap);
          const y = labelH + cell.row * (cellH + cellGap);

          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={cellW}
              height={cellH}
              rx={cellRadius}
              fill={getColor(cell.intensity)}
              className={animated ? 'anim-heat-pop' : ''}
              style={animated ? { animationDelay: `${idx * 3}ms` } : undefined}
            >
              {cell.label && <title>{cell.label}</title>}
            </rect>
          );
        })}
      </svg>

      {/* Legend */}
      {showLegend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Low</Typography>
          {[0, 20, 40, 60, 80, 100].map((v) => (
            <Box
              key={v}
              sx={{
                width: 14,
                height: 10,
                borderRadius: '2px',
                bgcolor: getColor(v),
              }}
            />
          ))}
          <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>High</Typography>
        </Box>
      )}
    </Box>
  );
}

export default memo(HeatmapComponent);
