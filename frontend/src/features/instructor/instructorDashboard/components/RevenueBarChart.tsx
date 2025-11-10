import React, { useEffect, useMemo, useRef, useState } from 'react';
export type RevenuePoint = { date: string; value: number };

type TimeRange = '7days' | '30days' | '90days';

interface Props {
  data: RevenuePoint[];
  timeRange: TimeRange;
  onTimeRangeChange: (r: TimeRange) => void;
  height?: number;
  showControls?: boolean;
}

const pad = 32;

const RevenueBarChart: React.FC<Props> = ({ data, timeRange, onTimeRangeChange, height = 200, showControls = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const measure = () => {
      const el = containerRef.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      setWidth(Math.max(360, Math.floor(rect.width)));
    };
    measure();
    const ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(measure) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('resize', measure); if (ro && containerRef.current) ro.unobserve(containerRef.current); };
  }, []);

  const innerWidth = Math.max(0, width - pad * 2);
  const innerHeight = height - pad * 2;

  const parsed = useMemo(() => data.map(d => {
    const [yy, mm, dd] = d.date.split('-').map(n => parseInt(n, 10));
    const xUtc = Date.UTC(yy, (mm || 1) - 1, dd || 1);
    return { x: xUtc, y: d.value, label: `${mm}/${dd}` };
  }), [data]);

  if (parsed.length === 0 || width <= 0) return <div ref={containerRef} style={{ height }} />;

  const minX = Math.min(...parsed.map(p => p.x));
  const maxX = Math.max(...parsed.map(p => p.x));
  const maxY = Math.max(1, Math.max(...parsed.map(p => p.y)));

  const xScale = (x: number) => pad + (innerWidth * (x - minX)) / Math.max(1, maxX - minX);
  const yScale = (y: number) => pad + innerHeight - (innerHeight * y) / maxY;

  // Bar sizing
  const barW = Math.max(4, Math.floor(innerWidth / (parsed.length * 1.6)));

  // Build 8 evenly spaced UTC ticks (always include first and last)
  const desiredTicks = 8;
  const tickStep = (maxX - minX) / Math.max(1, desiredTicks - 1);
  const ticks = Array.from({ length: desiredTicks }, (_, i) => {
    const txMs = minX + i * tickStep;
    const d = new Date(txMs);
    const label = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
    return { x: xScale(txMs), label };
  });

  return (
    <div>
      {showControls && (
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm text-slate-600">Time range:</div>
          {(['7days','30days','90days'] as TimeRange[]).map(r => (
            <button key={r} onClick={() => onTimeRangeChange(r)} className={`px-2.5 py-1 rounded text-sm border ${timeRange === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>{r.replace('days',' days')}</button>
          ))}
        </div>
      )}
      <div ref={containerRef} className="w-full">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Revenue bar chart" style={{ display: 'block', width: '100%' }}>
          <line x1={pad} y1={pad + innerHeight} x2={pad + innerWidth} y2={pad + innerHeight} stroke="#cbd5e1" />
          <line x1={pad} y1={pad} x2={pad} y2={pad + innerHeight} stroke="#cbd5e1" />
          {new Array(4).fill(0).map((_, i) => (
            <line key={`g-${i}`} x1={pad} x2={pad + innerWidth} y1={pad + (innerHeight * i) / 4} y2={pad + (innerHeight * i) / 4} stroke="#e2e8f0" />
          ))}

          {/* Bars */}
          {parsed.map((p, i) => {
            const xCenter = xScale(p.x);
            const x = Math.max(pad, Math.min(xCenter - barW / 2, pad + innerWidth - barW));
            const y = yScale(p.y);
            const h = pad + innerHeight - y;
            return <rect key={`b-${i}`} x={x} y={y} width={barW} height={Math.max(1, h)} fill="#6366f1" opacity={p.y === 0 ? 0.35 : 0.9} rx={2} />;
          })}

          {/* X ticks */}
          {ticks.map((t, i) => {
            const isFirst = i === 0; const isLast = i === ticks.length - 1;
            const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
            const tx = isFirst ? t.x + 4 : isLast ? t.x - 4 : t.x;
            return (
              <g key={`t-${i}`}>
                <line x1={t.x} y1={pad + innerHeight} x2={t.x} y2={pad + innerHeight + 4} stroke="#cbd5e1" />
                <text x={tx} y={pad + innerHeight + 18} textAnchor={anchor as any} fontSize="12" fill="#475569">{t.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default RevenueBarChart;






