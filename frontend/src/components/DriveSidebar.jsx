import React, { useState } from 'react';
import {
  HardDrive,
  Star,
  Clock,
  Trash2,
  Cloud,
  CreditCard,
  Plus,
  UploadCloud,
  FolderPlus,
  Database,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DriveSidebar({
  activeSection,
  setActiveSection,
  user,
  onOpenUpload,
  onOpenNewFolder,
  onOpenPricing,
  onOpenStorage,
}) {
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const storageUsed = user?.storage?.used_mb || 0;
  const storageTotal = user?.storage?.total_mb || 100;
  const storagePct = user?.storage?.percentage || 0;

  const navItems = [
    { id: 'drive', label: 'My Drive', icon: HardDrive, color: '#8ab4f8' },
    { id: 'starred', label: 'Starred', icon: Star, color: '#fbbc04' },
    { id: 'recent', label: 'Recent', icon: Clock, color: '#81c995' },
    { id: 'trash', label: 'Trash', icon: Trash2, color: '#f28b82' },
  ];

  return (
    <aside className="w-64 bg-[#131314] flex flex-col justify-between p-3.5 select-none shrink-0 z-20">
      
      <div className="space-y-5">
        
        {/* + NEW Button (Authentic Google Drive 4-Color Floating Pill) */}
        <div className="relative pt-1 pl-1">
          <button
            onClick={() => setNewDropdownOpen(!newDropdownOpen)}
            className="flex items-center space-x-3 px-5 py-3.5 rounded-2xl bg-[#37393e] hover:bg-[#43464c] text-white shadow-lg hover:shadow-xl font-semibold text-sm transition-all active:scale-[0.98] border border-[#484b52] cursor-pointer"
          >
            {/* Google 4-Color Plus Icon */}
            <svg className="w-6 h-6" viewBox="0 0 36 36">
              <path fill="#4285F4" d="M16 16v14h4V16h14v-4H20V2h-4v10H2v4h14z"/>
              <path fill="#FBBC05" d="M30 16H20l-4-4h14z"/>
              <path fill="#34A853" d="M16 30V16h4l-4 14z"/>
              <path fill="#EA4335" d="M16 2v14l-4-4V2z"/>
            </svg>
            <span className="font-bold text-white tracking-wide">New</span>
          </button>

          {/* New Dropdown Menu */}
          {newDropdownOpen && (
            <div
              className="absolute left-1 top-16 w-60 bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl py-2 z-50 text-xs font-medium animate-in fade-in duration-100 font-sans"
              onClick={() => setNewDropdownOpen(false)}
            >
              <button
                onClick={onOpenNewFolder}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-zinc-100 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-[#8ab4f8]" />
                <span className="font-semibold">New folder</span>
              </button>

              <div className="border-t border-[#3c4043] my-1" />

              <button
                onClick={onOpenUpload}
                className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-zinc-100 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-[#81c995]" />
                <span className="font-semibold">Upload image & compress</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation List - Google Material 3 Pill Selection */}
        <nav className="space-y-1 text-xs font-semibold pr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-left transition-all ${
                  isActive
                    ? 'bg-[#283446] text-[#8ab4f8] font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-[#1e1f20]'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon
                    className="w-4 h-4 transition-colors"
                    style={{ color: isActive ? '#8ab4f8' : item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          <div className="border-t border-[#2d3135] my-3 pr-2" />

          {/* Cloudflare R2 Sync Navigation */}
          <button
            onClick={onOpenStorage}
            className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-full text-left text-zinc-300 hover:text-white hover:bg-[#1e1f20] transition-all font-semibold"
          >
            <Database className="w-4 h-4 text-[#22d3ee]" />
            <span>Cloudflare R2 Bucket</span>
          </button>

          {/* Storage Plans */}
          <button
            onClick={onOpenPricing}
            className="w-full flex items-center space-x-3.5 px-4 py-2.5 rounded-full text-left text-zinc-300 hover:text-white hover:bg-[#1e1f20] transition-all font-semibold"
          >
            <CreditCard className="w-4 h-4 text-[#fbbc04]" />
            <span>Storage Plans</span>
          </button>
        </nav>

      </div>

      {/* Storage Meter Widget (Google One Multi-Color Style) */}
      <div className="p-4 rounded-3xl bg-[#1e1f20] border border-[#2d3135] space-y-2.5 mr-2 shadow-sm">
        <div className="flex items-center space-x-2 text-zinc-200 font-bold text-xs">
          <Cloud className="w-4 h-4 text-[#8ab4f8]" />
          <span>Storage</span>
        </div>

        {/* Google One Rainbow Bar */}
        <div className="w-full h-1.5 bg-[#2d3135] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]"
            style={{ width: `${Math.max(8, Math.min(100, storagePct))}%` }}
          />
        </div>

        <p className="text-[11px] text-zinc-400 font-mono">
          {storageUsed} MB of {storageTotal} MB used
        </p>

        <button
          onClick={onOpenPricing}
          className="w-full mt-1 py-1.5 px-3 rounded-full border border-[#4285F4]/40 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#8ab4f8] text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>Get more storage</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </aside>
  );
}
