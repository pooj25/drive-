<?php

namespace App\Http\Controllers;

use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FolderController extends Controller
{
    /**
     * List folders for user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Folder::where('user_id', $user->id)
            ->withCount('images');

        if ($request->has('parent_id')) {
            $parentId = $request->get('parent_id');
            if ($parentId === 'null' || $parentId === null || $parentId === '') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $parentId);
            }
        }

        $folders = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'folders' => $folders,
        ]);
    }

    /**
     * Create a new folder
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'parent_id' => 'nullable|exists:folders,id',
            'color' => 'nullable|string|max:20',
        ]);

        $folder = Folder::create([
            'user_id' => $request->user()->id,
            'name' => trim($request->name),
            'parent_id' => $request->parent_id ?: null,
            'color' => $request->color ?: '#94a3b8',
        ]);

        return response()->json([
            'message' => 'Folder created successfully',
            'folder' => $folder->loadCount('images'),
        ], 201);
    }

    /**
     * Rename folder
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:20',
        ]);

        $folder = Folder::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $folder->update([
            'name' => trim($request->name),
            'color' => $request->color ?: $folder->color,
        ]);

        return response()->json([
            'message' => 'Folder updated',
            'folder' => $folder->loadCount('images'),
        ]);
    }

    /**
     * Delete folder
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $folder = Folder::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Unlink images in this folder to root (or delete)
        $folder->images()->update(['folder_id' => null]);
        $folder->delete();

        return response()->json([
            'message' => 'Folder deleted successfully',
        ]);
    }
}
