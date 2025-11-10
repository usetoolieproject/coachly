import { Mail, Phone, User2 } from 'lucide-react';
import type { InstructorContact } from '../types';

export function ContactSupportModal({ open, onClose, contact }: { open: boolean; onClose: () => void; contact: InstructorContact | null; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
      <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">Contact Your Instructor</h3>
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-base">Close</button>
        </div>
        <p className="text-gray-600 mt-2 text-base">Reach out for help or questions.</p>

        {/* Instructor identity */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <User2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
            </div>
            <div className="text-sm text-gray-500">Your enrolled instructor</div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="text-base font-medium text-gray-900">{contact?.email || '—'}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Phone</div>
              <div className="text-base font-medium text-gray-900">{contact?.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


