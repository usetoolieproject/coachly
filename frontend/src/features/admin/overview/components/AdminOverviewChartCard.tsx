import React, { useMemo, useState, useRef, useEffect } from 'react';
import { LineChart, Maximize2 } from 'lucide-react';
import { ExportPdfButton } from '../../../../components/shared';
import { useAdminOverview } from '../hooks/useAdminOverview';
import Chart from 'chart.js/auto';

export const AdminOverviewChartCard: React.FC = () => {
  const { metric, setMetric, timeframe, setTimeframe, chart, loadingChart, refreshChart } = (useAdminOverview() as any);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const labels = useMemo(() => chart.points.map((p: any) => p.x), [chart]);
  const values = useMemo(() => chart.points.map((p: any) => p.y), [chart]);

  useEffect(() => {
    if (loadingChart) return; // wait until data is ready
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const height = (canvasRef.current.parentElement && (canvasRef.current.parentElement as HTMLElement).clientHeight) || 300;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.25)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

    const color = '#7c3aed';
    const instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: metric === 'revenue' ? 'Revenue' : metric === 'educators' ? 'Educators' : 'Students',
            data: values,
            fill: true,
            borderColor: color,
            backgroundColor: gradient,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: color,
            pointBorderWidth: 0,
            borderWidth: 2,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: '#111827',
            borderColor: '#4b5563',
            borderWidth: 1,
            padding: 10,
            titleColor: '#e5e7eb',
            bodyColor: '#ffffff',
            displayColors: false,
            callbacks: {
              label: (ctx) => {
                const v = (ctx.parsed as any).y;
                if (metric === 'revenue') return `$${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(v)}`;
                return new Intl.NumberFormat().format(v);
              },
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(229,231,235,0.6)' },
            border: { display: false },
            ticks: { color: '#6b7280', maxRotation: 0, autoSkip: true },
          },
          y: {
            grid: { color: 'rgba(229,231,235,0.6)' },
            border: { display: false },
            ticks: {
              color: '#6b7280',
              callback: (value) => (metric === 'revenue' ? `$${value}` : `${value}`),
            },
          },
        },
      },
    });

    chartInstanceRef.current = instance;
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [labels, values, metric, timeframe, showModal, loadingChart]);

  const onChangeMetric = async (m: 'revenue' | 'educators' | 'students') => {
    setMetric(m);
    await refreshChart(m, timeframe);
  };
  const onChangeTimeframe = async (t: 'days' | 'months' | 'year') => {
    setTimeframe(t);
    await refreshChart(metric, t);
  };

  const ChartBody = (
    <div className="p-3">
      {loadingChart ? (
        <div className="h-56 animate-pulse">
          <div className="h-44 bg-gradient-to-b from-gray-50 to-gray-100 rounded mb-3"></div>
          <div className="flex justify-between text-xs text-gray-400">
            {labels.slice(0, 6).map((_: string, i: number) => (
              <div key={i} className="w-10 h-3 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-56">
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
            <LineChart className="h-4 w-4 text-purple-600"/>
            Trend
          </h3>
          <p className="text-xs text-gray-600">Interactive line chart</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={metric}
            onChange={(e) => onChangeMetric(e.target.value as any)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="revenue">Revenue</option>
            <option value="educators">Educators</option>
            <option value="students">Students</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => onChangeTimeframe(e.target.value as any)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="days">Days</option>
            <option value="months">Months</option>
            <option value="year">Year</option>
          </select>
          <button onClick={() => setShowModal(true)} className="p-1 border rounded text-gray-600 hover:bg-gray-50">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {!showModal && ChartBody}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">Trend</div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={metric}
                  onChange={(e) => onChangeMetric(e.target.value as any)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="revenue">Revenue</option>
                  <option value="educators">Educators</option>
                  <option value="students">Students</option>
                </select>
                <select
                  value={timeframe}
                  onChange={(e) => onChangeTimeframe(e.target.value as any)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="year">Year</option>
                </select>
                <ExportPdfButton onExport={() => window.print()} small />
                <button onClick={() => setShowModal(false)} className="text-xs text-gray-600">Close</button>
              </div>
            </div>
            <div className="p-3">
              {loadingChart ? (
                <div className="h-[65vh] animate-pulse">
                  <div className="h-[60vh] bg-gradient-to-b from-gray-50 to-gray-100 rounded mb-3"></div>
                </div>
              ) : (
                <div className="h-[65vh]">
                  <canvas ref={canvasRef} width={1600} height={800} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
