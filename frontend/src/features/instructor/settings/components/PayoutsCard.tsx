import React from 'react';
import { Loader2, ShieldCheck, Banknote, AlertTriangle } from 'lucide-react';
import { connectService } from '../services/connectService';
import type { StripeConnectStatus } from '../types';

interface PayoutsCardProps {
  status: StripeConnectStatus | null;
  onStatusRefresh: () => void;
}

export const PayoutsCard: React.FC<PayoutsCardProps> = ({ status, onStatusRefresh }) => {
  const [loadingAction, setLoadingAction] = React.useState<'setup' | 'resume' | 'disconnect' | null>(null);
  const isReady = Boolean(status?.chargesEnabled && status?.payoutsEnabled);
  const needsVerification = Boolean(status?.needsVerification || (status?.requirementsCurrentlyDue?.length ?? 0) > 0);

  const handleSetup = async () => {
    try {
      setLoadingAction('setup');
      const { url } = await connectService.startOnboarding();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setLoadingAction(null);
    }
  };

  const handleResume = async () => {
    try {
      setLoadingAction('resume');
      const { url } = await connectService.resumeOnboarding();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setLoadingAction(null);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect payouts? You will need to set up payouts again to receive payments.')) return;
    try {
      setLoadingAction('disconnect');
      await connectService.disconnect();
      onStatusRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isReady ? 'bg-emerald-500' : 'bg-amber-500'}`}>
            <Banknote className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">Payouts</h3>
            <p className="text-sm text-slate-500">Connect your Stripe account to receive student payments.</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status?.chargesEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
            Charges {status?.chargesEnabled ? 'enabled' : 'disabled'}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status?.payoutsEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
            Payouts {status?.payoutsEnabled ? 'enabled' : 'disabled'}
          </span>
          {needsVerification && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
              Verification required
            </span>
          )}
        </div>

        {(!status?.stripeAccountId || !status?.chargesEnabled) && (
          <button
            onClick={handleSetup}
            disabled={loadingAction !== null}
            className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingAction === 'setup' && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingAction === 'setup' ? 'Redirecting…' : 'Set up payouts'}
          </button>
        )}

        {status?.stripeAccountId && needsVerification && (
          <button
            onClick={handleResume}
            disabled={loadingAction !== null}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-2xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loadingAction === 'resume' && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingAction === 'resume' ? 'Redirecting…' : 'Continue verification'}
          </button>
        )}

        {isReady && (
          <div className="flex items-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Your account is ready to receive payouts.
          </div>
        )}

        {status?.requirementsCurrentlyDue?.length ? (
          <div className="text-sm text-slate-600">
            <div className="flex items-center text-amber-700 mb-2">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Additional information required by Stripe:
            </div>
            <ul className="list-disc ml-5">
              {status.requirementsCurrentlyDue.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="px-6 pb-6">
        {status?.stripeAccountId && (
          <button
            onClick={handleDisconnect}
            disabled={loadingAction !== null}
            className="bg-red-300 hover:bg-red-500 text-gray-800 px-4 py-2 rounded-2xl text-sm font-medium transition-colors"
          >
            {loadingAction === 'disconnect' ? 'Disconnecting…' : 'Disconnect payouts'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PayoutsCard;


