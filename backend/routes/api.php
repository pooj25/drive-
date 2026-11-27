<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\StorageController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication & Google OAuth
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/google', [AuthController::class, 'googleAuth']);
});

// Public Image Serving (allows viewing and downloading images)
Route::get('/images/{id}/serve', [ImageController::class, 'serve'])->name('images.serve');

// Public Subscription Plans & Webhooks
Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);
Route::post('/subscriptions/webhook/stripe', [SubscriptionController::class, 'webhookStripe']);
Route::post('/subscriptions/webhook/razorpay', [SubscriptionController::class, 'webhookRazorpay']);

// Protected Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Folders Management (Google Drive Folders)
    Route::get('/folders', [FolderController::class, 'index']);
    Route::post('/folders', [FolderController::class, 'store']);
    Route::put('/folders/{id}', [FolderController::class, 'update']);
    Route::delete('/folders/{id}', [FolderController::class, 'destroy']);

    // Image Management (Google Drive Media)
    Route::get('/images', [ImageController::class, 'index']);
    Route::post('/images/upload', [ImageController::class, 'upload']);
    Route::get('/images/{id}', [ImageController::class, 'show']);
    Route::post('/images/{id}/star', [ImageController::class, 'toggleStar']);
    Route::post('/images/{id}/trash', [ImageController::class, 'moveToTrash']);
    Route::post('/images/{id}/restore', [ImageController::class, 'restore']);
    Route::post('/images/{id}/move', [ImageController::class, 'moveToFolder']);
    Route::post('/images/empty-trash', [ImageController::class, 'emptyTrash']);
    Route::delete('/images/{id}', [ImageController::class, 'destroy']);

    // Subscription & Payment Management
    Route::get('/subscriptions/current', [SubscriptionController::class, 'current']);
    Route::post('/subscriptions/checkout/stripe', [SubscriptionController::class, 'checkoutStripe']);
    Route::post('/subscriptions/checkout/razorpay', [SubscriptionController::class, 'checkoutRazorpay']);
    Route::post('/subscriptions/verify/razorpay', [SubscriptionController::class, 'verifyRazorpay']);
    Route::post('/subscriptions/upgrade', [SubscriptionController::class, 'completeUpgrade']);
    Route::post('/subscriptions/cancel', [SubscriptionController::class, 'cancel']);

    // Storage Management (Local vs Cloudflare R2)
    Route::get('/storage/status', [StorageController::class, 'status']);
    Route::post('/storage/test-r2', [StorageController::class, 'testR2']);
});
