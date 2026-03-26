import { Mail, Send } from 'lucide-react';

export default function RelayPage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Email Relay</h1>
        <p className="text-xs text-slate-400 mt-0.5">View and manage your email delivery settings</p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Email Relay Configuration</h2>
            <p className="text-slate-600 mb-6">
              Configure your email delivery preferences and view relay logs.
            </p>
            <p className="text-sm text-slate-400">This feature is coming soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
