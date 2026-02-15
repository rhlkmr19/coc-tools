// ============================================
// Clash Intelligence Pro – Animated Counter
// ============================================
// Number counter with smooth animation from
// 0 to target value using requestAnimationFrame:
//   - Configurable duration and easing
//   - Supports decimal precision
//   - Optional prefix/suffix (e.g. "$", "%")
//   - Optional locale number formatting
//   - Orbitron font by default
// ============================================

import { useState, useEffect, useRef, memo } from 'react';
import { Typography } from '@mui/material';

/**
 * @param {object} props
 * @param {number} props.value        – Target number to count to
 * @param {number} [props.duration=1000] – Animation duration in ms
 * @param {number} [props.decimals=0]  – Decimal places
 * @param {string} [props.prefix='']   – Text before number
 * @param {string} [props.suffix='']   – Text after number
 * @param {boolean} [props.useLocale=false] – Enable locale formatting (1,234)
 * @param {string} [props.fontFamily='Orbitron'] – Font family
 * @param {string} [props.fontSize='1.2rem'] – Font size
 * @param {string} [props.color]       – Text color
 * @param {number} [props.fontWeight=700] – Font weight
 * @param {object} [props.sx]          – Extra sx overrides
 */
function AnimatedCounter({
  value = 0,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  useLocale = false,
  fontFamily = 'Orbitron',
  fontSize = '1.2rem',
  color,
  fontWeight = 700,
  sx = {},
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = typeof value === 'number' ? value : 0;
    const startTime = performance.now();
    const diff = endValue - startValue;

    // Easing: ease-out cubic
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startValue + diff * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, duration]);

  // Format the display value
  const formatValue = (num) => {
    const fixed = num.toFixed(decimals);
    if (useLocale) {
      return Number(fixed).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return fixed;
  };

  return (
    <Typography
      className="anim-count-up"
      sx={{
        fontFamily,
        fontWeight,
        fontSize,
        color: color || 'text.primary',
        lineHeight: 1.1,
        ...sx,
      }}
    >
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </Typography>
  );
}

export default memo(AnimatedCounter);
