import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * Social Post Relay Page
 * Based on DEPENDENCY-MAP.md - Moderation Flow Dependencies
 *
 * Purpose: Provide Open Graph tags for social sharing
 * URL: pulseagent.ai/p/[postId]
 *
 * Shows:
 * - Full OG tags if moderation_status = 'approved'
 * - "Under review" message if pending/flagged
 * - 404 if rejected
 */

export async function generateMetadata({
  params,
}: {
  params: { postId: string };
}): Promise<Metadata> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('social_posts')
    .select('*, clients!inner(*)')
    .eq('id', params.postId)
    .maybeSingle();

  if (!post || post.moderation_status === 'rejected') {
    return {
      title: 'Post Not Found',
    };
  }

  if (post.moderation_status !== 'approved') {
    return {
      title: 'Content Under Review',
      description: 'This content is being reviewed and will be available soon.',
    };
  }

  // Get appropriate image for platform
  const imageUrl =
    post.platform === 'linkedin'
      ? post.image_url_li
      : post.platform === 'facebook'
      ? post.image_url_fb
      : post.platform === 'instagram'
      ? post.image_url_ig
      : post.image_url_tw;

  return {
    title: `${(post as any).clients.business_name} on ${post.platform}`,
    description: post.post_copy.slice(0, 160),
    openGraph: {
      title: `${(post as any).clients.business_name}`,
      description: post.post_copy,
      images: imageUrl ? [imageUrl] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${(post as any).clients.business_name}`,
      description: post.post_copy,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function RelayPage({
  params,
}: {
  params: { postId: string };
}) {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('social_posts')
    .select('*, clients!inner(*)')
    .eq('id', params.postId)
    .maybeSingle();

  if (!post) {
    notFound();
  }

  // Handle moderation status
  if (post.moderation_status === 'rejected') {
    notFound();
  }

  if (post.moderation_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="mt-4 text-lg font-medium text-gray-900">
              Content Under Review
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              This content is being reviewed and will be available soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get appropriate image
  const imageUrl =
    post.platform === 'linkedin'
      ? post.image_url_li
      : post.platform === 'facebook'
      ? post.image_url_fb
      : post.platform === 'instagram'
      ? post.image_url_ig
      : post.image_url_tw;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {(post as any).clients.business_name}
            </h2>
            <p className="mt-1 text-sm text-gray-500 capitalize">
              {post.platform} • {new Date(post.scheduled_date).toLocaleDateString()}
            </p>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt="Post content"
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-gray-900 whitespace-pre-wrap">{post.post_copy}</p>
            {post.hashtags && (
              <p className="mt-4 text-blue-600">{post.hashtags}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Powered by PulseAgent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
