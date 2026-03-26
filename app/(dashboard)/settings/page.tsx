'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Settings Page - Business Profile
 * Based on DEPENDENCY-MAP.md - Client Profile Dependencies
 *
 * Allows editing:
 * - Business information
 * - Brand settings
 * - Platform preferences
 * - Email preferences
 */
export default function SettingsPage() {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadClient();
  }, []);

  async function loadClient() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setClient(data);
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          business_name: client.business_name,
          industry: client.industry,
          location_city: client.location_city,
          location_state: client.location_state,
          core_offer: client.core_offer,
          target_customer: client.target_customer,
          differentiator: client.differentiator,
          brand_voice: client.brand_voice,
          brand_primary: client.brand_primary,
          brand_secondary: client.brand_secondary,
          phone: client.phone,
          website: client.website,
          selected_platforms: client.selected_platforms,
          email_preferences: client.email_preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (error) throw error;

      setMessage('Settings saved successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    return <div>Client profile not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your business profile and preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Business Information
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Business Name
              </label>
              <input
                type="text"
                value={client.business_name}
                onChange={(e) =>
                  setClient({ ...client, business_name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <select
                value={client.industry}
                onChange={(e) =>
                  setClient({ ...client, industry: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="insurance">Insurance</option>
                <option value="legal">Legal</option>
                <option value="chiro">Chiropractic</option>
                <option value="accounting">Accounting</option>
                <option value="realestate">Real Estate</option>
                <option value="fitness">Fitness</option>
                <option value="restaurant">Restaurant</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                value={client.location_city || ''}
                onChange={(e) =>
                  setClient({ ...client, location_city: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                value={client.location_state || ''}
                onChange={(e) =>
                  setClient({ ...client, location_state: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={client.phone || ''}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                value={client.website || ''}
                onChange={(e) =>
                  setClient({ ...client, website: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Core Offer
              </label>
              <textarea
                rows={3}
                value={client.core_offer || ''}
                onChange={(e) =>
                  setClient({ ...client, core_offer: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="What do you offer to customers?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Target Customer
              </label>
              <textarea
                rows={2}
                value={client.target_customer || ''}
                onChange={(e) =>
                  setClient({ ...client, target_customer: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Who are your ideal customers?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Differentiator
              </label>
              <textarea
                rows={2}
                value={client.differentiator || ''}
                onChange={(e) =>
                  setClient({ ...client, differentiator: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="What makes you different?"
              />
            </div>
          </div>
        </div>

        {/* Brand Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Brand Settings
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Voice
              </label>
              <select
                value={client.brand_voice}
                onChange={(e) =>
                  setClient({ ...client, brand_voice: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="bold">Bold</option>
                <option value="calm">Calm</option>
                <option value="witty">Witty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Brand Color
              </label>
              <input
                type="color"
                value={client.brand_primary || '#3B82F6'}
                onChange={(e) =>
                  setClient({ ...client, brand_primary: e.target.value })
                }
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Brand Color
              </label>
              <input
                type="color"
                value={client.brand_secondary || '#8B5CF6'}
                onChange={(e) =>
                  setClient({ ...client, brand_secondary: e.target.value })
                }
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Email Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={client.email_preferences?.daily_posts ?? true}
                  onChange={(e) =>
                    setClient({
                      ...client,
                      email_preferences: {
                        ...client.email_preferences,
                        daily_posts: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Daily social posts
                </label>
                <p className="text-gray-500">
                  Receive your daily social content at 8am
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={client.email_preferences?.monthly_report ?? true}
                  onChange={(e) =>
                    setClient({
                      ...client,
                      email_preferences: {
                        ...client.email_preferences,
                        monthly_report: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Monthly reports
                </label>
                <p className="text-gray-500">
                  Get monthly performance summaries
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={client.email_preferences?.product_updates ?? true}
                  onChange={(e) =>
                    setClient({
                      ...client,
                      email_preferences: {
                        ...client.email_preferences,
                        product_updates: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label className="font-medium text-gray-700">
                  Product updates
                </label>
                <p className="text-gray-500">
                  Stay informed about new features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {message && (
              <p
                className={`text-sm ${
                  message.includes('Error') ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Plan & Billing Link */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Plan & Billing
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Current Plan: <span className="font-medium capitalize">{client.plan}</span>
        </p>
        <a
          href="/dashboard/settings/billing"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Manage Billing →
        </a>
      </div>
    </div>
  );
}
