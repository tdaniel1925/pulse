'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Building2,
  Briefcase,
  Users,
  ArrowRight,
  Check,
  Sparkles,
  CheckCircle,
  PlusCircle,
  Clock,
  Eye,
  AlertTriangle,
} from 'lucide-react';

/**
 * Onboarding Page
 * Creates client profile with business info and platform selection
 */
export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    targetAudience: '',
    brandTone: 'friendly',
    selectedPlatforms: ['linkedin', 'facebook'] as string[],
    postsPerMonth: 90,
    deliveryTime: '8am',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', description: 'B2B & Professional', color: 'bg-blue-600' },
    { id: 'facebook', name: 'Facebook', description: 'Community & Local', color: 'bg-blue-500' },
    { id: 'instagram', name: 'Instagram', description: 'Visual & Stories', color: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400' },
    { id: 'x', name: 'X (Twitter)', description: 'Thought Leadership', color: 'bg-slate-900' },
    { id: 'youtube', name: 'YouTube', description: 'Video Scripts', color: 'bg-red-600' },
    { id: 'tiktok', name: 'TikTok', description: 'Short-form Video', color: 'bg-slate-950' },
  ];

  const tones = ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Bold', 'Educational'];

  const togglePlatform = (platformId: string) => {
    if (formData.selectedPlatforms.includes(platformId)) {
      setFormData({
        ...formData,
        selectedPlatforms: formData.selectedPlatforms.filter((p) => p !== platformId),
      });
    } else {
      setFormData({
        ...formData,
        selectedPlatforms: [...formData.selectedPlatforms, platformId],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        business_name: formData.businessName,
        industry: formData.industry,
        target_customer: formData.targetAudience,
        brand_voice: formData.brandTone.toLowerCase(),
        selected_platforms: formData.selectedPlatforms,
        plan: 'pro',
        plan_status: 'active',
        email_preferences: {
          daily_posts: true,
          monthly_report: true,
          product_updates: true,
        },
      });

      if (error) throw error;

      router.push('/dashboard');
    } catch (error: any) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal Top Nav */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">PulseAgent</span>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400 text-xs">Step 3 of 4</span>
              <Link href="/login" className="text-slate-500 hover:text-purple-600 transition-colors text-xs">
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-0">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Account</span>
            </div>
            <div className="flex-1 h-0.5 bg-purple-600 mx-2 mb-4"></div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-purple-600 font-medium whitespace-nowrap">Profile</span>
            </div>
            <div className="flex-1 h-0.5 bg-purple-600 mx-2 mb-4"></div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-purple-600 flex items-center justify-center text-white text-xs font-bold">
                3
              </div>
              <span className="text-xs text-purple-700 font-semibold whitespace-nowrap">Setup</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200 mx-2 mb-4"></div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                4
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Onboarding Area */}
      <section className="py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-md mb-5">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Let's set up your workspace</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Tell us about your business and choose your social platforms. This takes about 2 minutes.
            </p>
          </div>

          {/* Main Card */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
            {/* Business Information Section */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900">Business Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Business name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Your business name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Industry <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="" disabled>Select your industry…</option>
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

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target audience <span className="text-slate-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="e.g. Adults 30–55 with back pain in Chicago"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Helps the AI write more targeted content for your audience.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand tone</label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setFormData({ ...formData, brandTone: tone })}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                          formData.brandTone === tone
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 text-slate-600 hover:border-purple-400 hover:text-purple-600'
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Platforms Section */}
            <div className="px-8 pt-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900">Social Platforms</h2>
              </div>
              <p className="text-sm text-slate-500 mb-5 ml-8">
                Select all platforms where you want to post content. You can change this later.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {platforms.map((platform) => {
                  const isSelected = formData.selectedPlatforms.includes(platform.id);
                  return (
                    <div
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`rounded-lg border-2 p-4 flex flex-col items-center gap-3 relative cursor-pointer transition-all ${
                        isSelected ? 'border-purple-400 bg-purple-50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-purple-500 bg-purple-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <div className={`w-10 h-10 rounded-md ${platform.color} flex items-center justify-center shrink-0`}>
                        <span className="text-white text-xs font-bold">{platform.name.charAt(0)}</span>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-800">{platform.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{platform.description}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}>
                        {isSelected ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3 h-3" />
                            <span>Add</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-purple-600">{formData.selectedPlatforms.length}</span> platform(s) selected
                </p>
                <p className="text-xs text-slate-400">Select at least 1 platform to continue</p>
              </div>
            </div>

            {/* Content Preferences Section */}
            <div className="px-8 pt-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <h2 className="text-lg font-bold text-slate-900">Content Preferences</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Posts per month</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="30"
                      max="150"
                      step="30"
                      value={formData.postsPerMonth}
                      onChange={(e) => setFormData({ ...formData, postsPerMonth: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-purple-600"
                    />
                    <span className="text-sm font-bold text-purple-600 w-12 text-right">{formData.postsPerMonth}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>30</span>
                    <span>60</span>
                    <span>90</span>
                    <span>120</span>
                    <span>150</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily delivery time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <select
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                    >
                      <option value="6am">6:00 AM</option>
                      <option value="7am">7:00 AM</option>
                      <option value="8am">8:00 AM (Recommended)</option>
                      <option value="9am">9:00 AM</option>
                      <option value="10am">10:00 AM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            <div className="px-8 pt-6 pb-6 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Your Setup Summary
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">{formData.postsPerMonth}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Posts/month</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">{formData.selectedPlatforms.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Platforms</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">8am</p>
                  <p className="text-xs text-slate-500 mt-0.5">Daily delivery</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">AI</p>
                  <p className="text-xs text-slate-500 mt-0.5">Images included</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="px-8 py-6">
              {(!formData.businessName || formData.selectedPlatforms.length === 0) && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">
                    Please fill in your business name and select at least one platform to continue.
                  </p>
                </div>
              )}

              {message && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.businessName || formData.selectedPlatforms.length === 0}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  'Setting up your workspace...'
                ) : (
                  <>
                    Complete Setup <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
