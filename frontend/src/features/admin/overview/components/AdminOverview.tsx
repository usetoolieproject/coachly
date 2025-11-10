import React, { useMemo, useState } from "react";
import { Mail, MoreHorizontal, ShieldCheck, UserX } from "lucide-react";
import { UpdatingIndicator, RefreshButton, ExportButton, MessageButton } from '../../../../components/shared';
import { AdminKpiCards } from './AdminKpiCards';
import { useAdminOverview } from '../hooks/useAdminOverview';
import { AdminOverviewChartCard } from './AdminOverviewChartCard';
import { EducatorDirectory } from './EducatorDirectory';
import { EducatorFilters } from './EducatorFilters';

// ---------------------------------------------
// SAMPLE DATA (mocked) — replace with API calls
// ---------------------------------------------
const EDUCATORS = [
  {
    id: "ed1",
    name: "Alex Morgan",
    email: "alex@strengthlab.io",
    country: "US",
    avatar: "https://i.pravatar.cc/100?img=1",
    signupDate: "2025-09-18",
    status: "active", // active | pending | suspended
    verifiedEmail: true,
    verifiedProfile: true,
    courses: 5,
    published: 4,
    students: 1240,
    avgRating: 4.7,
    lastLogin: "2025-10-09",
    // Coachly membership (we treat educators as OUR customers)
    membership: {
      tier: "Pro", // Free | Starter | Pro | Enterprise
      status: "active", // trialing | active | past_due | paused | canceled
      renewalDate: "2025-11-18",
      cycle: "monthly",
      trialEndsAt: null,
      invoices: 7,
      paymentProvider: "stripe",
      paymentLast4: "4242",
      supportTier: "priority",
      payments: [
        { id: "in_1", date: "2025-09-18", amount: 49, currency: "USD", status: "paid", methodLast4: "4242" },
        { id: "in_2", date: "2025-08-18", amount: 49, currency: "USD", status: "paid", methodLast4: "4242" }
      ],
    },
  },
  {
    id: "ed2",
    name: "Priya Nair",
    email: "priya@flexfit.ac",
    country: "IN",
    avatar: "https://i.pravatar.cc/100?img=2",
    signupDate: "2025-10-02",
    status: "pending",
    verifiedEmail: true,
    verifiedProfile: false,
    courses: 1,
    published: 0,
    students: 0,
    avgRating: 0,
    lastLogin: "2025-10-10",
    membership: {
      tier: "Starter",
      status: "trialing",
      renewalDate: "2025-11-02",
      cycle: "monthly",
      trialEndsAt: "2025-10-16",
      invoices: 0,
      paymentProvider: "stripe",
      paymentLast4: null,
      supportTier: "standard",
      payments: [
        { id: "in_3", date: "2025-10-02", amount: 19, currency: "USD", status: "paid", methodLast4: null }
      ],
    },
  },
  {
    id: "ed3",
    name: "Diego Ramos",
    email: "diego@coremotion.mx",
    country: "MX",
    avatar: "https://i.pravatar.cc/100?img=3",
    signupDate: "2025-08-27",
    status: "active",
    verifiedEmail: true,
    verifiedProfile: true,
    courses: 3,
    published: 2,
    students: 410,
    avgRating: 4.3,
    lastLogin: "2025-10-07",
    membership: {
      tier: "Starter",
      status: "active",
      renewalDate: "2025-10-27",
      cycle: "annual",
      trialEndsAt: null,
      invoices: 1,
      paymentProvider: "stripe",
      paymentLast4: "1881",
      supportTier: "standard",
      payments: [
        { id: "in_4", date: "2025-08-27", amount: 19, currency: "USD", status: "paid", methodLast4: "1881" }
      ],
    },
  },
  {
    id: "ed4",
    name: "Sara Johansson",
    email: "sara@vitality.se",
    country: "SE",
    avatar: "https://i.pravatar.cc/100?img=4",
    signupDate: "2025-10-06",
    status: "active",
    verifiedEmail: true,
    verifiedProfile: false,
    courses: 2,
    published: 1,
    students: 85,
    avgRating: 4.5,
    lastLogin: "2025-10-10",
    membership: {
      tier: "Free",
      status: "past_due",
      renewalDate: "2025-11-06",
      cycle: "monthly",
      trialEndsAt: null,
      invoices: 2,
      paymentProvider: "stripe",
      paymentLast4: "0065",
      supportTier: "standard",
      payments: [
        { id: "in_5", date: "2025-09-06", amount: 0, currency: "USD", status: "failed", methodLast4: "0065" }
      ],
    },
  },
  {
    id: "ed5",
    name: "Mohamed El Idrissi",
    email: "mohamed@trainstrong.ma",
    country: "MA",
    avatar: "https://i.pravatar.cc/100?img=5",
    signupDate: "2025-09-29",
    status: "suspended",
    verifiedEmail: true,
    verifiedProfile: false,
    courses: 4,
    published: 1,
    students: 120,
    avgRating: 3.8,
    lastLogin: "2025-10-04",
    membership: {
      tier: "Pro",
      status: "paused",
      renewalDate: "2025-10-29",
      cycle: "monthly",
      trialEndsAt: null,
      invoices: 5,
      paymentProvider: "stripe",
      paymentLast4: "3005",
      supportTier: "priority",
      payments: [
        { id: "in_6", date: "2025-09-29", amount: 49, currency: "USD", status: "paid", methodLast4: "3005" },
        { id: "in_7", date: "2025-08-29", amount: 49, currency: "USD", status: "paid", methodLast4: "3005" }
      ],
    },
  },
];


