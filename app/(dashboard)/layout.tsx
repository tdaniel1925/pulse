import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Layout as LayoutIcon,
  Calendar,
  Send,
  Settings,
  BellOff,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!client) {
    redirect('/dashboard/onboarding');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center text-white shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-slate-900">PulseAgent</span>
        </div>

        {/* Workspace Badge */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {client.business_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{client.business_name}</p>
              <p className="text-xs text-slate-400 capitalize">{client.plan} Plan</p>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Main</p>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/pages"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <LayoutIcon className="w-4 h-4 shrink-0" />
            <span>Landing Pages</span>
          </Link>

          <Link
            href="/dashboard/social"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Social Calendar</span>
          </Link>

          <Link
            href="/dashboard/relay"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Email Relay</span>
          </Link>

          <div className="pt-4 pb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Account</p>
          </div>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </Link>

          <Link
            href="/dashboard/unsubscribe"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
          >
            <BellOff className="w-4 h-4 shrink-0" />
            <span>Unsubscribe</span>
          </Link>
        </nav>

        {/* User Profile Footer */}
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{client.business_name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <Link href="/login" className="text-slate-400 hover:text-slate-600 transition-colors shrink-0" title="Sign out">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
