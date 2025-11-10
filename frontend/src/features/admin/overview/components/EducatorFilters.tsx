import React from "react";
import { Filter, Search } from "lucide-react";

interface EducatorFiltersProps {
  shownCount: number;
  query: string;
  onQueryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  onReset?: () => void;
}

export const EducatorFilters: React.FC<EducatorFiltersProps> = ({
  shownCount,
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-3 border-b border-gray-200 flex flex-row items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
          <Filter className="h-4 w-4 text-purple-600"/>
          Filters
        </h3>
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">{shownCount} shown</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"/>
          <input 
            value={query} 
            onChange={(e) => onQueryChange(e.target.value)} 
            placeholder="Search name, email, country, membership" 
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Status</label>
            <select 
              value={status} 
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="any">Any</option>
              <option value="paid">Paid</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Sort by</label>
            <select 
              value={sort} 
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="signup">Sign up date</option>
              <option value="students">No. of students</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};


