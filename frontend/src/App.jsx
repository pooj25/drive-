import React, { useState, useEffect } from 'react';
import DriveHeader from './components/DriveHeader';
import DriveSidebar from './components/DriveSidebar';
import DriveBreadcrumb from './components/DriveBreadcrumb';
import DriveFolderList from './components/DriveFolderList';
import DriveFileList from './components/DriveFileList';
import DriveDetailsDrawer from './components/DriveDetailsDrawer';
import UploadZone from './components/UploadZone';
import NewFolderModal from './components/NewFolderModal';
import MoveToFolderModal from './components/MoveToFolderModal';
import SubscriptionPlans from './components/SubscriptionPlans';
import StorageSettingsModal from './components/StorageSettingsModal';
import AccountModal from './components/AccountModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import ImageModal from './components/ImageModal';
import { authApi, foldersApi, imagesApi } from './api';
import { Trash2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Google Drive Navigation State
  const [activeSection, setActiveSection] = useState('drive'); // 'drive', 'starred', 'recent', 'trash'
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Search, Sort, Filter
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [diskFilter, setDiskFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Selection & Panels
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [moveModalImage, setMoveModalImage] = useState(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [storageModalOpen, setStorageModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('google');

  // Initial Auth Check
  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setImages([]);
      setFolders([]);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch data whenever user, section, folder, search, sort, or disk filter changes
  useEffect(() => {
    if (user) {
      loadFolders();
      loadImages();
    }
  }, [user, activeSection, currentFolder, search, sort, diskFilter]);

  const checkAuth = async () => {
    const token = localStorage.getItem('pixelvault_token');
    if (!token) {
      setUser(null);
      setAuthChecking(false);
      return;
    }

    try {
      const res = await authApi.getUser();
      setUser(res.data.user);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('pixelvault_token');
        setUser(null);
      } else {
        console.warn('Backend server may be restarting or unreachable:', err.message);
      }
    } finally {
      setAuthChecking(false);
    }
  };

  const loadFolders = async () => {
    try {
      const res = await foldersApi.list(currentFolder ? currentFolder.id : null);
      setFolders(res.data.folders || []);
    } catch (err) {
      console.error('Error loading folders:', err);
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      const params = {
        section: activeSection,
        search,
        sort,
        disk: diskFilter || undefined,
        per_page: 60,
      };

      if (activeSection === 'drive') {
        params.folder_id = currentFolder ? currentFolder.id : 'root';
      }

      const res = await imagesApi.list(params);
      const list = res.data.images.data || [];
      setImages(list);
      setStats(res.data.stats || null);

      // Auto select first image if nothing selected or update selected reference
      if (selectedImage) {
        const updated = list.find((i) => i.id === selectedImage.id);
        setSelectedImage(updated || list[0] || null);
      } else if (list.length > 0) {
        setSelectedImage(list[0]);
      }
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (name, color) => {
    await foldersApi.create(name, currentFolder ? currentFolder.id : null, color);
    loadFolders();
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Delete this folder? Its images will be moved to My Drive.')) {
      await foldersApi.delete(folderId);
      loadFolders();
      loadImages();
    }
  };

  const handleRenameFolder = async (folder) => {
    const newName = window.prompt('Rename folder to:', folder.name);
    if (newName && newName.trim()) {
      await foldersApi.update(folder.id, newName.trim(), folder.color);
      loadFolders();
    }
  };

  const handleToggleStar = async (id) => {
    try {
      await imagesApi.toggleStar(id);
      loadImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToTrash = async (id) => {
    try {
      await imagesApi.moveToTrash(id);
      loadImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await imagesApi.restore(id);
      loadImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm('Permanently delete this image from disk? This cannot be undone.')) {
      try {
        await imagesApi.delete(id);
        loadImages();
        refreshUser();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEmptyTrash = async () => {
    if (window.confirm('Permanently delete all items in trash?')) {
      try {
        await imagesApi.emptyTrash();
        loadImages();
        refreshUser();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMoveFile = async (imageId, folderId) => {
    await imagesApi.moveToFolder(imageId, folderId);
    loadImages();
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getUser();
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {}
    localStorage.removeItem('pixelvault_token');
    setUser(null);
    setImages([]);
    setFolders([]);
  };

  // 1. Initial Loading Screen
  if (authChecking) {
    return (
      <div className="h-screen w-screen bg-[#131314] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-12 h-12">
          <svg className="w-12 h-12 drop-shadow-md animate-pulse" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </div>
        <div className="flex items-center space-x-2 text-zinc-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-ping" />
          <span>Starting PixelVault Drive...</span>
        </div>
      </div>
    );
  }

  // 2. Dedicated Sign In / Sign Up Login Page when unauthenticated
  if (!user) {
    return (
      <AuthPage
        initialMode="login"
        onAuthSuccess={(userData) => {
          setUser(userData);
          loadFolders();
          loadImages();
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-[#131314] text-[#e3e3e3] flex flex-col overflow-hidden font-sans select-none">
      
      {/* 1. Google Drive Top Navigation Header */}
      <DriveHeader
        search={search}
        setSearch={setSearch}
        viewMode={viewMode}
        setViewMode={setViewMode}
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        user={user}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode);
          setAuthModalOpen(true);
        }}
        onOpenAccount={() => setAccountModalOpen(true)}
        onOpenStorage={() => setStorageModalOpen(true)}
        onOpenPricing={() => setPricingModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Main Drive Work Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Google Drive Sidebar */}
        <DriveSidebar
          activeSection={activeSection}
          setActiveSection={(sec) => {
            setActiveSection(sec);
            setCurrentFolder(null); // Return to root of that section
          }}
          user={user}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenNewFolder={() => setNewFolderModalOpen(true)}
          onOpenPricing={() => setPricingModalOpen(true)}
          onOpenStorage={() => setStorageModalOpen(true)}
        />

        {/* Center: Drive Workspace - Google Drive Elevated Canvas Card */}
        <main className="flex-1 bg-[#1e1f20] border border-[#2d3135] rounded-3xl my-2 mr-2 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between shadow-lg">
          
          <div className="space-y-5">
            
            {/* Breadcrumb & Filters */}
            <DriveBreadcrumb
              activeSection={activeSection}
              currentFolder={currentFolder}
              onNavigateRoot={() => setCurrentFolder(null)}
              diskFilter={diskFilter}
              setDiskFilter={setDiskFilter}
              sort={sort}
              setSort={setSort}
            />

            {/* Trash Action Header */}
            {activeSection === 'trash' && images.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between text-xs animate-in fade-in">
                <span className="text-red-200">
                  Items in trash are soft-deleted. You can restore them or empty permanently.
                </span>
                <button
                  onClick={handleEmptyTrash}
                  className="px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Empty trash</span>
                </button>
              </div>
            )}

            {/* Folders Section (Only shown in My Drive) */}
            {activeSection === 'drive' && (
              <DriveFolderList
                folders={folders}
                currentFolder={currentFolder}
                onOpenFolder={(f) => setCurrentFolder(f)}
                onDeleteFolder={handleDeleteFolder}
                onRenameFolder={handleRenameFolder}
              />
            )}

            {/* Files Section (Grid or List View) */}
            <DriveFileList
              images={images}
              viewMode={viewMode}
              selectedImage={selectedImage}
              onSelectImage={(img) => setSelectedImage(img)}
              onToggleStar={handleToggleStar}
              onMoveToTrash={handleMoveToTrash}
              onRestore={handleRestore}
              onPermanentDelete={handlePermanentDelete}
              onOpenMoveModal={(img) => setMoveModalImage(img)}
              isTrashSection={activeSection === 'trash'}
            />

          </div>

          {/* Footer Bar */}
          <div className="pt-6 text-center sm:text-left text-[11px] font-mono text-zinc-400 flex flex-col sm:flex-row items-center justify-between border-t border-[#2d3135] mt-8">
            <span className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
              <span>PixelVault Drive &bull; PHP Intervention Image & Cloudflare R2</span>
            </span>
            <span className="mt-2 sm:mt-0 px-2.5 py-1 rounded-full bg-[#131314] border border-[#2d3135] text-zinc-300">
              {stats?.total_count ?? 0} files &bull; <span className="text-[#81c995] font-semibold">{stats?.total_saved_mb ?? 0} MB</span> space saved
            </span>
          </div>

        </main>

        {/* Right: Google Drive Details & Compression Drawer */}
        {showDetails && (
          <DriveDetailsDrawer
            image={selectedImage}
            onClose={() => setShowDetails(false)}
            onToggleStar={handleToggleStar}
            onMoveToTrash={handleMoveToTrash}
            onOpenMoveModal={(img) => setMoveModalImage(img)}
            onOpenLightbox={(img) => setLightboxImage(img)}
          />
        )}

      </div>

      {/* 3. Modals */}

      {/* Upload Modal with Compression Quality Controls */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-all"
            >
              ✕
            </button>
            <UploadZone
              user={user}
              onUploadSuccess={() => {
                loadImages();
                refreshUser();
                setUploadModalOpen(false);
              }}
              onNavigatePricing={() => {
                setUploadModalOpen(false);
                setPricingModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={newFolderModalOpen}
        onClose={() => setNewFolderModalOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      {/* Move File to Folder Modal */}
      <MoveToFolderModal
        isOpen={Boolean(moveModalImage)}
        onClose={() => setMoveModalImage(null)}
        image={moveModalImage}
        folders={folders}
        onMove={handleMoveFile}
      />

      {/* Subscription Plans Modal (Google One style) */}
      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPricingModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-all"
            >
              ✕
            </button>
            <SubscriptionPlans
              user={user}
              onSubscriptionUpdated={() => {
                refreshUser();
                setPricingModalOpen(false);
              }}
              onOpenAuth={(mode) => {
                setPricingModalOpen(false);
                setAuthModalMode(mode);
                setAuthModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Cloudflare R2 Management Modal */}
      <StorageSettingsModal
        isOpen={storageModalOpen}
        onClose={() => setStorageModalOpen(false)}
      />

      {/* Account Profile & Storage Quota Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        user={user}
        onClose={() => setAccountModalOpen(false)}
        onSubscriptionChanged={() => {
          refreshUser();
        }}
      />

      {/* Google OAuth & Email Sign-in Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          loadImages();
          loadFolders();
        }}
      />

      {/* Lightbox Preview */}
      <ImageModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
        onDelete={(id) => {
          handlePermanentDelete(id);
          setLightboxImage(null);
        }}
      />

    </div>
  );
}
