/**
 * Database types for PulseAgent
 * Based on PROJECT-SPEC.md schema
 *
 * NOTE: In production, generate these from Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > lib/types/database.ts
 */

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          rep_code: string | null;
          referred_by: string | null;
          industry: string;
          niche: string | null;
          target_customer: string | null;
          location_city: string | null;
          location_state: string | null;
          timezone: string;
          core_offer: string | null;
          differentiator: string | null;
          brand_voice: string;
          primary_goal: string;
          logo_url: string | null;
          brand_primary: string | null;
          brand_secondary: string | null;
          phone: string | null;
          website: string | null;
          calendly_url: string | null;
          apex_rep_id: string | null;
          apex_rank: string | null;
          apex_affiliate_link: string | null;
          selected_platforms: string[];
          post_approval_mode: string;
          podcast_cadence: string;
          podcast_format: string;
          podcast_voice_id: string | null;
          square_customer_id: string | null;
          square_subscription_id: string | null;
          square_setup_fee_payment_id: string | null;
          setup_fee_paid: boolean;
          plan: string;
          plan_status: string;
          trial_ends_at: string;
          email_preferences: {
            daily_posts: boolean;
            monthly_report: boolean;
            product_updates: boolean;
          };
          unsubscribed_at: string | null;
          onboarding_complete: boolean;
          provisioning_complete: boolean;
          content_generated_at: string | null;
          moderation_required: boolean;
          moderation_exempt_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      landing_pages: {
        Row: {
          id: string;
          client_id: string;
          page_type: string;
          target_keyword: string | null;
          target_audience: string | null;
          unique_offer: string | null;
          slug: string;
          headline: string | null;
          subheadline: string | null;
          body_copy: any | null;
          cta_primary: string | null;
          cta_secondary: string | null;
          seo_title: string | null;
          seo_description: string | null;
          hero_image_url: string | null;
          og_image_url: string | null;
          template_id: string | null;
          published: boolean;
          published_url: string | null;
          is_primary: boolean;
          moderation_status: string;
          moderation_flags: any | null;
          moderation_score: number | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['landing_pages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['landing_pages']['Insert']>;
      };
      social_posts: {
        Row: {
          id: string;
          client_id: string;
          platform: string;
          post_copy: string;
          hashtags: string | null;
          image_prompt: string | null;
          image_url_raw: string | null;
          image_url_fb: string | null;
          image_url_ig: string | null;
          image_url_li: string | null;
          image_url_tw: string | null;
          image_url_yt: string | null;
          share_url_facebook: string | null;
          share_url_linkedin: string | null;
          share_url_twitter: string | null;
          relay_page_url: string | null;
          scheduled_date: string;
          scheduled_time: string;
          email_sent_at: string | null;
          batch_month: string;
          status: string;
          topics: string[];
          moderation_status: string;
          moderation_flags: any | null;
          moderation_score: number | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['social_posts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['social_posts']['Insert']>;
      };
      podcast_episodes: {
        Row: {
          id: string;
          client_id: string;
          episode_number: number;
          title: string | null;
          description: string | null;
          show_notes: string | null;
          intro_script: string | null;
          full_script: string | null;
          outro_script: string | null;
          outline: any | null;
          topics_covered: string[];
          keywords: string[];
          audio_url: string | null;
          cover_art_url: string | null;
          status: string;
          published_at: string | null;
          moderation_status: string;
          moderation_flags: any | null;
          moderation_score: number | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['podcast_episodes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['podcast_episodes']['Insert']>;
      };
      generation_log: {
        Row: {
          id: string;
          client_id: string;
          job_type: string;
          inngest_run_id: string | null;
          claude_tokens_in: number;
          claude_tokens_out: number;
          dalle_calls: number;
          ideogram_calls: number;
          sharp_operations: number;
          emails_sent: number;
          status: string;
          error: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['generation_log']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['generation_log']['Insert']>;
      };
    };
  };
}
