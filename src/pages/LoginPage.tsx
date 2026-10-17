import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Moon,
  Loader2,
  CheckCircle2,
  Timer
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

import { ProjexLogo } from '../components/common/ProjexLogo';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------------------------------------------------------------------------
// Client-side rate limiter for Supabase Auth
// Prevents hitting Supabase's aggressive free-tier limits (≈4 emails/hr,
// limited sign-in attempts per minute). Tracks attempts in a sliding window
// and imposes a cooldown when the threshold is reached or when Supabase
// returns a 429 / rate-limit error.
// ---------------------------------------------------------------------------
const AUTH_RATE_LIMIT = 4;           // max attempts within the window
const AUTH_RATE_WINDOW_MS = 60_000;  // 60-second sliding window
const COOLDOWN_SECONDS = 60;         // cooldown duration when rate-limited
const SIGNUP_COOLDOWN_SECONDS = 120; // longer cooldown for sign-up (email send limits)

/** Detects whether a Supabase error message indicates rate limiting. */
function isRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('too many') ||
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('email rate limit') ||
    lower.includes('429') ||
    lower.includes('request limit') ||
    lower.includes('exceeded') ||
    lower.includes('throttle')
  );
}

interface LoginPageProps {
  onLoginSuccess: (isLeader: boolean, user?: User | null) => void;
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [redeemInviteCode, setRedeemInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [signupConfirmationSent, setSignupConfirmationSent] = useState(false);

  // ── Rate-limit state ──────────────────────────────────────────────────
  const attemptTimestamps = useRef<number[]>([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCoolingDown = cooldownRemaining > 0;

  /** Start a visible countdown that blocks further auth attempts. */
  const startCooldown = useCallback((seconds: number) => {
    // Clear any existing timer
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    setCooldownRemaining(seconds);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  /**
   * Returns `true` if the attempt is allowed, `false` if rate-limited.
   * Automatically prunes stale timestamps and triggers the cooldown UI.
   */
  const checkClientRateLimit = useCallback((): boolean => {
    const now = Date.now();
    // Prune timestamps outside the sliding window
    attemptTimestamps.current = attemptTimestamps.current.filter(
      ts => now - ts < AUTH_RATE_WINDOW_MS
    );

    if (attemptTimestamps.current.length >= AUTH_RATE_LIMIT) {
      const cooldownSec = authMode === 'signup' ? SIGNUP_COOLDOWN_SECONDS : COOLDOWN_SECONDS;
      startCooldown(cooldownSec);
      return false;
    }

    attemptTimestamps.current.push(now);
    return true;
  }, [authMode, startCooldown]);

  const validate = () => {
    const newErrors: { email?: string; password?: string; fullName?: string; auth?: string } = {};
    if (authMode === 'signup' && !fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email format (e.g., student@projex.edu).';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, auth: undefined }));

    if (!validate()) return;

    // If Supabase is configured, authenticate against Supabase Auth
    if (isSupabaseConfigured && supabase) {
      // ── Client-side rate-limit gate ──────────────────────────────
      if (isCoolingDown) {
        setErrors(prev => ({
          ...prev,
          auth: `Rate limit active. Please wait ${cooldownRemaining}s before trying again.`,
        }));
        return;
      }

      if (!checkClientRateLimit()) {
        const cooldownSec = authMode === 'signup' ? SIGNUP_COOLDOWN_SECONDS : COOLDOWN_SECONDS;
        setErrors(prev => ({
          ...prev,
          auth: `Too many attempts — please wait ${cooldownSec} seconds before trying again. This protects against Supabase rate limits.`,
        }));
        return;
      }
      // ─────────────────────────────────────────────────────────────

      setIsLoading(true);
      try {
        let authUser: User | null = null;

        if (authMode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

          if (error) {
            let friendlyMsg = error.message;

            // Detect rate-limit errors and auto-trigger cooldown
            if (isRateLimitError(error.message)) {
              const cooldownSec = SIGNUP_COOLDOWN_SECONDS;
              startCooldown(cooldownSec);
              friendlyMsg = `Supabase rate limit reached — too many sign-up attempts. A ${cooldownSec}-second cooldown has been applied. This is a Supabase free-tier restriction on confirmation emails (~4/hour).`;
            } else if (error.message.toLowerCase().includes('already registered')) {
              friendlyMsg = 'This email is already registered. Please sign in instead, or use "Forgot password" to reset.';
            }

            setErrors(prev => ({ ...prev, auth: friendlyMsg }));
            setIsLoading(false);
            return;
          }

          // Supabase requires email confirmation by default.
          // If session is null but user exists, email confirmation email was sent.
          if (data.user && !data.session) {
            setSignupConfirmationSent(true);
            setIsLoading(false);
            return;
          }

          authUser = data.user;
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

          if (error) {
            let friendlyMsg = error.message || 'Authentication failed. Please verify your credentials.';

            // Detect rate-limit errors and auto-trigger cooldown
            if (isRateLimitError(error.message)) {
              const cooldownSec = COOLDOWN_SECONDS;
              startCooldown(cooldownSec);
              friendlyMsg = `Too many login attempts — Supabase has rate-limited this account. A ${cooldownSec}-second cooldown has been applied. Please wait and try again.`;
            } else if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('invalid email or password')) {
              friendlyMsg = 'Invalid email or password. Double-check your credentials or use "Forgot password" to reset.';
            } else if (error.message.toLowerCase().includes('email not confirmed')) {
              friendlyMsg = 'Your email address is not confirmed yet. Please check your inbox for a confirmation email from PROJEX / Supabase.';
            }
            setErrors(prev => ({
              ...prev,
              auth: friendlyMsg,
            }));
            setIsLoading(false);
            return;
          }

          authUser = data.user;
        }

        if (authUser) {
          // If the user entered an invite code, redeem it now
          if (redeemInviteCode.trim()) {
            try {
              const { redeemProjectInvite } = await import('../lib/dataService');
              await redeemProjectInvite({ code: redeemInviteCode.trim() });
            } catch (invErr: any) {
              console.warn('[LoginPage] Invite redemption note:', invErr?.message);
            }
          }

          // Check role or default to member
          const isLeader = Boolean(
            authUser.email?.toLowerCase().includes('lead') ||
            authUser.email?.toLowerCase().includes('alex') ||
            authUser.user_metadata?.role === 'leader' ||
            authUser.user_metadata?.is_leader === true
          );
          onLoginSuccess(isLeader, authUser);
        }
      } catch (err: any) {
        setErrors(prev => ({
          ...prev,
          auth: err?.message || 'Network error occurred while connecting to authentication service.',
        }));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Fallback if Supabase is not configured (operates in pure demo mode)
    const isLeader = !email.toLowerCase().includes('maya');
    onLoginSuccess(isLeader, null);
  };

  // Quick Demo Buttons (Explicitly labeled demo mode - no Supabase read/write)
  const handleQuickDemo = (role: 'leader' | 'member') => {
    if (role === 'leader') {
      setEmail('alex.rivera@projex.edu');
      setPassword('demo-leader-pass');
      onLoginSuccess(true, null);
    } else {
      setEmail('maya.chen@projex.edu');
      setPassword('demo-member-pass');
      onLoginSuccess(false, null);
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

      {/* Email Confirmation Success Screen */}
      {signupConfirmationSent ? (
        <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6 my-auto transition-colors text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check your inbox!</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We've sent a confirmation email to{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click the link in the email to verify your account, then come back here and sign in.
              The link expires in 24 hours — check your spam folder if you don't see it.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-xs text-left space-y-1">
            <p className="font-semibold text-blue-700 dark:text-blue-300">Have a project invite code?</p>
            <p className="text-[11px] text-blue-600 dark:text-blue-400">
              After confirming your email, sign in and enter your invite code (PRJ-XXXX) in the login form to join your project automatically.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setSignupConfirmationSent(false);
                setAuthMode('signin');
                setPassword('');
              }}
              className="w-full py-3 bg-[#1E60FF] hover:bg-[#1A53DE] text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => setSignupConfirmationSent(false)}
              className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to sign up form
            </button>
          </div>
        </div>
      ) : (
      <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl space-y-6 my-auto transition-colors">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <ProjexLogo variant="mark" size={48} animated={false} className="text-[#1E60FF]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {authMode === 'signup' ? 'Create PROJEX Account' : 'Log in to PROJEX'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'signup' 
              ? 'Join student team workspaces and redeem project invites' 
              : 'Student team workspace and AI project coordination'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        {isSupabaseConfigured && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrors({});
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrors({});
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Auth Provider Indicator Badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>
            {isSupabaseConfigured 
              ? 'Supabase Auth Connected' 
              : 'Local Demo Mode (Supabase Not Configured)'}
          </span>
        </div>

        {/* Global Auth Error Banner */}
        {errors.auth && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Authentication note</span>
              <p className="text-[11px] leading-relaxed text-rose-600 dark:text-rose-300">
                {errors.auth}
              </p>
            </div>
          </div>
        )}

        {/* Rate Limit Cooldown Banner */}
        {isCoolingDown && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1 flex-1">
              <span className="font-bold">Rate limit cooldown active</span>
              <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                Too many authentication attempts detected. Please wait before trying again.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 bg-amber-200/60 dark:bg-amber-900/40 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.max(0, (cooldownRemaining / (authMode === 'signup' ? SIGNUP_COOLDOWN_SECONDS : COOLDOWN_SECONDS)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tabular-nums w-8 text-right">
                  {cooldownRemaining}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Demo-Only Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/60 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-[#1E60FF] dark:text-blue-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Simulated Demo Mode</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
              Offline Demo
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            Quick demo buttons bypass Supabase to preview the UI locally. They do not authenticate a real account or query database records.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('leader')}
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-[11px] font-bold text-[#1E60FF] dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Demo as Leader</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleQuickDemo('member')}
              className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Demo as Member</span>
            </button>
          </div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field (Sign Up Only) */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={isLoading}
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                  }}
                  placeholder="Alex Rivera"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all disabled:opacity-50 ${
                    errors.fullName 
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-100 dark:ring-rose-950/50' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-[#1E60FF] focus:bg-white dark:focus:bg-slate-900'
                  }`}
                />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.auth) {
                    setErrors(prev => ({ ...prev, email: undefined, auth: undefined }));
                  }
                }}
                placeholder="you@domain.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all disabled:opacity-50 ${
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
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.auth) {
                    setErrors(prev => ({ ...prev, password: undefined, auth: undefined }));
                  }
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all disabled:opacity-50 ${
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

          {/* Optional Project Invite Code */}
          {isSupabaseConfigured && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Have an invite code?</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={isLoading}
                  value={redeemInviteCode}
                  onChange={(e) => setRedeemInviteCode(e.target.value.toUpperCase())}
                  placeholder="PRJ-XXXX"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono tracking-wider outline-none focus:border-[#1E60FF] focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Enter the code sent by your project leader or received via Telegram bot.
              </p>
            </div>
          )}

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
              Remember my session
            </label>
          </div>

          {/* Submit Button with Loading & Cooldown State */}
          <button
            type="submit"
            disabled={isLoading || isCoolingDown}
            className={`w-full py-3 active:scale-[0.99] disabled:opacity-60 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isCoolingDown
                ? 'bg-amber-500 hover:bg-amber-500 cursor-not-allowed'
                : 'bg-[#1E60FF] hover:bg-[#1A53DE]'
            }`}
          >
            {isCoolingDown ? (
              <>
                <Timer className="w-4 h-4" />
                <span>Wait {cooldownRemaining}s</span>
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{authMode === 'signup' ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <span>
                {isSupabaseConfigured 
                  ? (authMode === 'signup' ? 'Create Account & Join' : 'Sign in with Supabase')
                  : 'Log in to Prototype'}
              </span>
            )}
          </button>
        </form>
      </div>
      )}

      {/* Forgot Password Simulated Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Password Recovery</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Account invitations and password resets are managed directly through Supabase Authentication or by project administrators.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-[#1E60FF] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Note */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500">
        PROJEX Workspace · Authentication Bridge
      </div>
    </div>
  );
};
