import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../../../contexts/ThemeContext';
import { TrendingUp, X } from 'lucide-react';
import RevenueLineChart from './RevenueLineChart';

interface RevenuePoint {
  date: string;
  value: number;
}

interface Props {
  analytics: { totalRevenue: number };
  series?: RevenuePoint[] | null;
  timeRange?: '7days' | '30days' | '90days';
  onTimeRangeChange?: (r: '7days' | '30days' | '90days') => void;
}

const RevenueOverview: React.FC<Props> = ({ analytics, series, timeRange = '30days', onTimeRangeChange = () => {} }) => {
  const [open, setOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const revenue = Number(analytics.totalRevenue) || 0;
  
  // Check if we have valid series data
  const hasValidSeries = series !== null && series !== undefined && series.length > 0 && series.some(s => s.value > 0);
  
  // Accurate monthly totals from Stripe daily series when available
  const { thisMonthTotal, lastMonthTotal, growthPct } = useMemo(() => {
    const now = new Date();
    const thisYear = now.getUTCFullYear();
    const thisMon = now.getUTCMonth();
    const prev = new Date(Date.UTC(thisYear, thisMon - 1, 1));
    const prevYear = prev.getUTCFullYear();
    const prevMon = prev.getUTCMonth();
    let thisSum = 0;
    let lastSum = 0;
    
    // If series is available and has data, use it
    if (hasValidSeries && series && series.length > 0) {
      for (const p of series) {
        const d = new Date(p.date + 'T00:00:00Z');
        const y = d.getUTCFullYear();
        const m = d.getUTCMonth();
        if (y === thisYear && m === thisMon) thisSum += p.value || 0;
        else if (y === prevYear && m === prevMon) lastSum += p.value || 0;
      }
      // If series exists but sums are 0, fall back to database revenue
      if (thisSum === 0 && revenue > 0) {
        thisSum = revenue;
      }
    } else {
      // No Stripe Connect or empty series - use database revenue
      thisSum = revenue;
      lastSum = 0;
    }
    
    thisSum = Math.round(thisSum * 100) / 100;
    lastSum = Math.round(lastSum * 100) / 100;
    const g = lastSum === 0 ? (thisSum > 0 ? 100 : 0) : Math.round(((thisSum - lastSum) / lastSum) * 1000) / 10;
    return { thisMonthTotal: thisSum, lastMonthTotal: lastSum, growthPct: g };
  }, [series, revenue, hasValidSeries]);
  // Build a fallback timeseries when no data is available
  // Creates a smooth curve from last month to current revenue
  const fallbackSeries: RevenuePoint[] = useMemo(() => {
    // Only use fallback if we have no valid series data
    if (hasValidSeries) {
      return [];
    }
    
    // If no revenue data at all, return empty series
    if (revenue === 0 && lastMonthTotal === 0) {
      return [];
    }
    
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = daysMap[timeRange];
    const today = new Date();
    const start = Math.max(0, lastMonthTotal);
    const end = Math.max(0, revenue || thisMonthTotal);
    
    const points: RevenuePoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      // Create a smooth curve with more weight towards the end
      const t = (days - 1 - i) / Math.max(1, days - 1);
      // Use easing function for smoother curve
      const easedT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const v = Math.max(0, Math.round((start + (end - start) * easedT) * 100) / 100);
      
      // Format date as YYYY-MM-DD
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      points.push({ date: `${year}-${month}-${day}`, value: v });
    }
    
    return points;
  }, [lastMonthTotal, revenue, thisMonthTotal, timeRange, hasValidSeries]);

  const cardBase = isDarkMode
    ? 'rounded-lg border border-gray-700 bg-gray-800/80 shadow-sm backdrop-blur'
    : 'rounded-lg border border-gray-200 bg-white shadow-sm';
  const heading = isDarkMode ? 'text-gray-100' : 'text-slate-800';
  const subheading = isDarkMode ? 'text-gray-400' : 'text-slate-500';

  return (
    <div className={cardBase}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-4 sm:p-6 pb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-xl ${heading} font-semibold`}>Revenue Overview</h3>
          <p className={`text-sm ${subheading} mt-1`}>Interactive chart with your revenue trends</p>
        </div>
        <button 
          onClick={() => setOpen(true)} 
          className="text-indigo-600 p-2 hover:underline text-sm font-medium self-start sm:self-auto"
        >
          View Details
        </button>
      </div>
      <div className="p-4 sm:p-6 pt-0">
        <div className="h-56 sm:h-64">
          <div className={`w-full h-full rounded-lg p-4 ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
            <RevenueLineChart 
              data={hasValidSeries && series ? series : (fallbackSeries.length > 0 ? fallbackSeries : [])} 
              timeRange={timeRange} 
              onTimeRangeChange={onTimeRangeChange} 
              height={timeRange === '7days' ? 200 : timeRange === '30days' ? 220 : 240} 
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 text-center">
          <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-25'}`}>
            <p className={`text-xs sm:text-sm ${subheading}`}>This Month</p>
            <p className={`text-lg sm:text-xl font-semibold ${heading}`}>${thisMonthTotal}</p>
          </div>
          <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-25'}`}>
            <p className={`text-xs sm:text-sm ${subheading}`}>Last Month</p>
            <p className={`text-lg sm:text-xl font-semibold ${heading}`}>${lastMonthTotal}</p>
          </div>
          <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-25'}`}>
            <p className={`text-xs sm:text-sm ${subheading}`}>Growth</p>
            <div className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> 
              <span className="text-sm sm:text-base">{growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`}</span>
            </div>
          </div>
        </div>
      </div>

      {open && ReactDOM.createPortal(
        (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className={`${isDarkMode ? 'bg-gray-800 text-gray-100 border border-gray-700 ring-1 ring-white/10' : 'bg-white'} relative rounded-xl shadow-2xl w-full max-w-3xl mx-4 animate-in fade-in zoom-in duration-150`}>
              <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div>
                  <h4 className={`${heading} font-semibold`}>Revenue Details</h4>
                </div>
                <button onClick={() => setOpen(false)} className={`p-1 rounded transition ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-100'}`} aria-label="Close">
                  <X className={`h-5 w-5 ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`} />
                </button>
              </div>
              <div className="p-6">
                <div className="h-[500px] mb-6">
                  <div className={`w-full h-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-700/40' : 'bg-gray-50'}`}>
                    <RevenueLineChart 
                      data={hasValidSeries && series ? series : (fallbackSeries.length > 0 ? fallbackSeries : [])} 
                      timeRange={timeRange} 
                      onTimeRangeChange={onTimeRangeChange} 
                      height={450} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center justify-center bg-gray-50 ">
                    <p className={`text-sm ${subheading}`}>This Month</p>
                    <p className={`text-2xl font-semibold ${heading}`}>${thisMonthTotal}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-gray-50 ">
                    <p className={`text-sm ${subheading}`}>Last Month</p>
                    <p className={`text-2xl font-semibold ${heading}`}>${lastMonthTotal}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-gray-50 ">
                    <p className={`text-sm ${subheading}`}>Growth</p>
                    <div className={`inline-flex items-center gap-1 ${growthPct >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-medium`}>
                      <TrendingUp className="h-4 w-4" /> {growthPct >= 0 ? `+${growthPct}%` : `${growthPct}%`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
        document.body
      )}
    </div>
  );
};

export default RevenueOverview;


