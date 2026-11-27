<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{
    /**
     * Get storage configuration status, statistics, and connectivity
     */
    public function status(Request $request): JsonResponse
    {
        $defaultDisk = config('filesystems.default', 'local');
        $r2Configured = !empty(config('filesystems.disks.r2.key')) &&
                        !empty(config('filesystems.disks.r2.secret')) &&
                        !empty(config('filesystems.disks.r2.endpoint'));

        $r2Bucket = config('filesystems.disks.r2.bucket', 'pixelvault-gallery');
        $r2Endpoint = config('filesystems.disks.r2.endpoint');
        $r2PublicUrl = config('filesystems.disks.r2.url');

        $user = $request->user();
        $userQuery = $user ? Image::where('user_id', $user->id) : Image::query();

        $localCount = (clone $userQuery)->whereIn('disk', ['local', 'public'])->count();
        $localBytes = (clone $userQuery)->whereIn('disk', ['local', 'public'])->sum('compressed_size');

        $r2Count = (clone $userQuery)->where('disk', 'r2')->count();
        $r2Bytes = (clone $userQuery)->where('disk', 'r2')->sum('compressed_size');

        return response()->json([
            'default_disk' => $defaultDisk,
            'r2' => [
                'configured' => $r2Configured,
                'bucket' => $r2Bucket,
                'endpoint' => $r2Endpoint ? preg_replace('/^https?:\/\//', '', $r2Endpoint) : null,
                'public_url' => $r2PublicUrl,
            ],
            'statistics' => [
                'local_images_count' => $localCount,
                'local_storage_mb' => round($localBytes / (1024 * 1024), 2),
                'r2_images_count' => $r2Count,
                'r2_storage_mb' => round($r2Bytes / (1024 * 1024), 2),
            ],
        ]);
    }

    /**
     * Test connection to Cloudflare R2
     */
    public function testR2(Request $request): JsonResponse
    {
        $r2Configured = !empty(config('filesystems.disks.r2.key')) &&
                        !empty(config('filesystems.disks.r2.secret')) &&
                        !empty(config('filesystems.disks.r2.endpoint'));

        if (!$r2Configured) {
            return response()->json([
                'success' => false,
                'message' => 'Cloudflare R2 is not fully configured yet. Please provide CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, and CLOUDFLARE_R2_ENDPOINT in .env file.',
            ], 422);
        }

        try {
            $testFileName = 'connection_tests/test_' . time() . '.txt';
            $testContent = 'PixelVault Cloudflare R2 connection test at ' . now()->toIso8601String();

            // Attempt write
            Storage::disk('r2')->put($testFileName, $testContent);
            // Attempt read
            $readContent = Storage::disk('r2')->get($testFileName);
            // Clean up
            Storage::disk('r2')->delete($testFileName);

            return response()->json([
                'success' => true,
                'message' => 'Cloudflare R2 bucket connection test successful! Read and write verified.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'R2 connection failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
