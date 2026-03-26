import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Email delivery service using Resend
 * Based on STORE-CONTRACTS.md - Resend service contract
 */

interface SocialPost {
  id: string;
  platform: string;
  post_copy: string;
  hashtags: string | null;
  image_url_fb: string | null;
  image_url_ig: string | null;
  image_url_li: string | null;
  image_url_tw: string | null;
  share_url_facebook: string | null;
  share_url_linkedin: string | null;
  share_url_twitter: string | null;
  relay_page_url: string | null;
}

/**
 * Send daily social post email
 * Based on DEPENDENCY-MAP.md - Daily email flow
 */
export async function sendDailyPostEmail(params: {
  to: string;
  clientName: string;
  posts: SocialPost[];
  unsubscribeToken: string;
}) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${params.unsubscribeToken}`;

  // TODO: Replace with React Email template
  const html = buildDailyEmailHTML(params.clientName, params.posts, unsubscribeUrl);

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: `Your social content for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`,
    html,
  });
}

/**
 * Send welcome email after provisioning
 */
export async function sendWelcomeEmail(params: {
  to: string;
  clientName: string;
  dashboardUrl: string;
  referralLink: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to PulseAgent</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Welcome to PulseAgent, ${params.clientName}!</h1>

  <p>Your account is ready and your content has been generated.</p>

  <p><strong>Next steps:</strong></p>
  <ol>
    <li><a href="${params.dashboardUrl}">Visit your dashboard</a></li>
    <li>Review your landing page</li>
    <li>Check out your first week of social posts</li>
  </ol>

  <p><strong>Your referral link:</strong><br>
  <a href="${params.referralLink}">${params.referralLink}</a></p>

  <p>Share this link to earn referral commissions!</p>

  <p>Questions? Reply to this email.</p>

  <p>Thanks,<br>The PulseAgent Team</p>
</body>
</html>`;

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: 'Welcome to PulseAgent - Your Content is Ready!',
    html,
  });
}

/**
 * Send monthly performance report
 */
export async function sendMonthlyReport(params: {
  to: string;
  clientName: string;
  stats: {
    postsGenerated: number;
    postsEmailed: number;
    pagesCreated: number;
  };
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Report - PulseAgent</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Your Monthly Report</h1>

  <p>Hi ${params.clientName},</p>

  <p>Here's your PulseAgent activity for the past month:</p>

  <ul>
    <li><strong>${params.stats.postsGenerated}</strong> social posts generated</li>
    <li><strong>${params.stats.postsEmailed}</strong> posts sent to your inbox</li>
    <li><strong>${params.stats.pagesCreated}</strong> landing pages created</li>
  </ul>

  <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your dashboard</a></p>

  <p>Thanks,<br>The PulseAgent Team</p>
</body>
</html>`;

  await resend.emails.send({
    from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
    to: params.to,
    subject: 'Your PulseAgent Monthly Report',
    html,
  });
}

/**
 * Helper: Build daily email HTML
 * TODO: Replace with React Email template
 */
function buildDailyEmailHTML(
  clientName: string,
  posts: SocialPost[],
  unsubscribeUrl: string
): string {
  const postsHTML = posts.map(post => {
    const imageUrl = post.platform === 'linkedin' ? post.image_url_li :
                    post.platform === 'facebook' ? post.image_url_fb :
                    post.platform === 'instagram' ? post.image_url_ig :
                    post.platform === 'twitter' ? post.image_url_tw : null;

    const shareUrl = post.platform === 'linkedin' ? post.share_url_linkedin :
                    post.platform === 'facebook' ? post.share_url_facebook :
                    post.platform === 'twitter' ? post.share_url_twitter : '#';

    return `
    <div style="margin-bottom: 30px; border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px;">
      <h3 style="margin-top: 0; text-transform: capitalize;">${post.platform}</h3>

      ${imageUrl ? `<img src="${imageUrl}" alt="Post image" style="max-width: 100%; height: auto; border-radius: 4px;">` : ''}

      <p style="white-space: pre-wrap; margin: 15px 0;">${post.post_copy}</p>

      ${post.hashtags ? `<p style="color: #0066cc;">${post.hashtags}</p>` : ''}

      <a href="${shareUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
        Share to ${post.platform}
      </a>
    </div>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Social Content for Today</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px;">
    <h1 style="margin-top: 0;">Hi ${clientName},</h1>

    <p>Here's your social content for today:</p>

    ${postsHTML}

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="font-size: 12px; color: #666;">
      <a href="${unsubscribeUrl}">Manage email preferences</a> |
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Dashboard</a>
    </p>
  </div>
</body>
</html>`;
}
