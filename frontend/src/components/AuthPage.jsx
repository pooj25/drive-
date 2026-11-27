import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { authApi } from '../api';

export default function AuthPage({ onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('pixelvault_last_email') || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const resetForm = () => {
    setError('');
    setName('');
    setPassword('');
    setPasswordConfirmation('');
  };

  const handleGoogleSignIn = async (customEmail = null, customName = null) => {
    setLoading(true);
    setError('');
    try {
      const targetEmail = customEmail || email || localStorage.getItem('pixelvault_last_email');
      if (!targetEmail || !targetEmail.trim()) {
        setError('Please enter your Google / Gmail address in the field below first.');
        setLoading(false);
        return;
      }

      const gEmail = targetEmail.trim().toLowerCase();
      const gName = customName || name || (gEmail.split('@')[0]);

      const res = await authApi.googleAuth({
        email: gEmail,
        name: gName,
        google_id: 'google_' + Math.abs(hashCode(gEmail)),
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(gEmail)}`,
      });

      localStorage.setItem('pixelvault_token', res.data.token);
      localStorage.setItem('pixelvault_last_email', gEmail);
      onAuthSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('pixelvault_token', res.data.token);
      localStorage.setItem('pixelvault_last_email', email.trim().toLowerCase());
      onAuthSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(name, email, password, passwordConfirmation);
      localStorage.setItem('pixelvault_token', res.data.token);
      localStorage.setItem('pixelvault_last_email', email.trim().toLowerCase());
      onAuthSuccess(res.data.user);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstErr = Object.values(errors)[0][0];
        setError(firstErr);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  return (
    <div className="min-h-screen w-screen bg-[#131314] text-[#e3e3e3] flex flex-col justify-between font-sans select-none overflow-y-auto">
      
      {/* Top Simple Brand Header */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-[#2d3135]/60 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg className="w-7 h-7 drop-shadow-md" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-lg tracking-tight text-white">PixelVault</span>
            <span className="text-zinc-400 font-normal text-base">Drive</span>
          </div>
        </div>

        {/* Switch Mode Pill in Header */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400 hidden sm:inline">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              resetForm();
            }}
            className="px-4 py-1.5 rounded-full border border-[#4285F4]/40 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#8ab4f8] font-bold transition-all cursor-pointer"
          >
            {mode === 'login' ? 'Create account' : 'Sign in'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="w-full max-w-md bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              
              {/* Google One Rainbow Top Highlight Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

              {/* Card Header */}
              <div className="text-center space-y-2 mb-6 pt-1">
                <div className="w-12 h-12 mx-auto flex items-center justify-center">
                  <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {mode === 'login' ? 'Sign in to PixelVault' : 'Create your account'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {mode === 'login'
                    ? 'to continue to PixelVault Drive'
                    : 'Get started with 150 MB free compressed storage'}
                </p>
              </div>

              {/* Mode Tabs (Sign In / Sign Up) */}
              <div className="grid grid-cols-2 p-1 bg-[#131314] rounded-2xl border border-[#2d3135] mb-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    resetForm();
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#4285F4] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    resetForm();
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[#4285F4] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-start space-x-2 text-xs text-red-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google OAuth 2.0 Sign In Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleSignIn()}
                  className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-3 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {/* Google 4-Color "G" Icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#2d3135]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
                    <span className="bg-[#1e1f20] px-3 text-zinc-500">Or use email credentials</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                  
                  {/* Name field (for Sign Up) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Rivera"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#131314] border border-[#3c4043] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#131314] border border-[#3c4043] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Password
                      </label>
                      {mode === 'login' && (
                        <span className="text-[10px] text-[#8ab4f8] hover:underline cursor-pointer">
                          Forgot password?
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#131314] border border-[#3c4043] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field (for Sign Up) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordConfirmation}
                          onChange={(e) => setPasswordConfirmation(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#131314] border border-[#3c4043] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {/* Remember me (for Login) */}
                  {mode === 'login' && (
                    <div className="flex items-center space-x-2 pt-1 text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-[#3c4043] text-[#4285F4] focus:ring-0 bg-[#131314]"
                      />
                      <label htmlFor="rememberMe" className="cursor-pointer">
                        Stay signed in on this browser
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-[#4285F4] hover:bg-[#1b66c9] text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40"
                  >
                    <span>
                      {loading
                        ? 'Verifying...'
                        : mode === 'login'
                        ? 'Sign In'
                        : 'Create Free Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </form>

              </div>

            </div>
          </div>
        </main>



    </div>
  );
}
