import { BookingRequest } from "../models/BookingRequest";
import { sendMail, notifyTeam, sendMailSafe } from "../services/mail";
import {
  bookingReminderGuest,
  bookingReminderTeam,
} from "../services/emailTemplates";

const INTERVAL_MS = 60 * 60 * 1000;

/** Hourly stub: send reminder emails for bookings due within the next day. */
export async function processBookingReminders(): Promise<number> {
  const now = new Date();
  const due = await BookingRequest.find({
    status: { $in: ["new", "confirmed"] },
    reminderAt: { $ne: null, $lte: now },
    reminderSentAt: null,
  }).limit(50);

  for (const booking of due) {
    const payload = {
      name: booking.name,
      email: booking.email,
      company: booking.company,
      phone: booking.phone,
      need: booking.need,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
    };
    const teamMail = bookingReminderTeam(payload);
    const guestMail = bookingReminderGuest(payload);

    await Promise.all([
      sendMailSafe("booking-reminder-team", () =>
        notifyTeam(teamMail.subject, teamMail.text, teamMail.html),
      ),
      sendMailSafe("booking-reminder-guest", () =>
        sendMail({
          to: booking.email,
          subject: guestMail.subject,
          text: guestMail.text,
          html: guestMail.html,
        }),
      ),
    ]);

    booking.reminderSentAt = new Date();
    await booking.save();
  }

  if (due.length) {
    console.log(`[jobs] Sent ${due.length} booking reminder(s)`);
  }
  return due.length;
}

export function startBookingReminderJob(): void {
  const tick = () => {
    void processBookingReminders().catch((err) => {
      console.error("[jobs] Booking reminder failed:", err);
    });
  };
  // Delay first run slightly so boot logs stay clean
  setTimeout(tick, 15_000);
  setInterval(tick, INTERVAL_MS);
  console.log("[jobs] Booking reminder job scheduled (hourly)");
}
