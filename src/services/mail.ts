import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";

let transporter: Transporter | null = null;

function getNotifyEmails(): string[] {
  const fromEnv = env.NOTIFY_EMAILS.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;
  // Placeholder team aliases until real SMTP recipients are configured
  return [
    "abu.fahad@intelligent-cloud.com",
    "fahad@intelligent-cloud.com",
    "fareed@intelligent-cloud.com",
    "riyadh@intelligent-cloud.com",
  ];
}

function getTransporter(): Transporter | null {
  if (!env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

export async function sendMail(options: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const to = Array.isArray(options.to) ? options.to.join(", ") : options.to;
  const mail = {
    from: env.SMTP_FROM,
    to,
    subject: options.subject,
    text: options.text,
    html: options.html ?? `<pre style="font-family:sans-serif;white-space:pre-wrap">${options.text}</pre>`,
  };

  const tx = getTransporter();
  if (!tx) {
    console.log("[mail:dev]", JSON.stringify({ to: mail.to, subject: mail.subject }, null, 2));
    return;
  }

  await tx.sendMail(mail);
}

export async function notifyTeam(
  subject: string,
  text: string,
  html?: string,
): Promise<void> {
  await sendMail({
    to: getNotifyEmails(),
    subject,
    text,
    html,
  });
}

/**
 * Fire-and-forget mail after a lead is persisted.
 * Logs failures; never throws — submission must still succeed for the client.
 */
export async function sendMailSafe(
  label: string,
  task: () => Promise<void>,
): Promise<void> {
  try {
    await task();
  } catch (err) {
    console.error(`[mail] ${label} failed:`, err);
  }
}

export { getNotifyEmails };
