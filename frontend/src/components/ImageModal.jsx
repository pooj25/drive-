import React, { useState } from 'react';
import {
  X,
  Download,
  Trash2,
  Copy,
  Check,
  HardDrive,
  Database,
  ArrowDownRight,
  Info
} from 'lucide-react';

export default function ImageModal({ image, onClose, onDelete }) {
  const [copied, setCopied] = useState(false);

  if (!image) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(image.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Column: Image Canvas */}
        <div className="md:w-3/5 bg-zinc-950 flex items-center justify-center p-4 min-h-[300px] sm:min-h-[420px] relative overflow-hidden">
          <img
            src={image.url}
            alt={image.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
          />

          {/* Savings Badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-zinc-900/90 text-emerald-400 border border-zinc-800 text-xs font-mono font-bold shadow-md flex items-center space-x-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Saved {image.compression_ratio}%</span>
          </div>

          {/* Disk Badge */}
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-zinc-900/90 text-zinc-300 border border-zinc-800 text-xs font-mono shadow-md flex items-center space-x-1">
            {image.disk === 'r2' ? (
              <>
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloudflare R2</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                <span>Local Disk</span>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Actions */}
        <div className="md:w-2/5 p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-800 bg-zinc-900 overflow-y-auto">
          
          <div className="space-y-5">
            
            {/* Header */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                WebP Optimized
              </span>
              <h3 className="text-base font-bold text-zinc-100 mt-2 truncate" title={image.title}>
                {image.title || image.original_filename}
              </h3>
              <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                {image.original_filename}
              </p>
            </div>

            {/* Compression Metrics Audit */}
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2.5 font-mono text-xs">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                <span>Compression Audit</span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500">Raw Input:</span>
                  <span className="text-zinc-300 font-semibold">{image.original_size_formatted}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500">Stored WebP:</span>
                  <span className="text-zinc-100 font-bold">{image.compressed_size_formatted}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-850">
                  <span className="text-zinc-500">Space Saved:</span>
                  <span className="text-emerald-400 font-bold">
                    {image.saved_bytes_formatted} ({image.compression_ratio}%)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Dimensions:</span>
                  <span className="text-zinc-300">
                    {image.width && image.height ? `${image.width} × ${image.height} px` : 'Optimized'}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Link */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Direct Image Link
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  readOnly
                  value={image.url}
                  className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700 shrink-0"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center space-x-2">
            <a
              href={image.download_url}
              download={image.original_filename}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs text-center transition-colors shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download WebP</span>
            </a>

            <button
              onClick={() => {
                onDelete(image.id);
                onClose();
              }}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/50 hover:text-red-300 text-zinc-400 transition-colors border border-zinc-700"
              title="Delete from gallery"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
