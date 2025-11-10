import React from 'react';
import { FileDown } from 'lucide-react';

interface ExportPdfButtonProps {
  onExport: () => void;
  small?: boolean;
}

export const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ onExport, small }) => {
  return (
    <button
      type="button"
      onClick={onExport}
      className={`inline-flex items-center gap-2 border border-gray-300 rounded ${small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} text-gray-700 hover:bg-gray-50`}
    >
      <FileDown className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span>Export PDF</span>
    </button>
  );
};


