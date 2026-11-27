import React, { useState } from 'react';
import {
  Folder,
  MoreVertical,
  Trash2,
  Edit2,
  FolderOpen
} from 'lucide-react';

export default function DriveFolderList({
  folders,
  currentFolder,
  onOpenFolder,
  onDeleteFolder,
  onRenameFolder,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!folders || folders.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-sans">
          Folders ({folders.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {folders.map((folder) => {
          const isSelected = currentFolder?.id === folder.id;
          const folderColor = folder.color || '#4285F4';

          return (
            <div
              key={folder.id}
              onClick={() => onOpenFolder(folder)}
              className={`group relative p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between select-none shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
                isSelected
                  ? 'bg-[#283446] border-[#4285f4] ring-2 ring-[#4285f4]/50'
                  : 'bg-[#18191a] border-[#2d3135] hover:border-zinc-500'
              }`}
              style={{
                background: isSelected
                  ? '#283446'
                  : `linear-gradient(135deg, ${folderColor}12 0%, #1e1f20 100%)`,
              }}
            >
              <div className="flex items-center space-x-3 truncate mr-2">
                {/* Colorful Folder Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${folderColor}22` }}
                >
                  <Folder
                    className="w-5 h-5 fill-current"
                    style={{ color: folderColor }}
                  />
                </div>
                
                <div className="truncate">
                  <span className="text-xs font-bold text-zinc-100 truncate block group-hover:text-white transition-colors">
                    {folder.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {folder.images_count ?? 0} {folder.images_count === 1 ? 'file' : 'files'}
                  </span>
                </div>
              </div>

              {/* Action Menu */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setActiveMenuId(activeMenuId === folder.id ? null : folder.id)}
                  className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {activeMenuId === folder.id && (
                  <div
                    className="absolute right-0 mt-1 w-36 bg-[#1e1f20] border border-[#3c4043] rounded-2xl shadow-2xl py-1.5 z-30 text-xs animate-in fade-in duration-100"
                    onClick={() => setActiveMenuId(null)}
                  >
                    <button
                      onClick={() => onOpenFolder(folder)}
                      className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-zinc-200"
                    >
                      <FolderOpen className="w-4 h-4 text-[#8ab4f8]" />
                      <span>Open folder</span>
                    </button>
                    <button
                      onClick={() => onRenameFolder(folder)}
                      className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-zinc-200"
                    >
                      <Edit2 className="w-4 h-4 text-[#fdd663]" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder.id)}
                      className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-[#282a2d] text-[#f28b82]"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
