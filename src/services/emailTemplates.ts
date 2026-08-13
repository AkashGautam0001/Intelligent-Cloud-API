/** Branded HTML email templates for Intelligent-Cloud SMTP. */

const BRAND = {
  name: "Intelligent-Cloud",
  tagline: "Secure. Innovate. Transform.",
  navy: "#04275f",
  orange: "#f26a13",
  surface: "#f8fafc",
  text: "#0b1730",
  muted: "#5f6b7a",
  border: "#e4eaf1",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(opts: { title: string; bodyHtml: string; preheader?: string }): {
  text: string;
  html: string;
} {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(opts.preheader)}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>${escapeHtml(opts.title)}</title></head>
<body style="margin:0;padding:0;background:${BRAND.surface};font-family:Geist,Segoe UI,Helvetica,Arial,sans-serif;color:${BRAND.text}">
  ${preheader}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.surface};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:${BRAND.navy};padding:20px 24px">
            <div style="font-size:18px;font-weight:600;color:#ffffff">${BRAND.name}</div>
            <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#d9eaf8;margin-top:4px">${BRAND.tagline}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px;font-size:15px;line-height:1.55;color:${BRAND.text}">
            ${opts.bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.muted}">
            ${BRAND.name} · MY MiTRAA TECHNOLOGY<br/>
            This is an automated message — replies may not be monitored.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { text: "", html };
}

function linesToHtml(lines: string[]): string {
  return lines
    .map((line) => {
      if (!line) return "<br/>";
      return `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`;
    })
    .join("");
}

function kvTable(rows: Array<[string, string]>): string {
  const cells = rows
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:6px 0;color:${BRAND.muted};width:140px;vertical-align:top">${escapeHtml(k)}</td>
          <td style="padding:6px 0;color:${BRAND.text};vertical-align:top">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 4px">${cells}</table>`;
}

export type ContactMailData = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  need: string;
  message: string;
};

export function contactNotifyTeam(data: ContactMailData) {
  const text = [
    `New contact request from ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Phone: ${data.phone}`,
    `Need: ${data.need}`,
    `Message: ${data.message || "(none)"}`,
    `ID: ${data.id}`,
  ].join("\n");

  const { html } = layout({
    title: `Contact: ${data.need}`,
    preheader: `${data.name} · ${data.company}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-weight:600">New contact request</p>
      ${kvTable([
        ["Name", data.name],
        ["Email", data.email],
        ["Company", data.company],
        ["Phone", data.phone],
        ["Need", data.need],
        ["Message", data.message || "(none)"],
        ["ID", data.id],
      ])}
    `,
  });

  return {
    subject: `[Intelligent-Cloud] Contact: ${data.need} — ${data.company}`,
    text,
    html,
  };
}

export function contactAutoReply(data: Pick<ContactMailData, "name" | "need">) {
  const text = [
    `Hi ${data.name},`,
    "",
    "Thanks for contacting Intelligent-Cloud. Our team has received your request and will follow up shortly.",
    "",
    `What you asked about: ${data.need}`,
    "",
    "— Intelligent-Cloud",
  ].join("\n");

  const { html } = layout({
    title: "We received your message",
    preheader: "Our team will follow up shortly.",
    bodyHtml: `
      ${linesToHtml([`Hi ${data.name},`, ""])}
      <p style="margin:0 0 12px">Thanks for contacting <strong>Intelligent-Cloud</strong>. Our team has received your request and will follow up shortly.</p>
      ${kvTable([["What you asked about", data.need]])}
      <p style="margin:16px 0 0">— Intelligent-Cloud</p>
    `,
  });

  return {
    subject: "We received your message — Intelligent-Cloud",
    text,
    html,
  };
}

export type BookingMailData = {
  id?: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  need: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
};

