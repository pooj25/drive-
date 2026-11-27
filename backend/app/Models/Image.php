<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'folder_id',
        'title',
        'original_filename',
        'stored_filename',
        'thumbnail_filename',
        'file_path',
        'thumbnail_path',
        'disk',
        'mime_type',
        'original_size',
        'compressed_size',
        'width',
        'height',
        'compression_ratio',
        'public_url',
        'thumbnail_url',
        'is_starred',
        'is_trashed',
        'trashed_at',
    ];

    protected $casts = [
        'original_size' => 'integer',
        'compressed_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'compression_ratio' => 'float',
        'is_starred' => 'boolean',
        'is_trashed' => 'boolean',
        'trashed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }
}
