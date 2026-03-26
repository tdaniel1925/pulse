'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Mail,
  Lock,
  Send,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/**
 * Login Page
 * Supports both magic link and password authentication
 * Integrated with Supabase Auth
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [usePassword, setUsePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setMessage('Check your email for the login link!');
      setMessageType('success');
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('Success! Redirecting to dashboard...');
      setMessageType('success');

      // Redirect to dashboard on success
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (error: any) {
      setMessage(error.message || 'Invalid email or password');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">PulseAgent</span>
            </Link>
            <a href="#" className="text-sm text-slate-500 hover:text-purple-600 transition-colors">
              Need help? <span className="text-purple-600 font-medium">Contact Support</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Branding Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white mx-auto mb-4 shadow-md">
              <Zap className="w-7 h-7" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your PulseAgent account</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            {/* Tab Toggle */}
            <div className="p-2 bg-slate-100 m-4 rounded-md flex gap-1">
              <button
                onClick={() => setUsePassword(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  !usePassword
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                Magic Link
              </button>
              <button
                onClick={() => setUsePassword(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  usePassword
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                Password
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={usePassword ? handlePasswordLogin : handleMagicLink} className="px-6 pb-6">
              {/* Magic Link Form */}
              {!usePassword && (
                <div>
                  <p className="text-sm text-slate-500 mb-4">
                    Enter your email and we'll send you a secure sign-in link. No password needed.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 transition-all bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Magic Link
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Check your spam folder if you don't see it within 60 seconds.
                  </p>
                </div>
              )}

              {/* Password Form */}
              {usePassword && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 transition-all bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-slate-700">Password</label>
                      <a href="#" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 transition-all bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>Signing in...</>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div
                  className={`mt-4 flex items-start gap-2 p-3 rounded-md text-sm ${
                    messageType === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-green-50 border border-green-200 text-green-700'
                  }`}
                >
                  {messageType === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <p>{message}</p>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100"></div>
                <span className="text-xs text-slate-400 font-medium">OR CONTINUE WITH</span>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
            </div>

            {/* Social Login */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-4 h-4" />
                Microsoft
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link href="/signup" className="text-purple-600 font-semibold hover:text-purple-700">
                  Start free trial
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              SSL Secured
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <EyeOff className="w-3.5 h-3.5 text-green-500" />
              No tracking
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-600 rounded-md flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-700">PulseAgent</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Contact Support
            </a>
          </div>
          <p className="text-xs text-slate-400">© 2024 PulseAgent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
