import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  HardDrive,
  CheckCircle2,
  Receipt,
  User,
  Cloud,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { subscriptionApi } from '../api';

export default function AccountModal({ isOpen, onClose, user, onSubscriptionChanged }) {
  const [data, setData] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
      setMessage('');
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const res = await subscriptionApi.getCurrent();
      setData(res.data);
    } catch (err) {
      console.error('Error loading account subscription:', err);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Cancel active subscription? You will return to Free tier.')) {
      return;
    }
    setCancelling(true);
    try {
      const res = await subscriptionApi.cancel();
      setMessage(res.data.message);
      loadData();
      onSubscriptionChanged();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen || !user) return null;

  const plan = data?.current_plan || user?.plan;
  const sub = data?.active_subscription || user?.subscription;
  const storage = data?.storage || user?.storage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[88vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* User Profile Card with Google Rainbow Ring */}
        <div className="flex items-center space-x-4 pb-5 border-b border-[#2d3135]">
          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] shadow-md shrink-0">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover bg-[#131314]"
            />
          </div>
          <div className="truncate">
            <h3 className="text-base font-bold text-white">{user.name}</h3>
            <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4285F4]/20 text-[#8ab4f8] border border-[#4285F4]/30">
                {plan?.name || 'Free Tier'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                UID #{user.id}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className="my-3 p-3 rounded-2xl bg-[#283446] border border-[#4285F4]/40 text-xs text-[#8ab4f8] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#81c995]" />
            <span>{message}</span>
          </div>
        )}

        {/* Subscription & Storage Details */}
        <div className="space-y-4 py-4 text-xs">
          
          {/* Storage Quota Bar */}
          <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2.5 shadow-sm">
            <div className="flex justify-between font-mono text-[11px] text-zinc-300">
              <span className="flex items-center space-x-1.5 font-bold">
                <Cloud className="w-3.5 h-3.5 text-[#8ab4f8]" />
                <span>STORAGE QUOTA</span>
              </span>
              <span className="text-[#81c995] font-bold">{storage?.percentage || 0}% used</span>
            </div>

            <div className="w-full h-2.5 bg-[#2d3135] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, Math.min(100, storage?.percentage || 0))}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-zinc-400 pt-1">
              <span>{storage?.used_mb || 0} MB used</span>
              <span>{storage?.total_mb || 100} MB total</span>
            </div>
          </div>

          {/* Active Subscription Details */}
          <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2 shadow-sm font-mono text-[11px]">
            <div className="flex justify-between items-center pb-2 border-b border-[#2d3135]">
              <span className="font-bold text-zinc-300 font-sans flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-[#FBBC05]" />
                <span>SUBSCRIPTION STATUS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34A853]/20 text-[#81c995] border border-[#34A853]/40">
                {sub?.status ? sub.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>

            <div className="space-y-1.5 text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Current Plan:</span>
                <span className="font-bold text-white">{plan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Billing Cycle:</span>
                <span>{sub?.billing_cycle || 'Monthly'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 font-sans">Payment Gateway:</span>
                <span className="uppercase text-[#8ab4f8] font-bold">{sub?.payment_gateway || 'Default'}</span>
              </div>
              {sub?.expires_at && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-sans">Next Renewal / Expiry:</span>
                  <span>{new Date(sub.expires_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {sub && plan?.slug !== 'free' && (
              <div className="pt-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-sans font-semibold text-xs transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            )}
          </div>

          {/* Payment Transactions */}
          {data?.transactions && data.transactions.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2">
              <span className="font-bold text-zinc-300 flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-[#8ab4f8]" />
                <span>Transaction Receipts</span>
              </span>
              <div className="divide-y divide-[#2d3135] font-mono text-[11px]">
                {data.transactions.map((t) => (
                  <div key={t.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="text-zinc-200 font-semibold">{t.gateway_transaction_id}</p>
                      <p className="text-zinc-500 text-[10px]">
                        {new Date(t.created_at).toLocaleDateString()} &bull; {t.gateway.toUpperCase()}
                      </p>
                    </div>
                    <span className="font-bold text-[#81c995]">
                      {t.currency} {t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
