import React, { useState, useEffect } from 'react';
import {
  Check,
  CreditCard,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  ShieldCheck,
  Sparkles,
  Zap,
  Cloud,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscriptionApi } from '../api';

export default function SubscriptionPlans({ user, onSubscriptionUpdated, onOpenAuth }) {
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('USD');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('stripe');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');

  const currentPlanSlug = user?.plan?.slug || 'free';

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await subscriptionApi.getPlans();
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (plan.slug === currentPlanSlug) return;
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
    setPaymentNotice('');
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setProcessingPayment(true);
    setPaymentNotice('');

    try {
      if (selectedGateway === 'stripe') {
        const res = await subscriptionApi.checkoutStripe(selectedPlan.id, billingCycle);
        if (res.data.mode === 'live' && res.data.checkout_url) {
          window.location.href = res.data.checkout_url;
          return;
        }

        const upgradeRes = await subscriptionApi.completeUpgrade(
          selectedPlan.id,
          'stripe',
          billingCycle,
          res.data.session_id
        );
        triggerSuccess(upgradeRes.data.message);
      } else {
        const res = await subscriptionApi.checkoutRazorpay(selectedPlan.id, billingCycle, currency);
        
        if (res.data.mode === 'simulated' || !window.Razorpay) {
          const upgradeRes = await subscriptionApi.completeUpgrade(
            selectedPlan.id,
            'razorpay',
            billingCycle,
            res.data.order_id
          );
          triggerSuccess(upgradeRes.data.message);
        } else {
          const options = {
            key: res.data.key_id,
            amount: res.data.amount,
            currency: res.data.currency,
            name: 'PixelVault Gallery',
            description: `${selectedPlan.name} (${billingCycle})`,
            order_id: res.data.order_id,
            prefill: {
              name: user.name,
              email: user.email,
            },
            theme: { color: '#4285F4' },
            handler: async (response) => {
              try {
                const verifyRes = await subscriptionApi.verifyRazorpay({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_id: selectedPlan.id,
                  billing_cycle: billingCycle,
                });
                triggerSuccess(verifyRes.data.message);
              } catch (err) {
                setPaymentNotice(err.response?.data?.message || 'Verification failed.');
                setProcessingPayment(false);
              }
            },
            modal: {
              ondismiss: () => setProcessingPayment(false),
            },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      setPaymentNotice(err.response?.data?.message || 'Payment initiation failed.');
      setProcessingPayment(false);
    }
  };

  const triggerSuccess = (msg) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335'],
    });
    setPaymentNotice(msg || 'Plan updated successfully!');
    setProcessingPayment(false);
    setTimeout(() => {
      setCheckoutModalOpen(false);
      onSubscriptionUpdated();
    }, 1500);
  };

  const getPrice = (plan) => {
    if (plan.price_monthly_usd === 0) return 'Free';
    if (currency === 'INR') {
      const price = billingCycle === 'yearly' ? plan.price_yearly_inr : plan.price_monthly_inr;
      return `₹${price}`;
    }
    const price = billingCycle === 'yearly' ? plan.price_yearly_usd : plan.price_monthly_usd;
    return `$${price}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Google One Rainbow Header Accent */}
      <div className="h-1.5 w-32 mx-auto rounded-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/30 text-[#8ab4f8] text-xs font-bold mb-1">
          <Cloud className="w-3.5 h-3.5 text-[#8ab4f8]" />
          <span>Google One Storage System</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Upgrade your Drive storage
        </h2>
        <p className="text-xs text-zinc-400">
          More space for high-resolution photos, Intervention WebP compression, and Cloudflare R2 bucket mirroring.
        </p>

        {/* Controls: Billing Cycle + Currency */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          
          {/* Monthly / Yearly Toggle */}
          <div className="bg-[#131314] border border-[#2d3135] p-1 rounded-full flex items-center text-xs shadow-inner">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#4285F4] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all flex items-center space-x-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#4285F4] text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#34A853] text-white font-bold">
                -20%
              </span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="bg-[#131314] border border-[#2d3135] p-1 rounded-full flex items-center text-xs shadow-inner">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                currency === 'USD'
                  ? 'bg-[#283446] text-[#8ab4f8] border border-[#4285f4]/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency('INR')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                currency === 'INR'
                  ? 'bg-[#283446] text-[#8ab4f8] border border-[#4285f4]/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>

        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isPro = plan.slug === 'pro';
          const isPremium = plan.slug === 'premium';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                isPro
                  ? 'bg-[#18191a] border-2 border-[#4285F4] shadow-2xl ring-1 ring-[#4285F4]/50'
                  : 'bg-[#18191a] border border-[#2d3135] hover:border-zinc-500 shadow-md'
              }`}
            >
              {isPro && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>{plan.name}</span>
                    {isPro && <Sparkles className="w-4 h-4 text-[#FBBC05]" />}
                  </h3>
                  {isPro && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#4285F4] to-[#A142F4] text-white shadow-sm">
                      POPULAR
                    </span>
                  )}
                  {isPremium && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBBC05]/20 text-[#fbbc04] border border-[#FBBC05]/40">
                      ENTERPRISE
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 min-h-[32px]">{plan.description}</p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-[#2d3135]">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-white">{getPrice(plan)}</span>
                    <span className="text-xs text-zinc-400 font-mono">/{billingCycle === 'yearly' ? 'yr' : 'mo'}</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#8ab4f8] font-bold mt-1.5 flex items-center space-x-1">
                    <Database className="w-3.5 h-3.5 text-[#22d3ee]" />
                    <span>
                      {plan.storage_limit_mb >= 1024
                        ? `${(plan.storage_limit_mb / 1024).toFixed(0)} GB Quota`
                        : `${plan.storage_limit_mb} MB Quota`}
                    </span>
                    <span className="text-zinc-500">&bull;</span>
                    <span className="text-zinc-400 font-normal">{plan.max_file_size_mb} MB max upload</span>
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6 text-xs text-zinc-300">
                  {plan.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#34A853]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-[#81c995]" />
                      </div>
                      <span className="text-zinc-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-full bg-[#131314] border border-[#2d3135] text-zinc-400 font-bold text-xs cursor-default text-center"
                  >
                    Current Active Tier
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isPro
                        ? 'bg-[#4285F4] hover:bg-[#1b66c9] text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
                        : 'bg-[#282a2d] hover:bg-[#383b40] text-zinc-100 hover:text-white'
                    }`}
                  >
                    <span>Upgrade to {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Dual Checkout Modal: Stripe + Razorpay */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 overflow-hidden">
            
            <button
              onClick={() => !processingPayment && setCheckoutModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/20 border border-[#4285F4]/40 flex items-center justify-center text-[#8ab4f8]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Payment Checkout</h3>
                <p className="text-[11px] text-zinc-400">
                  {selectedPlan.name} &bull; {billingCycle.toUpperCase()} ({getPrice(selectedPlan)})
                </p>
              </div>
            </div>

            {paymentNotice && (
              <div className="mb-4 p-3 rounded-2xl bg-[#283446] border border-[#4285F4]/40 text-xs text-[#8ab4f8] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#81c995]" />
                <span>{paymentNotice}</span>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-zinc-300">
                Choose Payment Gateway
              </label>

              {/* Gateway Switcher */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Stripe */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('stripe')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedGateway === 'stripe'
                      ? 'bg-[#635BFF]/15 border-[#635BFF] text-white shadow-md'
                      : 'bg-[#131314] border-[#2d3135] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                    <span className="text-[#635BFF] font-black tracking-tight text-sm">stripe</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    Credit / Debit Cards
                  </p>
                </button>

                {/* Razorpay */}
                <button
                  type="button"
                  onClick={() => setSelectedGateway('razorpay')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    selectedGateway === 'razorpay'
                      ? 'bg-[#00BAF2]/15 border-[#00BAF2] text-white shadow-md'
                      : 'bg-[#131314] border-[#2d3135] text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-bold text-xs mb-1">
                    <span className="text-[#00BAF2] font-black tracking-tight text-sm">Razorpay</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono">
                    UPI, NetBanking & Cards
                  </p>
                </button>

              </div>

              {/* Security Badge */}
              <div className="p-3 rounded-2xl bg-[#131314] border border-[#2d3135] flex items-center space-x-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-[#81c995] shrink-0" />
                <span>Instant sandbox checkout ready. Live keys supported via backend .env</span>
              </div>

              {/* Complete Payment Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={processingPayment}
                className="w-full py-3 rounded-full bg-[#4285F4] hover:bg-[#1b66c9] disabled:opacity-40 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {processingPayment ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay {getPrice(selectedPlan)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
