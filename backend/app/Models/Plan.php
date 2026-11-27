<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_monthly_usd',
        'price_yearly_usd',
        'price_monthly_inr',
        'price_yearly_inr',
        'storage_limit_mb',
        'max_file_size_mb',
        'allow_r2',
        'features',
        'is_active',
    ];

    protected $casts = [
        'price_monthly_usd' => 'float',
        'price_yearly_usd' => 'float',
        'price_monthly_inr' => 'float',
        'price_yearly_inr' => 'float',
        'storage_limit_mb' => 'integer',
        'max_file_size_mb' => 'integer',
        'allow_r2' => 'boolean',
        'features' => 'array',
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}
