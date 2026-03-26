import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import jwt from 'jsonwebtoken';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/email/preferences
 * Update email preferences (CAN-SPAM compliance)
 *
 * Based on:
 * - STORE-CONTRACTS.md - Email preferences contract
 * - DEPENDENCY-MAP.md - Email & Notification Dependencies (Section 5)
 *
 * Flow:
 * 1. Verify JWT token from unsubscribe link
 * 2. Update email preferences
 * 3. Return confirmation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, preferences } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Step 1: Verify JWT token
    let clientId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        clientId: string;
      };
      clientId = decoded.clientId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Step 2: Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    const validPreferences = {
      daily_posts: preferences.daily_posts === true,
      monthly_report: preferences.monthly_report === true,
      product_updates: preferences.product_updates === true,
    };

    // Step 3: Update client preferences
    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        email_preferences: validPreferences,
        unsubscribed_at:
          !validPreferences.daily_posts &&
          !validPreferences.monthly_report &&
          !validPreferences.product_updates
            ? new Date().toISOString()
            : null,
      })
      .eq('id', clientId);

    if (updateError) {
      throw new Error(`Failed to update preferences: ${updateError.message}`);
    }

    // Step 4: Return confirmation
    const unsubscribedAll =
      !validPreferences.daily_posts &&
      !validPreferences.monthly_report &&
      !validPreferences.product_updates;

    return NextResponse.json({
      success: true,
      message: unsubscribedAll
        ? 'You have been unsubscribed from all emails.'
        : 'Email preferences updated successfully.',
      preferences: validPreferences,
    });
  } catch (error: any) {
    console.error('Email preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email/preferences?token=xxx
 * Get current email preferences
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Verify JWT token
    let clientId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        clientId: string;
      };
      clientId = decoded.clientId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get client preferences
    const supabase = createAdminClient();

    const { data: client, error } = await supabase
      .from('clients')
      .select('email_preferences, business_name')
      .eq('id', clientId)
      .maybeSingle();

    if (error || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      business_name: client.business_name,
      preferences: client.email_preferences,
    });
  } catch (error: any) {
    console.error('Email preferences fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
      { status: 500 }
    );
  }
}
