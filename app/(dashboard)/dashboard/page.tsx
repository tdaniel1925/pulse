import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Bell, Plus, FileText, MessageSquare, Mail } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!client) return null;

  const { data: pages } = await supabase
    .from('landing_pages')
    .select('id')
    .eq('client_id', client.id);

  const { data: postsThisMonth } = await supabase
    .from('social_posts')
    .select('id')
    .eq('client_id', client.id)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const { data: emailsSent } = await supabase
    .from('social_posts')
    .select('id')
    .eq('client_id', client.id)
    .not('email_sent_at', 'is', null);

  const { data: recentPosts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('client_id', client.id)
    .in('moderation_status', ['approved', 'pending'])
    .order('scheduled_date', { ascending: true })
    .limit(5);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full"></span>
          </button>
          <Link
            href="/dashboard/social"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-7">
        {/* Welcome Banner */}
        <section className="mb-7">
          <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-lg p-6 flex items-center justify-between overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent"></div>
            <div className="relative z-10">
              <p className="text-purple-300 text-sm font-medium mb-1">Good morning 👋</p>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome back, {client.business_name}</h2>
              <p className="text-slate-400 text-sm">
                You have <span className="text-purple-300 font-semibold">{recentPosts?.length || 0} posts</span> ready for review today.
              </p>
            </div>
            <div className="relative z-10 hidden md:flex items-center gap-3">
              <div className="text-center px-5 py-3 bg-white/10 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-white">
                  {Math.floor((new Date().getTime() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Days Active</p>
              </div>
              <div className="text-center px-5 py-3 bg-white/10 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-purple-300">100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Post Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <span className="text-xs text-slate-400">Total</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{pages?.length || 0}</p>
              <p className="text-sm text-slate-500">Landing Pages</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs text-slate-400">This Month</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{postsThisMonth?.length || 0}</p>
              <p className="text-sm text-slate-500">Social Posts</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-400">All Time</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{emailsSent?.length || 0}</p>
              <p className="text-sm text-slate-500">Emails Sent</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-7">
          <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/pages/new"
              className="flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">Create Landing Page</h4>
                <p className="text-sm text-slate-500 mt-0.5">Generate a new AI-powered landing page</p>
              </div>
            </Link>
            <Link
              href="/dashboard/social"
              className="flex items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900">View Social Posts</h4>
                <p className="text-sm text-slate-500 mt-0.5">See your upcoming social content</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Posts */}
        {recentPosts && recentPosts.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Upcoming Posts</h3>
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm divide-y divide-slate-100">
              {recentPosts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-900 capitalize">{post.platform}</span>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-500">{new Date(post.scheduled_date).toLocaleDateString()}</span>
                        {post.moderation_status === 'pending' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Under Review
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{post.post_copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
