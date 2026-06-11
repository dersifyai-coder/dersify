'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Simple in-memory rate limiting per IP (resets on server restart)
// For production, use Redis — but this prevents most abuse
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 3; // max 3 submissions per IP per 15 min window

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export type WaitlistActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function joinWaitlist(
  prevState: WaitlistActionResult | null,
  formData: FormData
): Promise<WaitlistActionResult> {
  // Get IP for rate limiting
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown';

  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: 'Too many requests. Please try again in 15 minutes.',
    };
  }

  // Extract and validate email
  const rawEmail = formData.get('email');

  if (!rawEmail || typeof rawEmail !== 'string') {
    return { success: false, error: 'Please enter your email address.' };
  }

  const email = rawEmail.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (email.length > 320) {
    return { success: false, error: 'Email address is too long.' };
  }

  // Source = which CTA was used; referrer captured client-side
  const source = formData.get('source') as string | null;
  const referrer = formData.get('referrer') as string | null;

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('waitlist_signups').insert({
    email,
    source: source ?? 'landing',
    referrer: referrer?.substring(0, 500) ?? null, // cap referrer length
  });

  if (error) {
    // Duplicate email (unique constraint violation): report success anyway
    // to prevent email enumeration attacks.
    if (error.code === '23505') {
      return {
        success: true,
        message: "You're on the list! We'll email you when Dersify launches.",
      };
    }

    console.error('[waitlist] Supabase insert error:', error.code, error.message);
    return {
      success: false,
      error: 'Something went wrong. Please try again in a moment.',
    };
  }

  // Optional confirmation email via Resend — only runs if configured.
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Dersify <noreply@dersify.com>',
        to: email,
        subject: "You're on the Dersify waitlist!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #0A1628; color: white; border-radius: 12px;">
            <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">You're on the list.</h1>
            <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6;">
              Thanks for joining the Dersify waitlist. We're putting the finishing touches on
              an AI learning system that actually remembers you, adapts to you, and teaches
              you exactly what you need.
            </p>
            <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-top: 16px;">
              When we're ready, you'll be among the first to know.
            </p>
            <p style="color: #0D9488; font-size: 14px; margin-top: 32px;">— The Dersify team</p>
          </div>
        `,
      });
    } catch (emailError) {
      // Never fail the signup because of email error — just log
      console.error('[waitlist] confirmation email failed:', emailError);
    }
  }

  return {
    success: true,
    message: "You're on the list! We'll email you when Dersify launches.",
  };
}
