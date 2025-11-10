// Overview Hooks
import { useState, useMemo, useEffect } from 'react';
import { Educator, OverviewStats, OverviewMetric, OverviewTimeframe, OverviewChartSeries } from '../types';
import { fetchAdminCustomerStats, overviewService } from '../services/overviewService';

export const useAdminOverview = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<string>("recent");
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Mock data - replace with actual API calls
  const educators: Educator[] = [];
  const [stats, setStats] = useState<OverviewStats>({ trials: 0, educatorsCount: 0, studentsTotal: 0, totalRevenue: 0 } as any);
  const [loadingStats, setLoadingStats] = useState(false);

  // Chart state
  const [metric, setMetric] = useState<OverviewMetric>('revenue');
  const [timeframe, setTimeframe] = useState<OverviewTimeframe>('days');
  const [chart, setChart] = useState<OverviewChartSeries>({ metric: 'revenue', points: [] });
  const [loadingChart, setLoadingChart] = useState(false);

  const refreshStats = async () => {
    setLoadingStats(true);
    try {
      const s = await fetchAdminCustomerStats();
      setStats({
        trials: s.trials,
        educatorsCount: s.totalEducators,
        studentsTotal: s.totalStudents,
        totalRevenue: s.totalRevenue,
      } as any);
    } finally {
      setLoadingStats(false);
    }
  };

  const refreshChart = async (m: OverviewMetric = metric, t: OverviewTimeframe = timeframe) => {
    setLoadingChart(true);
    try {
      const data = await overviewService.getOverviewChart(m, t);
      setChart(data);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    refreshStats();
    refreshChart('revenue', 'days');
  }, []);

  const filtered = useMemo(() => {
    let rows = educators.filter((e) =>
      [e.name, e.email, e.country, e.membership.tier, e.membership.status].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (status !== "all") rows = rows.filter((e) => e.status === status);
    if (sort === "recent") rows = rows.sort((a, b) => +new Date(b.signupDate) - +new Date(a.signupDate));
    if (sort === "students") rows = rows.sort((a, b) => b.students - a.students);
    if (sort === "rating") rows = rows.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    return rows;
  }, [query, status, sort, educators]);

  const totals: OverviewStats = stats;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selectedEducator = educators.find((e) => e.id === selected) || null;

  return {
    refreshStats,
    loadingStats,
    query,
    setQuery,
    status,
    setStatus,
    sort,
    setSort,
    selected,
    setSelected,
    page,
    setPage,
    filtered,
    totals,
    totalPages,
    pageRows,
    selectedEducator,
    pageSize,
    // chart
    metric,
    setMetric,
    timeframe,
    setTimeframe,
    chart,
    loadingChart,
    refreshChart,
  };
};
