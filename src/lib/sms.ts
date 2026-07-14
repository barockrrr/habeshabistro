/**
 * SMS notifications for order and reservation confirmations.
 *
 * Default: Twilio (works globally, easy to set up for testing).
 *
 * For production in Ethiopia specifically, a local gateway (Afromessage,
 * GeezSMS) is usually cheaper and more reliable for domestic delivery than
 * an international provider — swap the implementation inside sendSms()
 * when you're ready; every call site in this app just calls sendSms(), so
 * nothing else needs to change.
 *
 * Without TWILIO_* env vars set, this silently logs to the console instead
 * of throwing — so local development and testing never breaks because SMS
 * isn't configured yet.
 */

const isConfigured = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER
);

export async function sendSms(to: string, message: string): Promise<{ sent: boolean; reason?: string }> {
  if (!isConfigured) {
    console.log(`[sms:dev-mode] Would send to ${to}: "${message}"`);
    return { sent: false, reason: 'SMS not configured (set TWILIO_* env vars) — logged instead.' };
  }

  try {
    // Lazy import so the twilio package is never touched unless configured.
    const twilio = (await import('twilio')).default;
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      to,
      from: process.env.TWILIO_FROM_NUMBER,
      body: message
    });
    return { sent: true };
  } catch (err: any) {
    console.error('[sms] Failed to send:', err.message);
    return { sent: false, reason: err.message };
  }
}
