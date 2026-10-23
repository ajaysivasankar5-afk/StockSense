import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string; // e.g. "Oct 12" or "Mon"
  value: number; // actual sales or demand
  forecast?: number;
  upperBand?: number;
  lowerBand?: number;
}

export interface ChartProps {
  data: ChartDataPoint[];
  height?: number;
  showForecastBands?: boolean;
  reorderPoint?: number;
  currentStock?: number;
  dailyDemand?: number;
  shelfLifeDayIndex?: number;
  unit?: string;
  className?: string;
}

export const AreaForecastChart: React.FC<ChartProps> = ({
  data,
  height = 240,
  showForecastBands = false,
  reorderPoint,
  currentStock,
  dailyDemand = 1,
  shelfLifeDayIndex,
  unit = 'units',
  className = '',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={`w-full flex items-center justify-center text-xs text-text-muted bg-surface-soft rounded-lg ${className}`}
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  // Calculate scales
  const allValues: number[] = [];
  data.forEach((d) => {
    allValues.push(d.value);
    if (d.forecast !== undefined) allValues.push(d.forecast);
    if (d.upperBand !== undefined) allValues.push(d.upperBand);
  });
  if (reorderPoint !== undefined) allValues.push(reorderPoint);
  if (currentStock !== undefined) allValues.push(currentStock);

  const maxValue = Math.max(...allValues, 10) * 1.15;
  const minValue = 0;

  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 28;

  const chartWidth = 600; // viewBox relative width
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingLeft + plotWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minValue, Math.min(maxValue, val));
    return paddingTop + plotHeight - ((clamped - minValue) / (maxValue - minValue)) * plotHeight;
  };

  // Build SVG paths
  const historicalPoints = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');

  // Gradient area path for actual / forecast
  const firstX = getX(0);
  const lastX = getX(data.length - 1);
  const baselineY = getY(0);

  const areaPath = `M ${firstX},${baselineY} L ${data
    .map((d, i) => `${getX(i)},${getY(d.forecast ?? d.value)}`)
    .join(' L ')} L ${lastX},${baselineY} Z`;

  // Upper/lower confidence band area
  let bandPath = '';
  if (showForecastBands) {
    const upperPoints = data.map((d, i) => `${getX(i)},${getY(d.upperBand ?? d.value)}`).join(' L ');
    const lowerPointsReversed = [...data]
      .reverse()
      .map((d, i) => `${getX(data.length - 1 - i)},${getY(d.lowerBand ?? d.value)}`)
      .join(' L ');
    bandPath = `M ${firstX},${getY(data[0].upperBand ?? data[0].value)} L ${upperPoints} L ${lowerPointsReversed} Z`;
  }

  // Calculate stock depletion trajectory line starting at day 0 (or midpoint) using currentStock
  let stockTrajectoryPath = '';
  if (currentStock !== undefined) {
    const startIdx = Math.floor(data.length / 2);
    const pts: string[] = [];
    let remStock = currentStock;
    const rate = Math.max(0.2, dailyDemand);

    for (let i = startIdx; i < data.length; i++) {
      const x = getX(i);
      const y = getY(Math.max(0, remStock));
      pts.push(`${x},${y}`);
      remStock = Math.max(0, remStock - rate);
    }
    if (pts.length > 0) {
      stockTrajectoryPath = pts.join(' L ');
    }
  }

  // Y-axis grid ticks (4 ticks)
  const ticks = [0, 0.33, 0.66, 1].map((pct) => ({
    val: Math.round(minValue + pct * (maxValue - minValue)),
    y: paddingTop + plotHeight - pct * plotHeight,
  }));

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div className={`relative w-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          {/* Emerald Gradient */}
          <linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
          {/* Subtle Confidence Band Fill */}
          <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {ticks.map((t, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={t.y}
              x2={chartWidth - paddingRight}
              y2={t.y}
              stroke="var(--border)"
              strokeDasharray={idx === 0 ? undefined : '3,3'}
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={t.y + 3.5}
              textAnchor="end"
              className="text-[10px] fill-text-muted font-sans tabular-nums"
            >
              {t.val}
            </text>
          </g>
        ))}

        {/* Confidence Band (if enabled) */}
        {showForecastBands && bandPath && (
          <path d={bandPath} fill="url(#bandGradient)" className="transition-opacity duration-200" />
        )}

        {/* Fill Area */}
        <path d={areaPath} fill="url(#emeraldArea)" />

        {/* Current Stock Trajectory Line (Cyan/Emerald path moving with currentStock) */}
        {currentStock !== undefined && stockTrajectoryPath && (
          <g>
            <path
              d={`M ${stockTrajectoryPath}`}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="2.5"
              strokeDasharray="5,4"
              className="transition-all duration-300"
            />
          </g>
        )}

        {/* Current Stock Reference Line */}
        {currentStock !== undefined && (
          <g className="transition-all duration-300">
            <line
              x1={paddingLeft}
              y1={getY(currentStock)}
              x2={chartWidth - paddingRight}
              y2={getY(currentStock)}
              stroke="#06B6D4"
              strokeDasharray="4,2"
              strokeWidth="1.5"
            />
            <rect
              x={chartWidth - paddingRight - 120}
              y={Math.max(paddingTop, getY(currentStock) - 10)}
              width="120"
              height="18"
              rx="4"
              fill="#0891B2"
              className="shadow-sm"
            />
            <text
              x={chartWidth - paddingRight - 60}
              y={Math.max(paddingTop + 12, getY(currentStock) + 3)}
              textAnchor="middle"
              className="text-[10px] font-bold fill-white tabular-nums"
            >
              Stock: {currentStock} {unit}
            </text>
          </g>
        )}

        {/* Reorder Point Reference Line (dashed navy) */}
        {reorderPoint !== undefined && (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(reorderPoint)}
              x2={chartWidth - paddingRight}
              y2={getY(reorderPoint)}
              stroke="#0F172A"
              strokeDasharray="4,4"
              strokeWidth="1.5"
            />
            <text
              x={paddingLeft + 6}
              y={getY(reorderPoint) - 5}
              textAnchor="start"
              className="text-[10px] font-semibold fill-navy-900 dark:fill-slate-300"
            >
              ROP: {reorderPoint}
            </text>
          </g>
        )}

        {/* Shelf-Life Expiry Marker (amber vertical line) */}
        {shelfLifeDayIndex !== undefined && shelfLifeDayIndex < data.length && (
          <g>
            <line
              x1={getX(shelfLifeDayIndex)}
              y1={paddingTop}
              x2={getX(shelfLifeDayIndex)}
              y2={height - paddingBottom}
              stroke="#F59E0B"
              strokeDasharray="3,3"
              strokeWidth="1.5"
            />
            <text
              x={getX(shelfLifeDayIndex) + 4}
              y={paddingTop + 12}
              className="text-[9px] font-semibold fill-amber-700 dark:fill-amber-400"
            >
              Expiry Limit
            </text>
          </g>
        )}

        {/* Historical / Demand Series Line */}
        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={historicalPoints}
        />

        {/* X-axis labels (sampled) */}
        {data.map((d, i) => {
          // Show ~5-7 labels evenly
          const step = Math.ceil(data.length / 6);
          if (i % step === 0 || i === data.length - 1) {
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-text-muted font-sans"
              >
                {d.label}
              </text>
            );
          }
          return null;
        })}

        {/* Interactive Hover columns */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={getX(i) - (plotWidth / data.length) / 2}
            y={paddingTop}
            width={Math.max(12, plotWidth / data.length)}
            height={plotHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        {/* Hover highlight marker */}
        {hoverIndex !== null && (
          <g>
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={height - paddingBottom}
              stroke="#64748B"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
            <circle
              cx={getX(hoverIndex)}
              cy={getY(data[hoverIndex].forecast ?? data[hoverIndex].value)}
              r="4.5"
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      {activePoint && hoverIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none bg-navy-900 text-on-navy px-3 py-1.5 rounded-lg text-xs shadow-md border border-navy-700"
          style={{
            left: `${(getX(hoverIndex) / chartWidth) * 100}%`,
            top: 0,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-semibold text-mint">{activePoint.label}</div>
          <div className="tabular-nums flex items-center gap-1.5 mt-0.5">
            <span className="text-on-navy-muted">Demand:</span>
            <span className="font-bold text-white">
              {activePoint.forecast ?? activePoint.value} {unit}
            </span>
          </div>
          {activePoint.upperBand !== undefined && (
            <div className="text-[10px] text-on-navy-muted tabular-nums">
              Band: {activePoint.lowerBand} – {activePoint.upperBand} {unit}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const StockSparklineGraph: React.FC<{
  currentStock: number;
  reorderPoint?: number;
  dailyDemand?: number;
  unit?: string;
  width?: number;
  height?: number;
}> = ({ currentStock, reorderPoint = 10, dailyDemand = 1, unit = 'pcs', width = 110, height = 28 }) => {
  const maxVal = Math.max(currentStock, reorderPoint * 1.5, 10);
  const getScaledY = (v: number) => {
    const c = Math.max(0, Math.min(maxVal, v));
    return height - 4 - (c / maxVal) * (height - 8);
  };

  const stockY = getScaledY(currentStock);
  const ropY = getScaledY(reorderPoint);

  // Trajectory points
  const p1 = `0,${stockY}`;
  const p2 = `${width * 0.4},${stockY}`;
  const endStock = Math.max(0, currentStock - dailyDemand * 5);
  const p3 = `${width},${getScaledY(endStock)}`;

  const isLow = currentStock <= reorderPoint;

  return (
    <div className="inline-flex items-center gap-2">
      <svg width={width} height={height} className="overflow-visible select-none">
        {/* ROP Line */}
        <line
          x1="0"
          y1={ropY}
          x2={width}
          y2={ropY}
          stroke="var(--border)"
          strokeDasharray="2,2"
          strokeWidth="1"
        />
        {/* Stock line */}
        <path
          d={`M ${p1} L ${p2} L ${p3}`}
          fill="none"
          stroke={isLow ? '#EF4444' : '#10B981'}
          strokeWidth="2"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        {/* Current position dot */}
        <circle
          cx={width * 0.4}
          cy={stockY}
          r="3"
          fill={isLow ? '#EF4444' : '#10B981'}
          className="transition-all duration-300 animate-pulse"
        />
      </svg>
    </div>
  );
};

