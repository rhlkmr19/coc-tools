// ============================================
// Clash Intelligence Pro – Radar Chart
// ============================================
// Reusable SVG radar / spider chart with:
//   - N-axis polygon grid with configurable levels
//   - Data polygon with gradient fill
//   - Axis labels with smart truncation
//   - Value dots with optional tooltips
//   - Optional second dataset overlay
//   - Configurable colors & sizing
//   - Entrance animation support
// ============================================

import { memo } from 'react';
import { Box } from '@mui/material';
import { colors } from '../../theme/theme';

/**
 * @param {object}   props
 * @param {Array<{subject:string, value:number, fullMark:number}>} props.data – Primary dataset
 * @param {Array<{subject:string, value:number, fullMark:number}>} [props.data2] – Optional overlay dataset
 * @param {number}   [props.size=220]       – SVG width & height
 * @param {number}   [props.levels=5]       – Number of concentric grid rings
 * @param {string}   [props.color]          – Primary polygon stroke color
 * @param {string}   [props.fillColor]      – Primary polygon fill color
 * @param {number}   [props.fillOpacity=0.15] – Fill opacity
 * @param {string}   [props.color2]         – Second dataset color
 * @param {number}   [props.strokeWidth=2]  – Polygon stroke width
 * @param {string}   [props.gridColor='rgba(212,175,55,0.12)'] – Grid ring color
 * @param {string}   [props.axisColor='rgba(212,175,55,0.2)']  – Axis line color
 * @param {string}   [props.labelColor='rgba(255,255,255,0.6)'] – Label text color
 * @param {number}   [props.labelSize=8]    – Label font size
 * @param {number}   [props.dotRadius=3]    – Value point radius
 * @param {boolean}  [props.showDots=true]  – Show data points
 * @param {boolean}  [props.showLabels=true] – Show axis labels
 * @param {boolean}  [props.showValues=false] – Show numeric values next to dots
 * @param {number}   [props.maxLabelLength=12] – Truncate labels beyond this length
 * @param {'polygon'|'circle'} [props.gridShape='circle'] – Grid ring shape
 * @param {string}   [props.className]      – CSS class for animation
 */
function RadarChartComponent({
  data,
  data2,
  size = 220,
  levels = 5,
  color,
  fillColor,
  fillOpacity = 0.15,
  color2 = '#64b5f6',
  strokeWidth = 2,
  gridColor = 'rgba(212,175,55,0.12)',
  axisColor = 'rgba(212,175,55,0.2)',
  labelColor = 'rgba(255,255,255,0.6)',
  labelSize = 8,
  dotRadius = 3,
  showDots = true,
  showLabels = true,
  showValues = false,
  maxLabelLength = 12,
  gridShape = 'circle',
  className = '',
}) {
  if (!data || data.length < 3) return null;

  const primaryColor = color || colors.ROYAL_GOLD;
  const primaryFill = fillColor || primaryColor;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const angleSlice = (Math.PI * 2) / data.length;

  // ─── Grid ──────────────────────────────────────────
  const renderGrid = () => {
    const elements = [];

    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius / levels) * lvl;

      if (gridShape === 'polygon') {
        const pts = data
          .map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          })
          .join(' ');
        elements.push(
          <polygon
            key={`grid-${lvl}`}
            points={pts}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        );
      } else {
        elements.push(
          <circle
            key={`grid-${lvl}`}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={gridColor}
            strokeWidth={1}
          />
        );
      }
    }

    return elements;
  };

  // ─── Axes ──────────────────────────────────────────
  const renderAxes = () =>
    data.map((d, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);
      const lx = cx + (radius + 18) * Math.cos(angle);
      const ly = cy + (radius + 18) * Math.sin(angle);
      const labelText =
        d.subject.length > maxLabelLength
          ? d.subject.slice(0, maxLabelLength - 1) + '…'
          : d.subject;

      return (
        <g key={`axis-${i}`}>
          <line
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke={axisColor}
            strokeWidth={1}
          />
          {showLabels && (
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fill={labelColor}
              fontSize={labelSize}
              fontFamily="Roboto"
            >
              {labelText}
            </text>
          )}
        </g>
      );
    });

  // ─── Data Polygon ──────────────────────────────────
  const buildPolygon = (dataset, col, fill, opacity, sw) => {
    const points = dataset
      .map((d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const fm = d.fullMark || 100;
        const r = (Math.min(d.value, fm) / fm) * radius;
        return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
      })
      .join(' ');

    const dots = showDots
      ? dataset.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const fm = d.fullMark || 100;
          const r = (Math.min(d.value, fm) / fm) * radius;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);

          return (
            <g key={`dot-${i}`}>
              <circle
                cx={px}
                cy={py}
                r={dotRadius}
                fill={col}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={1}
              />
              {showValues && (
                <text
                  x={px}
                  y={py - dotRadius - 4}
                  textAnchor="middle"
                  fill={col}
                  fontSize={7}
                  fontWeight="bold"
                  fontFamily="Orbitron"
                >
                  {Math.round(d.value)}
                </text>
              )}
            </g>
          );
        })
      : null;

    return (
      <>
        <polygon
          points={points}
          fill={fill}
          fillOpacity={opacity}
          stroke={col}
          strokeWidth={sw}
        />
        {dots}
      </>
    );
  };

  return (
    <Box
      className={className}
      sx={{ display: 'inline-flex', justifyContent: 'center' }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {renderGrid()}
        {renderAxes()}

        {/* Optional second dataset (rendered first = behind) */}
        {data2 &&
          data2.length === data.length &&
          buildPolygon(data2, color2, color2, 0.08, 1.5)}

        {/* Primary dataset */}
        {buildPolygon(data, primaryColor, primaryFill, fillOpacity, strokeWidth)}
      </svg>
    </Box>
  );
}

export default memo(RadarChartComponent);
