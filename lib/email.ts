// lib/email.ts
import { Resend } from "resend";


export type SendVerificationEmailInput = {
  to: string;
  token: string;
  baseUrl: string;
};


const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
  const { to, token, baseUrl } = input;
  const url = new URL("/verify", baseUrl);
  url.searchParams.set("token", token);


  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "no-reply@example.com",
    to,
    subject: "Потвърдете вашия имейл",
    html: `
<div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.6">
<h2>Добре дошли в Xartify</h2>
<p>За да активирате профила, моля кликнете на бутона:</p>
<p><a href="${url.toString()}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#111;color:#fff;text-decoration:none">Потвърди имейл</a></p>
<p>Ако бутонът не работи, копирайте следния линк:</p>
<p><code>${url.toString()}</code></p>
<p>Линкът е валиден 24 часа.</p>
</div>
`,
  });
}