'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Mail,
  Lock,
  Building2,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  XCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/**
 * Signup Page
 * Creates new user account with Supabase Auth
 * Includes password strength indicator and full form validation
 */
export default function SignupPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    industry: '',
    password: '',
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  const checkPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordStrength(checkPasswordStrength(password));
  };

  const getStrengthLabel = () => {
    if (!formData.password) return 'Enter a password to see strength';
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    return labels[passwordStrength - 1] || 'Weak';
  };

  const getStrengthColor = () => {
    if (!formData.password) return 'text-slate-400';
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-600', 'text-green-600'];
    return colors[passwordStrength - 1] || 'text-red-500';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate all fields
    if (
      !formData.businessName ||
      !formData.email ||
      !formData.industry ||
      !formData.password ||
      !formData.termsAccepted
    ) {
      setMessage('Please fill all fields and accept the terms');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Create auth user with password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            business_name: formData.businessName,
            industry: formData.industry,
          },
        },
      });

      if (authError) throw authError;

      setMessage('Account created! Redirecting to onboarding...');
      setMessageType('success');

      // Redirect to onboarding after successful signup
      setTimeout(() => router.push('/dashboard/onboarding'), 1500);
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during signup');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal Top Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">PulseAgent</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/login" className="text-slate-500 hover:text-purple-600 transition-colors">
                Already have an account? <span className="text-purple-600 font-medium">Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Signup Area */}
      <section className="py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600 rounded-lg shadow-md mb-5">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
            <p className="text-slate-500 text-sm">Start your free trial — no credit card required</p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-5 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>Free 14-day trial</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <XCircle className="w-3.5 h-3.5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 pt-6 pb-6">
              <form onSubmit={handleSignup}>
                {/* Business Name Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="business-name">
                    Business name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="business-name"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Acme Chiropractic"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@yourbusiness.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Industry Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="industry">
                    Industry
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <select
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="" disabled className="text-slate-400">
                        Select your industry…
                      </option>
                      <optgroup label="Healthcare">
                        <option value="chiropractic">Chiropractic</option>
                        <option value="dentistry">Dentistry</option>
                        <option value="physical-therapy">Physical Therapy</option>
                        <option value="medical-practice">Medical Practice</option>
                        <option value="mental-health">Mental Health / Therapy</option>
                        <option value="optometry">Optometry</option>
                      </optgroup>
                      <optgroup label="Legal">
                        <option value="law-firm">Law Firm</option>
                        <option value="personal-injury">Personal Injury</option>
                        <option value="family-law">Family Law</option>
                        <option value="estate-planning">Estate Planning</option>
                      </optgroup>
                      <optgroup label="Finance">
                        <option value="financial-advisor">Financial Advisor</option>
                        <option value="insurance">Insurance Agency</option>
                        <option value="accounting">Accounting / CPA</option>
                        <option value="mortgage">Mortgage / Lending</option>
                      </optgroup>
                      <optgroup label="Real Estate">
                        <option value="real-estate-agent">Real Estate Agent</option>
                        <option value="property-management">Property Management</option>
                      </optgroup>
                      <optgroup label="Fitness & Wellness">
                        <option value="gym-fitness">Gym / Fitness Studio</option>
                        <option value="personal-trainer">Personal Trainer</option>
                        <option value="yoga-pilates">Yoga / Pilates</option>
                        <option value="nutrition">Nutrition / Dietitian</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="restaurant">Restaurant / Food</option>
                        <option value="retail">Retail</option>
                        <option value="home-services">Home Services</option>
                        <option value="other">Other</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

                {/* Password Strength Indicator */}
                <div className="mb-5">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="h-1 flex-1 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            index < passwordStrength ? strengthColors[passwordStrength - 1] : ''
                          }`}
                          style={{ width: index < passwordStrength ? '100%' : '0%' }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${getStrengthColor()}`}>{getStrengthLabel()}</p>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start mb-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 shrink-0"
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-slate-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    messageType === 'success' && message
                      ? 'bg-green-600 text-white'
                      : messageType === 'error' && message
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>Creating account...</>
                  ) : messageType === 'success' && message ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Account created! Redirecting...
                    </>
                  ) : messageType === 'error' && message ? (
                    <>
                      <AlertCircle className="w-4 h-4" /> Try Again
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Message Display */}
                {message && (
                  <div
                    className={`mt-4 p-3 rounded-md text-sm flex items-start gap-2 ${
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
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium">OR SIGN UP WITH</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Social Signup */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 px-4 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-4 h-4" />
                  Microsoft
                </button>
              </div>
            </div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold ml-1">
              Sign in →
            </Link>
          </p>

          {/* What Happens Next */}
          <div className="mt-6 bg-white rounded-lg border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              What happens after you sign up
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">5-minute onboarding</p>
                  <p className="text-xs text-slate-500">Tell us about your business and target audience</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">AI generates your first month</p>
                  <p className="text-xs text-slate-500">30–150 posts created and ready to review</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Daily email at 8am</p>
                  <p className="text-xs text-slate-500">Post in 30 seconds — copy, paste, done</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
