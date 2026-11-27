import React, { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Info,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  Cloud,
  SlidersHorizontal,
  HardDrive,
  Settings,
  ShieldCheck
} from 'lucide-react';

export default function DriveHeader({
  search,
  setSearch,
  viewMode,
  setViewMode,
  showDetails,
  setShowDetails,
  user,
  onOpenAuth,
  onOpenAccount,
  onOpenStorage,
  onOpenPricing,
  onLogout,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-[#131314] px-4 sm:px-6 flex items-center justify-between select-none shrink-0 z-30">
      
      {/* Left: Google Drive Brand Logo */}
      <div className="flex items-center space-x-3 w-64">
        {/* Authentic Google Drive Triangle Logo */}
        <div className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-105 cursor-pointer">
          <svg className="w-8 h-8 drop-shadow-md" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-xl tracking-tight text-white">
            PixelVault
          </span>
          <span className="text-zinc-400 font-normal text-base">Drive</span>
        </div>
      </div>

      {/* Center: Google Drive Pill Search Bar */}
      <div className="flex-1 max-w-2xl px-4 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8ab4f8] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in Drive..."
            className="w-full pl-11 pr-11 py-2.5 bg-[#282a2d] hover:bg-[#313438] focus:bg-[#1e1f20] border border-transparent focus:border-[#4285F4] rounded-full text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none transition-all shadow-sm focus:ring-2 focus:ring-[#4285F4]/30"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          ) : (
            <div className="absolute right-4 flex items-center space-x-1.5 text-zinc-400 pointer-events-none">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: View Switcher, Info Drawer, User Profile */}
      <div className="flex items-center space-x-2.5">
        
        {/* View Switcher: Grid vs List */}
        <div className="flex items-center bg-[#282a2d] p-1 rounded-full text-zinc-300 border border-[#3c4043]/50 shadow-inner">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'grid'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#383b40]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={`p-1.5 rounded-full transition-all ${
              viewMode === 'list'
                ? 'bg-[#4285F4] text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#383b40]'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Info (i) Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          title="Details"
          className={`p-2 rounded-full transition-all ${
            showDetails
              ? 'bg-[#283446] text-[#8ab4f8] ring-1 ring-[#4285F4]/40'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-[#282a2d]'
          }`}
        >
          <Info className="w-5 h-5" />
        </button>

        {/* User Account / Sign In with Google Rainbow Avatar Ring */}
        {user ? (
          <div className="relative pl-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] hover:scale-105 transition-all shadow-md focus:outline-none"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover bg-[#131314]"
              />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl py-2 z-50 text-xs animate-in fade-in duration-100 font-sans"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-4 py-3 border-b border-[#3c4043] flex items-center space-x-3">
                  <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full bg-[#131314]"
                    />
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-zinc-100 truncate text-sm">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4285F4]/20 text-[#8ab4f8] border border-[#4285F4]/40">
                      {user.plan?.name || 'Free Tier'}
                    </span>
                  </div>
                </div>

                <div className="py-1.5">
                  <button
                    onClick={onOpenAccount}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-zinc-200 transition-colors"
                  >
                    <User className="w-4 h-4 text-[#8ab4f8]" />
                    <span>Google Drive Storage Account</span>
                  </button>

                  <button
                    onClick={onOpenStorage}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-cyan-300 transition-colors"
                  >
                    <HardDrive className="w-4 h-4 text-[#22d3ee]" />
                    <span>Cloudflare R2 Bucket Mirror</span>
                  </button>

                  <button
                    onClick={onOpenPricing}
                    className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-[#fbbc04] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-[#fbbc04]" />
                    <span>Upgrade Storage (Google One)</span>
                  </button>
                </div>

                <div className="border-t border-[#3c4043] my-1" />

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 text-left flex items-center space-x-3 hover:bg-[#282a2d] text-[#f28b82] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => onOpenAuth('login')}
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#4285F4] hover:bg-[#1b66c9] text-white transition-all shadow-md hover:shadow-lg"
          >
            Sign in
          </button>
        )}

      </div>

    </header>
  );
}
