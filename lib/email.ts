// lib/email.ts
import { Resend } from "resend";

export type SendVerificationEmailInput = {
  to: string;
  token: string;
  baseUrl: string;
};

// Единствен клиент, създаден веднъж
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Изпраща имейл за верификация.
 * Ако домейнът не е верифициран, използва fallback from: onboarding@resend.dev
 */
export async function sendVerificationEmail(input: SendVerificationEmailInput): Promise<void> {
  const { to, token, baseUrl } = input;
  const verifyUrl = new URL("/api/verify-email", baseUrl);
  verifyUrl.searchParams.set("token", token);

  const fromHeader = process.env.RESEND_FROM && process.env.RESEND_FROM.trim().length > 0
    ? process.env.RESEND_FROM
    : "onboarding@resend.dev";

  await resend.emails.send({
    from: fromHeader,
    to,
    subject: "Потвърдете вашия имейл",
    html: `
      <div style="font-family:Inter,system-ui,Segoe UI,Arial,sans-serif;line-height:1.6">
        <h2>Добре дошли</h2>
        <p>За да активирате профила, кликнете на бутона:</p>
        <p><a href="${verifyUrl.toString()}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#111;color:#fff;text-decoration:none">Потвърди имейл</a></p>
        <p>Ако бутонът не работи, копирайте следния линк:</p>
        <p><code>${verifyUrl.toString()}</code></p>
        <p>Линкът е валиден 24 часа.</p>
      </div>
    `,
  });
}
