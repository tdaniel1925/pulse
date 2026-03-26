import { createClient } from '@/lib/supabase/server';
import { Calendar, MessageSquare } from 'lucide-react';

export default async function SocialPage() {
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

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('client_id', client.id)
    .eq('batch_month', currentMonth)
    .in('moderation_status', ['approved', 'pending'])
    .order('scheduled_date', { ascending: true });

  const postsByDate: Record<string, any[]> = {};
  posts?.forEach((post) => {
    const date = post.scheduled_date;
    if (!postsByDate[date]) postsByDate[date] = [];
    postsByDate[date].push(post);
  });

  const dates = Object.keys(postsByDate).sort();

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Social Calendar</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Active Platforms:</span>
            <div className="flex gap-2">
              {client.selected_platforms.map((platform: string) => (
                <span
                  key={platform}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No posts scheduled yet</h3>
            <p className="text-sm text-slate-500">Your social content will appear here once generated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <span className="ml-auto text-xs text-slate-500">{postsByDate[date].length} posts</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {postsByDate[date].map((post) => (
                    <div key={post.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                            {post.platform}
                          </span>
                          {post.moderation_status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              Under Review
                            </span>
                          )}
                          {post.moderation_status === 'approved' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-3 whitespace-pre-wrap">{post.post_copy}</p>
                      {post.image_url && (
                        <div className="mb-3">
                          <img
                            src={post.image_url}
                            alt="Post image"
                            className="h-48 w-auto rounded-md border border-slate-200"
                          />
                        </div>
                      )}
                      {post.moderation_status === 'approved' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-medium transition-colors">
                            Copy to Clipboard
                          </button>
                          {post.email_sent_at && (
                            <span className="text-green-600">✓ Sent via email</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
