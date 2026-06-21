import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showGrid?: boolean;
  showDots?: boolean;
  className?: string;
  formatValue?: (v: number) => string;
}

export function LineChart({
  data,
  height = 180,
  color = '#2d5a4a',
  gradientFrom = 'rgba(45, 90, 74, 0.3)',
  gradientTo = 'rgba(45, 90, 74, 0)',
  showGrid = true,
  showDots = true,
  className,
  formatValue = (v) => v.toString(),
}: LineChartProps) {
  const { pathD, areaD, points, maxValue, minValue } = useMemo(() => {
    if (data.length === 0) {
      return { pathD: '', areaD: '', points: [], maxValue: 0, minValue: 0 };
    }
    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const padding = { top: 20, right: 16, bottom: 28, left: 8 };
    const chartWidth = 100;
    const chartHeight = height - padding.top - padding.bottom;

    const pts = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * (chartWidth - padding.left - padding.right);
      const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
      return { x, y, value: d.value, label: d.label };
    });

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${path} L ${pts[pts.length - 1].x} ${height - padding.bottom} L ${pts[0].x} ${height - padding.bottom} Z`;

    return { pathD: path, areaD: area, points: pts, maxValue: max, minValue: min };
  }, [data, height]);

  const gridLines = useMemo(() => {
    if (!showGrid || data.length === 0) return [];
    const lines = 4;
    const padding = { top: 20, bottom: 28 };
    const chartHeight = height - padding.top - padding.bottom;
    return Array.from({ length: lines + 1 }, (_, i) => {
      const y = padding.top + (i / lines) * chartHeight;
      const value = maxValue - (i / lines) * (maxValue - minValue);
      return { y, value };
    });
  }, [showGrid, data.length, height, maxValue, minValue]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <p className="text-xs text-ink-300">暂无数据</p>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="w-full">
        <defs>
          <linearGradient id="lineChartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientFrom} />
            <stop offset="100%" stopColor={gradientTo} />
          </linearGradient>
        </defs>

        {showGrid && gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1="8"
              y1={line.y}
              x2="92"
              y2={line.y}
              stroke="#e8edea"
              strokeWidth="0.3"
              strokeDasharray="1,1"
            />
            <text x="4" y={line.y + 3} fontSize="3" fill="#9ca3af" textAnchor="start">
              {formatValue(Math.round(line.value))}
            </text>
          </g>
        ))}

        <motion.path
          d={areaD}
          fill="url(#lineChartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {showDots && points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill="white"
            stroke={color}
            strokeWidth="1.2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}

        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={height - 10}
            fontSize="3.5"
            fill="#6b7280"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
