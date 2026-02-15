// ============================================
// Clash Intelligence Pro – Pie / Donut Chart
// ============================================
// Reusable SVG pie/donut chart with:
//   - Arc segments with configurable colors
//   - Donut mode with center text
//   - Animated stroke-dasharray entrance
//   - Labels on or outside segments
//   - Legend strip below chart
//   - Optional percentage display
//   - Hover highlight support
// ============================================

import { memo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/theme';

// Default color palette (8 colors)
const DEFAULT_COLORS = [
  colors.ROYAL_GOLD,
  '#64b5f6',
  '#81c784',
  '#ff8a65',
  '#ce93d8',
  '#4dd0e1',
  '#ffb74d',
  '#ef5350',
];

/**
 * @typedef  PieSlice
 * @property {string} label  – Segment label
 * @property {number} value  – Numeric value
 * @property {string} [color] – Override color
 */

/**
 * @param {object}   props
 * @param {PieSlice[]} props.data          – Slice data
 * @param {number}   [props.size=180]       – SVG width & height
 * @param {boolean}  [props.donut=true]     – Donut (ring) mode
 * @param {number}   [props.strokeWidth=28] – Ring thickness in donut mode
 * @param {string}   [props.centerText]     – Text in donut center
 * @param {string}   [props.centerSubtext]  – Smaller text below center
 * @param {boolean}  [props.showLegend=true] – Show legend below
 * @param {boolean}  [props.showPercent=true] – Show % in legend
 * @param {boolean}  [props.showLabels=false] – Show labels on arcs
 * @param {number}   [props.gap=2]          – Gap between segments (degrees)
 * @param {string[]} [props.colors]         – Custom color palette
 * @param {string}   [props.className]      – CSS class
 */
function PieChartComponent({
  data,
  size = 180,
  donut = true,
  strokeWidth = 28,
  centerText,
  centerSubtext,
  showLegend = true,
  showPercent = true,
  showLabels = false,
  gap = 2,
  colors: customColors,
  className = '',
}) {
  const [hoverIndex, setHoverIndex] = useState(-1);

  if (!data || data.length === 0) return null;

  const palette = customColors || DEFAULT_COLORS;
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;

  const cx = size / 2;
  const cy = size / 2;
  const radius = donut ? (size - strokeWidth) / 2 - 4 : size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const gapAngle = gap * (Math.PI / 180);
  const totalGap = gapAngle * data.length;
  const availableAngle = 2 * Math.PI - totalGap;

  // Build arc segments
  let currentAngle = -Math.PI / 2; // Start from top

  const segments = data.map((slice, i) => {
    const proportion = slice.value / total;
    const sweepAngle = proportion * availableAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweepAngle;
    currentAngle = endAngle + gapAngle;

    const color = slice.color || palette[i % palette.length];
    const isHovered = hoverIndex === i;

    if (donut) {
      // Donut: use stroke-dasharray on circle
      const dashLength = (proportion * (circumference - data.length * gap)) ;
      return { startAngle, endAngle, proportion, color, dashLength, isHovered, label: slice.label, value: slice.value };
    }

    // Pie: SVG arc path
    const r = isHovered ? radius + 4 : radius;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sweepAngle > Math.PI ? 1 : 0;

    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const labelAngle = (startAngle + endAngle) / 2;
    const labelR = r * 0.65;

    return { path, color, isHovered, proportion, labelAngle, labelR, label: slice.label, value: slice.value };
  });

  // ─── Donut Rendering ───────────────────────────────
  if (donut) {
    let offset = 0;

    return (
      <Box className={className} sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((seg, i) => {
            const segCircumference = circumference;
            const proportion = seg.proportion;
            const dashLen = proportion * segCircumference;
            const gapLen = segCircumference - dashLen;
            const currentOffset = offset;
            offset += dashLen + gap;

            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={seg.isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${dashLen} ${gapLen}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{
                  transition: 'stroke-width 0.2s ease, stroke-dasharray 1s ease',
                  cursor: 'pointer',
                  opacity: seg.isHovered ? 1 : hoverIndex >= 0 ? 0.6 : 1,
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(-1)}
              />
            );
          })}

          {/* Center text */}
          {centerText && (
            <>
              <text
                x={cx}
                y={centerSubtext ? cy - 6 : cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={size * 0.13}
                fontWeight="bold"
                fontFamily="Orbitron"
              >
                {centerText}
              </text>
              {centerSubtext && (
                <text
                  x={cx}
                  y={cy + size * 0.08}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={size * 0.065}
                  fontFamily="Roboto"
                >
                  {centerSubtext}
                </text>
              )}
            </>
          )}
        </svg>

        {/* Legend */}
        {showLegend && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1, maxWidth: size + 40 }}>
            {data.map((slice, i) => {
              const pct = Math.round((slice.value / total) * 100);
              const color = slice.color || palette[i % palette.length];
              return (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    cursor: 'pointer',
                    opacity: hoverIndex >= 0 && hoverIndex !== i ? 0.5 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(-1)}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                    {slice.label}{showPercent ? ` ${pct}%` : ''}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  }

  // ─── Pie Rendering ─────────────────────────────────
  return (
    <Box className={className} sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <g key={i}>
            <path
              d={seg.path}
              fill={seg.color}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s ease',
                opacity: seg.isHovered ? 1 : hoverIndex >= 0 ? 0.6 : 1,
              }}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(-1)}
            />
            {showLabels && seg.proportion > 0.06 && (
              <text
                x={cx + seg.labelR * Math.cos(seg.labelAngle)}
                y={cy + seg.labelR * Math.sin(seg.labelAngle)}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={8}
                fontWeight="bold"
                fontFamily="Roboto"
                style={{ pointerEvents: 'none' }}
              >
                {Math.round(seg.proportion * 100)}%
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      {showLegend && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1, maxWidth: size + 40 }}>
          {data.map((slice, i) => {
            const pct = Math.round((slice.value / total) * 100);
            const color = slice.color || palette[i % palette.length];
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  cursor: 'pointer',
                  opacity: hoverIndex >= 0 && hoverIndex !== i ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(-1)}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {slice.label}{showPercent ? ` ${pct}%` : ''}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default memo(PieChartComponent);
