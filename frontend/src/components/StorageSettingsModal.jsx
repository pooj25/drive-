import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  ShieldCheck,
  Server,
  Zap
} from 'lucide-react';
import { storageApi } from '../api';

export default function StorageSettingsModal({ isOpen, onClose }) {
  const [status, setStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setTestResult(null);
    }
  }, [isOpen]);

  const loadStatus = async () => {
    try {
      const res = await storageApi.getStatus();
      setStatus(res.data);
    } catch (err) {
      console.error('Error getting storage status:', err);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await storageApi.testR2();
      setTestResult({ success: true, message: res.data.message });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.response?.data?.message || 'Connection test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#1e1f20] border border-[#3c4043] rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[88vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#282a2d] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-[#22d3ee] shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Storage Architecture</h3>
            <p className="text-xs text-zinc-400">Local NVMe Disk &bull; Cloudflare R2 Object Storage</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Storage Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Local Storage */}
            <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2 font-mono shadow-sm">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-[#8ab4f8]" />
                  <span>LOCAL DISK</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#283446] text-[#8ab4f8] font-bold border border-[#4285f4]/30">
                  Active
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] font-sans">
                Stored in <code className="text-zinc-200">storage/app/public</code> and served via streaming endpoint.
              </p>
              <div className="pt-2 border-t border-[#2d3135] flex justify-between text-zinc-300 text-[11px]">
                <span className="text-zinc-400 font-sans">Files Stored:</span>
                <span className="font-bold text-white">{status?.statistics?.local_images_count ?? 0}</span>
              </div>
              <div className="flex justify-between text-zinc-300 text-[11px]">
                <span className="text-zinc-400 font-sans">Disk Size:</span>
                <span className="font-bold text-[#81c995]">{status?.statistics?.local_storage_mb ?? 0} MB</span>
              </div>
            </div>

            {/* Cloudflare R2 */}
            <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2 font-mono shadow-sm">
              <div className="flex items-center justify-between font-bold text-zinc-200">
                <span className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-[#22d3ee]" />
                  <span>CLOUDFLARE R2</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  status?.r2?.configured
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {status?.r2?.configured ? 'Configured' : 'Ready for keys'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] font-sans">
                S3-compatible zero-egress bucket: <code className="text-cyan-300">{status?.r2?.bucket || 'pixelvault-gallery'}</code>
              </p>
              <div className="pt-2 border-t border-[#2d3135] flex justify-between text-zinc-300 text-[11px]">
                <span className="text-zinc-400 font-sans">R2 Files:</span>
                <span className="font-bold text-white">{status?.statistics?.r2_images_count ?? 0}</span>
              </div>
              <div className="flex justify-between text-zinc-300 text-[11px]">
                <span className="text-zinc-400 font-sans">Cloud Size:</span>
                <span className="font-bold text-cyan-400">{status?.statistics?.r2_storage_mb ?? 0} MB</span>
              </div>
            </div>

          </div>

          {/* Test Live Connection */}
          <div className="p-4 rounded-2xl bg-[#131314] border border-[#2d3135] flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-200">Cloudflare R2 Live Ping</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Verify authentication, endpoint connectivity, and bucket write capability.
              </p>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 rounded-full bg-[#282a2d] hover:bg-[#383b40] text-zinc-100 font-semibold text-xs border border-[#3c4043] transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#22d3ee] ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Pinging...' : 'Test Ping'}</span>
            </button>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center space-x-2 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-[#81c995] shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#fbbc04] shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Environment Guide */}
          <div className="p-4 rounded-2xl bg-[#18191a] border border-[#2d3135] space-y-2">
            <p className="font-bold text-zinc-200 flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#8ab4f8]" />
              <span>Cloudflare R2 Configuration (.env)</span>
            </p>
            <p className="text-zinc-400 text-[11px]">
              Add your credentials in <code className="text-zinc-200 bg-[#131314] px-1.5 py-0.5 rounded">backend/.env</code>:
            </p>
            <pre className="p-3 rounded-xl bg-[#131314] text-[11px] font-mono text-zinc-300 overflow-x-auto border border-[#2d3135]">
              CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key{'\n'}
              CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key{'\n'}
              CLOUDFLARE_R2_BUCKET=pixelvault-gallery{'\n'}
              CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id{'\n'}
              CLOUDFLARE_R2_URL=https://pub-xxxx.r2.dev
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
