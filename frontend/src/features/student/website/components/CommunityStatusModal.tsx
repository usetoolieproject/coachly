import React from 'react';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { CommunityStatusModalProps } from '../types';

const CommunityStatusModal: React.FC<CommunityStatusModalProps> = ({
  isOpen,
  onClose,
  status,
  currentCommunity,
  targetCommunity,
  onConfirmSwitch,
  loading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {status === 'already_joined' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Already a Member!</h3>
            <p className="text-gray-600 mb-6">
              You're already a member of {targetCommunity?.instructorName}'s community. 
              You have access to all courses and community features.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        )}

        {status === 'has_existing_community' && (
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Switch Communities?</h3>
            <div className="text-left mb-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-1">Current Community</h4>
                <p className="text-sm text-blue-800">{currentCommunity?.instructorName}'s community</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-1">New Community</h4>
                <p className="text-sm text-green-800">{targetCommunity?.instructorName}'s community</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-medium text-amber-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Important Warning
                </h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• You can only be in one community at a time</li>
                  <li>• Your course progress in the current community will be preserved</li>
                  <li>• You won't be able to access your current community's content anymore</li>
                  <li>• Community posts and interactions will no longer be accessible</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={onConfirmSwitch}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Switching Communities...
                  </>
                ) : (
                  `Yes, Switch to ${targetCommunity?.instructorName}'s Community`
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                No, Stay in Current Community
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Alternatively, you can create a new student account to join multiple communities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityStatusModal;


