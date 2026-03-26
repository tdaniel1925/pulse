'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Unsubscribe Page
 * Based on DEPENDENCY-MAP.md - Email & Notification Dependencies
 * CAN-SPAM Compliance
 *
 * Allows users to manage email preferences via JWT token
 */
export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [preferences, setPreferences] = useState({
    daily_posts: true,
    monthly_report: true,
    product_updates: true,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      loadPreferences();
    } else {
      setLoading(false);
      setMessage('Invalid or missing token');
    }
  }, [token]);

  async function loadPreferences() {
    try {
      const response = await fetch(`/api/email/preferences?token=${token}`);
      const data = await response.json();

      if (response.ok) {
        setBusinessName(data.business_name);
        setPreferences(data.preferences);
      } else {
        setMessage(data.error || 'Failed to load preferences');
      }
    } catch (error) {
      setMessage('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, preferences }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Failed to update preferences');
      }
    } catch (error) {
      setMessage('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Email Preferences</h2>
          {businessName && (
            <p className="mt-2 text-sm text-gray-600">{businessName}</p>
          )}
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          {message && !saving && (
            <div
              className={`mb-6 p-4 rounded-md ${
                message.includes('Error') || message.includes('Failed')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-green-50 text-green-800'
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <p className="text-sm text-gray-700 mb-4">
                Choose which emails you'd like to receive:
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={preferences.daily_posts}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          daily_posts: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Daily social posts
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive your daily social content at 8am local time
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={preferences.monthly_report}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          monthly_report: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Monthly performance reports
                    </label>
                    <p className="text-sm text-gray-500">
                      Get monthly summaries of your content performance
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={preferences.product_updates}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          product_updates: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3">
                    <label className="text-sm font-medium text-gray-700">
                      Product updates
                    </label>
                    <p className="text-sm text-gray-500">
                      Stay informed about new features and improvements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can also manage your email preferences from your{' '}
              <a href="/dashboard/settings" className="text-blue-600 hover:text-blue-500">
                dashboard settings
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-500">
            ← Back to PulseAgent
          </a>
        </div>
      </div>
    </div>
  );
}
