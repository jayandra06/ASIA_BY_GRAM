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
        return new Response(JSON.stringify(leads), {
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

        const lead = new EventLead({
            name,
            phone,
            age,
            eventName,
            adId,
            source,
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
                        notes: `Registered via event link (${eventName})`,
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
            extra: { source, adId },
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
