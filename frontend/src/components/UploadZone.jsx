import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  SlidersHorizontal,
  HardDrive,
  FileImage,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  X,
  Layers,
  Sparkles,
  Zap,
  Database
} from 'lucide-react';
import { imagesApi } from '../api';

export default function UploadZone({ user, onUploadSuccess, onNavigatePricing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [quality, setQuality] = useState(80);
  const [maxDimension, setMaxDimension] = useState(2000);
  const [storageDisk, setStorageDisk] = useState('public');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const canUseR2 = user?.plan?.allow_r2 ?? false;

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^/.]+$/, ''));
    setUploadResult(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', title);
    formData.append('quality', quality);
    formData.append('max_dimension', maxDimension);
    formData.append('storage_disk', storageDisk);

    try {
      const res = await imagesApi.upload(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      setUploadResult(res.data.image);
      setUploading(false);
      setTimeout(() => {
        onUploadSuccess(res.data.image);
      }, 1200);
    } catch (err) {
      setUploading(false);
      setErrorMessage(
        err.response?.data?.message || 'Upload failed. Please check file format and storage limits.'
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] flex items-center justify-center text-white shadow-md">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            Upload & Compress Media
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optimized with server-side PHP Intervention Image into lightweight WebP format.
          </p>
        </div>
      </div>

      {/* Main Grid: Dropzone & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Dropzone (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`relative rounded-3xl border-2 border-dashed p-6 text-center transition-all cursor-pointer overflow-hidden ${
              dragActive
                ? 'border-[#4285F4] bg-[#4285F4]/10 shadow-lg'
                : selectedFile
                ? 'border-[#3c4043] bg-[#18191a]'
                : 'border-[#3c4043] bg-[#18191a]/60 hover:border-[#4285F4]/70 hover:bg-[#18191a]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {selectedFile && previewUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-video max-h-56 mx-auto rounded-2xl overflow-hidden bg-black/60 border border-[#2d3135]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelection();
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-black text-zinc-300 hover:text-white transition-colors border border-zinc-700 shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-left bg-[#1e1f20] p-3 rounded-2xl border border-[#2d3135] flex items-center justify-between text-xs">
                  <div className="truncate mr-3">
                    <p className="font-semibold text-zinc-100 truncate">{selectedFile.name}</p>
                    <p className="text-zinc-400 font-mono text-[11px] mt-0.5">
                      Input Size: {formatFileSize(selectedFile.size)} &bull; {selectedFile.type}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#4285F4]/20 text-[#8ab4f8] font-mono text-[10px] font-bold border border-[#4285F4]/30 shrink-0">
                    READY FOR COMPRESS
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#4285F4]/20 to-[#34A853]/20 border border-[#4285F4]/40 flex items-center justify-center text-[#8ab4f8] shadow-inner">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">
                    Click to browse or drop high-res image here
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    JPEG, PNG, WebP &bull; Quota limit {user?.plan?.max_file_size_mb || 5} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {uploading && (
            <div className="bg-[#18191a] border border-[#2d3135] rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-200 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
                  <span>Compressing with Intervention Image...</span>
                </span>
                <span className="font-bold text-[#81c995]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#2d3135] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4285F4] via-[#FBBC05] to-[#34A853] rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadResult && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#81c995]" />
                <span>Successfully compressed and saved!</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e8e3e] text-white font-bold text-[10px]">
                -{uploadResult.compression_ratio}% Space Saved
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-start space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Right Column: Settings Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-[#18191a] border border-[#2d3135] rounded-3xl p-5 space-y-4">
          
          <div className="flex items-center space-x-2 pb-3 border-b border-[#2d3135]">
            <SlidersHorizontal className="w-4 h-4 text-[#8ab4f8]" />
            <h3 className="text-sm font-bold text-zinc-100">Compression Engine</h3>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Title / Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vacation Shoot"
              className="w-full px-3.5 py-2 bg-[#131314] border border-[#3c4043] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] transition-colors"
            />
          </div>

          {/* WebP Quality Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-zinc-400">
                WebP Quality
              </label>
              <span className="font-mono text-xs font-bold text-[#81c995]">
                {quality}% {quality >= 85 ? '(Max Detail)' : quality >= 70 ? '(Balanced)' : '(Max Compression)'}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full h-1.5 bg-[#2d3135] rounded-lg appearance-none cursor-pointer accent-[#4285F4]"
            />
            <p className="text-[10px] text-zinc-500 font-mono">
              Intervention encodes raw buffer directly to WebP in RAM without writing temp files.
            </p>
          </div>

          {/* Max Resolution Clamp */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Max Edge Dimension
            </label>
            <select
              value={maxDimension}
              onChange={(e) => setMaxDimension(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-[#131314] border border-[#3c4043] rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#4285F4] font-medium"
            >
              <option value="1200">1200 px (Web & Mobile Standard)</option>
              <option value="2000">2000 px (Retina Display - Recommended)</option>
              <option value="3840">3840 px (4K Ultra-HD Master)</option>
            </select>
          </div>

          {/* Target Storage Disk */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Storage Destination
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              
              {/* Local */}
              <button
                type="button"
                onClick={() => setStorageDisk('public')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  storageDisk === 'public'
                    ? 'bg-[#283446] border-[#4285f4] text-[#8ab4f8] shadow-sm'
                    : 'bg-[#131314] border-[#2d3135] text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-[#8ab4f8]" />
                  <span>Local Disk</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  NVMe SSD storage
                </p>
              </button>

              {/* R2 Cloud */}
              <button
                type="button"
                disabled={!canUseR2}
                onClick={() => canUseR2 && setStorageDisk('r2')}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  storageDisk === 'r2'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-sm'
                    : !canUseR2
                    ? 'bg-[#131314]/50 border-[#2d3135] opacity-50 cursor-not-allowed text-zinc-500'
                    : 'bg-[#131314] border-[#2d3135] text-zinc-400 hover:border-cyan-800'
                }`}
              >
                {!canUseR2 && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[#fbbc04] font-bold">
                    PRO
                  </span>
                )}
                <div className="flex items-center space-x-2 font-bold mb-1">
                  <Database className="w-3.5 h-3.5 text-[#22d3ee]" />
                  <span>Cloudflare R2</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  S3 Cloud bucket
                </p>
              </button>

            </div>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full py-3 rounded-2xl bg-[#4285F4] hover:bg-[#1b66c9] disabled:opacity-40 disabled:hover:bg-[#4285F4] text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#fdd663]" />
            <span>Upload & Compress Now</span>
          </button>

        </div>

      </div>

    </div>
  );
}
