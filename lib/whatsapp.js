/**
 * WhatsApp Cloud API (Meta) helpers for event / competition registrations.
 *
 * Required env:
 *   WHATSAPP_TOKEN              — permanent / system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID    — Business phone number ID from Meta
 *   WHATSAPP_ADMIN_NUMBER       — Restaurant notify number (digits, e.g. 9198XXXXXXXX)
 *
 * Optional:
 *   WHATSAPP_API_VERSION        — default v21.0
 *   WHATSAPP_SEND_GUEST_CONFIRM — "true" to also message the registrant
 *   WHATSAPP_GUEST_TEMPLATE     — approved template name (needed for most guest sends)
 *   WHATSAPP_GUEST_TEMPLATE_LANG — default en
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

function digitsOnly(value = '') {
    return String(value).replace(/\D/g, '');
}

/** Normalize to WhatsApp international format (India → 91XXXXXXXXXX). */
export function toWhatsAppNumber(raw) {
    let n = digitsOnly(raw);
    if (!n) return '';

    if (n.startsWith('0')) n = n.slice(1);

    // Already has country code
    if (n.length >= 11 && n.length <= 15) return n;

    // Indian 10-digit mobile
    if (n.length === 10) return `91${n}`;

    return n;
}

function isConfigured() {
    return Boolean(
        process.env.WHATSAPP_TOKEN &&
            process.env.WHATSAPP_PHONE_NUMBER_ID &&
            process.env.WHATSAPP_ADMIN_NUMBER
    );
}

async function graphSend(payload) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            ...payload,
        }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const detail = data?.error?.message || JSON.stringify(data);
        throw new Error(`WhatsApp API ${res.status}: ${detail}`);
    }
    return data;
}

export async function sendWhatsAppText(to, body) {
    const toNumber = toWhatsAppNumber(to);
    if (!toNumber || !body) return null;

    return graphSend({
        to: toNumber,
        type: 'text',
        text: { preview_url: false, body: String(body).slice(0, 4096) },
    });
}

export async function sendWhatsAppTemplate(to, templateName, languageCode, bodyParams = []) {
    const toNumber = toWhatsAppNumber(to);
    if (!toNumber || !templateName) return null;

    const components =
        bodyParams.length > 0
            ? [
                  {
                      type: 'body',
                      parameters: bodyParams.map((text) => ({
                          type: 'text',
                          text: String(text ?? ''),
                      })),
                  },
              ]
            : undefined;

    return graphSend({
        to: toNumber,
        type: 'template',
        template: {
            name: templateName,
            language: { code: languageCode || 'en' },
            ...(components ? { components } : {}),
        },
    });
}

function formatWhen(date = new Date()) {
    try {
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata',
        }).format(date);
    } catch {
        return date.toISOString();
    }
}

function buildAdminMessage({ type, eventName, name, phone, age, extra = {} }) {
    const lines = [
        type === 'competition' ? '🏆 New Competition Registration' : '🆕 New Event Registration',
        '',
        `Event: ${eventName || 'General'}`,
        `Name: ${name}`,
        `Phone: ${phone}`,
    ];

    if (age != null && age !== '') lines.push(`Age: ${age}`);
    if (extra.experience) lines.push(`Experience: ${extra.experience}`);
    if (extra.email) lines.push(`Email: ${extra.email}`);
    if (extra.tableNumber) lines.push(`Table: ${extra.tableNumber}`);
    if (extra.source) lines.push(`Source: ${extra.source}`);
    lines.push(`Time: ${formatWhen()}`);
    lines.push('', '— Asia By Gram');

    return lines.join('\n');
}

function buildGuestMessage({ eventName, name }) {
    const first = (name || '').trim().split(/\s+/)[0] || 'there';
    const event = eventName || 'our event';
    return (
        `Hi ${first}! ✅ You're registered for *${event}* at Asia By Gram.\n\n` +
        `We'll contact you with the next steps. See you soon!`
    );
}

/**
 * Notify restaurant (and optionally guest) after a successful registration.
 * Never throws — failures are logged so signup still succeeds.
 */
export async function notifyRegistrationWhatsApp(payload) {
    if (!isConfigured()) {
        console.warn(
            '[whatsapp] Skipped — set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ADMIN_NUMBER'
        );
        return { sent: false, reason: 'not_configured' };
    }

    const result = { sent: false, admin: null, guest: null, errors: [] };

    try {
        const adminTo = process.env.WHATSAPP_ADMIN_NUMBER;
        await sendWhatsAppText(adminTo, buildAdminMessage(payload));
        result.admin = true;
        result.sent = true;
    } catch (err) {
        console.error('[whatsapp] Admin notify failed:', err.message);
        result.errors.push(err.message);
    }

    const sendGuest = String(process.env.WHATSAPP_SEND_GUEST_CONFIRM || '').toLowerCase() === 'true';
    if (sendGuest && payload.phone) {
        try {
            const template = process.env.WHATSAPP_GUEST_TEMPLATE;
            if (template) {
                await sendWhatsAppTemplate(
                    payload.phone,
                    template,
                    process.env.WHATSAPP_GUEST_TEMPLATE_LANG || 'en',
                    [payload.name || '', payload.eventName || 'Event']
                );
            } else {
                await sendWhatsAppText(
                    payload.phone,
                    buildGuestMessage({
                        eventName: payload.eventName,
                        name: payload.name,
                    })
                );
            }
            result.guest = true;
            result.sent = true;
        } catch (err) {
            console.error('[whatsapp] Guest confirm failed:', err.message);
            result.errors.push(err.message);
        }
    }

    return result;
}
