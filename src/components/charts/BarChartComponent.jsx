// ============================================
// Clash Intelligence Pro – Bar Chart
// ============================================
// Reusable SVG bar chart with:
//   - Vertical grouped bars (up to 3 series)
//   - Gradient bar fills
//   - Auto-scaled Y axis
//   - Category labels (X axis)
//   - Built-in legend
//   - Optional value labels on bars
//   - Horizontal/vertical orientation
//   - Rounded bar caps
// ============================================

import { memo } from 'react';
import { Box } from '@mui/material';
import { colors } from '../../theme/theme';

// Default color palette
const PALETTE = [
  'rgba(74, 222, 128, 0.8)',   // green
  'rgba(251, 146, 60, 0.8)',   // orange
  'rgba(100, 181, 246, 0.8)',  // blue
];

/**
 * @typedef  BarSeries
 * @property {string} dataKey – Key to read values from
 * @property {string} [color] – Bar fill color
 * @property {string} [label] – Legend label
 */

/**
 * @param {object}   props
 * @param {Array<object>} props.data     – Data array
 * @param {string|BarSeries[]} props.dataKeys – Single key or array of series configs
 * @param {string}   [props.categoryKey='name'] – Key for X-axis labels
 * @param {number}   [props.width=310]     – SVG width
 * @param {number}   [props.height=180]    – SVG height
 * @param {boolean}  [props.showLegend=true]  – Show legend
 * @param {boolean}  [props.showValues=false] – Show value labels on bars
 * @param {boolean}  [props.horizontal=false] – Horizontal bars
 * @param {number}   [props.barRadius=3]      – Bar corner radius
 * @param {number}   [props.barGap=0.1]       – Gap ratio between groups (0-1)
 * @param {number}   [props.innerGap=0.05]    – Gap ratio between bars in group (0-1)
 * @param {string}   [props.className]        – CSS class
 */
function BarChartComponent({
  data,
  dataKeys,
  categoryKey = 'name',
  width = 310,
  height = 180,
  showLegend = true,
  showValues = false,
  horizontal = false,
  barRadius = 3,
  barGap = 0.15,
  innerGap = 0.08,
  className = '',
}) {
  if (!data || data.length === 0) return null;

  // Normalize series
  const series = Array.isArray(dataKeys)
    ? dataKeys.map((s, i) =>
        typeof s === 'string'
          ? { dataKey: s, color: PALETTE[i % PALETTE.length], label: s }
          : { color: PALETTE[i % PALETTE.length], label: s.dataKey, ...s }
      )
    : [{ dataKey: dataKeys, color: PALETTE[0], label: dataKeys }];

  const padding = {
    top: showLegend && series.length > 1 ? 22 : 8,
    right: 8,
    bottom: horizontal ? 8 : 28,
    left: horizontal ? 40 : 8,
  };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute max value across all series
  let maxVal = 0;
  for (const d of data) {
    for (const s of series) {
      const v = d[s.dataKey] ?? 0;
      if (v > maxVal) maxVal = v;
    }
  }
  maxVal = maxVal || 1;

  const n = data.length;
  const seriesCount = series.length;

  // ─── Vertical Bars ─────────────────────────────────
  if (!horizontal) {
    const groupW = chartW / n;
    const barSection = groupW * (1 - barGap);
    const barW = (barSection / seriesCount) * (1 - innerGap);
    const innerPad = barSection * innerGap / Math.max(seriesCount - 1, 1);

    return (
      <Box className={className} sx={{ display: 'inline-flex' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Bars */}
          {data.map((d, di) => {
            const groupX = padding.left + di * groupW + (groupW * barGap) / 2;

            return (
              <g key={di}>
                {series.map((s, si) => {
                  const val = d[s.dataKey] ?? 0;
                  const barH = (val / maxVal) * chartH;
                  const x = groupX + si * (barW + innerPad);
                  const y = padding.top + chartH - barH;

                  return (
                    <g key={s.dataKey}>
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={Math.max(barH, 0)}
                        rx={barRadius}
                        fill={s.color}
                      />
                      {showValues && val > 0 && (
                        <text
                          x={x + barW / 2}
                          y={y - 3}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.6)"
                          fontSize={7}
                          fontFamily="Orbitron"
                        >
                          {val.toLocaleString()}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Category label */}
                <text
                  x={groupX + barSection / 2}
                  y={height - padding.bottom + 14}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize={7}
                  fontFamily="Roboto"
                  transform={
                    (d[categoryKey] || '').length > 5
                      ? `rotate(-35, ${groupX + barSection / 2}, ${height - padding.bottom + 14})`
                      : undefined
                  }
                >
                  {(d[categoryKey] || '').slice(0, 8)}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          {showLegend && series.length > 1 &&
            series.map((s, i) => (
              <g key={`legend-${i}`}>
                <rect
                  x={width - padding.right - (series.length - i) * 72}
                  y={3}
                  width={8}
                  height={8}
                  rx={1}
                  fill={s.color}
                />
                <text
                  x={width - padding.right - (series.length - i) * 72 + 12}
                  y={11}
                  fill="rgba(255,255,255,0.5)"
                  fontSize={7}
                  fontFamily="Roboto"
                >
                  {s.label}
                </text>
              </g>
            ))}
        </svg>
      </Box>
    );
  }

  // ─── Horizontal Bars ───────────────────────────────
  const groupH = chartH / n;
  const barSection = groupH * (1 - barGap);
  const barH = (barSection / seriesCount) * (1 - innerGap);
  const innerPad = barSection * innerGap / Math.max(seriesCount - 1, 1);

  return (
    <Box className={className} sx={{ display: 'inline-flex' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((d, di) => {
          const groupY = padding.top + di * groupH + (groupH * barGap) / 2;

          return (
            <g key={di}>
              {/* Category label */}
              <text
                x={padding.left - 4}
                y={groupY + barSection / 2 + 3}
                textAnchor="end"
                fill="rgba(255,255,255,0.4)"
                fontSize={7}
                fontFamily="Roboto"
              >
                {(d[categoryKey] || '').slice(0, 6)}
              </text>

              {series.map((s, si) => {
                const val = d[s.dataKey] ?? 0;
                const barW = (val / maxVal) * chartW;
                const y = groupY + si * (barH + innerPad);

                return (
                  <g key={s.dataKey}>
                    <rect
                      x={padding.left}
                      y={y}
                      width={Math.max(barW, 0)}
                      height={barH}
                      rx={barRadius}
                      fill={s.color}
                    />
                    {showValues && val > 0 && (
                      <text
                        x={padding.left + barW + 4}
                        y={y + barH / 2 + 3}
                        fill="rgba(255,255,255,0.5)"
                        fontSize={7}
                        fontFamily="Orbitron"
                      >
                        {val.toLocaleString()}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Legend */}
        {showLegend && series.length > 1 &&
          series.map((s, i) => (
            <g key={`legend-${i}`}>
              <rect
                x={padding.left + i * 72}
                y={2}
                width={8}
                height={8}
                rx={1}
                fill={s.color}
              />
              <text
                x={padding.left + i * 72 + 12}
                y={10}
                fill="rgba(255,255,255,0.5)"
                fontSize={7}
                fontFamily="Roboto"
              >
                {s.label}
              </text>
            </g>
          ))}
      </svg>
    </Box>
  );
}

export default memo(BarChartComponent);
