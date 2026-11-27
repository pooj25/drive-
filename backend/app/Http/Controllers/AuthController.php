<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Standard email/password registration
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => 'https://api.dicebear.com/7.x/initials/svg?seed=' . urlencode($request->name),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $this->formatUserData($user),
        ], 201);
    }

    /**
     * Standard email/password login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password',
            ], 401);
        }

        // Revoke old tokens if desired or create fresh
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => $this->formatUserData($user),
        ]);
    }

    /**
     * Google OAuth 2.0 (Gmail Signup / Login)
     * Handles Google ID token or Access Token from frontend Google Sign-In SDK,
     * or simulated Google login payload for local development testing.
     */
    public function googleAuth(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_token' => 'nullable|string',
            'access_token' => 'nullable|string',
            // If using client-side simulated OAuth or direct payload:
            'email' => 'nullable|email',
            'name' => 'nullable|string',
            'google_id' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid request', 'errors' => $validator->errors()], 422);
        }

        $googleUser = null;

        // 1. Verify with Google if id_token is provided
        if ($request->filled('id_token')) {
            try {
                $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                    'id_token' => $request->id_token,
                ]);

                if ($response->successful()) {
                    $payload = $response->json();
                    $googleUser = [
                        'google_id' => $payload['sub'],
                        'email' => $payload['email'],
                        'name' => $payload['name'] ?? explode('@', $payload['email'])[0],
                        'avatar' => $payload['picture'] ?? null,
                    ];
                }
            } catch (\Exception $e) {
                // Fall through to other checks
            }
        }

        // 2. If access_token provided, fetch userinfo from Google
        if (!$googleUser && $request->filled('access_token')) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $request->access_token,
                ])->get('https://www.googleapis.com/oauth2/v3/userinfo');

                if ($response->successful()) {
                    $payload = $response->json();
                    $googleUser = [
                        'google_id' => $payload['sub'],
                        'email' => $payload['email'],
                        'name' => $payload['name'] ?? explode('@', $payload['email'])[0],
                        'avatar' => $payload['picture'] ?? null,
                    ];
                }
            } catch (\Exception $e) {
                // Fall through
            }
        }

        // 3. Fallback for Local Dev / Testing / Demo OAuth Mode:
        // Allows testing Google signup seamlessly even before configuring Google Cloud Console credentials
        if (!$googleUser && $request->filled('email')) {
            $googleUser = [
                'google_id' => $request->google_id ?? ('g_' . substr(md5($request->email), 0, 16)),
                'email' => $request->email,
                'name' => $request->name ?? explode('@', $request->email)[0],
                'avatar' => $request->avatar ?? ('https://api.dicebear.com/7.x/identicon/svg?seed=' . urlencode($request->email)),
            ];
        }

        if (!$googleUser) {
            return response()->json([
                'message' => 'Failed to authenticate with Google. Provide a valid Google token or credentials.',
            ], 400);
        }

        // Find or create user
        $user = User::where('google_id', $googleUser['google_id'])
            ->orWhere('email', $googleUser['email'])
            ->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser['name'],
                'email' => $googleUser['email'],
                'google_id' => $googleUser['google_id'],
                'avatar' => $googleUser['avatar'],
                'password' => Hash::make(uniqid('google_', true)),
                'email_verified_at' => now(),
            ]);
        } else {
            // Update Google ID and avatar if needed
            $user->update([
                'google_id' => $googleUser['google_id'],
                'avatar' => $googleUser['avatar'] ?? $user->avatar,
            ]);
        }

        $token = $user->createToken('google_token')->plainTextToken;

        return response()->json([
            'message' => 'Google Authentication successful',
            'token' => $token,
            'user' => $this->formatUserData($user),
        ]);
    }

    /**
     * Get current authenticated user details
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUserData($request->user()),
        ]);
    }

    /**
     * Logout and revoke tokens
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Helper to format user payload with plan and storage stats
     */
    private function formatUserData(User $user): array
    {
        $plan = $user->getCurrentPlan();
        $usedStorageBytes = $user->usedStorageBytes();
        $totalStorageBytes = $plan->storage_limit_mb * 1024 * 1024;
        $activeSubscription = $user->activeSubscription()->with('plan')->first();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'role' => $user->role,
            'created_at' => $user->created_at,
            'plan' => [
                'name' => $plan->name,
                'slug' => $plan->slug,
                'storage_limit_mb' => $plan->storage_limit_mb,
                'max_file_size_mb' => $plan->max_file_size_mb,
                'allow_r2' => $plan->allow_r2,
                'features' => $plan->features,
            ],
            'storage' => [
                'used_bytes' => $usedStorageBytes,
                'total_bytes' => $totalStorageBytes,
                'used_mb' => round($usedStorageBytes / (1024 * 1024), 2),
                'total_mb' => $plan->storage_limit_mb,
                'percentage' => $totalStorageBytes > 0 ? round(($usedStorageBytes / $totalStorageBytes) * 100, 1) : 0,
            ],
            'subscription' => $activeSubscription ? [
                'id' => $activeSubscription->id,
                'gateway' => $activeSubscription->gateway,
                'billing_cycle' => $activeSubscription->billing_cycle,
                'status' => $activeSubscription->status,
                'starts_at' => $activeSubscription->starts_at,
                'ends_at' => $activeSubscription->ends_at,
                'is_expired' => $activeSubscription->isExpired(),
                'amount' => $activeSubscription->amount,
                'currency' => $activeSubscription->currency,
            ] : null,
        ];
    }
}
