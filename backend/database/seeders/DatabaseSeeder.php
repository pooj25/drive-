<?php

namespace Database\Seeders;

use App\Models\Image;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Subscription Plans
        $freePlan = Plan::updateOrCreate(['slug' => 'free'], [
            'name' => 'Free Plan',
            'slug' => 'free',
            'description' => 'Ideal for casual photo sharing and basic compression.',
            'price_monthly_usd' => 0.00,
            'price_yearly_usd' => 0.00,
            'price_monthly_inr' => 0.00,
            'price_yearly_inr' => 0.00,
            'storage_limit_mb' => 150,     // 150 MB
            'max_file_size_mb' => 5,       // 5 MB max per file
            'allow_r2' => false,
            'features' => [
                '150 MB Local Storage',
                'Max 5 MB file size',
                'Intervention Image Smart Compression (WebP/JPEG)',
                'Standard Gallery View',
                'Direct Download',
            ],
            'is_active' => true,
        ]);

        $proPlan = Plan::updateOrCreate(['slug' => 'pro'], [
            'name' => 'Pro Creator',
            'slug' => 'pro',
            'description' => 'For professional photographers and high-resolution galleries.',
            'price_monthly_usd' => 9.99,
            'price_yearly_usd' => 99.00,
            'price_monthly_inr' => 799.00,
            'price_yearly_inr' => 7990.00,
            'storage_limit_mb' => 2048,    // 2 GB
            'max_file_size_mb' => 25,      // 25 MB max per file
            'allow_r2' => true,
            'features' => [
                '2 GB Cloud & Local Storage',
                'Max 25 MB file size',
                'Intervention Image High-Definition Compression',
                'Cloudflare R2 Bucket Sync Option',
                'Priority Processing & Thumbnails',
                'Batch Image Uploads',
            ],
            'is_active' => true,
        ]);

        $premiumPlan = Plan::updateOrCreate(['slug' => 'premium'], [
            'name' => 'Studio Premium',
            'slug' => 'premium',
            'description' => 'Unlimited creativity for agencies, studios, and high-volume media.',
            'price_monthly_usd' => 24.99,
            'price_yearly_usd' => 249.00,
            'price_monthly_inr' => 1999.00,
            'price_yearly_inr' => 19990.00,
            'storage_limit_mb' => 10240,   // 10 GB
            'max_file_size_mb' => 100,     // 100 MB max per file
            'allow_r2' => true,
            'features' => [
                '10 GB Storage with Multi-Disk Support',
                'Max 100 MB file size',
                'Cloudflare R2 Direct Cloud Storage',
                'Lossless & Ultra-Compressed Options',
                'Direct CDN links & Expiry Controls',
                'Full Stripe & Razorpay automated billing',
            ],
            'is_active' => true,
        ]);

        // 2. Create Demo User
        $demoUser = User::updateOrCreate(['email' => 'demo@gallery.local'], [
            'name' => 'Alex Morgan',
            'email' => 'demo@gallery.local',
            'password' => Hash::make('password123'),
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            'role' => 'user',
        ]);

        // Create Google Drive Sample Folders
        $natureFolder = \App\Models\Folder::updateOrCreate(
            ['user_id' => $demoUser->id, 'name' => 'Nature & Landscapes'],
            ['color' => '#10b981']
        );
        $urbanFolder = \App\Models\Folder::updateOrCreate(
            ['user_id' => $demoUser->id, 'name' => 'Urban & Architecture'],
            ['color' => '#6366f1']
        );
        $archiveFolder = \App\Models\Folder::updateOrCreate(
            ['user_id' => $demoUser->id, 'name' => 'High-Res Wallpapers'],
            ['color' => '#f59e0b']
        );

        // 3. Create Pro User with active subscription
        $proUser = User::updateOrCreate(['email' => 'pro@gallery.local'], [
            'name' => 'Elena Rostova',
            'email' => 'pro@gallery.local',
            'password' => Hash::make('password123'),
            'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
            'role' => 'user',
        ]);

        Subscription::updateOrCreate(
            ['user_id' => $proUser->id, 'status' => 'active'],
            [
                'plan_id' => $proPlan->id,
                'gateway' => 'stripe',
                'gateway_subscription_id' => 'sub_mock_pro_' . time(),
                'gateway_order_id' => 'order_stripe_' . time(),
                'billing_cycle' => 'monthly',
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
                'status' => 'active',
                'amount' => 9.99,
                'currency' => 'USD',
            ]
        );

        // 4. Seed initial sample images with realistic compression metrics
        $sampleImages = [
            [
                'title' => 'Misty Alpine Lake Morning',
                'original_filename' => 'alpine_lake_raw.jpg',
                'stored_filename' => 'sample_alpine_lake.webp',
                'thumbnail_filename' => 'thumb_sample_alpine_lake.webp',
                'file_path' => 'images/sample_alpine_lake.webp',
                'thumbnail_path' => 'images/thumbnails/thumb_sample_alpine_lake.webp',
                'disk' => 'local',
                'mime_type' => 'image/webp',
                'original_size' => 4589210, // ~4.38 MB
                'compressed_size' => 612450, // ~598 KB
                'width' => 2400,
                'height' => 1600,
                'compression_ratio' => 86.65, // % saved
                'public_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=70',
            ],
            [
                'title' => 'Neon Cyberpunk Urban Alley',
                'original_filename' => 'tokyo_night_streets.png',
                'stored_filename' => 'sample_tokyo_night.webp',
                'thumbnail_filename' => 'thumb_sample_tokyo_night.webp',
                'file_path' => 'images/sample_tokyo_night.webp',
                'thumbnail_path' => 'images/thumbnails/thumb_sample_tokyo_night.webp',
                'disk' => 'local',
                'mime_type' => 'image/webp',
                'original_size' => 8192400, // ~7.8 MB
                'compressed_size' => 945200, // ~923 KB
                'width' => 2800,
                'height' => 1867,
                'compression_ratio' => 88.46,
                'public_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=70',
            ],
            [
                'title' => 'Golden Hour Coastal Cliffs',
                'original_filename' => 'sunset_ocean_cliff.jpg',
                'stored_filename' => 'sample_sunset_cliff.webp',
                'thumbnail_filename' => 'thumb_sample_sunset_cliff.webp',
                'file_path' => 'images/sample_sunset_cliff.webp',
                'thumbnail_path' => 'images/thumbnails/thumb_sample_sunset_cliff.webp',
                'disk' => 'local',
                'mime_type' => 'image/webp',
                'original_size' => 3840120, // ~3.66 MB
                'compressed_size' => 482100, // ~470 KB
                'width' => 2000,
                'height' => 1333,
                'compression_ratio' => 87.45,
                'public_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70',
            ],
            [
                'title' => 'Minimalist Architecture Lines',
                'original_filename' => 'modern_facade_facets.jpg',
                'stored_filename' => 'sample_architecture.webp',
                'thumbnail_filename' => 'thumb_sample_architecture.webp',
                'file_path' => 'images/sample_architecture.webp',
                'thumbnail_path' => 'images/thumbnails/thumb_sample_architecture.webp',
                'disk' => 'local',
                'mime_type' => 'image/webp',
                'original_size' => 5240980, // ~5.0 MB
                'compressed_size' => 512000, // ~500 KB
                'width' => 2200,
                'height' => 1467,
                'compression_ratio' => 90.23,
                'public_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=70',
            ],
            [
                'title' => 'Emerald Forest Ferns & Dew',
                'original_filename' => 'deep_rainforest_macro.jpg',
                'stored_filename' => 'sample_rainforest.webp',
                'thumbnail_filename' => 'thumb_sample_rainforest.webp',
                'file_path' => 'images/sample_rainforest.webp',
                'thumbnail_path' => 'images/thumbnails/thumb_sample_rainforest.webp',
                'disk' => 'r2', // Cloudflare R2 example
                'mime_type' => 'image/webp',
                'original_size' => 6450200, // ~6.15 MB
                'compressed_size' => 789400, // ~770 KB
                'width' => 2560,
                'height' => 1440,
                'compression_ratio' => 87.76,
                'public_url' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=70',
            ],
        ];

        foreach ($sampleImages as $img) {
            Image::create(array_merge($img, ['user_id' => $demoUser->id]));
        }
    }
}
