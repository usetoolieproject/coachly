import React from 'react';

interface RowsPerPageSelectProps {
  value: number;
  onChange: (next: number) => void;
  options?: number[];
  className?: string;
}

export const RowsPerPageSelect: React.FC<RowsPerPageSelectProps> = ({ value, onChange, options = [5, 10, 20], className }) => {
  return (
    <div className={`flex items-center gap-2 text-xs ${className || ''}`}>
      <span className="text-gray-600">Rows</span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="px-2 py-1 text-xs border border-gray-300 rounded"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};


