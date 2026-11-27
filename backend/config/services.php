<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', 'http://localhost:5173/auth/google/callback'),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY', 'pk_test_sample_stripe_key'),
        'secret' => env('STRIPE_SECRET', 'sk_test_sample_stripe_secret'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET', 'whsec_sample_webhook_secret'),
    ],

    'razorpay' => [
        'key' => env('RAZORPAY_KEY', 'rzp_test_sample_razorpay_key'),
        'secret' => env('RAZORPAY_SECRET', 'sample_razorpay_secret'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET', 'sample_razorpay_webhook_secret'),
    ],

    'cloudflare_r2' => [
        'account_id' => env('CLOUDFLARE_R2_ACCOUNT_ID'),
        'access_key_id' => env('CLOUDFLARE_R2_ACCESS_KEY_ID'),
        'secret_access_key' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
        'bucket' => env('CLOUDFLARE_R2_BUCKET', 'gallery-bucket'),
        'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
        'public_url' => env('CLOUDFLARE_R2_PUBLIC_URL'),
    ],

];
