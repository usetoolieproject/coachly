import React from 'react';
import { Trash2 } from 'lucide-react';

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  isDeleting?: boolean;
};

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, title, content, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-700 line-clamp-3">{content}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={onClose} disabled={isDeleting} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{isDeleting ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;


