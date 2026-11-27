import React, { useState } from 'react';
import {
  Search,
  Download,
  Trash2,
  Maximize2,
  HardDrive,
  RefreshCw,
  Plus,
  ArrowDownRight,
  Database,
  Filter
} from 'lucide-react';

export default function GalleryView({
  images,
  stats,
  loading,
  search,
  setSearch,
  sort,
  setSort,
  diskFilter,
  setDiskFilter,
  onRefresh,
  onSelectImage,
  onDeleteImage,
  onNavigateUpload,
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  return (
    <div className="space-y-6">
      
      {/* 1. Technical Metric Dashboard Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Images */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Total Media</p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold tracking-tight text-zinc-100">{stats?.total_count || 0}</span>
            <span className="text-xs text-zinc-500 font-mono">items</span>
          </div>
        </div>

        {/* Space Saved */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Storage Reduced</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-emerald-400">{stats?.total_saved_mb || 0} MB</span>
            <span className="text-xs font-mono font-semibold text-emerald-500/90">
              (-{stats?.saved_percentage || 0}%)
            </span>
          </div>
        </div>

        {/* Stored Size */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Stored on Disk</p>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-2xl font-bold tracking-tight text-zinc-200">{stats?.total_compressed_mb || 0}</span>
            <span className="text-xs text-zinc-500 font-mono">MB WebP</span>
          </div>
        </div>

        {/* Compression Engine */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Compression Engine</p>
          <p className="text-sm font-semibold text-zinc-200 mt-1">Intervention Image v4</p>
          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Auto-scale &bull; WebP 80%</p>
        </div>

      </div>

      {/* 2. Controls & Search Bar */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images by name or title..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Storage Filter */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
            <button
              onClick={() => setDiskFilter('')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                diskFilter === '' ? 'bg-zinc-850 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Storage
            </button>
            <button
              onClick={() => setDiskFilter('local')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                diskFilter === 'local' ? 'bg-zinc-850 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Local Disk
            </button>
            <button
              onClick={() => setDiskFilter('r2')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                diskFilter === 'r2' ? 'bg-zinc-850 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>R2 Bucket</span>
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            <option value="created_at">Newest First</option>
            <option value="compression_ratio">Highest Savings %</option>
            <option value="original_size">Largest Raw Size</option>
            <option value="compressed_size">Smallest Compressed</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            title="Refresh gallery"
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-zinc-200' : ''}`} />
          </button>

          {/* Direct Upload Button */}
          <button
            onClick={onNavigateUpload}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

        </div>

      </div>

      {/* 3. Image Grid */}
      {loading && images.length === 0 ? (
        <div className="py-24 text-center">
          <div className="inline-flex p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mb-3 animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-xs font-mono text-zinc-400">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
            <HardDrive className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 mb-1">No media files found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
            {search
              ? `No images matched "${search}". Try clearing search keywords.`
              : 'Your compressed image library is currently empty. Upload photos to start.'}
          </p>
          <button
            onClick={onNavigateUpload}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Images</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col"
            >
              {/* Image Preview Box */}
              <div
                className="relative aspect-video w-full overflow-hidden bg-zinc-950 cursor-pointer"
                onClick={() => onSelectImage(img)}
              >
                <img
                  src={img.thumbnail_url || img.url}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  loading="lazy"
                />

                {/* Savings Badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-900/90 text-emerald-400 border border-zinc-800 text-[10px] font-mono font-bold shadow-sm flex items-center space-x-0.5">
                  <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                  <span>-{img.compression_ratio}%</span>
                </div>

                {/* Storage Disk Indicator */}
                <div
                  className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold shadow-sm border ${
                    img.disk === 'r2'
                      ? 'bg-zinc-900/90 text-cyan-400 border-cyan-800/40'
                      : 'bg-zinc-900/90 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {img.disk === 'r2' ? 'R2 BUCKET' : 'LOCAL DISK'}
                </div>

                {/* Hover Quick Actions */}
                <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectImage(img);
                    }}
                    className="p-2 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-transform active:scale-95 shadow"
                    title="View details"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={img.download_url}
                    download={img.original_filename}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-transform active:scale-95 shadow border border-zinc-700"
                    title="Download compressed image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(img.id);
                    }}
                    className="p-2 rounded-lg bg-zinc-800 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-transform active:scale-95 shadow border border-zinc-700"
                    title="Delete image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-zinc-200 truncate group-hover:text-white transition-colors" title={img.title}>
                    {img.title || img.original_filename}
                  </h4>
                  <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                    {img.width ? `${img.width}×${img.height} px` : 'WebP'} &bull; {img.stored_filename}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center space-x-1">
                    <span className="line-through text-zinc-500 text-[10px]">
                      {img.original_size_formatted}
                    </span>
                    <span className="text-zinc-600">&rarr;</span>
                    <span className="font-bold text-zinc-200">
                      {img.compressed_size_formatted}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400">
                    Saved {img.saved_bytes_formatted}
                  </span>
                </div>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === img.id && (
                <div className="absolute inset-0 bg-zinc-950/95 p-4 flex flex-col items-center justify-center text-center z-20 animate-in fade-in duration-100">
                  <Trash2 className="w-6 h-6 text-red-400 mb-2" />
                  <p className="text-xs font-bold text-zinc-100 mb-0.5">Confirm Delete</p>
                  <p className="text-[11px] text-zinc-400 mb-3">Removes file from disk and database.</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onDeleteImage(img.id);
                        setDeleteConfirmId(null);
                      }}
                      className="px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
