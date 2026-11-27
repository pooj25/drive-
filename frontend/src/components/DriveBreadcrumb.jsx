import React from 'react';
import {
  ChevronRight,
  HardDrive,
  Folder,
  Database,
  ArrowUpDown,
  Star,
  Clock,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';

export default function DriveBreadcrumb({
  activeSection,
  currentFolder,
  onNavigateRoot,
  diskFilter,
  setDiskFilter,
  sort,
  setSort,
}) {
  const getSectionInfo = () => {
    switch (activeSection) {
      case 'starred':
        return { title: 'Starred', icon: Star, color: '#fbbc04' };
      case 'recent':
        return { title: 'Recent', icon: Clock, color: '#81c995' };
      case 'trash':
        return { title: 'Trash', icon: Trash2, color: '#f28b82' };
      default:
        return { title: 'My Drive', icon: HardDrive, color: '#8ab4f8' };
    }
  };

  const section = getSectionInfo();
  const SectionIcon = section.icon;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#2d3135] gap-3">
      
      {/* Breadcrumb Path with Google Material 3 Capsule */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={onNavigateRoot}
          className="group flex items-center space-x-2 px-3 py-1.5 rounded-full hover:bg-[#282a2d] transition-all"
        >
          <SectionIcon className="w-4 h-4 transition-transform group-hover:scale-110" style={{ color: section.color }} />
          <span className="font-bold text-base text-zinc-100 group-hover:text-white transition-colors">
            {section.title}
          </span>
        </button>

        {activeSection === 'drive' && currentFolder && (
          <>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
            <div
              className="flex items-center space-x-2 px-3 py-1 rounded-full border shadow-sm text-xs font-semibold"
              style={{
                backgroundColor: `${currentFolder.color || '#8ab4f8'}15`,
                borderColor: `${currentFolder.color || '#8ab4f8'}40`,
                color: currentFolder.color || '#8ab4f8',
              }}
            >
              <Folder className="w-3.5 h-3.5 fill-current" />
              <span>{currentFolder.name}</span>
            </div>
          </>
        )}
      </div>

      {/* Filter Chips & Sorting (Material 3 Segmented Controls) */}
      <div className="flex items-center space-x-2.5 text-xs">
        
        {/* Storage Filter Chips */}
        <div className="flex items-center bg-[#131314] p-1 rounded-full border border-[#2d3135] text-[11px] shadow-sm">
          <button
            onClick={() => setDiskFilter('')}
            className={`px-3 py-1 rounded-full font-medium transition-all ${
              diskFilter === ''
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Media
          </button>
          
          <button
            onClick={() => setDiskFilter('local')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center space-x-1 ${
              diskFilter === 'local'
                ? 'bg-[#283446] text-[#8ab4f8] border border-[#4285f4]/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-3 h-3 text-[#8ab4f8]" />
            <span>Local</span>
          </button>

          <button
            onClick={() => setDiskFilter('r2')}
            className={`px-3 py-1 rounded-full font-medium transition-all flex items-center space-x-1 ${
              diskFilter === 'r2'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3 h-3 text-[#22d3ee]" />
            <span>R2 Cloud</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#131314] border border-[#2d3135] rounded-full px-3.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-[#4285F4] font-medium transition-colors cursor-pointer appearance-none pr-7 shadow-sm"
          >
            <option value="created_at">Sort: Newest</option>
            <option value="compression_ratio">Sort: Highest Saved %</option>
            <option value="original_size">Sort: Raw Size</option>
            <option value="compressed_size">Sort: Stored Size</option>
            <option value="title">Sort: Name (A-Z)</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

      </div>

    </div>
  );
}
