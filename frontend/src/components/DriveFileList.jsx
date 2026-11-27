import React, { useState } from 'react';
import {
  Star,
  Download,
  Trash2,
  HardDrive,
  Database,
  ArrowDownRight,
  MoreVertical,
  FolderInput,
  RotateCcw,
  FileImage,
  ImageIcon,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function DriveFileList({
  images,
  viewMode,
  selectedImage,
  onSelectImage,
  onToggleStar,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
  onOpenMoveModal,
  isTrashSection = false,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!images || images.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-400 space-y-3 bg-[#18191a]/60 rounded-3xl border border-[#2d3135] p-8">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#4285F4]/20 via-[#34A853]/20 to-[#FBBC05]/20 border border-[#4285F4]/30 flex items-center justify-center shadow-inner">
          <ImageIcon className="w-8 h-8 text-[#8ab4f8]" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-200">
            {isTrashSection ? 'Trash is empty' : 'No images in this folder'}
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {isTrashSection
              ? 'Photos deleted from My Drive will stay here until permanently purged.'
              : 'Click "+ New" to upload high-res photos and compress them with Intervention Image.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-sans">
          Files ({images.length})
        </h3>
      </div>

      {/* 1. GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {images.map((img) => {
            const isSelected = selectedImage?.id === img.id;

            return (
              <div
                key={img.id}
                onClick={() => onSelectImage(img)}
                className={`group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 flex flex-col select-none shadow-sm hover:-translate-y-0.5 hover:shadow-lg ${
                  isSelected
                    ? 'bg-[#283446] border-[#4285f4] ring-2 ring-[#4285f4]/80 shadow-md'
                    : 'bg-[#18191a] border-[#2d3135] hover:border-zinc-500'
                }`}
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-square w-full bg-[#131314] overflow-hidden flex items-center justify-center">
                  <img
                    src={img.thumbnail_url || img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Savings Tag */}
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#1e8e3e] to-[#34a853] text-white text-[10px] font-bold shadow-md flex items-center space-x-0.5">
                    <ArrowDownRight className="w-3 h-3 text-white" />
                    <span>-{img.compression_ratio}%</span>
                  </div>

                  {/* Storage Badge */}
                  <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold shadow-md backdrop-blur-md ${
                    img.disk === 'r2'
                      ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/60'
                      : 'bg-black/75 text-zinc-300 border border-zinc-700/60'
                  }`}>
                    {img.disk === 'r2' ? 'R2 CLOUD' : 'LOCAL DISK'}
                  </div>

                  {/* Star Button */}
                  {!isTrashSection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(img.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-zinc-300 hover:text-[#fbbc04] transition-all shadow-sm"
                      title={img.is_starred ? 'Unstar' : 'Star'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          img.is_starred
                            ? 'text-[#fbbc04] fill-[#fbbc04]'
                            : 'text-zinc-400 hover:text-[#fbbc04]'
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Card Footer Info */}
                <div className="p-3 bg-[#18191a] flex items-center justify-between border-t border-[#2d3135]/60">
                  <div className="truncate mr-1">
                    <p className="text-xs font-semibold text-zinc-100 truncate group-hover:text-[#8ab4f8] transition-colors">
                      {img.title || img.original_filename}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-400 mt-0.5">
                      <span className="text-[#81c995] font-semibold">{img.compressed_size_formatted}</span>
                      <span>&bull;</span>
                      <span className="line-through text-zinc-500">{img.original_size_formatted}</span>
                    </div>
                  </div>

                  {/* 3-Dot Action Menu */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === img.id ? null : img.id)}
                      className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === img.id && (
                      <div
                        className="absolute right-0 bottom-full mb-1 w-44 bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl py-1.5 z-30 text-xs animate-in fade-in duration-100 font-sans"
                        onClick={() => setActiveMenuId(null)}
                      >
                        {!isTrashSection ? (
                          <>
                            <a
                              href={img.download_url}
                              download={img.original_filename}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-zinc-200 transition-colors"
                            >
                              <Download className="w-4 h-4 text-[#8ab4f8]" />
                              <span>Download</span>
                            </a>
                            <button
                              onClick={() => onOpenMoveModal(img)}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-zinc-200 transition-colors"
                            >
                              <FolderInput className="w-4 h-4 text-[#81c995]" />
                              <span>Move to folder</span>
                            </button>
                            <button
                              onClick={() => onToggleStar(img.id)}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-zinc-200 transition-colors"
                            >
                              <Star className={`w-4 h-4 ${img.is_starred ? 'text-[#fbbc04] fill-[#fbbc04]' : 'text-zinc-400'}`} />
                              <span>{img.is_starred ? 'Unstar' : 'Add star'}</span>
                            </button>
                            <div className="border-t border-[#3c4043] my-1" />
                            <button
                              onClick={() => onMoveToTrash(img.id)}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-[#f28b82] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Move to trash</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onRestore(img.id)}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-[#81c995] transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Restore file</span>
                            </button>
                            <button
                              onClick={() => onPermanentDelete(img.id)}
                              className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-[#f28b82] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete permanently</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LIST VIEW (Google Drive Authentic Table) */}
      {viewMode === 'list' && (
        <div className="bg-[#18191a] border border-[#2d3135] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#131314] text-zinc-400 border-b border-[#2d3135] font-sans">
              <tr>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Saved Space</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Raw Size</th>
                <th className="py-3 px-4 font-semibold">Stored Size</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Storage</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3135]/60 text-zinc-200">
              {images.map((img) => {
                const isSelected = selectedImage?.id === img.id;

                return (
                  <tr
                    key={img.id}
                    onClick={() => onSelectImage(img)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#283446]'
                        : 'hover:bg-[#282a2d]/80'
                    }`}
                  >
                    {/* Name & Thumbnail */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={img.thumbnail_url || img.url}
                          alt={img.title}
                          className="w-9 h-9 rounded-lg object-cover bg-black shrink-0 border border-[#2d3135]"
                        />
                        <div className="truncate max-w-xs">
                          <span className="font-semibold text-zinc-100 block truncate">
                            {img.title || img.original_filename}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            WebP &bull; {img.width ? `${img.width}×${img.height}` : 'Optimized'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Saved Space Tag */}
                    <td className="py-2.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#1e8e3e] to-[#34a853] text-white text-[10px] font-bold shadow-sm inline-flex items-center space-x-0.5">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>-{img.compression_ratio}%</span>
                      </span>
                    </td>

                    {/* Raw Input Size */}
                    <td className="py-2.5 px-4 font-mono text-zinc-400 hidden md:table-cell">
                      {img.original_size_formatted}
                    </td>

                    {/* Stored Size */}
                    <td className="py-2.5 px-4 font-mono font-bold text-[#81c995]">
                      {img.compressed_size_formatted}
                    </td>

                    {/* Storage Type */}
                    <td className="py-2.5 px-4 hidden lg:table-cell">
                      {img.disk === 'r2' ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 text-[10px] font-semibold flex items-center space-x-1 w-fit">
                          <Database className="w-3 h-3 text-[#22d3ee]" />
                          <span>R2</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#283446] text-[#8ab4f8] border border-[#4285f4]/30 text-[10px] font-semibold flex items-center space-x-1 w-fit">
                          <HardDrive className="w-3 h-3 text-[#8ab4f8]" />
                          <span>Local</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        {!isTrashSection ? (
                          <>
                            <button
                              onClick={() => onToggleStar(img.id)}
                              className="p-1.5 rounded-full hover:bg-[#282a2d] text-zinc-400 hover:text-[#fbbc04] transition-colors"
                              title={img.is_starred ? 'Unstar' : 'Star'}
                            >
                              <Star className={`w-4 h-4 ${img.is_starred ? 'text-[#fbbc04] fill-[#fbbc04]' : ''}`} />
                            </button>
                            <a
                              href={img.download_url}
                              download={img.original_filename}
                              className="p-1.5 rounded-full hover:bg-[#282a2d] text-zinc-400 hover:text-[#8ab4f8] transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => onMoveToTrash(img.id)}
                              className="p-1.5 rounded-full hover:bg-red-950/30 text-zinc-400 hover:text-[#f28b82] transition-colors"
                              title="Trash"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onRestore(img.id)}
                              className="p-1.5 rounded-full hover:bg-[#282a2d] text-[#81c995] transition-colors"
                              title="Restore"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onPermanentDelete(img.id)}
                              className="p-1.5 rounded-full hover:bg-red-950/30 text-[#f28b82] transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
