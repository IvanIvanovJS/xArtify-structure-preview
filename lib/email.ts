// src/lib/email.ts
import 'server-only';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(opts: { to: string; token: string; baseUrl: string }) {
  const { to, token, baseUrl } = opts;
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/verify-email?token=${encodeURIComponent(token)}`;

  const subject = 'Потвърдете имейла си';
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111">
      <h2>Добре дошли!</h2>
      <p>За да активирате профила си, моля потвърдете имейла:</p>
      <p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Потвърди имейл</a></p>
      <p>Ако бутонът не работи, копирайте връзката:</p>
      <p><code>${verifyUrl}</code></p>
      <p style="font-size:12px;color:#666">Линкът е валиден 24 часа.</p>
    </div>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM || 'no-reply@yourdomain.com',
    to,
    subject,
    html,
  });
}
