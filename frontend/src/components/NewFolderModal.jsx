import React, { useState } from 'react';
import { X, FolderPlus, Folder } from 'lucide-react';

export default function NewFolderModal({ isOpen, onClose, onCreateFolder }) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4285F4');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const colorPalette = [
    '#4285F4', // Google Blue
    '#34A853', // Google Green
    '#FBBC05', // Google Yellow
    '#EA4335', // Google Red
    '#A142F4', // Google Purple
    '#24C1E0', // Google Cyan
    '#EC4899', // Pink
    '#94A3B8', // Slate
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setLoading(true);
    try {
      await onCreateFolder(folderName.trim(), selectedColor);
      setFolderName('');
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

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/20 border border-[#4285F4]/40 flex items-center justify-center text-[#8ab4f8]">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">New folder</h3>
            <p className="text-[11px] text-zinc-400">Organize your compressed gallery</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2.5 bg-[#131314] border border-[#3c4043] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-medium"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
              Folder Color
            </label>
            <div className="flex items-center justify-between p-2 bg-[#131314] rounded-2xl border border-[#2d3135]">
              {colorPalette.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    selectedColor === col
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#131314] scale-110 shadow-md'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          {/* Live Folder Preview Capsule */}
          <div
            className="p-3 rounded-2xl border flex items-center space-x-3 transition-colors"
            style={{
              backgroundColor: `${selectedColor}14`,
              borderColor: `${selectedColor}40`,
            }}
          >
            <Folder className="w-5 h-5 fill-current" style={{ color: selectedColor }} />
            <span className="text-xs font-semibold text-zinc-100 truncate">
              {folderName.trim() || 'Folder Preview'}
            </span>
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
              disabled={loading || !folderName.trim()}
              className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#1b66c9] text-white font-bold text-xs shadow-md disabled:opacity-40 transition-all cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