export function bookingReceivedTeam(data: BookingMailData) {
  const text = [
    `New booking request from ${data.name}`,
    `Email: ${data.email}`,
    `Company: ${data.company}`,
    `Phone: ${data.phone}`,
    `Need: ${data.need}`,
    `Preferred: ${data.preferredDate} ${data.preferredTime}`,
    `Notes: ${data.notes || "(none)"}`,
    data.id ? `ID: ${data.id}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const { html } = layout({
    title: `Booking: ${data.need}`,
    preheader: `${data.preferredDate} at ${data.preferredTime}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-weight:600">New booking request</p>
      ${kvTable([
        ["Name", data.name],
        ["Email", data.email],
        ["Company", data.company],
        ["Phone", data.phone],
        ["Need", data.need],
        ["Preferred", `${data.preferredDate} at ${data.preferredTime}`],
        ["Notes", data.notes || "(none)"],
        ...(data.id ? [["ID", data.id] as [string, string]] : []),
      ])}
    `,
  });

  return {
    subject: `[Intelligent-Cloud] Booking: ${data.need} — ${data.preferredDate}`,
    text,
    html,
  };
}

export function bookingReceivedConfirm(data: Pick<BookingMailData, "name" | "need" | "preferredDate" | "preferredTime">) {
  const text = [
    `Hi ${data.name},`,
    "",
    "Thanks for booking a cloud assessment with Intelligent-Cloud.",
    "We've received your preferred time and will confirm shortly.",
    "",
    `Need: ${data.need}`,
    `Preferred: ${data.preferredDate} at ${data.preferredTime}`,
    "",
    "— Intelligent-Cloud",
  ].join("\n");

  const { html } = layout({
    title: "Demo request received",
    preheader: "We'll confirm your preferred slot shortly.",
    bodyHtml: `
      ${linesToHtml([`Hi ${data.name},`, ""])}
      <p style="margin:0 0 12px">Thanks for booking a cloud assessment with <strong>Intelligent-Cloud</strong>. We've received your preferred time and will confirm shortly.</p>
      ${kvTable([
        ["Need", data.need],
        ["Preferred", `${data.preferredDate} at ${data.preferredTime}`],
      ])}
      <p style="margin:16px 0 0">— Intelligent-Cloud</p>
    `,
  });

  return {
    subject: "Demo request received — Intelligent-Cloud",
    text,
    html,
  };
}

export function bookingReminderTeam(data: BookingMailData) {
  const text = [
    `Reminder: upcoming assessment for ${data.name} (${data.company})`,
    `Need: ${data.need}`,
    `Preferred: ${data.preferredDate} at ${data.preferredTime}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
  ].join("\n");

  const { html } = layout({
    title: "Booking reminder",
    preheader: `${data.preferredDate} at ${data.preferredTime}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-weight:600">Booking reminder</p>
      ${kvTable([
        ["Name", data.name],
        ["Company", data.company],
        ["Need", data.need],
        ["Preferred", `${data.preferredDate} at ${data.preferredTime}`],
        ["Email", data.email],
        ["Phone", data.phone],
      ])}
    `,
  });

  return {
    subject: `[Intelligent-Cloud] Booking reminder — ${data.preferredDate}`,
    text,
    html,
  };
}

export function bookingReminderGuest(data: Pick<BookingMailData, "name" | "preferredDate" | "preferredTime">) {
  const text = [
    `Hi ${data.name},`,
    "",
    "This is a friendly reminder about your preferred cloud assessment slot:",
    `${data.preferredDate} at ${data.preferredTime}`,
    "",
    "Our team will confirm the final time if they have not already.",
    "",
    "— Intelligent-Cloud",
  ].join("\n");

  const { html } = layout({
    title: "Assessment reminder",
    preheader: `${data.preferredDate} at ${data.preferredTime}`,
    bodyHtml: `
      ${linesToHtml([`Hi ${data.name},`, ""])}
      <p style="margin:0 0 12px">This is a friendly reminder about your preferred cloud assessment slot:</p>
      <p style="margin:0 0 12px;font-weight:600;color:${BRAND.navy}">${escapeHtml(data.preferredDate)} at ${escapeHtml(data.preferredTime)}</p>
      <p style="margin:0 0 12px">Our team will confirm the final time if they have not already.</p>
      <p style="margin:16px 0 0">— Intelligent-Cloud</p>
    `,
  });

  return {
    subject: "Reminder: your Intelligent-Cloud assessment",
    text,
    html,
  };
}

export type TicketMailData = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  tier: string;
};

export function ticketNotifyTeam(data: TicketMailData) {
  const text = [
    `New support ticket from ${data.name}`,
    `Email: ${data.email}`,
    `Tier: ${data.tier}`,
    `Subject: ${data.subject}`,
    "",
    data.body,
    "",
    `ID: ${data.id}`,
  ].join("\n");

  const { html } = layout({
    title: `Ticket: ${data.subject}`,
    preheader: `${data.name} · ${data.tier}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-weight:600">New support ticket</p>
      ${kvTable([
        ["Name", data.name],
        ["Email", data.email],
        ["Tier", data.tier],
        ["Subject", data.subject],
        ["ID", data.id],
      ])}
      <p style="margin:16px 0 8px;color:${BRAND.muted};font-size:12px;text-transform:uppercase;letter-spacing:0.06em">Message</p>
      <div style="white-space:pre-wrap;background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;padding:12px">${escapeHtml(data.body)}</div>
    `,
  });

  return {
    subject: `[Intelligent-Cloud] Ticket: ${data.subject}`,
    text,
    html,
  };
}

export function ticketAck(data: Pick<TicketMailData, "name" | "subject" | "tier">) {
  const text = [
    `Hi ${data.name},`,
    "",
    "We've received your support request and our team will follow up soon.",
    "",
    `Subject: ${data.subject}`,
    `Preferred tier: ${data.tier}`,
    "",
    "— Intelligent-Cloud Support",
  ].join("\n");

  const { html } = layout({
    title: "Support ticket received",
    preheader: "Our team will follow up soon.",
    bodyHtml: `
      ${linesToHtml([`Hi ${data.name},`, ""])}
      <p style="margin:0 0 12px">We've received your support request and our team will follow up soon.</p>
      ${kvTable([
        ["Subject", data.subject],
        ["Preferred tier", data.tier],
      ])}
      <p style="margin:16px 0 0">— Intelligent-Cloud Support</p>
    `,
  });

  return {
    subject: "Support ticket received — Intelligent-Cloud",
    text,
    html,
  };
}
