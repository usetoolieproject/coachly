import React, { useMemo, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Edit, Trash2, Tag } from 'lucide-react';
import { usePromoCodes } from '../../hooks/usePromoCodes';
import { useSubscriptionPlans } from '../../subscription-plans';
import type { PromoCode } from '../../types';
import { GeneratePromoCodeModal } from './GeneratePromoCodeModal';
import { EditPromoCodeModal } from './EditPromoCodeModal';
import { RefreshButton } from '../../../../components/shared/ui/RefreshButton';
import Pagination from '../../../../components/shared/ui/Pagination';
import { RowsPerPageSelect } from '../../../../components/shared/ui/RowsPerPageSelect';
import { UpdatingIndicator } from '../../../../components/shared/ui/UpdatingIndicator';
import { ExportPdfButton } from '../../../../components/shared/ui/ExportPdfButton';

const typeBadge = (pc: PromoCode) => {
  if (pc.type === 'discount') return `${pc.discount_percent}% off`;
  return `${pc.free_months} mo free`;
};

export const PromoCodesList: React.FC = () => {
  const { codes, loading, generate, toggle, update, remove, refetch } = usePromoCodes();
  const { plans } = useSubscriptionPlans();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const planNameById = useMemo(() => {
    const map = new Map<string, string>();
    plans.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [plans]);

  const totalPages = Math.max(1, Math.ceil((codes?.length || 0) / rowsPerPage));
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = pageStart + rowsPerPage;
  const paginated = (codes || []).slice(pageStart, pageEnd);

  const onExport = () => {
    // Simple print fallback for now; replace with real PDF export later
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">Promo Codes</h2>
                <p className="text-sm text-slate-500">Generate and manage codes for discounts or free access</p>
              </div>
            </div>

            {/* Top-right controls */}
            <div className="flex items-center gap-3">
            <UpdatingIndicator isUpdating={loading} />
            <RefreshButton onClick={() => { refetch(); }} isRefreshing={loading} />
              <ExportPdfButton onExport={onExport} small />
              <RowsPerPageSelect value={rowsPerPage} onChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }} />
            </div>
          </div>
          {/* New Code button under controls, right-aligned */}
          <div className="mt-3 flex justify-end">
            <button onClick={() => setShowModal(true)} className="rounded-2xl bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 text-sm font-medium shadow">
              <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4" /> New Code</span>
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col min-h-[78vh]">
          <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Usage</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expires</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading && (
                <>
                  {Array.from({ length: rowsPerPage }).map((_, idx) => (
                    <tr key={`sk-${idx}`}>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-6 w-40 ml-auto bg-gray-200 rounded-full animate-pulse" /></td>
                    </tr>
                  ))}
                </>
              )}
              {!loading && paginated.length === 0 && (
              <tr><td className="px-6 py-6 text-gray-500" colSpan={6}>No promo codes yet</td></tr>
            )}
              {!loading && paginated.map((pc) => (
              <tr key={pc.id} className={pc.is_active ? '' : 'opacity-60'}>
                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm">{pc.code}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{typeBadge(pc)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">{pc.plan_id ? (planNameById.get(pc.plan_id) || '—') : 'Any plan'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">{pc.used_count}{pc.max_uses != null ? ` / ${pc.max_uses}` : ''}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">{pc.expires_at ? new Date(pc.expires_at).toLocaleDateString() : '—'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right space-x-2">
                  <button onClick={() => toggle(pc.id, !pc.is_active)} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${pc.is_active ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {pc.is_active ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />} {pc.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => setEditing(pc)} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                    <Edit className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => remove(pc.id)} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          </div>
          <Pagination
            className="mt-auto pt-3"
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
            onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          />
        </div>
      </div>

      {showModal && (
        <GeneratePromoCodeModal
          onClose={() => setShowModal(false)}
          plans={plans.map((p) => ({ id: p.id, name: p.name, billingInterval: p.billingInterval, billingIntervalCount: p.billingIntervalCount }))}
          onSubmit={async (payload) => { await generate(payload); }}
        />
      )}

      {editing && (
        <EditPromoCodeModal
          promo={editing}
          plans={plans.map((p) => ({ id: p.id, name: p.name, billingInterval: p.billingInterval, billingIntervalCount: p.billingIntervalCount }))}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => { await update(editing.id, payload); setEditing(null); }}
        />
      )}
    </div>
  );
};


