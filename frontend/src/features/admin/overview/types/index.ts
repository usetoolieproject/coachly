// Overview Types
export interface Educator {
  id: string;
  name: string;
  email: string;
  country: string;
  avatar: string;
  signupDate: string;
  status: 'active' | 'pending' | 'suspended';
  verifiedEmail: boolean;
  verifiedProfile: boolean;
  courses: number;
  published: number;
  students: number;
  avgRating: number;
  lastLogin: string;
  membership: {
    tier: string;
    status: string;
    renewalDate: string;
    cycle: string;
    trialEndsAt: string | null;
    invoices: number;
    paymentProvider: string;
    paymentLast4: string | null;
    supportTier: string;
    payments: Array<{
      id: string;
      date: string;
      amount: number;
      currency: string;
      status: string;
      methodLast4: string | null;
    }>;
  };
}

export interface OverviewStats {
  trials: number;
  educatorsCount: number;
  studentsTotal: number;
  totalRevenue: number;
}

export type OverviewMetric = 'revenue' | 'educators' | 'students';

export type OverviewTimeframe = 'days' | 'months' | 'year';

export interface OverviewChartPoint {
  x: string; // ISO date or label
  y: number;
}

export interface OverviewChartSeries {
  metric: OverviewMetric;
  points: OverviewChartPoint[];
}
