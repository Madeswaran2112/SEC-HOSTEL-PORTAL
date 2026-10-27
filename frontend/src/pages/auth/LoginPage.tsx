import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import campusBg from '../../assets/sec-hostel-login-bg.png';
import buildingLogo from '../../assets/sec-hostel-building.png';
import {
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedId = identifier.trim();
    if (!trimmedId || !password) {
      setError('Please enter both Register Number / ID and Password');
      return;
    }

    const success = await login({ email: trimmedId, password });
    if (success) {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') {
        navigate('/admin');
      } else if (user?.role === 'ROLE_GIRLS_STUDENT' || user?.gender === 'FEMALE') {
        navigate('/girls');
      } else if (user?.role === 'ROLE_BOYS_STUDENT' || user?.gender === 'MALE') {
        navigate('/boys');
      } else {
        navigate('/boys');
      }
    }
  };

  return (
    <div
      className="sec-login-bg min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans select-none"
      style={{
        backgroundImage: `url('/sec-hostel-login-bg.png'), url(${campusBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Background Soft Natural Lighting Gradient (Non-intrusive) */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-blue-950/25 pointer-events-none" />

      {/* Layered Vibrant Blue Wave Shapes at Bottom-Left */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Wave Layer 1 (Deep Navy/Royal Blue Base) */}
        <svg
          className="absolute bottom-0 left-0 w-full md:w-[78%] h-[200px] sm:h-[260px] md:h-[310px] text-blue-900/85"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,400 L0,180 C260,270 540,160 1000,220 L1000,400 Z"
          />
        </svg>

        {/* Wave Layer 2 (Primary Electric Blue Ribbon) */}
        <svg
          className="absolute bottom-0 left-0 w-full md:w-[68%] h-[180px] sm:h-[230px] md:h-[275px] text-blue-600/95"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,400 L0,230 C240,310 520,195 900,260 L900,400 Z"
          />
        </svg>

        {/* Wave Layer 3 (Cyan / Sky Blue Upper Accent Curve) */}
        <svg
          className="absolute bottom-0 left-0 w-full md:w-[55%] h-[150px] sm:h-[190px] md:h-[235px] text-sky-400/90"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,400 L0,280 C200,335 440,240 760,290 L760,400 Z"
          />
        </svg>
      </div>

      {/* Soft Foreground Foliage Corner Accents */}
      <div className="absolute top-1/4 -left-12 w-44 h-44 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 -left-8 w-56 h-56 rounded-full bg-emerald-700/25 blur-2xl pointer-events-none" />
      <div className="absolute bottom-6 -right-12 w-72 h-72 rounded-full bg-emerald-800/20 blur-3xl pointer-events-none" />

      {/* TOP HEADER / BRANDING WITH CIRCULAR BUILDING PHOTO LOGO */}
      <header className="relative z-10 w-full px-6 sm:px-10 lg:px-16 pt-6 pb-2 flex items-center justify-between">
        {/* Top-Left: Circular Logo & Text Branding */}
        <div className="flex items-center gap-3.5 sm:gap-4.5">
          <img
            src={buildingLogo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sec-hostel-building.png';
            }}
            alt="SEC Hostel Building Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-xl shrink-0"
          />
          <div>
            {/* 1. Main Title: SEC HOSTEL (WHITE #FFFFFF) */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none drop-shadow-md">
              SEC HOSTEL
            </h1>

            {/* 2. College Name: SAVEETHA ENGINEERING COLLEGE (RAINBOW / MULTICOLOR GRADIENT) */}
            <p
              className="text-xs sm:text-sm font-black tracking-wider uppercase mt-1 drop-shadow-sm bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #ec4899 0%, #ef4444 14%, #f97316 28%, #eab308 42%, #22c55e 56%, #06b6d4 70%, #3b82f6 84%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SAVEETHA ENGINEERING COLLEGE
            </p>

            {/* 3. Subtitle: HOSTEL MANAGEMENT PORTAL (BLACK #111111) */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-3 sm:w-5 h-[1.5px] bg-[#111111]/70" />
              <p className="text-[10px] sm:text-xs font-bold text-[#111111] tracking-[0.2em] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                HOSTEL MANAGEMENT PORTAL
              </p>
              <span className="w-3 sm:w-5 h-[1.5px] bg-[#111111]/70" />
            </div>
          </div>
        </div>

        {/* Top-Right: Motto & Tagline */}
        <div className="hidden sm:flex items-center gap-2.5 text-right drop-shadow-md">
          <div className="w-1 h-9 bg-blue-500 rounded-full" />
          <div className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-orange-400 leading-tight uppercase">
            <div>A Safe Stay</div>
            <div className="text-blue-800 font-semibold">A Bright Tomorrow</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA: Centered on mobile, aligned to the right on desktop */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6  sm:px-10 lg:px-16 py-6 sm:py-10 flex items-center justify-end">
        {/* Login Card */}
        <div className="w-full max-w-[420px] my-auto">
          <div className="bg-white/92 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.22)] border border-white/80 p-7 sm:p-9 transition duration-300">
            {/* Card Header */}
            <div className="text-center mb-6">
              <span className="text-xs font-medium text-slate-500">
                Welcome to
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-600 tracking-tight mt-0.5">
                SEC HOSTEL
              </h2>
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider mt-0.5">
                Saveetha Engineering College
              </p>
              <div className="w-8 h-1 bg-blue-600 rounded-full mx-auto my-2.5" />
              <p className="text-xs font-medium text-slate-400">
                Login to access your hostel portal
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-xl text-xs font-semibold text-red-700 shadow-2xs"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Register Number / ID
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 211421104001 or Email"
                    className="block w-full pl-10 pr-4 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-white/90 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition cursor-pointer"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>LOGIN</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Card Footer Motto & Registration */}
            <div className="text-center pt-5 border-t border-slate-100 mt-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                DISCIPLINE &nbsp;|&nbsp; COMFORT &nbsp;|&nbsp; COMMUNITY
              </p>
              <p className="text-xs text-slate-500 mt-2.5 font-medium">
                New Student?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BAR: Location on Bottom-Left, Dots on Bottom-Right */}
      <footer className="relative z-10 w-full px-6 sm:px-10 lg:px-16 py-4 flex items-center justify-between">
        {/* Bottom-Left: Location Pin */}
        <div className="flex items-center gap-2.5 text-white drop-shadow-md">
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold leading-tight">
              Saveetha Engineering College
            </div>
            <div className="text-[10px] sm:text-xs text-blue-100 font-medium">
              Thandalam, Chennai, Tamil Nadu
            </div>
          </div>
        </div>

        {/* Bottom-Right: 3 Carousel Dots */}
        <div className="flex items-center gap-1.5 opacity-90 drop-shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-white/50" />
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
