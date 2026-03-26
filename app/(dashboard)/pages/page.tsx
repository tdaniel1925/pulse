import { createClient } from '@/lib/supabase/server';
import { canCreateLandingPage, PLAN_LIMITS } from '@/lib/config/plans';
import { Plus, FileText, Eye, Clock } from 'lucide-react';
import Link from 'next/link';

export default async function PagesPage() {
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

  if (!client) return <div>Client profile not found</div>;

  const { data: pages } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  const publishedCount = pages?.filter((p) => p.published).length || 0;
  const { allowed, limit } = canCreateLandingPage(client.plan, publishedCount);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Landing Pages</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {publishedCount} of {limit === -1 ? 'unlimited' : limit} pages published
          </p>
        </div>
        <div className="flex items-center gap-3">
          {allowed ? (
            <Link
              href="/api/generate/page"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Page
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-400 bg-slate-100 cursor-not-allowed"
            >
              Page Limit Reached
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7">
        {!pages || pages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No landing pages yet</h3>
            <p className="text-sm text-slate-500 mb-6">Get started by creating your first AI-powered landing page.</p>
            {allowed && (
              <Link
                href="/api/generate/page"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-md shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Your First Page
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {page.hero_image_url && (
                  <div className="aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={page.hero_image_url}
                      alt={page.headline || 'Page preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {page.headline || 'Untitled Page'}
                    </h3>
                    {page.published ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 shrink-0 ml-2">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 shrink-0 ml-2">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{page.subheadline}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(page.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{page.page_type}</span>
                  </div>
                  {page.moderation_status === 'pending' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 mb-3">
                      Under Review
                    </span>
                  )}
                  {page.moderation_status === 'flagged' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 mb-3">
                      Flagged
                    </span>
                  )}
                  {page.published && page.published_url && (
                    <a
                      href={page.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Live Page
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!allowed && limit !== -1 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-5">
            <h3 className="text-sm font-bold text-amber-900 mb-2">Page limit reached</h3>
            <p className="text-sm text-amber-700 mb-4">
              You've reached your limit of {limit} published pages. Upgrade your plan to create more.
            </p>
            <Link
              href="/dashboard/settings/billing"
              className="inline-flex items-center text-sm font-semibold text-amber-900 hover:text-amber-800"
            >
              Upgrade Plan →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
