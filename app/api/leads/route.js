import dbConnect from '../../../lib/db';
import EventLead from '../../../models/EventLead';
import CompetitionRegistration from '../../../models/CompetitionRegistration';
import { notifyRegistrationWhatsApp } from '../../../lib/whatsapp';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const eventName = searchParams.get('event');

        const query = {};
        if (eventName) query.eventName = eventName;

        const leads = await EventLead.find(query).sort({ createdAt: -1 }).lean();

        // Cross-check paymentStatus and entryFee with CompetitionRegistration if applicable
        const phones = leads.map((l) => l.phone).filter(Boolean);
        const compMap = new Map();
        if (phones.length > 0) {
            try {
                const comps = await CompetitionRegistration.find({ phone: { $in: phones } }).lean();
                for (const c of comps) {
                    if (c.phone && !compMap.has(c.phone)) {
                        compMap.set(c.phone, c);
                    }
                }
            } catch (cErr) {
                console.error('Error fetching linked competition records:', cErr);
            }
        }

        const enrichedLeads = leads.map((lead) => {
            const comp = compMap.get(lead.phone);
            const isChessOrComp = /chess|competition/i.test(lead.eventName || '');
            const paymentStatus =
                lead.paymentStatus && lead.paymentStatus !== 'Pending'
                    ? lead.paymentStatus
                    : comp?.paymentStatus || lead.paymentStatus || 'Pending';

            const entryFee =
                lead.entryFee !== undefined && lead.entryFee !== null && lead.entryFee > 0
                    ? lead.entryFee
                    : comp?.entryFee !== undefined
                      ? comp.entryFee
                      : isChessOrComp
                        ? 500
                        : 0;

            return {
                ...lead,
                paymentStatus,
                entryFee,
            };
        });

        return new Response(JSON.stringify(enrichedLeads), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim().replace(/\s+/g, '');
        const age = Number(body.age);
        const eventName = (body.eventName || '').trim();
        const adId = body.adId ? String(body.adId) : '';
        const source = body.source || 'register';

        if (!name || !phone || !age) {
            return new Response(JSON.stringify({ error: 'Name, phone and age are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!/^[0-9+\-]{8,15}$/.test(phone)) {
            return new Response(JSON.stringify({ error: 'Please enter a valid phone number' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (Number.isNaN(age) || age < 1 || age > 120) {
            return new Response(JSON.stringify({ error: 'Please enter a valid age' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Allow same phone for different events; block duplicate for same event
        const existingQuery = { phone };
        if (eventName) existingQuery.eventName = eventName;

        const existing = await EventLead.findOne(existingQuery);
        if (existing) {
            return new Response(
                JSON.stringify({ error: 'You have already registered for this event with this number' }),
                {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        const entryFee = body.entryFee !== undefined ? Number(body.entryFee) : (/chess|competition/i.test(eventName) ? 500 : 0);
        const paymentStatus = body.paymentStatus && ['Pending', 'Paid', 'Refunded', 'Free'].includes(body.paymentStatus)
            ? body.paymentStatus
            : 'Pending';
        const utr = (body.utr || '').trim();
        const paymentNotes = (body.paymentNotes || (utr ? `UPI UTR: ${utr}` : '')).trim();

        const lead = new EventLead({
            name,
            phone,
            age,
            eventName,
            adId,
            source,
            entryFee,
            paymentStatus,
            paymentNotes,
            utr,
        });

        await lead.save();

        // If this event is a chess competition or general competition, auto-sync to CompetitionRegistration
        if (/chess|competition/i.test(eventName)) {
            try {
                const existingComp = await CompetitionRegistration.findOne({ phone });
                if (!existingComp) {
                    const compReg = new CompetitionRegistration({
                        name,
                        phone,
                        age,
                        competition: eventName || 'Chess Championship 2026',
                        experience: 'Beginner',
                        notes: `Registered via event link (${eventName})${utr ? ` | UTR: ${utr}` : ''}`,
                        entryFee: 500,
                        paymentStatus: 'Pending',
                    });
                    await compReg.save();
                }
            } catch (syncErr) {
                console.error('Error auto-syncing lead to CompetitionRegistration:', syncErr);
            }
        }

        // Best-effort WhatsApp — never block a successful registration
        const whatsapp = await notifyRegistrationWhatsApp({
            type: 'event',
            eventName: eventName || 'Event registration',
            name,
            phone,
            age,
            extra: { source, adId, entryFee, utr },
        });

        return new Response(JSON.stringify({ ...lead.toObject(), whatsapp }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
