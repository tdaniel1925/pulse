import { BellOff, Mail } from 'lucide-react';

export default function UnsubscribePage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Email Preferences</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your email subscription settings</p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div className="max-w-2xl">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Email Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-slate-700">Daily social posts</label>
                  <p className="text-sm text-slate-500">Receive your daily social content at 8am</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-slate-700">Monthly reports</label>
                  <p className="text-sm text-slate-500">Get monthly performance summaries</p>
                </div>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3">
                  <label className="text-sm font-medium text-slate-700">Product updates</label>
                  <p className="text-sm text-slate-500">Stay informed about new features</p>
                </div>
              </div>
            </div>
            <button className="mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md transition-all">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
