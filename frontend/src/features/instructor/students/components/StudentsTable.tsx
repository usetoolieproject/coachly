import React from 'react';
import { ArrowUpDown, Eye, Download, Trash2 } from 'lucide-react';
import { ProfilePicture } from '../../../../components/shared';
import type { Student } from '../types';
import { useTheme } from '../../../../contexts/ThemeContext';
import Pagination from '../../../../components/shared/ui/Pagination';
import { RowsPerPageSelect } from '../../../../components/shared/ui/RowsPerPageSelect';

export function StudentsTable({ rows, onSort, onView, onDelete }: { rows: Student[]; onSort: (f: keyof Student)=>void; onView: (id: string)=>void; onDelete?: (id: string)=>void; }) {
  const { isDarkMode } = useTheme();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(7);

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = rows.slice(start, start + rowsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [rows.length, rowsPerPage, totalPages, currentPage]);

  const cardClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const primaryText = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop Table View (lg and above) */}
      <div className="hidden lg:block">
        <div className={`rounded-xl shadow-sm border overflow-hidden ${cardClass}`}>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'}`}>
              <thead className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => onSort('firstName')}>
                    <div className="flex items-center gap-1">Student <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => onSort('email')}>
                    <div className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount Paid</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`} onClick={() => onSort('joinedDate')}>
                    <div className="flex items-center gap-1">Date Joined <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Method</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Progress</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-900 divide-gray-800' : 'bg-white divide-gray-200'} divide-y`}>
                {pageRows.map((student) => (
                  <tr key={student.id} className={`${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ProfilePicture src={student.profilePictureUrl} firstName={student.firstName} lastName={student.lastName} size="md" />
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${primaryText}`}>{student.firstName} {student.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${primaryText}`}>{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${primaryText}`}>${student.amountPaid.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>{student.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${primaryText}`}>{new Date(student.joinedDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${primaryText}`}>{student.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${student.progress.completionPercentage}%` }} />
                      </div>
                      <div className={`text-xs mt-1 ${secondaryText}`}>{student.progress.completionPercentage}% complete</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <button onClick={() => onView(student.id)} className={`p-1 rounded ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'}`} title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => alert('Individual download coming soon!')} className={`p-1 rounded ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`} title="Download Data">
                          <Download className="h-4 w-4" />
                        </button>
                        {onDelete && (
                          <button onClick={() => onDelete(student.id)} className={`p-1 rounded ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`} title="Delete Student">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Card View (below lg) */}
      <div className="lg:hidden space-y-4">
        {pageRows.map((student) => (
          <div key={student.id} className={`rounded-xl border p-4 sm:p-6 ${cardClass}`}>
            {/* Header Row: Profile and Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ProfilePicture src={student.profilePictureUrl} firstName={student.firstName} lastName={student.lastName} size="md" />
                <div>
                  <div className={`font-semibold text-lg ${primaryText}`}>{student.firstName} {student.lastName}</div>
                  <div className={`text-sm ${secondaryText}`}>{student.email}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onView(student.id)} className={`p-2 rounded-lg ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20' : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50'}`} title="View Details">
                  <Eye className="h-4 w-4" />
                </button>
                <button onClick={() => alert('Individual download coming soon!')} className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`} title="Download Data">
                  <Download className="h-4 w-4" />
                </button>
                {onDelete && (
                  <button onClick={() => onDelete(student.id)} className={`p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`} title="Delete Student">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className={`text-sm ${secondaryText}`}>Amount Paid</div>
                <div className={`font-semibold ${primaryText}`}>${student.amountPaid.toFixed(2)}</div>
              </div>
              <div>
                <div className={`text-sm ${secondaryText}`}>Status</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>{student.status}</span>
              </div>
            </div>

            {/* Details Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className={`text-sm ${secondaryText}`}>Date Joined</div>
                <div className={`text-sm ${primaryText}`}>{new Date(student.joinedDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className={`text-sm ${secondaryText}`}>Payment Method</div>
                <div className={`text-sm ${primaryText}`}>{student.paymentMethod}</div>
              </div>
            </div>

            {/* Progress Row */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className={`text-sm ${secondaryText} mb-2`}>Course Progress</div>
              <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${student.progress.completionPercentage}%` }} />
              </div>
              <div className={`text-xs mt-1 ${secondaryText}`}>{student.progress.completionPercentage}% complete</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <RowsPerPageSelect value={rowsPerPage} onChange={(n)=>{ setRowsPerPage(n); setCurrentPage(1); }} options={[7, 10, 20, 50]} />
        <Pagination
          className="w-full sm:w-64 md:w-72"
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((p)=>Math.max(1, p-1))}
          onNext={() => setCurrentPage((p)=>Math.min(totalPages, p+1))}
        />
      </div>
    </div>
  );
}


