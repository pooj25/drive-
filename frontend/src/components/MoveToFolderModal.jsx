import React, { useState } from 'react';
import { X, FolderInput, Folder, HardDrive, Check } from 'lucide-react';

export default function MoveToFolderModal({ isOpen, onClose, image, folders, onMove }) {
  const [selectedFolderId, setSelectedFolderId] = useState('root');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !image) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onMove(image.id, selectedFolderId === 'root' ? null : selectedFolderId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#81c995]/20 border border-[#81c995]/40 flex items-center justify-center text-[#81c995]">
            <FolderInput className="w-5 h-5" />
          </div>
          <div className="truncate pr-4">
            <h3 className="text-sm font-bold text-white">Move item</h3>
            <p className="text-[11px] text-zinc-400 truncate font-mono">
              {image.title || image.original_filename}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-1.5 p-1 bg-[#131314] rounded-2xl border border-[#2d3135]">
            
            {/* Root: My Drive */}
            <div
              onClick={() => setSelectedFolderId('root')}
              className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                selectedFolderId === 'root'
                  ? 'bg-[#283446] border border-[#4285f4] text-[#8ab4f8]'
                  : 'hover:bg-[#1e1f20] text-zinc-300'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <HardDrive className="w-4 h-4 text-[#8ab4f8]" />
                <span className="text-xs font-semibold">My Drive (Root)</span>
              </div>
              {selectedFolderId === 'root' && <Check className="w-4 h-4 text-[#8ab4f8]" />}
            </div>

            {/* User Folders */}
            {folders.map((f) => {
              const isSelected = selectedFolderId === f.id;
              const col = f.color || '#4285F4';

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#283446] border border-[#4285f4] text-[#8ab4f8]'
                      : 'hover:bg-[#1e1f20] text-zinc-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Folder className="w-4 h-4 fill-current" style={{ color: col }} />
                    <span className="text-xs font-semibold truncate">{f.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#8ab4f8]" />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#1b66c9] text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all cursor-pointer"
            >
              {loading ? 'Moving...' : 'Move here'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
