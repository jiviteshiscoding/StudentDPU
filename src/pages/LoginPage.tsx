import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

import { ProjexLogo } from '../components/common/ProjexLogo';

interface LoginPageProps {
  onLoginSuccess: (isLeader: boolean) => void;
  onBackToIntro: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToIntro,
  isDark,
  onToggleTheme,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email format (e.g., alex.rivera@projex.edu).';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long for demo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Determine role from email or default to leader
      const isLeader = !email.toLowerCase().includes('maya');
      onLoginSuccess(isLeader);
    }
  };

  const handleQuickDemo = (role: 'leader' | 'member') => {
    if (role === 'leader') {
      setEmail('alex.rivera@projex.edu');
      setPassword('demo-leader-pass');
      onLoginSuccess(true);
    } else {
      setEmail('maya.chen@projex.edu');
      setPassword('demo-member-pass');
      onLoginSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200 flex flex-col justify-between p-6">
      {/* Top Bar with Back Link & Theme Switcher */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={onBackToIntro}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to introduction</span>
        </button>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6 my-auto transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <ProjexLogo variant="mark" size={48} animated={false} className="text-[#1E60FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Log in to PROJEX
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Student team workspace and AI project coordination
          </p>
        </div>

        {/* Demo-Only Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#1E60FF] dark:text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span>Prototype Demonstration Mode</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            This frontend prototype operates with local state. No real backend credentials are sent or stored.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('leader')}
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-[11px] font-bold text-[#1E60FF] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Enter as Leader</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('member')}
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Enter as Member</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                placeholder="alex.rivera@projex.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all ${
                  errors.email 
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/50' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1E60FF] focus:bg-white dark:focus:bg-slate-900'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#1E60FF] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all ${
                  errors.password 
                    ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/50' 
                    : 'border-slate-200 dark:border-slate-700 focus:border-[#1E60FF] focus:bg-white dark:focus:bg-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#1E60FF] focus:ring-blue-400 cursor-pointer accent-[#1E60FF]"
            />
            <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              Remember my demo session
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#1E60FF] hover:bg-[#1A53DE] active:scale-[0.99] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            Log in to Prototype
          </button>
        </form>
      </div>

      {/* Forgot Password Simulated Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Demo Password Reset</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In this frontend prototype, authentication is simulated. Any demo password (e.g., <code>demo123</code>) or the quick demo buttons will grant entry as Alex Rivera or Maya Chen.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#1E60FF] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Note */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        PROJEX Workspace · Frontend Prototype
      </div>
    </div>
  );
};