//

// ---------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------
function AdminOverview() {
  const { totals, refreshStats, loadingStats } = (useAdminOverview() as any);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("any");
  const [sort, setSort] = useState<string>("signup");
  const [selected, setSelected] = useState<string | null>(null);
  // pagination handled inside EducatorDirectory
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let rows = EDUCATORS.filter((e) =>
      [e.name, e.email].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    if (status !== "any") rows = rows.filter((e) => e.membership?.status === status);
    if (sort === "signup") rows = rows.sort((a, b) => +new Date(b.signupDate) - +new Date(a.signupDate));
    if (sort === "students") rows = rows.sort((a, b) => b.students - a.students);
    if (sort === "status") rows = rows.sort((a, b) => (a.membership?.status || '').localeCompare(b.membership?.status || ''));
    return rows;
  }, [query, status, sort]);

  const selectedEducator = EDUCATORS.find((e) => e.id === selected) || null;

  // totals provided by hook now

  const isUpdating = refreshing || loadingStats;
  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">Educators</h1>
          <p className="text-gray-600 mt-1">Treat educators as Coachly customers.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-24 flex items-center justify-start">
            <UpdatingIndicator isUpdating={isUpdating} />
          </div>
          <ExportButton />
          <MessageButton />
          <RefreshButton onClick={async () => {
            if (refreshing) return;
            setRefreshing(true);
            await refreshStats();
            setRefreshing(false);
          }} />
        </div>
      </div>

      {/* Top KPI Cards */}
      <AdminKpiCards totals={totals} />

      {/* Trends & Filters Row */}
      <div className="grid lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <AdminOverviewChartCard />
            </div>
        <EducatorFilters 
          shownCount={filtered.length}
          query={query}
          onQueryChange={setQuery}
          status={status}
          onStatusChange={setStatus}
          sort={sort}
          onSortChange={setSort}
          
          onReset={() => { setQuery(""); setStatus("any"); setSort("signup"); }}
        />
      </div>

      {/* Educator Directory */}
      <EducatorDirectory query={query} status={status} sort={sort} />

      {/* Detail Sheet */}
      {selected && selectedEducator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedEducator.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-lg font-semibold leading-tight text-gray-900">{selectedEducator.name}</div>
                    <div className="text-xs text-gray-500">{selectedEducator.email}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Status" value={<StatusBadge status={selectedEducator.status} />} />
                <MiniStat label="Country" value={<span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">{selectedEducator.country}</span>} />
                <MiniStat label="Verification" value={<VerifyPills email={selectedEducator.verifiedEmail} profile={selectedEducator.verifiedProfile} />} />
                <MiniStat label="Last login" value={new Date(selectedEducator.lastLogin).toLocaleDateString()} />
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-900 mb-1">Students & Quality</h4>
                  <p className="text-xs text-gray-600 mb-2">Only aggregate counts are shown.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <MiniKpi label="Students" value={selectedEducator.students.toLocaleString()} />
                    <MiniKpi label="Avg rating" value={selectedEducator.avgRating ? selectedEducator.avgRating.toFixed(1) : "—"} />
                    <MiniKpi label="Courses" value={`${selectedEducator.published}/${selectedEducator.courses}`} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  {selectedEducator.status !== "active" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors">
                      <ShieldCheck className="h-4 w-4"/>
                      Approve
                    </button>
                  )}
                  {selectedEducator.status === "active" && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <UserX className="h-4 w-4"/>
                      Suspend
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-4 w-4"/>
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: "active" | "pending" | "suspended" | string }) {
  if (status === "active") return <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">Active</span>;
  if (status === "pending") return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
  if (status === "suspended") return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Suspended</span>;
  return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{status}</span>;
}

//

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-gray-50 p-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-0.5 text-base font-medium">{value}</div>
    </div>
  );
}

function VerifyPills({ email, profile }: { email: boolean; profile: boolean }) {
  return (
    <div className="flex gap-2">
      <span className={`px-2 py-1 text-xs rounded-full ${email ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
        ✓ Email
      </span>
      <span className={`px-2 py-1 text-xs rounded-full ${profile ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
        ✓ Profile
      </span>
    </div>
  );
}

export default AdminOverview;