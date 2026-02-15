// ============================================
// Clash Intelligence Pro – Progress Ring
// ============================================
// Reusable SVG circular progress indicator with:
//   - Configurable size, stroke width, color
//   - Animated stroke-dashoffset transition
//   - Center text (score / label)
//   - Optional rating badge
//   - Background track ring
// ============================================

import { memo } from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../theme/theme';

/**
 * @param {object}  props
 * @param {number}  props.value       – Progress value 0-100
 * @param {number}  [props.size=90]   – Diameter in px
 * @param {number}  [props.strokeWidth=6] – Stroke thickness
 * @param {string}  [props.color]     – Ring color (auto-calculated if omitted)
 * @param {string}  [props.trackColor] – Background track color
 * @param {string}  [props.label]     – Small text below the ring
 * @param {boolean} [props.showValue=true] – Show numeric value in center
 * @param {string}  [props.suffix='']  – Text after value, e.g. '%'
 * @param {string}  [props.centerText] – Override center text entirely
 * @param {number}  [props.fontSize]   – Center text font-size override
 */
function ProgressRing({
  value = 0,
  size = 90,
  strokeWidth = 6,
  color,
  trackColor,
  label,
  showValue = true,
  suffix = '',
  centerText,
  fontSize,
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clampedValue / 100) * circumference;

  // Auto color based on value
  const ringColor =
    color ||
    (clampedValue >= 80
      ? '#4caf50'
      : clampedValue >= 60
      ? colors.ROYAL_GOLD
      : clampedValue >= 40
      ? '#ff9800'
      : '#f44336');

  const track = trackColor || 'rgba(255,255,255,0.08)';
  const displayText = centerText ?? `${clampedValue}${suffix}`;
  const textSize = fontSize || size * 0.26;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
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
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Glow filter */}
        <defs>
          <filter id={`glow-${size}-${clampedValue}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center text */}
        {showValue && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={textSize}
            fontWeight="bold"
            fontFamily="Orbitron"
          >
            {displayText}
          </text>
        )}
      </svg>

      {/* Label below */}
      {label && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            color: 'text.secondary',
            fontSize: '0.65rem',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

export default memo(ProgressRing);
