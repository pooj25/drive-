<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;

class ImageController extends Controller
{
    protected ImageManager $imageManager;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
    }

    /**
     * Get list of images for current user with Google Drive style sectioning
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Image::where('user_id', $user->id);

        // Section filter: 'drive' (default), 'starred', 'recent', 'trash'
        $section = $request->get('section', 'drive');

        if ($section === 'trash') {
            $query->where('is_trashed', true);
        } else {
            $query->where('is_trashed', false);

            if ($section === 'starred') {
                $query->where('is_starred', true);
            } elseif ($section === 'recent') {
                $query->latest('updated_at');
            } elseif ($section === 'drive') {
                // In My Drive, optionally filter by folder_id
                if ($request->has('folder_id')) {
                    $folderId = $request->get('folder_id');
                    if ($folderId === 'root' || $folderId === '' || $folderId === 'null') {
                        $query->whereNull('folder_id');
                    } else {
                        $query->where('folder_id', $folderId);
                    }
                }
            }
        }

        // Search by title or filename
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('original_filename', 'like', "%{$search}%");
            });
        }

        // Filter by disk if specified (local vs r2)
        if ($request->filled('disk')) {
            $query->where('disk', $request->disk);
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        if (in_array($sortBy, ['created_at', 'original_size', 'compressed_size', 'compression_ratio', 'title', 'updated_at'])) {
            $query->orderBy($sortBy, $direction === 'asc' ? 'asc' : 'desc');
        } else {
            $query->latest('id');
        }

        $perPage = (int) $request->get('per_page', 50);
        $images = $query->paginate($perPage);

        // Append calculated URLs
        $images->getCollection()->transform(function ($img) {
            return $this->formatImage($img);
        });

        // Summary stats
        $activeImages = Image::where('user_id', $user->id)->where('is_trashed', false);
        $totalOriginalBytes = (clone $activeImages)->sum('original_size');
        $totalCompressedBytes = (clone $activeImages)->sum('compressed_size');
        $totalSavedBytes = max(0, $totalOriginalBytes - $totalCompressedBytes);
        $savedPercentage = $totalOriginalBytes > 0 ? round(($totalSavedBytes / $totalOriginalBytes) * 100, 1) : 0;

        return response()->json([
            'images' => $images,
            'stats' => [
                'total_count' => (clone $activeImages)->count(),
                'total_original_mb' => round($totalOriginalBytes / (1024 * 1024), 2),
                'total_compressed_mb' => round($totalCompressedBytes / (1024 * 1024), 2),
                'total_saved_mb' => round($totalSavedBytes / (1024 * 1024), 2),
                'saved_percentage' => $savedPercentage,
                'starred_count' => Image::where('user_id', $user->id)->where('is_starred', true)->where('is_trashed', false)->count(),
                'trash_count' => Image::where('user_id', $user->id)->where('is_trashed', true)->count(),
            ],
        ]);
    }

    /**
     * Upload and compress an image into target folder
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:51200',
            'title' => 'nullable|string|max:255',
            'folder_id' => 'nullable|exists:folders,id',
            'quality' => 'nullable|integer|min:30|max:100',
            'storage_disk' => 'nullable|string|in:local,public,r2',
            'max_dimension' => 'nullable|integer|min:400|max:4000',
        ]);

        $user = $request->user();
        $file = $request->file('image');
        $originalSize = $file->getSize();

        // 1. Quota Check
        $uploadCheck = $user->canUpload($originalSize);
        if (!$uploadCheck['allowed']) {
            return response()->json([
                'message' => $uploadCheck['message'],
                'plan' => $user->getCurrentPlan(),
            ], 403);
        }

        $plan = $user->getCurrentPlan();

        // 2. Storage Disk
        $requestedDisk = $request->get('storage_disk', 'public');
        if ($requestedDisk === 'r2') {
            if (!$plan->allow_r2) {
                return response()->json([
                    'message' => 'Cloudflare R2 storage requires a Pro or Premium plan.',
                ], 403);
            }
            $targetDisk = 'r2';
        } else {
            $targetDisk = 'public';
        }

        try {
            $quality = (int) $request->get('quality', 80);
            $maxDimension = (int) $request->get('max_dimension', 2000);

            // Read directly from binary stream
            $imageObj = $this->imageManager->decodeBinary($file->get());

            $width = $imageObj->width();
            $height = $imageObj->height();

            // Scale down if larger than constraint while preserving aspect ratio
            if ($width > $maxDimension || $height > $maxDimension) {
                $imageObj->scaleDown(width: $maxDimension, height: $maxDimension);
                $width = $imageObj->width();
                $height = $imageObj->height();
            }

            // Encode to modern WebP format
            $encodedImage = $imageObj->encode(new WebpEncoder(quality: $quality));
            $compressedData = (string) $encodedImage;
            $compressedSize = strlen($compressedData);

            // Thumbnail (400px)
            $thumbObj = clone $imageObj;
            $thumbObj->scaleDown(width: 400, height: 400);
            $encodedThumb = $thumbObj->encode(new WebpEncoder(quality: 70));
            $thumbData = (string) $encodedThumb;

            // Filenames
            $uuid = Str::uuid()->toString();
            $storedFilename = $uuid . '.webp';
            $thumbFilename = 'thumb_' . $uuid . '.webp';
            $filePath = 'gallery/' . $storedFilename;
            $thumbPath = 'gallery/thumbnails/' . $thumbFilename;

            // Save to physical disk
            $actualDisk = $targetDisk;
            if ($targetDisk === 'r2' && (!config('filesystems.disks.r2.key') || !config('filesystems.disks.r2.endpoint'))) {
                Storage::disk('public')->put($filePath, $compressedData);
                Storage::disk('public')->put($thumbPath, $thumbData);
            } else {
                try {
                    Storage::disk($targetDisk)->put($filePath, $compressedData);
                    Storage::disk($targetDisk)->put($thumbPath, $thumbData);
                } catch (\Exception $diskException) {
                    Storage::disk('public')->put($filePath, $compressedData);
                    Storage::disk('public')->put($thumbPath, $thumbData);
                    $actualDisk = 'public';
                }
            }

            // Calculate savings
            $savedBytes = max(0, $originalSize - $compressedSize);
            $compressionRatio = $originalSize > 0 ? round(($savedBytes / $originalSize) * 100, 2) : 0;

            // Save record
            $imageRecord = Image::create([
                'user_id' => $user->id,
                'folder_id' => $request->folder_id ?: null,
                'title' => $request->title ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => $storedFilename,
                'thumbnail_filename' => $thumbFilename,
                'file_path' => $filePath,
                'thumbnail_path' => $thumbPath,
                'disk' => $actualDisk,
                'mime_type' => 'image/webp',
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'width' => $width,
                'height' => $height,
                'compression_ratio' => $compressionRatio,
                'is_starred' => false,
                'is_trashed' => false,
            ]);

            return response()->json([
                'message' => 'Image compressed and uploaded successfully',
                'image' => $this->formatImage($imageRecord),
                'stats' => [
                    'original_size_kb' => round($originalSize / 1024, 2),
                    'compressed_size_kb' => round($compressedSize / 1024, 2),
                    'saved_percentage' => $compressionRatio,
                    'disk' => $actualDisk,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to process image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle Star (Favorite)
     */
    public function toggleStar(Request $request, int $id): JsonResponse
    {
        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $image->update([
            'is_starred' => !$image->is_starred,
        ]);

        return response()->json([
            'message' => $image->is_starred ? 'Added to Starred' : 'Removed from Starred',
            'is_starred' => $image->is_starred,
        ]);
    }

    /**
     * Move to Trash (Soft delete Google Drive style)
     */
    public function moveToTrash(Request $request, int $id): JsonResponse
    {
        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $image->update([
            'is_trashed' => true,
            'trashed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Moved to Trash',
        ]);
    }

    /**
     * Restore from Trash
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $image->update([
            'is_trashed' => false,
            'trashed_at' => null,
        ]);

        return response()->json([
            'message' => 'Restored from Trash',
        ]);
    }

    /**
     * Move to Folder
     */
    public function moveToFolder(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'folder_id' => 'nullable|exists:folders,id',
        ]);

        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $image->update([
            'folder_id' => $request->folder_id ?: null,
        ]);

        return response()->json([
            'message' => 'Image moved successfully',
        ]);
    }

    /**
     * Empty Trash (Permanently remove all trashed images)
     */
    public function emptyTrash(Request $request): JsonResponse
    {
        $trashedImages = Image::where('user_id', $request->user()->id)
            ->where('is_trashed', true)
            ->get();

        foreach ($trashedImages as $img) {
            $disk = $img->disk === 'r2' ? 'r2' : 'public';
            if (Storage::disk($disk)->exists($img->file_path)) {
                Storage::disk($disk)->delete($img->file_path);
            }
            if ($img->thumbnail_path && Storage::disk($disk)->exists($img->thumbnail_path)) {
                Storage::disk($disk)->delete($img->thumbnail_path);
            }
            $img->delete();
        }

        return response()->json([
            'message' => 'Trash emptied permanently',
        ]);
    }

    /**
     * Show single image metadata
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'image' => $this->formatImage($image),
        ]);
    }

    /**
     * Stream/Serve image directly
     */
    public function serve(int $id, Request $request)
    {
        $image = Image::findOrFail($id);

        if ($image->public_url && Str::startsWith($image->public_url, 'http')) {
            return redirect($request->has('thumb') && $image->thumbnail_url ? $image->thumbnail_url : $image->public_url);
        }

        $isThumb = $request->has('thumb');
        $path = $isThumb && $image->thumbnail_path ? $image->thumbnail_path : $image->file_path;
        $disk = $image->disk === 'r2' ? 'r2' : 'public';

        if (!Storage::disk($disk)->exists($path)) {
            if (Storage::disk('public')->exists($path)) {
                $disk = 'public';
            } else {
                return response()->json(['message' => 'File not found on storage'], 404);
            }
        }

        $fileContent = Storage::disk($disk)->get($path);
        $mime = Storage::disk($disk)->mimeType($path) ?: 'image/webp';

        return response($fileContent, 200, [
            'Content-Type' => $mime,
            'Content-Disposition' => ($request->has('download') ? 'attachment; filename="' . $image->original_filename . '"' : 'inline'),
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Permanent Delete
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $image = Image::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $disk = $image->disk === 'r2' ? 'r2' : 'public';
        if (Storage::disk($disk)->exists($image->file_path)) {
            Storage::disk($disk)->delete($image->file_path);
        }
        if ($image->thumbnail_path && Storage::disk($disk)->exists($image->thumbnail_path)) {
            Storage::disk($disk)->delete($image->thumbnail_path);
        }

        $image->delete();

        return response()->json([
            'message' => 'Image deleted permanently',
        ]);
    }

    private function formatImage(Image $img): array
    {
        $viewUrl = $img->public_url ?: "/api/images/{$img->id}/serve";
        $thumbUrl = $img->thumbnail_url ?: "/api/images/{$img->id}/serve?thumb=1";
        $downloadUrl = "/api/images/{$img->id}/serve?download=1";

        return [
            'id' => $img->id,
            'user_id' => $img->user_id,
            'folder_id' => $img->folder_id,
            'title' => $img->title,
            'original_filename' => $img->original_filename,
            'stored_filename' => $img->stored_filename,
            'thumbnail_filename' => $img->thumbnail_filename,
            'disk' => $img->disk,
            'mime_type' => $img->mime_type,
            'original_size' => $img->original_size,
            'compressed_size' => $img->compressed_size,
            'original_size_formatted' => $this->formatBytes($img->original_size),
            'compressed_size_formatted' => $this->formatBytes($img->compressed_size),
            'saved_bytes' => max(0, $img->original_size - $img->compressed_size),
            'saved_bytes_formatted' => $this->formatBytes(max(0, $img->original_size - $img->compressed_size)),
            'compression_ratio' => $img->compression_ratio,
            'width' => $img->width,
            'height' => $img->height,
            'is_starred' => (bool) $img->is_starred,
            'is_trashed' => (bool) $img->is_trashed,
            'trashed_at' => $img->trashed_at ? $img->trashed_at->toIso8601String() : null,
            'url' => $viewUrl,
            'thumbnail_url' => $thumbUrl,
            'download_url' => $downloadUrl,
            'created_at' => $img->created_at->toIso8601String(),
            'updated_at' => $img->updated_at->toIso8601String(),
        ];
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}
