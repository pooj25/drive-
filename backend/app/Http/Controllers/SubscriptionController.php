<?php

namespace App\Http\Controllers;

use App\Models\PaymentTransaction;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api as RazorpayApi;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;

class SubscriptionController extends Controller
{
    /**
     * List all active subscription plans
     */
    public function plans(): JsonResponse
    {
        $plans = Plan::where('is_active', true)->get();

        return response()->json([
            'plans' => $plans,
        ]);
    }

    /**
     * Get current user's subscription details and usage
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();
        $plan = $user->getCurrentPlan();
        $subscription = $user->activeSubscription()->with('plan')->first();
        $usedStorageBytes = $user->usedStorageBytes();
        $totalStorageBytes = $plan->storage_limit_mb * 1024 * 1024;

        $transactions = PaymentTransaction::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'current_plan' => $plan,
            'active_subscription' => $subscription,
            'storage' => [
                'used_bytes' => $usedStorageBytes,
                'total_bytes' => $totalStorageBytes,
                'used_mb' => round($usedStorageBytes / (1024 * 1024), 2),
                'total_mb' => $plan->storage_limit_mb,
                'percentage' => $totalStorageBytes > 0 ? round(($usedStorageBytes / $totalStorageBytes) * 100, 1) : 0,
            ],
            'recent_transactions' => $transactions,
        ]);
    }

    /**
     * Create Stripe Checkout Session
     */
    public function checkoutStripe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);
        $billingCycle = $request->billing_cycle;

        $amount = $billingCycle === 'yearly' ? $plan->price_yearly_usd : $plan->price_monthly_usd;
        $currency = 'usd';

        $stripeSecret = config('services.stripe.secret');

        // Check if using live/real Stripe key or demo mode
        if (empty($stripeSecret) || str_starts_with($stripeSecret, 'sk_test_sample')) {
            // Simulated Stripe checkout session for smooth dev experience
            $mockSessionId = 'cs_test_' . bin2hex(random_bytes(12));
            return response()->json([
                'mode' => 'simulated',
                'session_id' => $mockSessionId,
                'checkout_url' => null,
                'message' => 'Stripe demo sandbox active. You can complete the upgrade directly.',
                'plan' => $plan,
                'amount' => $amount,
                'currency' => $currency,
                'billing_cycle' => $billingCycle,
            ]);
        }

        try {
            Stripe::setApiKey($stripeSecret);

            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

            $session = StripeSession::create([
                'payment_method_types' => ['card'],
                'customer_email' => $user->email,
                'line_items' => [[
                    'price_data' => [
                        'currency' => $currency,
                        'product_data' => [
                            'name' => "PixelVault {$plan->name} ({$billingCycle})",
                            'description' => "Storage: {$plan->storage_limit_mb}MB with Intervention Image compression.",
                        ],
                        'unit_amount' => (int) ($amount * 100), // in cents
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => "{$frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe",
                'cancel_url' => "{$frontendUrl}/subscription?cancelled=1",
                'metadata' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'billing_cycle' => $billingCycle,
                ],
            ]);

            return response()->json([
                'mode' => 'live',
                'session_id' => $session->id,
                'checkout_url' => $session->url,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Stripe error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create Razorpay Order
     */
    public function checkoutRazorpay(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
            'currency' => 'nullable|in:INR,USD',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);
        $billingCycle = $request->billing_cycle;
        $currency = strtoupper($request->get('currency', 'INR'));

        $amount = $currency === 'INR'
            ? ($billingCycle === 'yearly' ? $plan->price_yearly_inr : $plan->price_monthly_inr)
            : ($billingCycle === 'yearly' ? $plan->price_yearly_usd : $plan->price_monthly_usd);

        $keyId = config('services.razorpay.key');
        $keySecret = config('services.razorpay.secret');

        // Check if demo key
        if (empty($keySecret) || str_starts_with($keySecret, 'sample_')) {
            $mockOrderId = 'order_rzp_mock_' . bin2hex(random_bytes(8));
            return response()->json([
                'mode' => 'simulated',
                'order_id' => $mockOrderId,
                'key_id' => $keyId ?: 'rzp_test_simulated',
                'amount' => (int) ($amount * 100), // in paise or cents
                'currency' => $currency,
                'plan' => $plan,
                'billing_cycle' => $billingCycle,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        }

        try {
            $api = new RazorpayApi($keyId, $keySecret);
            $orderData = [
                'receipt' => 'rcpt_' . $user->id . '_' . time(),
                'amount' => (int) ($amount * 100), // amount in paise
                'currency' => $currency,
                'notes' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'billing_cycle' => $billingCycle,
                ],
            ];

            $razorpayOrder = $api->order->create($orderData);

            return response()->json([
                'mode' => 'live',
                'order_id' => $razorpayOrder['id'],
                'key_id' => $keyId,
                'amount' => $razorpayOrder['amount'],
                'currency' => $currency,
                'plan' => $plan,
                'billing_cycle' => $billingCycle,
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Razorpay order creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify Razorpay payment signature and activate plan
     */
    public function verifyRazorpay(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'nullable|string',
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);
        $keySecret = config('services.razorpay.secret');

        // Signature check if in live mode
        if (!empty($keySecret) && !str_starts_with($keySecret, 'sample_')) {
            $expectedSignature = hash_hmac(
                'sha256',
                $request->razorpay_order_id . '|' . $request->razorpay_payment_id,
                $keySecret
            );

            if ($expectedSignature !== $request->razorpay_signature) {
                return response()->json(['message' => 'Invalid Razorpay signature.'], 400);
            }
        }

        // Activate subscription
        $subscription = $this->activatePlanForUser(
            user: $user,
            plan: $plan,
            gateway: 'razorpay',
            billingCycle: $request->billing_cycle,
            gatewaySubId: $request->razorpay_payment_id,
            gatewayOrderId: $request->razorpay_order_id,
            amount: $request->billing_cycle === 'yearly' ? $plan->price_yearly_inr : $plan->price_monthly_inr,
            currency: 'INR'
        );

        PaymentTransaction::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'gateway' => 'razorpay',
            'transaction_id' => $request->razorpay_payment_id,
            'amount' => $subscription->amount,
            'currency' => $subscription->currency,
            'status' => 'succeeded',
            'payload' => $request->all(),
        ]);

        return response()->json([
            'message' => "Successfully upgraded to {$plan->name}!",
            'subscription' => $subscription->load('plan'),
        ]);
    }

    /**
     * Complete or simulate direct upgrade (works for both Stripe & Razorpay simulation)
     */
    public function completeUpgrade(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'gateway' => 'required|in:stripe,razorpay',
            'billing_cycle' => 'required|in:monthly,yearly',
            'transaction_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $plan = Plan::findOrFail($request->plan_id);
        $gateway = $request->gateway;
        $cycle = $request->billing_cycle;

        $currency = $gateway === 'razorpay' ? 'INR' : 'USD';
        $amount = $cycle === 'yearly'
            ? ($currency === 'INR' ? $plan->price_yearly_inr : $plan->price_yearly_usd)
            : ($currency === 'INR' ? $plan->price_monthly_inr : $plan->price_monthly_usd);

        $txId = $request->transaction_id ?: ($gateway . '_' . bin2hex(random_bytes(8)));

        $subscription = $this->activatePlanForUser(
            user: $user,
            plan: $plan,
            gateway: $gateway,
            billingCycle: $cycle,
            gatewaySubId: 'sub_' . $txId,
            gatewayOrderId: 'ord_' . $txId,
            amount: $amount,
            currency: $currency
        );

        PaymentTransaction::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'gateway' => $gateway,
            'transaction_id' => $txId,
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'succeeded',
            'payload' => ['simulated' => true, 'timestamp' => now()->toIso8601String()],
        ]);

        return response()->json([
            'message' => "Successfully subscribed to {$plan->name} plan!",
            'subscription' => $subscription->load('plan'),
        ]);
    }

    /**
     * Cancel active subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription()->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found to cancel.'], 404);
        }

        $subscription->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Subscription cancelled successfully. You are now on the Free tier.',
            'subscription' => $subscription,
        ]);
    }

    /**
     * Stripe Webhook Handler
     */
    public function webhookStripe(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Stripe webhook received: ', $payload);

        // Process checkout.session.completed
        if (($payload['type'] ?? '') === 'checkout.session.completed') {
            $session = $payload['data']['object'] ?? [];
            $metadata = $session['metadata'] ?? [];

            if (!empty($metadata['user_id']) && !empty($metadata['plan_id'])) {
                $user = User::find($metadata['user_id']);
                $plan = Plan::find($metadata['plan_id']);

                if ($user && $plan) {
                    $cycle = $metadata['billing_cycle'] ?? 'monthly';
                    $amount = ($session['amount_total'] ?? 0) / 100;
                    $currency = strtoupper($session['currency'] ?? 'USD');

                    $sub = $this->activatePlanForUser(
                        user: $user,
                        plan: $plan,
                        gateway: 'stripe',
                        billingCycle: $cycle,
                        gatewaySubId: $session['subscription'] ?? $session['id'],
                        gatewayOrderId: $session['id'],
                        amount: $amount,
                        currency: $currency
                    );

                    PaymentTransaction::create([
                        'user_id' => $user->id,
                        'subscription_id' => $sub->id,
                        'gateway' => 'stripe',
                        'transaction_id' => $session['payment_intent'] ?? $session['id'],
                        'amount' => $amount,
                        'currency' => $currency,
                        'status' => 'succeeded',
                        'payload' => $session,
                    ]);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Razorpay Webhook Handler
     */
    public function webhookRazorpay(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Razorpay webhook received: ', $payload);

        return response()->json(['status' => 'success']);
    }

    /**
     * Helper to expire previous active subscriptions and create new one
     */
    private function activatePlanForUser(
        User $user,
        Plan $plan,
        string $gateway,
        string $billingCycle,
        ?string $gatewaySubId,
        ?string $gatewayOrderId,
        float $amount,
        string $currency
    ): Subscription {
        // Expire older active subscriptions
        Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        $startsAt = now();
        $endsAt = $billingCycle === 'yearly' ? now()->addYear() : now()->addMonth();

        return Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'gateway' => $gateway,
            'gateway_subscription_id' => $gatewaySubId,
            'gateway_order_id' => $gatewayOrderId,
            'billing_cycle' => $billingCycle,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'status' => 'active',
            'amount' => $amount,
            'currency' => $currency,
        ]);
    }
}
