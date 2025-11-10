import React, { useMemo, useState } from 'react';
import { Users, CreditCard, Mail } from 'lucide-react';
import { RowsPerPageSelect } from '../../../../components/shared';
import { useEducatorDirectory } from '../hooks/useEducatorDirectory';

export const EducatorDirectory: React.FC<{ query?: string; status?: string; sort?: string }> = ({ query = '', status = 'any', sort = 'signup' }) => {
  const {
    page, setPage,
    limit, setLimit,
    loading,
    items,
    totalPages,
  } = useEducatorDirectory({ query, status, sort });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  return (
    <>
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
          <Users className="h-4 w-4 text-purple-600"/>
          Educator Directory
        </h3>
        <RowsPerPageSelect value={limit} onChange={(n) => { setLimit(n); setPage(1); }} />
      </div>


      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sign up date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. of students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">No educators found</td></tr>
            ) : (
              items.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedId(e.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.firstName} {e.lastName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{typeof e.students === 'number' ? e.students.toLocaleString() : '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {e.status === 'paid' ? (
                        <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">Paid</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Trial</span>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 text-xs">
        <div className="text-gray-700">Page {page} of {totalPages}</div>
        <div className="flex gap-1">
          <button 
            disabled={page === 1} 
            onClick={() => page > 1 && setPage(page - 1)}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button 
            disabled={page === totalPages} 
            onClick={() => page < totalPages && setPage(page + 1)}
            className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    {selected && (() => {
      const s = selected as NonNullable<typeof selected>;
      return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="text-xl font-semibold text-gray-900">{s.firstName} {s.lastName}</div>
                <div className="text-xs text-gray-500 mt-2">Email</div>
                <div className="text-base text-gray-500">{s.email}</div>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600 text-base">Close</button>
            </div>
            <div className="p-7 space-y-5 text-base">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Tel</div>
                  <div className="text-gray-900 text-base mt-0.5">{s.phone || '—'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Country</div>
                  <div className="text-gray-900 text-base mt-0.5">{s.country || '—'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="mt-1">
                    {s.status === 'paid' ? (
                      <span className="px-2.5 py-1.5 text-sm bg-emerald-100 text-emerald-800 rounded-full">Paid</span>
                    ) : (
                      <span className="px-2.5 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-full">Trial</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Sign up date</div>
                  <div className="text-gray-900 text-base mt-0.5">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Last login</div>
                  <div className="text-gray-900 text-base mt-0.5">{s.lastLogin ? new Date(s.lastLogin).toLocaleString() : '—'}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">No. of students</div>
                  <div className="text-gray-900 text-base mt-0.5">{typeof s.students === 'number' ? s.students.toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>
            <div className="px-7 py-5 border-t border-gray-200 flex items-center justify-end gap-3">
              <button className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base hover:from-purple-700 hover:to-indigo-700">
                <CreditCard className="h-5 w-5"/>
                View payments
              </button>
              <button className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-base hover:bg-gray-50">
                <Mail className="h-5 w-5"/>
                Message
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    </>
  );
};
