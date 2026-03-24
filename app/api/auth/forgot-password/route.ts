import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/server/auth';
import { rateLimit, getClientIp, rateLimitedResponse } from '@/server/rate-limit';

async function sendResetEmail(email: string, token: string) {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    // No email provider configured — log to console for local dev
    console.log(`[Password Reset] URL for ${email}: ${resetUrl}`);
    return;
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@myshoplink.site',
      to: email,
      subject: 'Reset your MyShopLink password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
          <h2 style="font-size:20px;font-weight:700;color:#111">Reset your password</h2>
          <p style="color:#555;font-size:14px;margin-top:8px">
            Click the button below to set a new password. This link expires in 60 minutes.
          </p>
          <a href="${resetUrl}"
            style="display:inline-block;margin-top:24px;padding:12px 24px;background:#25D366;color:#fff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(request: NextRequest) {
  // 3 reset requests per IP per hour
  const ip = getClientIp(request);
  const rl = rateLimit(`forgot:${ip}`, { limit: 3, windowSecs: 60 * 60 });
  if (!rl.allowed) return rateLimitedResponse(rl.resetAt);

  const { email } = await request.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const token = await createPasswordResetToken(normalized);

  // Always return success — don't reveal whether the email exists
  if (token) {
    await sendResetEmail(normalized, token).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
