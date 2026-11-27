import React, { useState } from 'react';
import {
  Images,
  UploadCloud,
  CreditCard,
  Cloud,
  LogOut,
  User,
  ChevronDown,
  Layers,
  Database
} from 'lucide-react';

export default function Navbar({
  user,
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenAccount,
  onOpenStorage,
  onLogout,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const storageUsed = user?.storage?.used_mb || 0;
  const storageTotal = user?.storage?.total_mb || 100;
  const storagePct = user?.storage?.percentage || 0;
  const planSlug = user?.plan?.slug || 'free';
  const planName = user?.plan?.name || 'Free Plan';

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - Minimal & Modern */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentTab('gallery')}
          >
            <div className="w-9 h-9 rounded-lg bg-zinc-100 text-zinc-950 flex items-center justify-center font-black shadow-sm group-hover:bg-white transition-colors">
              <Layers className="w-5 h-5 text-zinc-900" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-zinc-100 tracking-tight">
                  PixelVault
                </span>
                <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60 uppercase">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal hidden sm:block">
                Intervention Compression &bull; Cloudflare R2
              </p>
            </div>
          </div>

          {/* Navigation Tabs - Modern Segmented Control */}
          <nav className="hidden md:flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setCurrentTab('gallery')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'gallery'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <Images className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </button>

            <button
              onClick={() => setCurrentTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'upload'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => setCurrentTab('pricing')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'pricing'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Plans & Billing</span>
            </button>

            <button
              onClick={onOpenStorage}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-all"
            >
              <Cloud className="w-3.5 h-3.5 text-zinc-400" />
              <span>R2 Bucket</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            
            {user ? (
              <>
                {/* Storage Meter */}
                <div
                  onClick={onOpenAccount}
                  className="hidden lg:flex flex-col items-end cursor-pointer group"
                  title="Storage quota details"
                >
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {storageUsed} / {storageTotal} MB
                    </span>
                    <span className="font-semibold text-zinc-300">{storagePct}%</span>
                  </div>
                  <div className="w-24 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        storagePct > 90
                          ? 'bg-red-500'
                          : storagePct > 70
                          ? 'bg-amber-500'
                          : 'bg-zinc-300'
                      }`}
                      style={{ width: `${Math.min(100, storagePct)}%` }}
                    />
                  </div>
                </div>

                {/* Plan Badge */}
                <button
                  onClick={() => setCurrentTab('pricing')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                    planSlug === 'premium'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                      : planSlug === 'pro'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {planName}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs animate-in fade-in duration-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-3.5 py-2.5 border-b border-zinc-800">
                        <p className="font-semibold text-zinc-200 truncate">{user.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{user.email}</p>
                      </div>

                      <button
                        onClick={onOpenAccount}
                        className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Account & Subscription</span>
                      </button>

                      <button
                        onClick={onOpenStorage}
                        className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      >
                        <Database className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Cloudflare R2 Storage</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('pricing')}
                        className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-zinc-800 text-zinc-200 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Upgrade Plan</span>
                      </button>

                      <div className="border-t border-zinc-800 my-1" />

                      <button
                        onClick={onLogout}
                        className="w-full px-3.5 py-2 text-left flex items-center space-x-2.5 hover:bg-zinc-800 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('google')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-sm"
                >
                  Google Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-800 text-xs text-zinc-400">
          <button
            onClick={() => setCurrentTab('gallery')}
            className={`py-1 ${currentTab === 'gallery' ? 'text-zinc-100 font-bold' : ''}`}
          >
            Gallery
          </button>
          <button
            onClick={() => setCurrentTab('upload')}
            className={`py-1 ${currentTab === 'upload' ? 'text-zinc-100 font-bold' : ''}`}
          >
            Upload
          </button>
          <button
            onClick={() => setCurrentTab('pricing')}
            className={`py-1 ${currentTab === 'pricing' ? 'text-zinc-100 font-bold' : ''}`}
          >
            Pricing
          </button>
          <button
            onClick={onOpenStorage}
            className="py-1 text-zinc-400"
          >
            R2 Storage
          </button>
        </div>

      </div>
    </header>
  );
}
