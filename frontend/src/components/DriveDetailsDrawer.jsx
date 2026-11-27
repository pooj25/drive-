import React, { useState } from 'react';
import {
  X,
  Star,
  Download,
  Trash2,
  HardDrive,
  Database,
  Calendar,
  Layers,
  ArrowDownRight,
  FolderInput,
  Copy,
  Check,
  Maximize2,
  Sparkles,
  Zap,
  ShieldCheck,
  FileImage
} from 'lucide-react';

export default function DriveDetailsDrawer({
  image,
  onClose,
  onToggleStar,
  onMoveToTrash,
  onOpenMoveModal,
  onOpenLightbox,
}) {
  const [copied, setCopied] = useState(false);

  if (!image) {
    return (
      <aside className="w-80 border-l border-[#2d3135] bg-[#131314] p-6 flex flex-col items-center justify-center text-center text-zinc-400 select-none shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-[#1e1f20] border border-[#2d3135] flex items-center justify-center mb-3">
          <Layers className="w-7 h-7 text-[#8ab4f8]" />
        </div>
        <p className="text-sm font-semibold text-zinc-200">Select an item</p>
        <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
          Click on any photo to view its live compression audit and storage details.
        </p>
      </aside>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-84 border-l border-[#2d3135] bg-[#131314] p-5 flex flex-col justify-between overflow-y-auto select-none shrink-0 text-xs">
      
      <div className="space-y-4">
        
        {/* Header with Title and Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2d3135]">
          <div className="flex items-center space-x-2 truncate pr-2">
            <div className="w-6 h-6 rounded-lg bg-[#4285F4]/15 flex items-center justify-center shrink-0">
              <FileImage className="w-3.5 h-3.5 text-[#8ab4f8]" />
            </div>
            <span className="font-semibold text-zinc-100 truncate text-xs">
              {image.title || image.original_filename}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-res Image Preview with Lightbox CTA */}
        <div
          className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#1e1f20] border border-[#2d3135] cursor-pointer group shadow-sm"
          onClick={() => onOpenLightbox(image)}
        >
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-1.5 font-semibold text-xs backdrop-blur-[2px]">
            <Maximize2 className="w-4 h-4 text-[#8ab4f8]" />
            <span>Open Lightbox</span>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300">
            {image.width ? `${image.width}×${image.height}` : 'WebP'}
          </div>
        </div>

        {/* Quick Toolbar with Vibrant Accents */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#1e1f20] border border-[#2d3135] rounded-xl text-zinc-300">
          <button
            onClick={() => onToggleStar(image.id)}
            className="py-2 rounded-lg flex flex-col items-center hover:bg-[#282a2d] transition-all"
            title={image.is_starred ? 'Unstar' : 'Star'}
          >
            <Star className={`w-4 h-4 mb-1 ${image.is_starred ? 'text-[#fbbc04] fill-[#fbbc04]' : 'text-zinc-400 hover:text-[#fbbc04]'}`} />
            <span className="text-[10px]">Star</span>
          </button>

          <a
            href={image.download_url}
            download={image.original_filename}
            className="py-2 rounded-lg flex flex-col items-center hover:bg-[#282a2d] hover:text-[#8ab4f8] transition-all text-zinc-300"
            title="Download file"
          >
            <Download className="w-4 h-4 mb-1 text-[#8ab4f8]" />
            <span className="text-[10px]">Download</span>
          </a>

          <button
            onClick={() => onOpenMoveModal(image)}
            className="py-2 rounded-lg flex flex-col items-center hover:bg-[#282a2d] hover:text-[#81c995] transition-all text-zinc-300"
            title="Move to folder"
          >
            <FolderInput className="w-4 h-4 mb-1 text-[#81c995]" />
            <span className="text-[10px]">Move</span>
          </button>

          <button
            onClick={() => onMoveToTrash(image.id)}
            className="py-2 rounded-lg flex flex-col items-center hover:bg-red-950/30 hover:text-[#f28b82] transition-all text-zinc-300"
            title="Move to trash"
          >
            <Trash2 className="w-4 h-4 mb-1 text-[#f28b82]" />
            <span className="text-[10px]">Trash</span>
          </button>
        </div>

        {/* Compression Audit Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#18231a] to-[#1e1f20] border border-emerald-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5 text-xs font-semibold text-[#81c995]">
              <Sparkles className="w-3.5 h-3.5 text-[#81c995]" />
              <span>Intervention Optimization</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#1e8e3e] text-white font-bold text-[10px] shadow-sm flex items-center space-x-0.5">
              <ArrowDownRight className="w-3 h-3" />
              <span>-{image.compression_ratio}%</span>
            </span>
          </div>

          {/* Visual Size Reduction Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>{image.original_size_formatted}</span>
              <span className="text-[#81c995] font-semibold">{image.compressed_size_formatted}</span>
            </div>
            <div className="w-full h-2 bg-[#2d3135] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-[#34A853] to-[#81c995] rounded-full"
                style={{ width: `${Math.max(5, 100 - (image.compression_ratio || 0))}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-400/90 font-mono text-right">
              Saved {image.saved_bytes_formatted}
            </p>
          </div>
        </div>

        {/* Technical File Metadata */}
        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-[#2d3135] space-y-2 text-[11px] font-mono">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-sans pb-1 border-b border-[#2d3135]">
            Storage & Specs
          </p>

          <div className="space-y-1.5 text-zinc-300">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-sans">Codec:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#282a2d] text-zinc-200 text-[10px] font-bold">
                WebP Lossy
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-sans">Storage Target:</span>
              <span className="flex items-center space-x-1.5">
                {image.disk === 'r2' ? (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-semibold flex items-center space-x-1">
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span>Cloudflare R2</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-[#283446] text-[#8ab4f8] border border-[#4285f4]/30 text-[10px] font-semibold flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 text-[#8ab4f8]" />
                    <span>Local Disk</span>
                  </span>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-sans">Resolution:</span>
              <span>{image.width ? `${image.width} × ${image.height} px` : 'Optimized'}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-sans">Uploaded:</span>
              <span>{new Date(image.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Direct Link with 1-Click Copy */}
        <div className="p-3.5 rounded-2xl bg-[#1e1f20] border border-[#2d3135] space-y-1.5">
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Shareable URL
          </label>
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              readOnly
              value={image.url}
              className="w-full px-2.5 py-1.5 bg-[#131314] border border-[#3c4043] rounded-xl text-[10px] font-mono text-zinc-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-xl bg-[#4285F4] hover:bg-[#1b66c9] text-white transition-all shrink-0 shadow-sm"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

    </aside>
  );
}
