<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('ends_at')
                      ->orWhere('ends_at', '>=', now());
            })
            ->latest('id');
    }

    public function images()
    {
        return $this->hasMany(Image::class);
    }

    public function folders()
    {
        return $this->hasMany(Folder::class);
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    /**
     * Get user's current effective plan. If no active subscription, returns the Free plan.
     */
    public function getCurrentPlan()
    {
        $activeSub = $this->activeSubscription()->with('plan')->first();
        if ($activeSub && $activeSub->plan) {
            return $activeSub->plan;
        }

        return Plan::where('slug', 'free')->first() ?? new Plan([
            'name' => 'Free Tier',
            'slug' => 'free',
            'storage_limit_mb' => 100,
            'max_file_size_mb' => 5,
            'allow_r2' => false,
        ]);
    }

    /**
     * Calculate used storage in bytes
     */
    public function usedStorageBytes(): int
    {
        return (int) $this->images()->sum('compressed_size');
    }

    /**
     * Check if user can upload file of given byte size
     */
    public function canUpload(int $fileSizeBytes): array
    {
        $plan = $this->getCurrentPlan();
        $maxSizeBytes = $plan->max_file_size_mb * 1024 * 1024;
        $storageLimitBytes = $plan->storage_limit_mb * 1024 * 1024;
        $currentUsed = $this->usedStorageBytes();

        if ($fileSizeBytes > $maxSizeBytes) {
            return [
                'allowed' => false,
                'message' => "File exceeds maximum upload size of {$plan->max_file_size_mb} MB for your current plan ({$plan->name})."
            ];
        }

        if (($currentUsed + $fileSizeBytes) > $storageLimitBytes) {
            return [
                'allowed' => false,
                'message' => "Uploading this file would exceed your total storage quota of {$plan->storage_limit_mb} MB. Upgrade your plan to get more space."
            ];
        }

        return ['allowed' => true, 'plan' => $plan];
    }
}
