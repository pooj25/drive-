<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'gateway',
        'gateway_subscription_id',
        'gateway_order_id',
        'gateway_payment_id',
        'billing_cycle',
        'starts_at',
        'ends_at',
        'status',
        'amount',
        'currency',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'amount' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function isExpired(): bool
    {
        if ($this->status !== 'active') {
            return true;
        }

        if ($this->ends_at && $this->ends_at->isPast()) {
            return true;
        }

        return false;
    }
}
