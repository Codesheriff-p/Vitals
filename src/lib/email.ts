import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("SMTP_HOST is not set. Add it to .env.local.");

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  return transporter;
}

/** No SMTP configured (e.g. local/demo dev) — print the code instead of emailing it, so
    seeded demo accounts (see README "Demo Logins") stay usable without a mail server. */
function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);
}

async function sendCodeEmail(to: string, subject: string, html: string, code: string) {
  if (!isEmailConfigured()) {
    console.log(`[dev] SMTP not configured — verification code for ${to}: ${code}`);
    return;
  }

  const from = process.env.EMAIL_FROM as string;
  try {
    await getTransporter().sendMail({ from, to, subject, html });
  } catch (err) {
    throw new Error(`Failed to send email: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function sendSignupCodeEmail(to: string, name: string, code: string) {
  await sendCodeEmail(
    to,
    `${code} is your VITALS HMS verification code`,
    `
      <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto;">
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Enter this code to verify your email and finish requesting a VITALS HMS account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't request a VITALS HMS account, you can ignore this email.</p>
      </div>
    `,
    code
  );
}

export async function sendLoginCodeEmail(to: string, name: string, code: string) {
  await sendCodeEmail(
    to,
    `${code} is your VITALS HMS sign-in code`,
    `
      <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto;">
        <p>Hi ${name.split(" ")[0]},</p>
        <p>Enter this code to finish signing in to VITALS HMS:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin: 24px 0;">${code}</p>
        <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you didn't try to sign in, you can ignore this email — your password wasn't shared and your account stays safe.</p>
      </div>
    `,
    code
  );
}
