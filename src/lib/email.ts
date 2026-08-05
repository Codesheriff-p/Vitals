import "server-only";
import { Resend } from "resend";

function getClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set. Add it to .env.local.");
  return new Resend(key);
}

export async function sendSignupCodeEmail(to: string, name: string, code: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set. Add it to .env.local.");

  const resend = getClient();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${code} is your VITALS HMS verification code`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto;">
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Enter this code to verify your email and finish requesting a VITALS HMS account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request a VITALS HMS account, you can ignore this email.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send verification email: ${error.message}`);
}

export async function sendLoginCodeEmail(to: string, name: string, code: string) {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set. Add it to .env.local.");

  const resend = getClient();

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${code} is your VITALS HMS sign-in code`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto;">
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Enter this code to finish signing in to VITALS HMS:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't try to sign in, you can ignore this email — your password wasn't shared and your account stays safe.</p>
      </div>
    `,
  });

  if (error) throw new Error(`Failed to send sign-in code email: ${error.message}`);
}
