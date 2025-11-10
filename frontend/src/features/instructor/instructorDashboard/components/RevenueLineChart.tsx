import React, { useEffect, useRef, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { useTheme } from '../../../../contexts/ThemeContext';

export type RevenuePoint = { date: string; value: number };

type TimeRange = '7days' | '30days' | '90days';

interface Props {
  data: RevenuePoint[];
  timeRange: TimeRange;
  onTimeRangeChange?: (r: TimeRange) => void;
  height?: number;
}

const RevenueLineChart: React.FC<Props> = ({ data, timeRange, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const { isDarkMode } = useTheme();

  // Format labels based on time range
  const labels = useMemo(() => {
    return data.map(d => {
      const date = new Date(d.date + 'T00:00:00Z');
      if (timeRange === '7days') {
        return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      } else if (timeRange === '30days') {
        return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      } else {
        return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
      }
    });
  }, [data, timeRange]);

  const values = useMemo(() => data.map(d => d.value), [data]);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (data.length === 0) return; // Don't render if no data
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clean up previous chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Get the actual canvas height
    const canvasHeight = canvasRef.current.parentElement?.clientHeight || height;
    
    // Calculate max value with proper padding
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;
    const yAxisMin = minValue < 0 ? Math.floor(minValue * 1.2) : 0;
    
    // Create gradient for area fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    const primaryColor = isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.25)';
    const transparentColor = isDarkMode ? 'rgba(99, 102, 241, 0)' : 'rgba(99, 102, 241, 0)';
    gradient.addColorStop(0, primaryColor);
    gradient.addColorStop(1, transparentColor);

    const borderColor = isDarkMode ? '#818cf8' : '#6366f1';
    const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
    const textColor = isDarkMode ? '#9ca3af' : '#6b7280';

    const instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: values,
            fill: true,
            borderColor: borderColor,
            backgroundColor: gradient,
            pointRadius: values.length > 30 ? 2 : 4,
            pointHoverRadius: values.length > 30 ? 3 : 6,
            pointBackgroundColor: borderColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: borderColor,
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            borderWidth: 2,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: isDarkMode ? '#1f2937' : '#111827',
            borderColor: isDarkMode ? '#374151' : '#4b5563',
            borderWidth: 1,
            padding: 12,
            titleColor: isDarkMode ? '#d1d5db' : '#e5e7eb',
            bodyColor: isDarkMode ? '#f3f4f6' : '#ffffff',
            displayColors: false,
            callbacks: {
              title: (items) => {
                const index = items[0].dataIndex;
                return data[index]?.date ? new Date(data[index].date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
              },
              label: (ctx) => {
                const v = (ctx.parsed as any).y;
                return `Revenue: $${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: gridColor,
            },
            border: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 11,
              },
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: timeRange === '7days' ? 7 : timeRange === '30days' ? 8 : 10,
            },
          },
          y: {
            beginAtZero: true,
            min: yAxisMin,
            max: yAxisMax,
            grid: {
              display: true,
              color: gridColor,
            },
            border: {
              display: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 11,
              },
              stepSize: yAxisMax > 1000 ? 500 : yAxisMax > 100 ? 50 : 10,
              callback: (value) => {
                const num = typeof value === 'number' ? value : parseFloat(value);
                if (num >= 1000) {
                  return `$${(num / 1000).toFixed(1)}k`;
                }
                return `$${Math.round(num)}`;
              },
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
  }, [labels, values, isDarkMode, height, timeRange, data]);

  if (data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default RevenueLineChart;

